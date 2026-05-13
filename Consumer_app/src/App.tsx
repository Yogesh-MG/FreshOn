import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "./components/freshon/PageTransition";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import PrivateRoute from "@/components/PrivateRoute";
import { LocationProvider } from "@/context/LocationContext";
import { LocationPermissionBannerWithContext } from "@/components/LocationPermissionBanner";
import { FlyToCartProvider } from "@/context/FlyToCartContext";
import { ErrorBoundary } from "./components/freshon/ErrorBoundary";
import Index from "./pages/Index.tsx";
import Category from "./pages/Category.tsx";
import Product from "./pages/Product.tsx";
import Cart from "./pages/Cart.tsx";
import Checkout from "./pages/Checkout.tsx";
import Track from "./pages/Track.tsx";
import Profile from "./pages/Profile.tsx";
import QuickShop from "./pages/QuickShop.tsx";
import Categories from "./pages/Categories.tsx";
import Farmer from "./pages/Farmer.tsx";
import Welcome from "./pages/Welcome.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import Search from "./pages/Search.tsx";
import Pride from "./pages/Pride.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import VerifyOtp from "./pages/VerifyOtp.tsx";
import NotFound from "./pages/NotFound.tsx";

// Optimized QueryClient for mobile
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - aggressive cache
      gcTime: 10 * 60 * 1000,   // 10 minutes garbage collection
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

const RootGate = () => {
  const onboarded = localStorage.getItem("freshon_onboarded");
  if (!onboarded) return <Navigate to="/onboarding" replace />;
  if (!localStorage.getItem("freshon_access_token")) return <Navigate to="/welcome" replace />;
  return <Index />;
};

function AppContent() {
  const location = useLocation();

  return (
    <>
      <LocationPermissionBannerWithContext />
      <Toaster />
      <Sonner />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Protected routes */}
          <Route path="/" element={<PageTransition><RootGate /></PageTransition>} />
          <Route path="/cart" element={<PrivateRoute><PageTransition><Cart /></PageTransition></PrivateRoute>} />
          <Route path="/checkout" element={<PrivateRoute><PageTransition><Checkout /></PageTransition></PrivateRoute>} />
          <Route path="/track/:id" element={<PrivateRoute><PageTransition><Track /></PageTransition></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><PageTransition><ErrorBoundary><Profile /></ErrorBoundary></PageTransition></PrivateRoute>} />
          <Route path="/quick-shop" element={<PrivateRoute><PageTransition><QuickShop /></PageTransition></PrivateRoute>} />
          <Route path="/search" element={<PrivateRoute><PageTransition><Search /></PageTransition></PrivateRoute>} />

          {/* Public routes */}
          <Route path="/onboarding" element={<PageTransition><Onboarding /></PageTransition>} />
          <Route path="/verify-otp" element={<PageTransition><VerifyOtp /></PageTransition>} />
          <Route path="/category/:id" element={<PageTransition><Category /></PageTransition>} />
          <Route path="/product/:id" element={<PageTransition><Product /></PageTransition>} />
          <Route path="/farmer/:id" element={<PageTransition><Farmer /></PageTransition>} />
          <Route path="/categories" element={<PageTransition><Categories /></PageTransition>} />
          <Route path="/welcome" element={<PageTransition><Welcome /></PageTransition>} />
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
          <Route path="/pride" element={<PageTransition><Pride /></PageTransition>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LocationProvider>
          <FlyToCartProvider>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </FlyToCartProvider>
        </LocationProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
