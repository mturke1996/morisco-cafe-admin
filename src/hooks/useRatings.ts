import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Rating, CreateRatingData, UpdateRatingData, RatingStats, RatingFilters } from '@/types/ratings';
import { generateProfanityReport } from '@/utils/profanityFilter';

// Hook لجلب التقييمات
export function useRatings(filters?: RatingFilters) {
  return useQuery({
    queryKey: ['ratings', filters],
    queryFn: async () => {
      let query = supabase
        .from('ratings')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.rating) {
        query = query.eq('rating', filters.rating);
      }
      if (filters?.is_approved !== undefined) {
        query = query.eq('is_approved', filters.is_approved);
      }
      if (filters?.is_flagged !== undefined) {
        query = query.eq('is_flagged', filters.is_flagged);
      }
      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to);
      }
      if (filters?.search) {
        query = query.or(`customer_name.ilike.%${filters.search}%,comment.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Rating[];
    },
  });
}

// Hook لجلب إحصائيات التقييمات
export function useRatingStats() {
  return useQuery({
    queryKey: ['rating-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ratings')
        .select('rating, is_approved, is_flagged');

      if (error) throw error;

      const stats: RatingStats = {
        total_ratings: data.length,
        average_rating: 0,
        rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        approved_ratings: 0,
        flagged_ratings: 0,
        pending_ratings: 0,
      };

      let totalRating = 0;
      data.forEach((rating) => {
        totalRating += rating.rating;
        stats.rating_distribution[rating.rating as keyof typeof stats.rating_distribution]++;
        
        if (rating.is_approved) stats.approved_ratings++;
        if (rating.is_flagged) stats.flagged_ratings++;
        if (!rating.is_approved && !rating.is_flagged) stats.pending_ratings++;
      });

      stats.average_rating = data.length > 0 ? totalRating / data.length : 0;

      return stats;
    },
  });
}

// Hook لإضافة تقييم جديد
export function useAddRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ratingData: CreateRatingData) => {
      // فحص المحتوى المسيء
      const profanityReport = generateProfanityReport(ratingData.comment || '');
      
      const { data, error } = await supabase
        .from('ratings')
        .insert({
          ...ratingData,
          is_flagged: profanityReport.contains,
          flagged_reason: profanityReport.contains 
            ? `محتوى مسيء: ${profanityReport.words.join(', ')}` 
            : null,
          comment: profanityReport.cleaned,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Rating;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratings'] });
      queryClient.invalidateQueries({ queryKey: ['rating-stats'] });
    },
  });
}

// Hook لتحديث تقييم
export function useUpdateRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & UpdateRatingData) => {
      // فحص المحتوى المسيء إذا تم تحديث التعليق
      let finalUpdateData = { ...updateData };
      
      if (updateData.comment) {
        const profanityReport = generateProfanityReport(updateData.comment);
        finalUpdateData = {
          ...finalUpdateData,
          is_flagged: profanityReport.contains,
          flagged_reason: profanityReport.contains 
            ? `محتوى مسيء: ${profanityReport.words.join(', ')}` 
            : null,
          comment: profanityReport.cleaned,
        };
      }

      const { data, error } = await supabase
        .from('ratings')
        .update(finalUpdateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Rating;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratings'] });
      queryClient.invalidateQueries({ queryKey: ['rating-stats'] });
    },
  });
}

// Hook لحذف تقييم
export function useDeleteRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ratings')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratings'] });
      queryClient.invalidateQueries({ queryKey: ['rating-stats'] });
    },
  });
}

// Hook للموافقة على تقييم
export function useApproveRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('ratings')
        .update({ is_approved: true, is_flagged: false, flagged_reason: null })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Rating;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratings'] });
      queryClient.invalidateQueries({ queryKey: ['rating-stats'] });
    },
  });
}

// Hook لرفض تقييم
export function useRejectRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('ratings')
        .update({ is_approved: false })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Rating;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratings'] });
      queryClient.invalidateQueries({ queryKey: ['rating-stats'] });
    },
  });
}
