import { Zap } from "lucide-react";

const strategyConfig = {
  VDP: { label: "Variable Data", color: "bg-[#E6F4FA] text-[#0073A8] border-[#0096D6]/30" },
  QR: { label: "QR Integration", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  Personalized: { label: "Personalized", color: "bg-orange-50 text-orange-700 border-orange-200" },
};

export default function StrategyBadge({
  type,
}: {
  type: "VDP" | "QR" | "Personalized";
}) {
  const config = strategyConfig[type] ?? strategyConfig.VDP;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${config.color}`}
    >
      <Zap size={10} />
      {config.label}
    </span>
  );
}
