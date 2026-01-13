import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import MovieCardDB from "./MovieCardDB";
import BookingModal from "./BookingModal";
import type { Movie } from "@/hooks/useMovies";

interface MovieCarouselDBProps {
  title: string;
  subtitle: string;
  movies: Movie[];
  isLoading?: boolean;
  onAuthRequired: () => void;
}

const MovieCarouselDB = ({
  title,
  subtitle,
  movies,
  isLoading,
  onAuthRequired,
}: MovieCarouselDBProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleBook = (movie: Movie) => {
    setSelectedMovie(movie);
  };

  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl md:text-3xl text-foreground tracking-wide">
              {title}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
          </div>

          {/* Navigation Arrows */}
          <div className="hidden md:flex gap-2">
            <motion.button
              className="p-2 rounded-lg bg-secondary border border-border hover:border-primary transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => scroll("left")}
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </motion.button>
            <motion.button
              className="p-2 rounded-lg bg-secondary border border-border hover:border-primary transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => scroll("right")}
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </motion.button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && movies.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No movies available in this category
          </div>
        )}

        {/* Movies Carousel */}
        {!isLoading && movies.length > 0 && (
          <div
            ref={scrollRef}
            className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {movies.map((movie, index) => (
              <MovieCardDB
                key={movie.id}
                movie={movie}
                index={index}
                onBook={handleBook}
                onAuthRequired={onAuthRequired}
              />
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedMovie && (
        <BookingModal
          isOpen={!!selectedMovie}
          onClose={() => setSelectedMovie(null)}
          movie={selectedMovie}
        />
      )}
    </section>
  );
};

export default MovieCarouselDB;
