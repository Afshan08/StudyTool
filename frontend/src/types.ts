export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  created_at: string;
}

export interface VideoEntry {
  id: number;
  file: string;
  duration: number;
  uploaded_at: string;
}

export interface SessionEditHistory {
  id: number;
  edited_by_username: string;
  previous_category: string;
  new_category: string;
  previous_duration: number;
  new_duration: number;
  previous_notes: string;
  new_notes: string;
  reason: string;
  edited_at: string;
}

export interface StudySession {
  id: number;
  category: number | null;
  category_details: Category | null;
  start_time: string;
  end_time: string | null;
  duration: number;
  worked_on: string;
  next_task: string;
  stop_reason: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  video?: VideoEntry | null;
  edit_histories?: SessionEditHistory[];
}

export interface ChartItem {
  label: string;
  hours: number;
  date?: string;
}

export interface CategoryDistItem {
  name: string;
  color: string;
  hours: number;
  seconds: number;
}

export interface Stats {
  today_hours: number;
  week_hours: number;
  month_hours: number;
  lifetime_hours: number;
  streak: number;
  weekly_goal: number;
  goal_progress_percent: number;
  category_distribution: CategoryDistItem[];
  charts: {
    daily: ChartItem[];
    weekly: ChartItem[];
    monthly: ChartItem[];
  };
}
