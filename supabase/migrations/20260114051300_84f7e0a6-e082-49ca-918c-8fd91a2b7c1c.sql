-- Create theaters table
CREATE TABLE public.theaters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Mumbai',
  amenities TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.theaters ENABLE ROW LEVEL SECURITY;

-- Anyone can view theaters
CREATE POLICY "Anyone can view theaters"
  ON public.theaters FOR SELECT
  USING (true);

-- Create showtimes table linking movies, theaters and times
CREATE TABLE public.showtimes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  movie_id UUID NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  theater_id UUID NOT NULL REFERENCES public.theaters(id) ON DELETE CASCADE,
  show_time TIME NOT NULL,
  show_date DATE NOT NULL,
  price NUMERIC DEFAULT 250,
  available_seats INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.showtimes ENABLE ROW LEVEL SECURITY;

-- Anyone can view showtimes
CREATE POLICY "Anyone can view showtimes"
  ON public.showtimes FOR SELECT
  USING (true);

-- Add theater_id and showtime_id to bookings
ALTER TABLE public.bookings 
  ADD COLUMN theater_id UUID REFERENCES public.theaters(id),
  ADD COLUMN showtime_id UUID REFERENCES public.showtimes(id);

-- Add updated_at trigger for theaters
CREATE TRIGGER update_theaters_updated_at
  BEFORE UPDATE ON public.theaters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger for showtimes
CREATE TRIGGER update_showtimes_updated_at
  BEFORE UPDATE ON public.showtimes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample theaters
INSERT INTO public.theaters (name, location, city, amenities) VALUES
  ('PVR Phoenix', 'Lower Parel', 'Mumbai', ARRAY['IMAX', 'Dolby Atmos', 'Recliner Seats']),
  ('INOX Megaplex', 'Malad', 'Mumbai', ARRAY['4DX', 'Dolby Atmos', 'Food Court']),
  ('Cinepolis', 'Andheri', 'Mumbai', ARRAY['VIP Lounge', 'Dolby Atmos']),
  ('PVR Icon', 'Versova', 'Mumbai', ARRAY['IMAX', 'Premium Seats', 'Parking']),
  ('INOX Leisure', 'Nariman Point', 'Mumbai', ARRAY['Dolby Atmos', 'Recliner Seats']);

-- Insert sample showtimes for now_showing movies
-- Get movie IDs and create showtimes for multiple dates
DO $$
DECLARE
  movie_rec RECORD;
  theater_rec RECORD;
  show_date DATE;
  times TIME[] := ARRAY['10:00:00', '13:30:00', '16:00:00', '19:30:00', '22:00:00']::TIME[];
  t TIME;
BEGIN
  FOR movie_rec IN SELECT id FROM public.movies WHERE availability = 'now_showing' LOOP
    FOR theater_rec IN SELECT id FROM public.theaters LOOP
      FOR i IN 0..6 LOOP
        show_date := CURRENT_DATE + i;
        FOREACH t IN ARRAY times LOOP
          INSERT INTO public.showtimes (movie_id, theater_id, show_time, show_date, price, available_seats)
          VALUES (movie_rec.id, theater_rec.id, t, show_date, 250 + (random() * 100)::INTEGER, 100);
        END LOOP;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;