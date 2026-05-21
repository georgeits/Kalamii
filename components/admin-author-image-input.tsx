/* eslint-disable @next/next/no-img-element */
"use client";

import { useId, useState } from "react";
import { DEMO_RECORD_MESSAGE } from "@/src/lib/demo-record";

type AdminAuthorImageInputProps = {
  authorId?: string;
  currentImageUrl?: string | null;
  onUploaded?: (imageUrl: string) => void;
};

export function AdminAuthorImageInput({ authorId, currentImageUrl, onUploaded }: AdminAuthorImageInputProps) {
  const inputId = useId();
  const [imageUrl, setImageUrl] = useState(currentImageUrl ?? "");
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl ?? "");
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const canUpload = Boolean(authorId) && !authorId?.startsWith("fallback-");

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!canUpload) {
      setError(DEMO_RECORD_MESSAGE);
      return;
    }

    setError("");
    setPreviewUrl(URL.createObjectURL(file));
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (authorId) {
        formData.append("authorId", authorId);
      }

      const response = await fetch("/api/admin/author-image", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as { imageUrl?: string; error?: string };

      if (!response.ok || !payload.imageUrl) {
        setError(payload.error ?? "სურათის ატვირთვა ვერ მოხერხდა.");
        return;
      }

      setImageUrl(payload.imageUrl);
      setPreviewUrl(payload.imageUrl);
      onUploaded?.(payload.imageUrl);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "სურათის ატვირთვა ვერ მოხერხდა.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name="image_url" value={imageUrl} />
      <label htmlFor={inputId} className="block text-sm text-[color:var(--muted)]">
        ავტორის ფოტო
      </label>
      <div className="flex items-start gap-4">
        <div className="grid h-28 w-24 shrink-0 place-items-center overflow-hidden rounded-[18px] border border-[color:var(--line)] bg-white/[0.045]">
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <span className="font-serif text-4xl text-[color:var(--gold-soft)]">A</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <input
            id={inputId}
            type="file"
            accept="image/*"
            disabled={!canUpload || isUploading}
            onChange={handleFileChange}
            className="block w-full text-sm text-[color:var(--muted)] file:mr-4 file:rounded-full file:border-0 file:bg-[rgba(244,177,93,0.18)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[color:var(--gold-soft)] disabled:cursor-not-allowed disabled:opacity-60"
          />
          <p className="mt-2 text-xs text-[color:var(--muted)]">
            {!canUpload
              ? "ფოტოს ატვირთვა ხელმისაწვდომი გახდება მას შემდეგ, რაც ავტორს ჯერ შექმნით ბაზაში."
              : isUploading
                ? "სურათი იტვირთება..."
                : "აირჩიეთ პორტრეტი. თუ ავტორი ახალია, ჯერ შეინახეთ და შემდეგ შეცვალეთ ფოტო."}
          </p>
          {error ? <p className="mt-2 text-xs text-[color:var(--danger)]">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
