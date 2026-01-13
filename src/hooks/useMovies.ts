import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Movie = Tables<"movies">;

export const useMovies = () => {
  return useQuery({
    queryKey: ["movies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movies")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Movie[];
    },
  });
};

export const useNowShowingMovies = () => {
  return useQuery({
    queryKey: ["movies", "now_showing"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movies")
        .select("*")
        .eq("availability", "now_showing")
        .order("rating", { ascending: false });

      if (error) throw error;
      return data as Movie[];
    },
  });
};

export const useComingSoonMovies = () => {
  return useQuery({
    queryKey: ["movies", "coming_soon"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movies")
        .select("*")
        .eq("availability", "coming_soon")
        .order("release_date", { ascending: true });

      if (error) throw error;
      return data as Movie[];
    },
  });
};

export const useMovieById = (id: string) => {
  return useQuery({
    queryKey: ["movies", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movies")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data as Movie | null;
    },
    enabled: !!id,
  });
};
