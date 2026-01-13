import { motion } from "framer-motion";
import { Star, Heart, Ticket } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { Movie } from "@/hooks/useMovies";

interface MovieCardDBProps {
  movie: Movie;
  index: number;
  onBook: (movie: Movie) => void;
  onAuthRequired: () => void;
}

const MovieCardDB = ({ movie, index, onBook, onAuthRequired }: MovieCardDBProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const { user } = useAuth();

  const handleBook = () => {
    if (!user) {
      onAuthRequired();
      return;
    }
    onBook(movie);
  };

  const isComingSoon = movie.availability === "coming_soon";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group relative flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px]"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3">
        <img
          src={movie.poster_url || "https://via.placeholder.com/400x600"}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Like Button */}
        <motion.button
          className="absolute top-3 right-3 p-2 bg-background/50 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsLiked(!isLiked)}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isLiked ? "fill-primary text-primary" : "text-foreground"
            }`}
          />
        </motion.button>

        {/* Coming Soon Badge */}
        {isComingSoon && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded">
            Coming Soon
          </div>
        )}

        {/* Rating Badge */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-background to-transparent">
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="font-semibold text-foreground text-sm">
              {movie.rating ? `${movie.rating}/10` : "N/A"}
            </span>
          </div>
        </div>

        {/* Book Button on Hover */}
        {!isComingSoon && (
          <motion.button
            className="absolute bottom-14 left-1/2 -translate-x-1/2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2 glow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBook}
          >
            <Ticket className="w-4 h-4" />
            Book Now
          </motion.button>
        )}
      </div>

      {/* Info */}
      <div className="space-y-1.5">
        <h3 className="font-semibold text-foreground text-sm md:text-base line-clamp-1 group-hover:text-primary transition-colors">
          {movie.title}
        </h3>
        <p className="text-muted-foreground text-xs md:text-sm line-clamp-1">
          {movie.genre?.join(" • ")}
        </p>
        <p className="text-primary font-semibold text-sm">
          ₹{movie.price}
        </p>
      </div>
    </motion.div>
  );
};

export default MovieCardDB;
