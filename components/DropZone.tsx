"use client";

import { useRef, useState } from "react";
import { Upload, X, File } from "lucide-react";

interface DropZoneProps {
  onFilesChange: (files: File[]) => void;
  files: File[];
}

export default function DropZone({ onFilesChange, files }: DropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    onFilesChange([...files, ...dropped]);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      onFilesChange([...files, ...Array.from(e.target.files)]);
    }
  }

  function removeFile(index: number) {
    onFilesChange(files.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          dragging
            ? "border-[#0096D6] bg-[#E6F4FA]"
            : "border-gray-300 hover:border-[#0096D6] hover:bg-[#E6F4FA]/40"
        }`}
      >
        <Upload size={24} className="mx-auto mb-2 text-[#6B7280]" />
        <p className="text-sm text-[#212121] font-medium">
          Drop brand assets here or <span className="text-[#0096D6]">browse</span>
        </p>
        <p className="text-xs text-[#6B7280] mt-1">PDF, PNG, JPG, SVG supported</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.svg"
          className="hidden"
          onChange={handleChange}
        />
      </div>

      {files.length > 0 && (
        <ul className="space-y-1.5">
          {files.map((file, i) => (
            <li
              key={i}
              className="flex items-center justify-between bg-[#F1F1F1] rounded-lg px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <File size={14} className="text-[#0096D6] shrink-0" />
                <span className="text-xs text-[#212121] truncate">{file.name}</span>
                <span className="text-xs text-[#6B7280] shrink-0">
                  {(file.size / 1024).toFixed(0)} KB
                </span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                className="text-[#6B7280] hover:text-red-500 ml-2"
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
