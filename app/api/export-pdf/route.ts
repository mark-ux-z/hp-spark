import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { supabase } from "@/lib/supabase";
import { CampaignPDF } from "@/lib/pdf-template";

export async function GET(req: NextRequest) {
  try {
    const campaignId = req.nextUrl.searchParams.get("campaignId");
    if (!campaignId) {
      return NextResponse.json({ error: "campaignId is required" }, { status: 400 });
    }

    const [{ data: campaign, error: ce }, { data: ideas, error: ie }] = await Promise.all([
      supabase.from("campaigns").select("*").eq("id", campaignId).single(),
      supabase.from("ideas").select("*").eq("campaign_id", campaignId).order("created_at", { ascending: true }),
    ]);

    if (ce || !campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }
    if (ie) throw ie;

    const element = React.createElement(CampaignPDF, { campaign, ideas: ideas ?? [] });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(element as any);

    const filename = `HP-Spark-${(campaign.brand_name ?? "campaign").replace(/\s+/g, "-")}-Brief.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(buffer.length),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate PDF";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
