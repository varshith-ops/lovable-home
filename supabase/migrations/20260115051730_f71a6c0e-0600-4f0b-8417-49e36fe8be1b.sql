-- Create seat_locks table with public read access to prevent double-booking
CREATE TABLE public.seat_locks (
  showtime_id UUID NOT NULL REFERENCES showtimes(id) ON DELETE CASCADE,
  seat_number TEXT NOT NULL,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  locked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (showtime_id, seat_number)
);

-- Enable RLS
ALTER TABLE public.seat_locks ENABLE ROW LEVEL SECURITY;

-- Anyone can view locked seats (critical for preventing double-booking)
CREATE POLICY "Anyone can view locked seats"
  ON public.seat_locks FOR SELECT USING (true);

-- Only the booking owner can insert their seat locks (via trigger, but policy for safety)
CREATE POLICY "Users can lock seats for their bookings"
  ON public.seat_locks FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings 
      WHERE bookings.id = seat_locks.booking_id 
      AND bookings.user_id = auth.uid()
    )
  );

-- Allow deletion when booking is cancelled (cascades automatically, but policy for manual cleanup)
CREATE POLICY "Users can unlock their own seats"
  ON public.seat_locks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM bookings 
      WHERE bookings.id = seat_locks.booking_id 
      AND bookings.user_id = auth.uid()
    )
  );

-- Create trigger function to auto-populate seat_locks when booking is created
CREATE OR REPLACE FUNCTION public.sync_seat_locks()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Insert each seat from the seat_numbers array
    INSERT INTO public.seat_locks (showtime_id, seat_number, booking_id)
    SELECT NEW.showtime_id, unnest(NEW.seat_numbers), NEW.id
    ON CONFLICT (showtime_id, seat_number) DO NOTHING;
  ELSIF TG_OP = 'UPDATE' THEN
    -- If booking is cancelled, remove the seat locks
    IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
      DELETE FROM public.seat_locks WHERE booking_id = NEW.id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    -- Remove seat locks when booking is deleted
    DELETE FROM public.seat_locks WHERE booking_id = OLD.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on bookings table
CREATE TRIGGER sync_seats_on_booking
  AFTER INSERT OR UPDATE OR DELETE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.sync_seat_locks();

-- Backfill existing bookings into seat_locks
INSERT INTO public.seat_locks (showtime_id, seat_number, booking_id)
SELECT b.showtime_id, unnest(b.seat_numbers), b.id
FROM public.bookings b
WHERE b.showtime_id IS NOT NULL 
  AND b.seat_numbers IS NOT NULL 
  AND array_length(b.seat_numbers, 1) > 0
  AND b.status IN ('pending', 'confirmed', 'paid')
ON CONFLICT (showtime_id, seat_number) DO NOTHING;