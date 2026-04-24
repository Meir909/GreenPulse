import ParticleBackground from "@/components/ParticleBackground";
import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import SolutionSection from "@/components/SolutionSection";
import DashboardSection from "@/components/DashboardSection";
import CalculatorSection from "@/components/CalculatorSection";
import ComparisonSection from "@/components/ComparisonSection";
import BusinessSection from "@/components/BusinessSection";
import RoadmapSection from "@/components/RoadmapSection";
import Footer from "@/components/FooterSection";

const Index = () => {
  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden pb-24">
      <ParticleBackground />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <DashboardSection />
      <CalculatorSection />
      <ComparisonSection />
      <BusinessSection />
      <RoadmapSection />
      <Footer />
    </div>
  );
};

export default Index;
