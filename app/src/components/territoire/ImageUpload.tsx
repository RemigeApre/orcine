"use client";

import { useState } from "react";
import type { Image } from "./types";

interface Props {
  images: Image[];
  apiBase: string;
  isAdmin: boolean;
  onAdd: (img: Image) => void;
  onDelete: (id: string) => void;
}

const END_TYPES = ["FLAG", "COAT_OF_ARMS"] as const;

export default function ImageUpload({ images, apiBase, isAdmin, onAdd, onDelete }: Props) {
  const [uploading, setUploading] = useState(false);
  const [type, setType] = useState<"FLAG" | "COAT_OF_ARMS">("FLAG");
  const [isCurrent, setIsCurrent] = useState(true);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");

    const form = new FormData();
    form.append("file", file);

    const up = await fetch("/api/upload", { method: "POST", body: form });
    if (!up.ok) {
      setError("Erreur upload");
      setUploading(false);
      return;
    }
    const { path } = await up.json();

    const res = await fetch(apiBase, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, isCurrent, filePath: path, notes }),
    });

    if (!res.ok) {
      setError("Erreur sauvegarde");
      setUploading(false);
      return;
    }

    const img = await res.json();
    onAdd(img);
    setNotes("");
    setUploading(false);
    e.target.value = "";
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        {images.map((img) => (
          <div key={img.id} className="flex flex-col gap-1 p-3 border" style={{ borderColor: "#2d2926" }}>
            <img
              src={`/api/files/${img.filePath}`}
              alt={img.type}
              className="w-full object-contain"
              style={{ maxHeight: "120px", backgroundColor: "#1c1a18" }}
            />
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs" style={{ color: "#8a837a" }}>
                {img.type === "FLAG" ? "Drapeau" : "Blason"}
                {img.isCurrent && <span style={{ color: "#c8a06a" }}> (actuel)</span>}
              </span>
              {isAdmin && (
                <button
                  onClick={() => onDelete(img.id)}
                  className="text-xs transition-colors duration-150"
                  style={{ color: "#8a837a" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#a05050")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#8a837a")}
                >
                  Supprimer
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {isAdmin && (
        <div className="flex flex-col gap-3 pt-3 border-t" style={{ borderColor: "#2d2926" }}>
          <div className="flex gap-4">
            {END_TYPES.map((t) => (
              <label key={t} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" value={t} checked={type === t} onChange={() => setType(t)} className="accent-[#c8a06a]" />
                <span className="text-xs" style={{ color: "#8a837a" }}>{t === "FLAG" ? "Drapeau" : "Blason"}</span>
              </label>
            ))}
            <label className="flex items-center gap-2 cursor-pointer ml-4">
              <input type="checkbox" checked={isCurrent} onChange={(e) => setIsCurrent(e.target.checked)} className="accent-[#c8a06a]" />
              <span className="text-xs" style={{ color: "#8a837a" }}>Actuel</span>
            </label>
          </div>
          <input
            type="text"
            placeholder="Notes (optionnel)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="border px-3 py-2 text-sm outline-none transition-colors duration-150 bg-transparent"
            style={{ borderColor: "#2d2926", color: "#dfd8cc" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#c8a06a")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#2d2926")}
          />
          <label className="flex items-center gap-3 cursor-pointer self-start px-5 py-2 border text-xs tracking-widest uppercase transition-colors duration-150"
            style={{ borderColor: "#2d2926", color: "#8a837a", letterSpacing: "0.15em" }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#c8a06a")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#2d2926")}
          >
            {uploading ? "..." : "+ Ajouter une image"}
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
          </label>
          {error && <p className="text-xs" style={{ color: "#a05050" }}>{error}</p>}
        </div>
      )}
    </div>
  );
}
