import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import MovieCarousel from "@/components/MovieCarousel";
import Footer from "@/components/Footer";
import { nowShowingMovies, comingSoonMovies, trendingMovies } from "@/data/movies";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroBanner />
        
        <MovieCarousel
          title="NOW SHOWING"
          subtitle="Book tickets for movies currently in theaters"
          movies={nowShowingMovies}
        />
        
        <MovieCarousel
          title="COMING SOON"
          subtitle="Get notified when tickets go on sale"
          movies={comingSoonMovies}
        />
        
        <MovieCarousel
          title="TRENDING"
          subtitle="Most popular movies this week"
          movies={trendingMovies}
        />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
