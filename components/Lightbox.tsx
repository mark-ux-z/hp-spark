"use client";

import { X, Download } from "lucide-react";
import { useEffect } from "react";

interface LightboxProps {
  src: string;
  title: string;
  onClose: () => void;
}

export default function Lightbox({ src, title, onClose }: LightboxProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function handleDownload() {
    const a = document.createElement("a");
    a.href = src;
    a.download = `${title.replace(/\s+/g, "-")}-mockup.png`;
    a.click();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <p className="text-sm font-semibold text-[#212121] truncate">{title}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 text-xs bg-[#0096D6] text-white px-3 py-1.5 rounded-lg hover:bg-[#0073A8] transition-colors"
            >
              <Download size={12} />
              Download
            </button>
            <button
              onClick={onClose}
              className="text-[#6B7280] hover:text-[#212121] p-1 rounded-lg hover:bg-[#F1F1F1]"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={title} className="w-full max-h-[80vh] object-contain" />
      </div>
    </div>
  );
}
