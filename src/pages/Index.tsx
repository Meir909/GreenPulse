import ParticleBackground from "@/components/ParticleBackground";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import WhatIsGreenpulseSection from "@/components/WhatIsGreenpulseSection";
import ProblemSection from "@/components/ProblemSection";
import SolutionSection from "@/components/SolutionSection";
import DashboardSection from "@/components/DashboardSection";
import DataDashboardSection from "@/components/DataDashboardSection";
import CityRankingSection from "@/components/CityRankingSection";
import ESGAnalyticsSection from "@/components/ESGAnalyticsSection";
import APIIntegrationSection from "@/components/APIIntegrationSection";
import OpenDataSection from "@/components/OpenDataSection";
import UseCasesSection from "@/components/UseCasesSection";
import CalculatorSection from "@/components/CalculatorSection";
import ComparisonSection from "@/components/ComparisonSection";
import BusinessSection from "@/components/BusinessSection";
import RoadmapSection from "@/components/RoadmapSection";
import MarketSection from "@/components/MarketSection";
import TeamSection from "@/components/TeamSection";
import Footer from "@/components/FooterSection";
import ChatbotFloatingButton from "@/components/ChatbotFloatingButton";

const Index = () => {
  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      <ParticleBackground />
      <Navbar />

      {/* Main Landing Flow */}
      <HeroSection />
      <WhatIsGreenpulseSection />
      <ProblemSection />
      <SolutionSection />

      {/* Platform Features & Capabilities */}
      <DashboardSection />
      <DataDashboardSection />
      <CityRankingSection />

      {/* Enterprise & B2B Solutions */}
      <ESGAnalyticsSection />
      <APIIntegrationSection />
      <OpenDataSection />

      {/* Application & Use Cases */}
      <UseCasesSection />

      {/* Additional Content */}
      <CalculatorSection />
      <ComparisonSection />
      <BusinessSection />
      <RoadmapSection />
      <MarketSection />
      <TeamSection />

      {/* Footer & Actions */}
      <Footer />
      <ChatbotFloatingButton />
    </div>
  );
};

export default Index;
