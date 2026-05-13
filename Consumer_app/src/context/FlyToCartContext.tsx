import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FlyToCartContextType {
  fly: (originRect: DOMRect, imageUrl: string) => void;
}

const FlyToCartContext = createContext<FlyToCartContextType | undefined>(undefined);

interface FlyingItem {
  id: number;
  origin: { x: number; y: number; width: number; height: number };
  target: { x: number; y: number };
  imageUrl: string;
}

export const FlyToCartProvider = ({ children }: { children: React.ReactNode }) => {
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const nextId = useRef(0);

  const fly = useCallback((originRect: DOMRect, imageUrl: string) => {
    // Attempt to find the cart target in both mobile and desktop (if any)
    const targetEl = document.getElementById("mobile-cart-target") || document.getElementById("cart-target");
    if (!targetEl) return;

    const targetRect = targetEl.getBoundingClientRect();
    
    const newItem: FlyingItem = {
      id: nextId.current++,
      origin: {
        x: originRect.left,
        y: originRect.top,
        width: originRect.width,
        height: originRect.height,
      },
      target: {
        x: targetRect.left + targetRect.width / 2,
        y: targetRect.top + targetRect.height / 2,
      },
      imageUrl,
    };

    setFlyingItems((prev) => [...prev, newItem]);

    // Remove item after animation completes
    setTimeout(() => {
      setFlyingItems((prev) => prev.filter((item) => item.id !== newItem.id));
    }, 800);
  }, []);

  return (
    <FlyToCartContext.Provider value={{ fly }}>
      {children}
      <div className="pointer-events-none fixed inset-0 z-[9999]">
        <AnimatePresence>
          {flyingItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{
                x: item.origin.x,
                y: item.origin.y,
                width: item.origin.width,
                height: item.origin.height,
                opacity: 1,
                scale: 1,
                borderRadius: "1rem",
              }}
              animate={{
                x: item.target.x - 20,
                y: item.target.y - 20,
                width: 40,
                height: 40,
                opacity: 0.2,
                scale: 0.5,
                borderRadius: "50%",
              }}
              transition={{
                duration: 0.7,
                ease: [0.34, 1.56, 0.64, 1], // Nice springy arc
              }}
              className="fixed overflow-hidden bg-white shadow-lg border border-mint/20"
              style={{ position: "fixed", top: 0, left: 0 }}
            >
              <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </FlyToCartContext.Provider>
  );
};

export const useFlyToCart = () => {
  const context = useContext(FlyToCartContext);
  if (!context) throw new Error("useFlyToCart must be used within a FlyToCartProvider");
  return context;
};
