export type Restaurant = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  city: string | null;
  discount_pct: number;
  created_at: string;
};

export type MenuItem = {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  category: string;
  price_cents: number;
  active: boolean;
  display_order: number;
};

export type Submission = {
  id: string;
  restaurant_id: string;
  phone: string | null;
  overall_rating: number;
  overall_comment: string | null;
  discount_code: string;
  created_at: string;
};

export type ItemFeedback = {
  id: string;
  submission_id: string;
  menu_item_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export type ItemFeedbackWithItem = ItemFeedback & {
  menu_item: Pick<MenuItem, "id" | "name" | "category">;
};

export type SubmissionWithItems = Submission & {
  item_feedback: ItemFeedbackWithItem[];
};

export type WeeklySummary = {
  generated_at: string;
  period_days: number;
  total_submissions: number;
  fix: { title: string; detail: string; item?: string }[];
  working: { title: string; detail: string; item?: string }[];
  trend: { title: string; detail: string };
};
