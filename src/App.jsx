import "./App.css";
import Navbar from "./Components/Navbar";
import Hero from "./Components/Hero";
import ContactUsSection from "./Components/ContactUsSection";
import AboutUsSection from "./Components/AboutUsSection";
import FooterSection from "./Components/FooterSection";
import ImageProvider from "./Context/ImageProvider";
import MainBackground from "./Components/MainBackground";
import PrivacyTermsSection from "./Components/PrivacyTermsSection";

export default function App() {
  return (
    <>
      <MainBackground />
      <div className="flex flex-col min-h-screen relative overflow-x-hidden text-[#eeeeee]">
        <ImageProvider>
          <Navbar />

          <main className="relative z-10 pt-16">
            <section id="home" className="scroll-mt-24">
              <Hero />
            </section>

            <AboutUsSection />
            <ContactUsSection />
            <PrivacyTermsSection />
            <FooterSection />
          </main>
        </ImageProvider>
      </div>
    </>
  );
}
