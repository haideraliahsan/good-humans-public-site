import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import About from "@/components/About";
import Services from "@/components/Services";
import HowWeWork from "@/components/HowWeWork";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Page() {
  return (
    <main className="min-h-screen">
      <Nav />
      <Hero />
      <Marquee />
      <About />
      <Services />
      <HowWeWork />
      <Contact />
      <Footer />
    </main>
  );
}
