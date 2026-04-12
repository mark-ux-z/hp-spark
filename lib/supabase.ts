import { createClient } from "@supabase/supabase-js";
import type { ProductionSpec } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Campaign = {
  id: string;
  user_id: string;
  status: "draft" | "active";
  brand_context: string | null;
  brand_name: string | null;
  asset_filenames: string[] | null;
  created_at: string;
  updated_at: string;
};

export type IdeaStatus = "approved" | "maybe" | "rejected";

// mockup_style is JSONB — we piggyback _pkg and _prod for spec persistence
export type MockupStyle = {
  shot: string;
  mood: string;
  finish: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export type Idea = {
  id: string;
  campaign_id: string;
  title: string;
  description: string;
  strategy_type: "VDP" | "QR" | "Personalized";
  mockup_url: string | null;
  mockup_style: MockupStyle | null;
  idea_status: IdeaStatus | null;
  feedback_history: { text: string; timestamp: string }[] | null;
  created_at: string;
  updated_at: string;
};

export type Asset = {
  id: string;
  campaign_id: string;
  filename: string;
  file_type: string | null;
  file_size_bytes: number | null;
  storage_path: string | null;
  created_at: string;
};

// ─── Idea updates ─────────────────────────────────────────────────────────────

export async function updateIdea(
  ideaId: string,
  updates: {
    title?: string;
    description?: string;
    strategy_type?: string;
    mockup_url?: string;
    mockup_style?: MockupStyle;
    idea_status?: IdeaStatus | null;
  },
  feedback?: string
) {
  const { data: idea, error: fetchError } = await supabase
    .from("ideas")
    .select("*")
    .eq("id", ideaId)
    .single();

  if (fetchError) throw fetchError;

  const payload: Record<string, unknown> = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  if (feedback) {
    const history = idea.feedback_history || [];
    payload.feedback_history = [
      ...history,
      { text: feedback, timestamp: new Date().toISOString() },
    ];
  }

  const { error } = await supabase
    .from("ideas")
    .update(payload)
    .eq("id", ideaId);

  if (error) throw error;
}

// Save packaging + production specs into mockup_style JSONB (no schema change needed)
export async function saveIdeaSpecs(
  ideaId: string,
  pkg: unknown | null,
  prod: unknown | null
) {
  const { data: idea } = await supabase
    .from("ideas")
    .select("mockup_style")
    .eq("id", ideaId)
    .single();

  const existing: Record<string, unknown> = idea?.mockup_style ?? {};
  const updated = { ...existing, _pkg: pkg ?? null, _prod: prod ?? null };

  await supabase
    .from("ideas")
    .update({ mockup_style: updated, updated_at: new Date().toISOString() })
    .eq("id", ideaId);
}

// ─── User settings (stored as a special __settings__ campaign row) ─────────────

const SETTINGS_USER = "demo-user-settings";
const SETTINGS_NAME = "__settings__";

export type SpecPreset = {
  id: string;
  name: string;
  spec: ProductionSpec;
};

export type UserSettings = {
  campaignNames: Record<string, string>;
  campaignStatuses: Record<string, string>;
  specPresets: SpecPreset[];
};

const EMPTY_SETTINGS: UserSettings = {
  campaignNames: {},
  campaignStatuses: {},
  specPresets: [],
};

let settingsCache: { id: string | null; data: UserSettings } | null = null;

export async function getSettings(): Promise<UserSettings> {
  const { data } = await supabase
    .from("campaigns")
    .select("id, brand_context")
    .eq("user_id", SETTINGS_USER)
    .eq("brand_name", SETTINGS_NAME)
    .maybeSingle();

  if (!data) {
    settingsCache = { id: null, data: EMPTY_SETTINGS };
    return EMPTY_SETTINGS;
  }

  try {
    const parsed = JSON.parse(data.brand_context ?? "{}");
    settingsCache = { id: data.id, data: { ...EMPTY_SETTINGS, ...parsed } };
    return settingsCache.data;
  } catch {
    settingsCache = { id: data.id, data: EMPTY_SETTINGS };
    return EMPTY_SETTINGS;
  }
}

export async function saveSettings(partial: Partial<UserSettings>): Promise<void> {
  // Get latest (or use cache)
  let current = settingsCache?.data ?? EMPTY_SETTINGS;
  const merged: UserSettings = { ...current, ...partial };
  settingsCache = { id: settingsCache?.id ?? null, data: merged };

  const payload = {
    user_id: SETTINGS_USER,
    brand_name: SETTINGS_NAME,
    status: "draft" as const,
    brand_context: JSON.stringify(merged),
    updated_at: new Date().toISOString(),
  };

  if (settingsCache.id) {
    await supabase.from("campaigns").update(payload).eq("id", settingsCache.id);
  } else {
    const { data } = await supabase
      .from("campaigns")
      .insert(payload)
      .select("id")
      .single();
    if (data) settingsCache.id = data.id;
  }
}
