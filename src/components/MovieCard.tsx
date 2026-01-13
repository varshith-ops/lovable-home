import { motion } from "framer-motion";
import { Star, Heart } from "lucide-react";
import { useState } from "react";

interface Movie {
  id: number;
  title: string;
  poster: string;
  rating: number;
  votes: string;
  genres: string[];
  releaseDate?: string;
}

interface MovieCardProps {
  movie: Movie;
  index: number;
}

const MovieCard = ({ movie, index }: MovieCardProps) => {
  const [isLiked, setIsLiked] = useState(false);

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
          src={movie.poster}
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

        {/* Rating Badge */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-background to-transparent">
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="font-semibold text-foreground text-sm">
              {movie.rating}/10
            </span>
            <span className="text-muted-foreground text-xs">
              {movie.votes}
            </span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1.5">
        <h3 className="font-semibold text-foreground text-sm md:text-base line-clamp-1 group-hover:text-primary transition-colors">
          {movie.title}
        </h3>
        <p className="text-muted-foreground text-xs md:text-sm line-clamp-1">
          {movie.genres.join(" • ")}
        </p>
      </div>
    </motion.div>
  );
};

export default MovieCard;
