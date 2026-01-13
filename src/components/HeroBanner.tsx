import { motion } from "framer-motion";
import { Play, Star, Clock } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const HeroBanner = () => {
  return (
    <section className="relative min-h-[70vh] md:min-h-[85vh] flex items-end overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="Featured Movie"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 pb-12 md:pb-20 pt-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          {/* Badge */}
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/20 border border-primary/30 rounded-full text-sm text-primary mb-4"
          >
            <Star className="w-4 h-4 fill-primary" />
            Featured This Week
          </motion.span>

          {/* Title */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-foreground mb-4 leading-none">
            INTERSTELLAR
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 mb-6 text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span className="font-semibold text-foreground">8.7/10</span>
              <span className="text-sm">• 2.1M Votes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>2h 49m</span>
            </div>
            <span className="px-2 py-0.5 bg-secondary rounded text-sm">UA</span>
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-2 mb-8">
            {["Sci-Fi", "Adventure", "Drama", "IMAX"].map((genre) => (
              <span
                key={genre}
                className="px-3 py-1 bg-secondary/80 border border-border rounded-full text-sm text-foreground"
              >
                {genre}
              </span>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4">
            <motion.button
              className="flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground font-semibold rounded-lg glow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-5 h-5 fill-current" />
              Book Tickets
            </motion.button>
            <motion.button
              className="flex items-center gap-2 px-8 py-3.5 bg-secondary border border-border text-foreground font-semibold rounded-lg hover:bg-muted transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Watch Trailer
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroBanner;
