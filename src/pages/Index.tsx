import ParticleBackground from "@/components/ParticleBackground";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import WhatIsGreenpulseSection from "@/components/WhatIsGreenpulseSection";
import ProblemSection from "@/components/ProblemSection";
import SolutionSection from "@/components/SolutionSection";
import DashboardSection from "@/components/DashboardSection";
import Co2CounterSection from "@/components/Co2CounterSection";
import HistoricalSection from "@/components/HistoricalSection";
import QRSection from "@/components/QRSection";
import CalculatorSection from "@/components/CalculatorSection";
import Footer from "@/components/FooterSection";
import ChatbotFloatingButton from "@/components/ChatbotFloatingButton";

const Index = () => {
  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      <ParticleBackground />
      <Navbar />

      {/* Landing Flow */}
      <HeroSection />
      <WhatIsGreenpulseSection />
      <ProblemSection />
      <SolutionSection />

      {/* Live Platform */}
      <DashboardSection />
      <Co2CounterSection />
      <HistoricalSection />

      {/* Tools */}
      <QRSection />
      <CalculatorSection />

      {/* Footer */}
      <Footer />
      <ChatbotFloatingButton />
    </div>
  );
};

export default Index;
