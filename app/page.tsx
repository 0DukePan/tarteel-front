import { ClassesSection } from "./components/classes-section";
import { FeaturesSection } from "./components/features-section";
import { HeroSection } from "./components/hero-section";
import { RegistrationSection } from "./components/registration-section";

export default function HomePage(){
  return (
   <main className="min-h-screen">
    <HeroSection/>
    <FeaturesSection/>
     <ClassesSection/>
     <RegistrationSection/>
   </main>

  )
}