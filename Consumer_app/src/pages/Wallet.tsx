import { PageShell } from "@/components/freshon/PageShell";
import { WalletSection } from "@/components/freshon/WalletSection";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

const WalletPage = () => {
  return (
    <PageShell>
      <div className="container max-w-2xl pt-6 pb-20">
        <div className="mb-6 flex items-center gap-4">
          <Link to="/profile" className="grid h-10 w-10 place-items-center rounded-full bg-surface hover:bg-mint-soft transition">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-display text-2xl font-bold">My Wallet</h1>
        </div>

        <WalletSection />
      </div>
    </PageShell>
  );
};

export default WalletPage;
