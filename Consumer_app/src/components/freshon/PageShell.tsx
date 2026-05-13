import { type ReactNode } from "react";
import { Header } from "./Header";
import { MobileTabBar } from "./MobileTabBar";

export const PageShell = ({ children, hideTabBar }: { children: ReactNode; hideTabBar?: boolean }) => (
  <div className="flex min-h-screen flex-col bg-background selection:bg-mint/30">
    <Header />
    <main className="flex-1 animate-fade-in pt-16 md:pt-20 pb-32 md:pb-12">
      <div className="mx-auto w-full max-w-screen-xl px-0 md:px-6">
        {children}
      </div>
    </main>
    {!hideTabBar && <MobileTabBar />}
    
    {/* Mobile Safe Area Bottom Spacer */}
    <div className="h-[env(safe-area-inset-bottom)] bg-background md:hidden" />
  </div>
);
