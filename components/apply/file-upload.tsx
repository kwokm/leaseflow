"use client";

import * as React from "react";
import { FileText, ImageIcon, Plus, Trash2, Upload } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/apply/field";
import { DURATION, EASE_OUT } from "@/lib/apply/motion";
import { formatFileSize } from "@/lib/apply/format";
import type { LocalFile } from "@/lib/apply/types";
import { cn } from "@/lib/utils";

export const FILE_ACCEPT = "image/png,image/jpeg,image/heic,image/webp,application/pdf";

/** Blob document type; also the folder the upload lands in. */
export type UploadKind = "photo_id_front" | "photo_id_back" | "paystub" | "bank_statement";

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `f-${Math.random().toString(36).slice(2)}`;
}

/**
 * The object URL gives an instant preview while the upload is in flight; the
 * durable copy lands in `storedUrl` once Blob storage accepts it.
 */
export function toLocalFile(file: File): LocalFile {
  return {
    id: newId(),
    name: file.name,
    size: file.size,
    mime: file.type || "application/octet-stream",
    url: URL.createObjectURL(file),
    addedAt: new Date().toISOString(),
  };
}

/**
 * Uploads to Blob and returns the file with its durable URL attached. If
 * storage is not configured the local preview is kept as-is, so the wizard
 * still works — the packet just records no stored document.
 */
export async function uploadLocalFile(
  local: LocalFile,
  source: File,
  kind: UploadKind
): Promise<LocalFile> {
  const body = new FormData();
  body.append("file", source);
  body.append("kind", kind);

  try {
    const response = await fetch("/api/uploads", { method: "POST", body });
    if (!response.ok) return local;
    const payload = (await response.json()) as { url?: string; pathname?: string };
    if (!payload.url) return local;
    return { ...local, storedUrl: payload.url, pathname: payload.pathname };
  } catch {
    return local;
  }
}

export function releaseLocalFile(file: LocalFile | null | undefined): void {
  if (file?.url) URL.revokeObjectURL(file.url);
}

function isImage(file: LocalFile): boolean {
  return file.mime.startsWith("image/");
}

function FilePreview({ file }: { file: LocalFile }) {
  // Object URL first (instant, no round trip), then the stored copy after reload.
  const src = file.url ?? file.storedUrl;

  if (isImage(file) && src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={`Preview of ${file.name}`}
        className="h-14 w-14 shrink-0 rounded-md border border-line object-cover"
      />
    );
  }

  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-line bg-mist text-mute">
      {isImage(file) ? <ImageIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
    </div>
  );
}

function FileRow({
  file,
  onRemove,
  onReplace,
}: {
  file: LocalFile;
  onRemove: () => void;
  onReplace?: () => void;
}) {
  const reduced = useReducedMotion();

  const row = (
    <div className="flex items-center gap-3 rounded-btn border border-line bg-paper p-2.5 transition-[border-color,box-shadow] duration-200 ease-premium">
      <FilePreview file={file} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-medium tracking-[-0.14px] text-ink">{file.name}</p>
        <p className="mt-0.5 text-[13px] font-medium text-mute">
          {formatFileSize(file.size)}
          {file.storedUrl ? " · saved" : file.url ? "" : " · preview cleared on reload"}
        </p>
      </div>
      {onReplace && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onReplace}
          className="hidden text-mute hover:text-ink sm:inline-flex"
        >
          Replace
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        size="iconTouch"
        onClick={onRemove}
        aria-label={`Remove ${file.name}`}
        className="text-mute hover:text-no"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  if (reduced) return row;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.ui, ease: EASE_OUT }}
    >
      {row}
    </motion.div>
  );
}

function useDropzone() {
  const [over, setOver] = React.useState(false);

  const onDragEnter = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setOver(true);
  };

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setOver(true);
  };

  const onDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setOver(false);
    }
  };

  return { over, setOver, onDragEnter, onDragOver, onDragLeave };
}

interface FileSlotProps {
  id: string;
  label: string;
  kind: UploadKind;
  hint?: string;
  error?: string;
  file: LocalFile | null;
  onChange: (file: LocalFile | null) => void;
}

/** Single-file slot — used for the front and back of a photo ID. */
export function FileSlot({ id, label, kind, hint, error, file, onChange }: FileSlotProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const errorId = error ? `${id}-error` : undefined;
  const drop = useDropzone();

  const handleFiles = (files: FileList | null) => {
    const picked = files?.[0];
    if (!picked) return;
    releaseLocalFile(file);
    const local = toLocalFile(picked);
    // Show it immediately, then swap in the stored copy when the upload lands.
    onChange(local);
    void uploadLocalFile(local, picked, kind).then((stored) => onChange(stored));
  };

  return (
    <div>
      <p className="mb-1.5 text-[13px] font-medium tracking-[-0.13px] text-ink-2">{label}</p>

      {file ? (
        <FileRow
          file={file}
          onReplace={() => inputRef.current?.click()}
          onRemove={() => {
            releaseLocalFile(file);
            onChange(null);
            if (inputRef.current) inputRef.current.value = "";
          }}
        />
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragEnter={drop.onDragEnter}
          onDragOver={drop.onDragOver}
          onDragLeave={drop.onDragLeave}
          onDrop={(event) => {
            event.preventDefault();
            drop.setOver(false);
            handleFiles(event.dataTransfer.files);
          }}
          aria-describedby={errorId}
          className={cn(
            "flex min-h-[128px] w-full flex-col items-center justify-center gap-2 rounded-btn border border-dashed bg-mist px-4 py-5 text-center",
            "transition-[background-color,border-color] duration-200 ease-premium",
            error ? "border-no" : "border-line-2",
            "hover:border-mute-3 hover:bg-rail",
            drop.over && "border-ink bg-wash"
          )}
        >
          <Upload className="h-5 w-5 text-mute" />
          <span className="text-[14px] font-medium tracking-[-0.14px] text-ink-2">
            {drop.over ? "Drop to add" : `Add ${label.toLowerCase()}`}
          </span>
          <span className="text-[13px] font-medium text-mute">JPG, PNG, or PDF</span>
        </button>
      )}

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={FILE_ACCEPT}
        className="sr-only"
        onChange={(event) => handleFiles(event.target.files)}
      />

      {hint && !error && <p className="mt-1.5 text-[13px] font-medium text-mute">{hint}</p>}
      <FieldError id={errorId ?? `${id}-error`} message={error} />
    </div>
  );
}

interface FileStackProps {
  id: string;
  label: string;
  kind: UploadKind;
  hint?: string;
  error?: string;
  files: LocalFile[];
  max: number;
  onChange: (files: LocalFile[]) => void;
}

/** Multi-file list with a hard cap — pay stubs (2) and bank statements (1–3). */
export function FileStack({ id, label, kind, hint, error, files, max, onChange }: FileStackProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const errorId = error ? `${id}-error` : undefined;
  const full = files.length >= max;
  const drop = useDropzone();
  // Uploads resolve out of order, so each one patches the list by id rather
  // than rebuilding it from a captured `files`.
  const latest = React.useRef(files);
  latest.current = files;

  const handleFiles = (list: FileList | null) => {
    if (!list?.length) return;
    const room = max - files.length;
    const sources = Array.from(list).slice(0, room);
    const added = sources.map(toLocalFile);
    onChange([...files, ...added]);
    if (inputRef.current) inputRef.current.value = "";

    sources.forEach((source, index) => {
      const local = added[index];
      void uploadLocalFile(local, source, kind).then((stored) => {
        onChange(latest.current.map((entry) => (entry.id === local.id ? stored : entry)));
      });
    });
  };

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <p className="text-[13px] font-medium tracking-[-0.13px] text-ink-2">{label}</p>
        <p className="num text-[13px] font-medium text-mute">
          {files.length} of {max}
        </p>
      </div>

      <div className="space-y-2">
        {files.map((file) => (
          <FileRow
            key={file.id}
            file={file}
            onRemove={() => {
              releaseLocalFile(file);
              onChange(files.filter((entry) => entry.id !== file.id));
            }}
          />
        ))}

        {!full && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragEnter={drop.onDragEnter}
            onDragOver={drop.onDragOver}
            onDragLeave={drop.onDragLeave}
            onDrop={(event) => {
              event.preventDefault();
              drop.setOver(false);
              handleFiles(event.dataTransfer.files);
            }}
            aria-describedby={errorId}
            className={cn(
              "flex min-h-[56px] w-full items-center justify-center gap-2 rounded-btn border border-dashed bg-mist px-4 text-[14px] font-medium tracking-[-0.14px] text-ink-2",
              "transition-[background-color,border-color] duration-200 ease-premium",
              error ? "border-no" : "border-line-2",
              "hover:border-mute-3 hover:bg-rail",
              drop.over && "border-ink bg-wash"
            )}
          >
            <Plus className="h-4 w-4 text-mute" />
            {drop.over ? "Drop to add" : "Add file"}
            <span className="text-mute">· JPG, PNG, or PDF</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        id={id}
        type="file"
        multiple
        accept={FILE_ACCEPT}
        className="sr-only"
        onChange={(event) => handleFiles(event.target.files)}
      />

      {hint && !error && <p className="mt-1.5 text-[13px] font-medium text-mute">{hint}</p>}
      <FieldError id={errorId ?? `${id}-error`} message={error} />
    </div>
  );
}
