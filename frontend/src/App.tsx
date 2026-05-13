import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import PrivateRoute from "@/components/PrivateRoute";
import { LocationProvider } from "@/context/LocationContext";
import { LocationPermissionBannerWithContext } from "@/components/LocationPermissionBanner";
import Index from "./pages/Index.tsx";
import Category from "./pages/Category.tsx";
import Product from "./pages/Product.tsx";
import Cart from "./pages/Cart.tsx";
import Checkout from "./pages/Checkout.tsx";
import Track from "./pages/Track.tsx";
import Profile from "./pages/Profile.tsx";
import Categories from "./pages/Categories.tsx";
import Farmer from "./pages/Farmer.tsx";
import Welcome from "./pages/Welcome.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import Search from "./pages/Search.tsx";
import Pride from "./pages/Pride.tsx";
import NotFound from "./pages/NotFound.tsx";
import { AuthModal } from "@/components/freshon/AuthModal";
import { QuickShopWidget } from "@/components/freshon/QuickShopWidget";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Don't retry failed requests by default
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      gcTime: 30 * 60 * 1000, // Keep in memory for 30 minutes
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnReconnect: false, // Don't refetch on reconnect
      refetchOnMount: false, // Don't refetch on component mount
    },
  },
});

function AppContent() {
  return (
    <>
      <LocationPermissionBannerWithContext />
      <Toaster />
      <Sonner />
      <AuthModal />
      <QuickShopWidget />
      <BrowserRouter>
          <Routes>
              {/* Protected routes — PrivateRoute checks /api/auth/me/ */}
              <Route path="/" element={<Index />} />
              <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
              <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
              <Route path="/track/:id" element={<PrivateRoute><Track /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/search" element={<PrivateRoute><Search /></PrivateRoute>} />

              {/* Public routes */}
              <Route path="/category/:id" element={<Category />} />
              <Route path="/product/:id" element={<Product />} />
              <Route path="/farmer/:id" element={<Farmer />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/pride" element={<Pride />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
    </>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LocationProvider>
          <AppContent />
        </LocationProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
