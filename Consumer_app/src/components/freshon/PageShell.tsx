import { type ReactNode } from "react";
import { Header } from "./Header";
import { MobileTabBar } from "./MobileTabBar";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Package } from "lucide-react";

export const PageShell = ({ children, hideTabBar }: { children: ReactNode; hideTabBar?: boolean }) => {
  const [searchParams] = useSearchParams();
  const modifyOrderId = searchParams.get("modify_order_id");

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-mint/30">
      <Header />
      
      {/* Modify Order Banner */}
      {modifyOrderId && (
        <div className="sticky top-16 z-40 w-full bg-forest px-4 py-2 text-white shadow-md">
          <div className="mx-auto flex max-w-screen-xl items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <p className="text-[11px] font-bold uppercase tracking-wider">Modifying Order #{modifyOrderId}</p>
            </div>
            <Link 
              to={`/track/${modifyOrderId}`}
              className="flex items-center gap-1 text-[11px] font-bold hover:underline"
            >
              <ArrowLeft className="h-3 w-3" /> Back to Order
            </Link>
          </div>
        </div>
      )}

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
};
