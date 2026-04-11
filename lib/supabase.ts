import { createClient } from "@supabase/supabase-js";

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

export type MockupStyle = {
  shot: string;
  mood: string;
  finish: string;
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
