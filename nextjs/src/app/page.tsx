import Navbar from "@/components/Navbar";
import HeroSection                from "@/components/sections/HeroSection";
import WhatIsSection              from "@/components/sections/WhatIsSection";
import ProblemSection             from "@/components/sections/ProblemSection";
import SolutionSection            from "@/components/sections/SolutionSection";
import ScientificValidationSection from "@/components/sections/ScientificValidationSection";
import DashboardSection           from "@/components/sections/DashboardSection";
import Co2CounterSection          from "@/components/sections/Co2CounterSection";
import HistoricalSection          from "@/components/sections/HistoricalSection";
import CalculatorSection          from "@/components/sections/CalculatorSection";
import QRSection                  from "@/components/sections/QRSection";
import Footer                     from "@/components/Footer";
import ChatbotFloatingButton      from "@/components/ChatbotFloatingButton";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        {/* Group 1 — Problem & Solution */}
        <HeroSection />
        <WhatIsSection />
        <ProblemSection />
        <SolutionSection />

        {/* Group 2 — Science & Credibility */}
        <ScientificValidationSection />

        {/* Group 3 — Live Data */}
        <DashboardSection />
        <HistoricalSection />

        {/* Group 4 — Impact */}
        <Co2CounterSection />
        <CalculatorSection />

        {/* Group 5 — CTA */}
        <QRSection />
      </main>
      <Footer />
      <ChatbotFloatingButton />
    </>
  );
}
