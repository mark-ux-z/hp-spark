"use client";

import { CheckCircle, Zap } from "lucide-react";

function useIsLocal() {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1" || h.startsWith("192.168.");
}

export default function TopBar() {
  const isLocal = useIsLocal();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-[#0096D6] rounded-md flex items-center justify-center">
          <span className="text-white font-bold text-sm tracking-tight">HP</span>
        </div>
        <div>
          <p className="text-[#212121] font-semibold text-sm leading-tight">HP Indigo</p>
          <p className="text-[#6B7280] text-xs leading-tight">Marketing Ideation</p>
        </div>
      </div>

      {isLocal && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-[#E6F4FA] border border-[#0096D6]/30 rounded-full px-3 py-1">
            <Zap size={12} className="text-[#0096D6]" />
            <span className="text-[#0073A8] text-xs font-medium">Nano Banana 2</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle size={14} className="text-emerald-500" />
            <span className="text-[#6B7280] text-xs">Supabase connected</span>
          </div>
        </div>
      )}
    </header>
  );
}
