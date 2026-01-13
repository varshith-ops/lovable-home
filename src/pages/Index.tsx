import { useState } from "react";
import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import MovieCarouselDB from "@/components/MovieCarouselDB";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import BookingsDrawer from "@/components/BookingsDrawer";
import { useNowShowingMovies, useComingSoonMovies } from "@/hooks/useMovies";

const Index = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isBookingsOpen, setIsBookingsOpen] = useState(false);

  const { data: nowShowing = [], isLoading: loadingNow } = useNowShowingMovies();
  const { data: comingSoon = [], isLoading: loadingComing } = useComingSoonMovies();

  return (
    <div className="min-h-screen bg-background">
      <Header onOpenAuth={() => setIsAuthOpen(true)} onOpenBookings={() => setIsBookingsOpen(true)} />
      <main>
        <HeroBanner />
        <MovieCarouselDB title="NOW SHOWING" subtitle="Book tickets for movies currently in theaters" movies={nowShowing} isLoading={loadingNow} onAuthRequired={() => setIsAuthOpen(true)} />
        <MovieCarouselDB title="COMING SOON" subtitle="Get notified when tickets go on sale" movies={comingSoon} isLoading={loadingComing} onAuthRequired={() => setIsAuthOpen(true)} />
      </main>
      <Footer />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <BookingsDrawer isOpen={isBookingsOpen} onClose={() => setIsBookingsOpen(false)} />
    </div>
  );
};

export default Index;
