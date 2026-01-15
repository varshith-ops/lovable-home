import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useBookedSeats = (showtimeId: string | null) => {
  return useQuery({
    queryKey: ["booked-seats", showtimeId],
    queryFn: async () => {
      if (!showtimeId) return [];

      // Query the public seat_locks table to get ALL booked seats for this showtime
      // This table has public read access, preventing double-booking race conditions
      const { data, error } = await supabase
        .from("seat_locks")
        .select("seat_number")
        .eq("showtime_id", showtimeId);

      if (error) throw error;

      // Extract seat numbers from the result
      const allBookedSeats = data?.map(lock => lock.seat_number) || [];
      return allBookedSeats;
    },
    enabled: !!showtimeId,
    refetchInterval: 5000, // Refresh every 5 seconds to catch new bookings
  });
};
