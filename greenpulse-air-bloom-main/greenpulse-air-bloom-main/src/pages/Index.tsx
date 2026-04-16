import ParticleBackground from "@/components/ParticleBackground";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import SolutionSection from "@/components/SolutionSection";
import DashboardSection from "@/components/DashboardSection";
import CalculatorSection from "@/components/CalculatorSection";
import ComparisonSection from "@/components/ComparisonSection";
import BusinessSection from "@/components/BusinessSection";
import RoadmapSection from "@/components/RoadmapSection";
import MarketSection from "@/components/MarketSection";
import TeamSection from "@/components/TeamSection";
import Footer from "@/components/FooterSection";

const Index = () => {
  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      <ParticleBackground />
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <DashboardSection />
      <CalculatorSection />
      <ComparisonSection />
      <BusinessSection />
      <RoadmapSection />
      <MarketSection />
      <TeamSection />
      <Footer />
    </div>
  );
};

export default Index;
