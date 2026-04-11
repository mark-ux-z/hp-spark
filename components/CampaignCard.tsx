import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import { Campaign } from "@/lib/supabase";

export default function CampaignCard({ campaign }: { campaign: Campaign }) {
  const date = new Date(campaign.created_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Link href={`/campaign/${campaign.id}`}>
      <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-[#0096D6] hover:shadow-sm transition-all group cursor-pointer">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#212121] truncate">
              {campaign.brand_name || "Unnamed Campaign"}
            </p>
            <p className="text-xs text-[#6B7280] mt-0.5 truncate">{campaign.brand_context}</p>
          </div>
          <ArrowRight
            size={16}
            className="text-[#6B7280] group-hover:text-[#0096D6] shrink-0 mt-0.5 transition-colors"
          />
        </div>
        <div className="flex items-center gap-3 mt-3">
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              campaign.status === "active"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-[#F1F1F1] text-[#6B7280]"
            }`}
          >
            {campaign.status}
          </span>
          <span className="flex items-center gap-1 text-xs text-[#6B7280]">
            <Calendar size={11} />
            {date}
          </span>
        </div>
      </div>
    </Link>
  );
}
