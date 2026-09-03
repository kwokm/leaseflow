"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Checkbox, Field, FieldError } from "@/components/apply/field";
import { Note, Panel, StepChrome, type StepProps } from "@/components/apply/step-shell";
import { Button } from "@/components/ui/button";
import { useRuntimeConfig } from "@/components/config/runtime-config";
import { toLocalFile, uploadLocalFile, releaseLocalFile } from "@/components/apply/file-upload";
import {
  BIO_MAX_CHARS,
  SOCIAL_NETWORKS,
  emptyApplicantBio,
  type ApplicantBio,
  type SocialNetwork,
} from "@/lib/apply/types";
import { newId } from "@/lib/ids";
import {
  FACEBOOK_PERSONAL_MESSAGE,
  SOCIAL_CONSENT_LABEL,
  SOCIAL_READ_COPY,
  notConfiguredMessage,
} from "@/lib/social/snapshot";
import { networkLabel, SocialGrid } from "@/components/desk/social-grid";

export function StepBio({ state, patch, embedded }: StepProps) {
  const { demo, social } = useRuntimeConfig();
  const search = useSearchParams();
  const [uploading, setUploading] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const bio = state.bio ?? emptyApplicantBio();

  const setBio = (partial: Partial<ApplicantBio>) =>
    patch({ bio: { ...bio, ...partial } });

  useEffect(() => {
    if (bio.draftId) return;
    setBio({ draftId: newId("dft") });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-time draft id
  }, [bio.draftId]);

  useEffect(() => {
    const network = search.get("social");
    const ok = search.get("socialOk");
    const err = search.get("socialError");
    if (err) setConnectError(err);
    if (!ok || !bio.draftId) return;
    fetch(`/api/apply/social/status?draftId=${encodeURIComponent(bio.draftId)}`)
      .then((response) => (response.ok ? response.json() : { profile: null }))
      .then((payload: { profile?: { social?: ApplicantBio["social"][SocialNetwork][] } }) => {
        const next = { ...bio.social };
        for (const account of payload.profile?.social ?? []) {
          next[account.network] = {
            ...next[account.network],
            ...account,
            connected: true,
          };
        }
        setBio({ social: next });
      })
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, bio.draftId]);

  async function onPhoto(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const local = toLocalFile(file);
      releaseLocalFile(bio.photo);
      const stored = await uploadLocalFile(local, file, "profile_photo");
      setBio({ photo: stored });
    } finally {
      setUploading(false);
    }
  }

  async function connect(network: SocialNetwork) {
    setConnectError(null);
    if (!bio.socialConsent) {
      setConnectError("Check the box before connecting a profile.");
      return;
    }
    if (!social[network]) {
      setConnectError(notConfiguredMessage(network));
      return;
    }
    const response = await fetch(`/api/apply/social/${network}/start`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        draftId: bio.draftId,
        listingId: state.listingId,
        returnTo: window.location.pathname,
        consented: true,
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
    if (!response.ok || !payload.url) {
      setConnectError(payload.error ?? notConfiguredMessage(network));
      return;
    }
    window.location.href = payload.url;
  }

  const photoSrc = bio.photo?.url ?? bio.photo?.storedUrl;
  const remaining = BIO_MAX_CHARS - bio.text.length;

  return (
    <StepChrome embedded={embedded} lead="Bio." tone="Optional — who you are, in your words.">
      <Panel
        title="Profile photo"
        description="A square crop preview. Stored like your other apply files."
      >
        <div className="flex items-center gap-4">
          <label className="bio-photo">
            {photoSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoSrc} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-[12px] font-medium text-mute">Add photo</span>
            )}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(event) => void onPhoto(event.target.files)}
            />
          </label>
          <p className="text-[13px] font-medium text-mute">
            {uploading ? "Uploading…" : "JPG or PNG. Optional."}
          </p>
        </div>
      </Panel>

      <Panel title="Short bio" description="Who you are — about 400 characters.">
        <textarea
          id="bio-text"
          maxLength={BIO_MAX_CHARS}
          value={bio.text}
          onChange={(event) => setBio({ text: event.target.value.slice(0, BIO_MAX_CHARS) })}
          rows={4}
          className="w-full rounded-md border border-line bg-paper px-3 py-2 text-[14px] font-medium leading-5 text-ink outline-none focus:border-ink"
          placeholder="Remote designer, quiet household, weekends at the beach."
        />
        <p className="mt-1.5 text-[12px] font-medium text-mute">{remaining} left</p>
      </Panel>

      <Panel
        title="Connect social"
        description={`${SOCIAL_READ_COPY} Instagram, TikTok, and Facebook Page posts only — we do not scrape.`}
      >
        <Checkbox
          id="social-consent"
          checked={bio.socialConsent}
          onChange={(checked) =>
            setBio({
              socialConsent: checked,
              socialConsentAt: checked ? new Date().toISOString() : undefined,
            })
          }
        >
          {SOCIAL_CONSENT_LABEL}
        </Checkbox>
        <p className="mt-2 text-[12px] font-medium text-mute-2">
          Not a consumer report. The landlord sees a snapshot from the moment you connect.
        </p>

        {connectError ? (
          <FieldError id="social-connect-error" message={connectError} />
        ) : null}

        <div className="mt-4 space-y-4">
          {SOCIAL_NETWORKS.map((network) => {
            const account = bio.social[network];
            const configured = social[network];
            return (
              <div key={network} className="rounded-md border border-line p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-[13px] font-semibold text-ink">{networkLabel(network)}</p>
                    {account.connected && account.handle ? (
                      <p className="text-[12px] font-medium text-mute">@{account.handle}</p>
                    ) : null}
                    {account.personalProfile ? (
                      <p className="text-[12px] font-medium text-mute">{FACEBOOK_PERSONAL_MESSAGE}</p>
                    ) : null}
                    {!configured ? (
                      <p className="text-[12px] font-medium text-mute">
                        {notConfiguredMessage(network)}
                      </p>
                    ) : null}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={configured ? "default" : "outline"}
                    disabled={!bio.socialConsent}
                    onClick={() => void connect(network)}
                  >
                    {account.connected ? "Reconnect" : "Connect"}
                  </Button>
                </div>
                <Field
                  id={`${network}-url`}
                  label="Public profile URL"
                  type="url"
                  placeholder={`https://www.${network === "tiktok" ? "tiktok.com/@" : network === "facebook" ? "facebook.com/" : "instagram.com/"}`}
                  value={account.profileUrl}
                  onChange={(event) =>
                    setBio({
                      social: {
                        ...bio.social,
                        [network]: { ...account, profileUrl: event.target.value },
                      },
                    })
                  }
                />
                <SocialGrid posts={account.posts} label="" />
              </div>
            );
          })}
        </div>
      </Panel>

      {demo ? (
        <Note>SAMPLE packets may show a written bio. Live Connect still needs Meta and TikTok apps.</Note>
      ) : null}
    </StepChrome>
  );
}
