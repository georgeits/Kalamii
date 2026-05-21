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
  const canUpload = Boolean(authorId);

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
    <div className="space-y-3 rounded-[22px] border border-[color:var(--line)] bg-white/[0.03] p-4 sm:p-5">
      <input type="hidden" name="image_url" value={imageUrl} />
      <label htmlFor={inputId} className="block text-sm font-medium text-[color:var(--muted)]">
        ავტორის ფოტო
      </label>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="grid h-36 w-28 shrink-0 place-items-center self-start overflow-hidden rounded-[20px] border border-[color:var(--line)] bg-white/[0.045]">
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <span className="font-serif text-4xl text-[color:var(--gold-soft)]">A</span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <input
            id={inputId}
            type="file"
            accept="image/*"
            disabled={!canUpload || isUploading}
            onChange={handleFileChange}
            className="sr-only"
          />
          <label
            htmlFor={inputId}
            className={`inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border px-5 py-2 text-sm font-semibold transition ${
              !canUpload || isUploading
                ? "cursor-not-allowed border-[color:var(--line)] bg-white/[0.04] text-[color:var(--muted)] opacity-60"
                : "border-[rgba(244,177,93,0.24)] bg-[rgba(244,177,93,0.12)] text-[color:var(--gold-soft)] hover:bg-[rgba(244,177,93,0.18)]"
            }`}
          >
            {isUploading ? "იტვირთება..." : "ფაილის არჩევა"}
          </label>
          <input
            type="text"
            readOnly
            value={previewUrl ? "სურათი არჩეულია" : "ფაილი ჯერ არ არის არჩეული"}
            className="h-11 w-full rounded-[16px] border border-[color:var(--line)] bg-white/[0.045] px-4 text-sm text-[color:var(--muted)] outline-none"
          />
          <p className="text-sm leading-6 text-[color:var(--muted)]">
            {!canUpload
              ? "ფოტოს ატვირთვა ხელმისაწვდომი გახდება მას შემდეგ, რაც ავტორს ჯერ შექმნით ბაზაში."
              : isUploading
                ? "სურათი იტვირთება..."
                : "აირჩიეთ პორტრეტი. თუ ავტორი ახალია, ჯერ შეინახეთ და შემდეგ შეცვალეთ ფოტო."}
          </p>
          {error ? <p className="text-sm leading-6 text-[color:var(--danger)]">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
