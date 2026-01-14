-- Add seat_numbers column to bookings to store which seats were booked
ALTER TABLE public.bookings 
  ADD COLUMN seat_numbers TEXT[] DEFAULT '{}';

-- Create a view to get booked seats per showtime
CREATE OR REPLACE VIEW public.booked_seats_by_showtime AS
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