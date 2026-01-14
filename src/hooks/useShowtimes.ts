import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Theater = Tables<"theaters">;
export type Showtime = Tables<"showtimes">;

export interface ShowtimeWithTheater extends Showtime {
  theaters: Theater;
}

export interface TheaterWithShowtimes {
  theater: Theater;
  showtimes: Showtime[];
}

export const useTheaters = () => {
  return useQuery({
    queryKey: ["theaters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("theaters")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as Theater[];
    },
  });
};

export const useShowtimesByMovieAndDate = (movieId: string, date: string) => {
  return useQuery({
    queryKey: ["showtimes", movieId, date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("showtimes")
        .select(`
          *,
          theaters (*)
        `)
        .eq("movie_id", movieId)
        .eq("show_date", date)
        .order("show_time");

      if (error) throw error;
      
      // Group showtimes by theater
      const theaterMap = new Map<string, TheaterWithShowtimes>();
      
      (data as ShowtimeWithTheater[]).forEach((showtime) => {
        const theaterId = showtime.theater_id;
        if (!theaterMap.has(theaterId)) {
          theaterMap.set(theaterId, {
            theater: showtime.theaters,
            showtimes: [],
          });
        }
        theaterMap.get(theaterId)!.showtimes.push(showtime);
      });

      return Array.from(theaterMap.values());
    },
    enabled: !!movieId && !!date,
  });
};
