import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Writer from "@/components/Writer";
import { Why, HowItWorks, UseCases } from "@/components/Landing";
import Footer from "@/components/Footer";
export default function Home() {
  return <><Navbar /><main><Hero /><Writer /><Why /><HowItWorks /><UseCases /></main><Footer /></>;
}
