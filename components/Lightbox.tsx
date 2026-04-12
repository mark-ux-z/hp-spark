"use client";

import { X, Download, ZoomIn, ZoomOut, Maximize2, Minimize2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface LightboxProps {
  src: string;
  title: string;
  onClose: () => void;
}

export default function Lightbox({ src, title, onClose }: LightboxProps) {
  const [zoomed, setZoomed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      // Only close on Escape when NOT in browser fullscreen
      if (e.key === "Escape" && !document.fullscreenElement) onClose();
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);

    function handleFsChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", handleFsChange);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
      document.removeEventListener("fullscreenchange", handleFsChange);
    };
  }, [onClose]);

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  function handleDownload() {
    const a = document.createElement("a");
    a.href = src;
    a.download = `${title.replace(/\s+/g, "-")}-mockup.png`;
    a.click();
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-black/90"
      onClick={onClose}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-5 py-3 bg-black/60 backdrop-blur-sm shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm font-semibold text-white truncate mr-4">{title}</p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setZoomed((z) => !z)}
            className="flex items-center gap-1.5 text-xs text-white/80 hover:text-white px-3 py-1.5 rounded-lg border border-white/20 hover:border-white/40 transition-colors"
          >
            {zoomed ? <ZoomOut size={13} /> : <ZoomIn size={13} />}
            {zoomed ? "Fit to screen" : "Zoom in"}
          </button>
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 text-xs text-white/80 hover:text-white px-3 py-1.5 rounded-lg border border-white/20 hover:border-white/40 transition-colors"
            title={isFullscreen ? "Exit fullscreen (Esc)" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 text-xs bg-[#0096D6] text-white px-3 py-1.5 rounded-lg hover:bg-[#0073A8] transition-colors"
          >
            <Download size={12} />
            Download
          </button>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
            title="Close"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      {/* Image area */}
      <div
        className="flex-1 flex items-center justify-center p-4 overflow-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={title}
          onClick={(e) => e.stopPropagation()}
          className={`rounded-lg shadow-2xl transition-all duration-200 ${
            zoomed
              ? "max-w-none w-auto h-auto cursor-zoom-out"
              : "max-w-full max-h-full object-contain cursor-zoom-in"
          }`}
          style={zoomed ? { maxHeight: "none" } : undefined}
        />
      </div>

      {/* Bottom hint */}
      <div className="text-center py-2 shrink-0">
        <span className="text-xs text-white/30">
          {isFullscreen ? "Press Esc to exit fullscreen" : "Click outside image or press Esc to close"}
        </span>
      </div>
    </div>
  );
}
