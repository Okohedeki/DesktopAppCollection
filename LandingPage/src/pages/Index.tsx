import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Problem from "@/components/landing/Problem";
import Solution from "@/components/landing/Solution";
import UseCases from "@/components/landing/UseCases";
import Benefits from "@/components/landing/Benefits";
import Audience from "@/components/landing/Audience";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <UseCases />
        <Benefits />
        <Audience />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
