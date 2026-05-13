import { Header } from "@/components/freshon/Header";
import { Hero } from "@/components/freshon/Hero";
import { Categories } from "@/components/freshon/Categories";
import { FreshToday, ProductGrid } from "@/components/freshon/Products";
import { FarmerHighlight } from "@/components/freshon/FarmerHighlight";
import { Trust } from "@/components/freshon/Trust";
import { Footer } from "@/components/freshon/Footer";
import { StickyCartBar } from "@/components/freshon/StickyCartBar";
import { MobileTabBar } from "@/components/freshon/MobileTabBar";
import { PrideBanner } from "@/components/freshon/PrideBanner";

const Index = () => (
  <div className="min-h-screen bg-background pb-24 md:pb-0">
    <Header />
    <Hero />
    <main className="container mx-auto space-y-16 px-4 py-12 md:py-16">
      <Categories />
      <FreshToday />
      <ProductGrid />
      <PrideBanner />
      <FarmerHighlight />
    </main>
    <Trust />
    <Footer />
    <StickyCartBar />
  </div>
);

export default Index;
