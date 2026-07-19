import "./App.css";
import Navbar from "./Components/Navbar";
import Hero from "./Components/Hero";
import ImageProvider from "./Context/ImageProvider";
import MainBackground from "./Components/MainBackground";
import { div } from "motion/react-client";

export default function App() {
  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden ">
      <MainBackground />
      <Navbar />
      <ImageProvider>
        <Hero />
      </ImageProvider>
    </div>
  );
}
