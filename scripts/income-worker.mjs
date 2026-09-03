#!/usr/bin/env node
/**
 * Mac Studio pull-worker for AI Income Check.
 *
 * Vercel never calls this machine. This script polls the preview origin,
 * claims one pending row, downloads the private blob through the worker
 * file route, rasterizes a PDF on macOS, and posts the image(s) to a
 * local OpenAI-compatible vision endpoint (Ollama by default).
 *
 *   LEASEPROOF_API_URL=https://<preview>.vercel.app \
 *   INCOME_WORKER_SECRET=… \
 *   node scripts/income-worker.mjs
 *
 * Optional:
 *   INCOME_OPENAI_BASE_URL  default http://127.0.0.1:11434/v1
 *   INCOME_OPENAI_API_KEY   default ollama
 *   INCOME_MODEL            default qwen2.5vl:7b
 *
 * Do not start Darkbloom from this script. Point INCOME_OPENAI_BASE_URL
 * at a local OpenAI-compatible server later without a code change.
 */

import { spawn } from "node:child_process";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";

const LOOP_MS = 3000;
const API = (process.env.LEASEPROOF_API_URL || "").replace(/\/$/, "");
const SECRET = process.env.INCOME_WORKER_SECRET || "";
const OPENAI_BASE = (process.env.INCOME_OPENAI_BASE_URL || "http://127.0.0.1:11434/v1").replace(
  /\/$/,
  "",
);
const OPENAI_KEY = process.env.INCOME_OPENAI_API_KEY || "ollama";
const MODEL = process.env.INCOME_MODEL || "qwen2.5vl:7b";
const CLAIMED_BY = process.env.INCOME_WORKER_NAME || "studio";

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

function extractionPrompt() {
  return [
    "Extract JSON only. No prose, no markdown.",
    "Schema:",
    "{",
    '  "detected_name": string | null,',
    '  "employer": string | null,',
    '  "pay_frequency": "weekly" | "biweekly" | "semimonthly" | "monthly" | "unknown",',
    '  "period_start": "YYYY-MM-DD" | null,',
    '  "period_end": "YYYY-MM-DD" | null,',
    '  "gross_this_period_cents": number | null,',
    '  "ytd_gross_cents": number | null,',
    '  "monthly_gross_cents": number | null,',
    '  "recency_current": boolean | null,',
    '  "notes": string | null',
    "}",
    `TODAY is ${todayUtc()} (UTC). recency_current is true only if the document period falls in the last two calendar months from TODAY.`,
    "Compute monthly_gross_cents from pay_frequency: weekly ×52/12, biweekly ×26/12, semimonthly ×2, monthly ×1.",
    "Never invent a name or amount. Use null if unreadable.",
  ].join("\n");
}

function authHeaders(extra = {}) {
  return {
    authorization: `Bearer ${SECRET}`,
    ...extra,
  };
}

async function api(path, init = {}) {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      ...authHeaders(init.headers && typeof init.headers === "object" ? init.headers : {}),
    },
  });
  return response;
}

function run(command, args, cwd) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd, stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", (error) => {
      resolve({ ok: false, code: 1, stderr: error.message });
    });
    child.on("close", (code) => {
      resolve({ ok: code === 0, code: code ?? 1, stderr });
    });
  });
}

function mimeFromName(name, fallback) {
  const ext = extname(name).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".pdf") return "application/pdf";
  return fallback || "application/octet-stream";
}

async function rasterizePdf(pdfPath, outDir) {
  const ql = await run("qlmanage", ["-t", "-s", "1600", "-o", outDir, pdfPath]);
  if (!ql.ok) {
    const converted = join(outDir, "page.png");
    const sips = await run("sips", ["-s", "format", "png", pdfPath, "--out", converted]);
    if (!sips.ok) {
      throw new Error("could not rasterize pdf");
    }
  }

  const files = (await readdir(outDir))
    .filter((name) => /\.(png|jpe?g|webp)$/i.test(name))
    .sort()
    .slice(0, 2);
  if (!files.length) throw new Error("could not rasterize pdf");
  return files.map((name) => join(outDir, name));
}

async function toDataUrl(filePath, mime) {
  const bytes = await readFile(filePath);
  return `data:${mime};base64,${bytes.toString("base64")}`;
}

async function imagesForJob(bytes, fileName, contentType) {
  const dir = await mkdtemp(join(tmpdir(), "income-check-"));
  try {
    const safeName = `upload${extname(fileName) || ""}`;
    const inputPath = join(dir, safeName);
    await writeFile(inputPath, bytes);
    const mime = contentType || mimeFromName(fileName);
    if (mime === "application/pdf" || extname(fileName).toLowerCase() === ".pdf") {
      const pages = await rasterizePdf(inputPath, dir);
      return Promise.all(pages.map((path) => toDataUrl(path, "image/png")));
    }
    if (!mime.startsWith("image/")) {
      throw new Error("unsupported document type");
    }
    return [await toDataUrl(inputPath, mime)];
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function complete(id, payload) {
  const response = await api("/api/income/worker/complete", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id, ...payload }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`complete ${response.status}: ${text.slice(0, 180)}`);
  }
}

async function extract(images) {
  const content = [
    { type: "text", text: extractionPrompt() },
    ...images.map((url) => ({ type: "image_url", image_url: { url } })),
  ];

  const response = await fetch(`${OPENAI_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0,
      messages: [{ role: "user", content }],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`vision ${response.status}: ${text.slice(0, 180)}`);
  }

  const payload = await response.json();
  const text = payload?.choices?.[0]?.message?.content;
  if (typeof text !== "string" || !text.trim()) {
    throw new Error("malformed model output");
  }
  return text;
}

async function handleJob(job, fileUrl) {
  const fileResponse = await api(fileUrl);
  if (!fileResponse.ok) {
    await complete(job.id, {
      status: "error",
      errorText: `could not download file (${fileResponse.status})`,
      extractor: MODEL,
    });
    console.log(`[income-worker] ${job.id} error download`);
    return;
  }

  const bytes = Buffer.from(await fileResponse.arrayBuffer());
  const contentType = fileResponse.headers.get("content-type") || "";

  let images;
  try {
    images = await imagesForJob(bytes, job.fileName || "upload", contentType);
  } catch (error) {
    const message = error instanceof Error ? error.message : "could not rasterize pdf";
    await complete(job.id, { status: "error", errorText: message, extractor: MODEL });
    console.log(`[income-worker] ${job.id} error rasterize`);
    return;
  }

  let rawText;
  try {
    rawText = await extract(images);
  } catch (error) {
    const message = error instanceof Error ? error.message : "vision failed";
    await complete(job.id, { status: "error", errorText: message, extractor: MODEL });
    console.log(`[income-worker] ${job.id} error vision`);
    return;
  }

  await complete(job.id, {
    status: "ready",
    rawText,
    extractor: MODEL,
  });
  console.log(`[income-worker] ${job.id} ready`);
}

async function tick() {
  const response = await api("/api/income/worker/claim", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ claimedBy: CLAIMED_BY }),
  });

  if (response.status === 404) return;
  if (response.status === 503) {
    console.log("[income-worker] secret unset on origin — sleeping");
    return;
  }
  if (!response.ok) {
    console.log(`[income-worker] claim ${response.status}`);
    return;
  }

  const payload = await response.json();
  const job = payload?.job;
  const fileUrl = payload?.fileUrl;
  if (!job?.id || !fileUrl) {
    console.log("[income-worker] claim empty");
    return;
  }

  console.log(`[income-worker] ${job.id} claimed`);
  await handleJob(job, fileUrl);
}

async function main() {
  if (!API) {
    console.error("LEASEPROOF_API_URL is required (preview origin, no trailing slash).");
    process.exit(1);
  }
  if (!SECRET) {
    console.error("INCOME_WORKER_SECRET is required. Do not commit a real value.");
    process.exit(1);
  }

  console.log(
    `[income-worker] pulling ${API} model=${MODEL} openai=${OPENAI_BASE} every ${LOOP_MS}ms`,
  );

  for (;;) {
    try {
      await tick();
    } catch (error) {
      const message = error instanceof Error ? error.message : "tick failed";
      console.log(`[income-worker] error ${message}`);
    }
    await new Promise((resolve) => setTimeout(resolve, LOOP_MS));
  }
}

await main();
