export interface Rating {
  id: string;
  customer_name: string;
  customer_phone: string;
  rating: number; // 1-5
  comment?: string;
  table_number?: number;
  order_id?: string;
  is_approved: boolean;
  is_flagged: boolean;
  flagged_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRatingData {
  customer_name: string;
  customer_phone: string;
  rating: number;
  comment?: string;
  table_number?: number;
  order_id?: string;
}

export interface UpdateRatingData {
  customer_name?: string;
  customer_phone?: string;
  rating?: number;
  comment?: string;
  table_number?: number;
  order_id?: string;
  is_approved?: boolean;
  is_flagged?: boolean;
  flagged_reason?: string;
}

export interface RatingStats {
  total_ratings: number;
  average_rating: number;
  rating_distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  approved_ratings: number;
  flagged_ratings: number;
  pending_ratings: number;
}

export interface RatingFilters {
  rating?: number;
  is_approved?: boolean;
  is_flagged?: boolean;
  date_from?: string;
  date_to?: string;
  search?: string;
}
