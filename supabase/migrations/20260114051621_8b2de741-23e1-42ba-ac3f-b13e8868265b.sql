-- Drop the old view and recreate with security_invoker
DROP VIEW IF EXISTS public.booked_seats_by_showtime;

CREATE OR REPLACE VIEW public.booked_seats_by_showtime
WITH (security_invoker=on) AS
SELECT 
  showtime_id,
  ARRAY_AGG(seat_number) as booked_seats
FROM (
  SELECT 
    showtime_id,
    UNNEST(seat_numbers) as seat_number
  FROM public.bookings
  WHERE status IN ('pending', 'confirmed', 'paid')
    AND showtime_id IS NOT NULL
) sub
GROUP BY showtime_id;