import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

// 事件篩選器類型
export interface EventFilters {
    tags?: string[];
    status?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    limit?: number;
}

// 獲取活動列表
export function useEvents(filters?: EventFilters) {
    return useQuery({
        queryKey: ['events', filters],
        queryFn: async () => {
            const supabase = createClient();
            let query = supabase
                .from('events')
                .select('*')
                .eq('status', 'published');

            if (filters?.tags && filters.tags.length > 0) {
                query = query.contains('tags', filters.tags);
            }

            if (filters?.startDate) {
                query = query.gte('start_time', filters.startDate);
            }

            if (filters?.search) {
                // Enhanced full-text search across multiple fields
                const searchTerm = `%${filters.search}%`;
                query = query.or(`title.ilike.${searchTerm},description_short.ilike.${searchTerm},venue_name.ilike.${searchTerm}`);
            }

            if (filters?.limit) {
                query = query.limit(filters.limit);
            }

            const { data, error } = await query.order('start_time', { ascending: true });

            if (error) throw error;
            return data;
        },
        staleTime: 1000 * 60 * 2, // 2 分鐘
    });
}

// 獲取單個活動
export function useEvent(eventId: string) {
    return useQuery({
        queryKey: ['event', eventId],
        queryFn: async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('id', eventId)
                .single();

            if (error) throw error;
            return data;
        },
        enabled: !!eventId,
    });
}

// 獲取用戶參加過的活動
export function useUserEvents(userId?: string) {
    return useQuery({
        queryKey: ['userEvents', userId],
        queryFn: async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('registrations')
                .select('*, event:events(*)')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        },
        enabled: !!userId,
    });
}

// 獲取地圖上的活動（有座標）
export function useMapEvents() {
    return useQuery({
        queryKey: ['mapEvents'],
        queryFn: async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('events')
                .select('id, title, venue_name, gps_lat, gps_lng, cover_image, start_time')
                .eq('status', 'published')
                .not('gps_lat', 'is', null)
                .not('gps_lng', 'is', null)
                .order('start_time', { ascending: true })
                .limit(50);

            if (error) throw error;
            return data;
        },
        staleTime: 1000 * 60 * 5, // 5 分鐘
    });
}

// 使緩存失效
export function useInvalidateEvents() {
    const queryClient = useQueryClient();

    return {
        invalidateAll: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
        invalidateEvent: (eventId: string) =>
            queryClient.invalidateQueries({ queryKey: ['event', eventId] }),
    };
}
