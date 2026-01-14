import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useBookedSeats = (showtimeId: string | null) => {
  return useQuery({
    queryKey: ["booked-seats", showtimeId],
    queryFn: async () => {
      if (!showtimeId) return [];

      // Get all bookings for this showtime and extract seat numbers
      const { data, error } = await supabase
        .from("bookings")
        .select("seat_numbers")
        .eq("showtime_id", showtimeId)
        .in("status", ["pending", "confirmed", "paid"]);

      if (error) throw error;

      // Flatten all seat numbers from all bookings
      const allBookedSeats = data?.flatMap(booking => booking.seat_numbers || []) || [];
      return allBookedSeats;
    },
    enabled: !!showtimeId,
    refetchInterval: 5000, // Refresh every 5 seconds to catch new bookings
  });
};
