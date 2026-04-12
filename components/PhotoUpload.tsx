"use client";
import { useState, useRef } from "react";
import { Camera, X, Loader2, ImagePlus } from "lucide-react";

interface PhotoUploadProps {
  /** Category label shown above the upload area */
  label: string;
  /** Helper text explaining what photos to take */
  hint?: string;
  /** Supabase Storage folder path prefix (e.g. "equipment") */
  category: string;
  /** Unique survey session ID for organizing uploads */
  sessionId: string;
  /** Current list of uploaded photo URLs */
  photos: string[];
  /** Called when photos array changes */
  onChange: (photos: string[]) => void;
  /** Max number of photos allowed */
  maxPhotos?: number;
}

export default function PhotoUpload({
  label,
  hint,
  category,
  sessionId,
  photos,
  onChange,
  maxPhotos = 5,
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = maxPhotos - photos.length;
    if (remaining <= 0) {
      setError(`Maximum ${maxPhotos} photos allowed`);
      return;
    }

    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    setError("");

    const newUrls: string[] = [];

    for (const file of toUpload) {
      // Validate size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("Each photo must be under 10MB");
        continue;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);
      formData.append("sessionId", sessionId);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Upload failed");
        }

        const data = await res.json();
        if (data.url) {
          newUrls.push(data.url);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        setError(msg);
      }
    }

    if (newUrls.length > 0) {
      onChange([...photos, ...newUrls]);
    }

    setUploading(false);
    // Reset input so same file can be re-selected
    if (inputRef.current) inputRef.current.value = "";
  };

  const removePhoto = (index: number) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="input-label">{label}</label>
      {hint && <p className="text-xs text-gray-500 mb-2">{hint}</p>}

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {photos.map((url, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-white/10">
              <img
                src={url}
                alt={`${label} ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute top-1 right-1 p-1 bg-black/70 rounded-full hover:bg-red-600 transition-colors"
              >
                <X size={12} className="text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {photos.length < maxPhotos && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-lg border-2 border-dashed transition-colors disabled:opacity-50"
          style={{
            borderColor: "var(--border-input)",
            color: "var(--text-tertiary)",
          }}
        >
          {uploading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span className="text-sm">Uploading...</span>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <Camera size={18} />
                <span className="text-sm font-medium">Take Photo</span>
                <span className="text-gray-600">|</span>
                <ImagePlus size={18} />
                <span className="text-sm font-medium">Choose File</span>
              </div>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/heic,image/heif,image/webp"
        capture="environment"
        multiple
        onChange={handleFiles}
        className="hidden"
      />

      {error && (
        <p className="text-xs text-red-400 mt-1">{error}</p>
      )}

      <p className="text-xs text-gray-600 mt-1">
        {photos.length}/{maxPhotos} photos &middot; Max 10MB each
      </p>
    </div>
  );
}
