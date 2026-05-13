import React, { useEffect, useState, useCallback } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Memoize the complete splash function to prevent dependency issues
  const completeSplash = useCallback(() => {
    setIsFadingOut(true);
    setTimeout(onFinish, 600); // Wait for fade animation
  }, [onFinish]);

  useEffect(() => {
    // Minimum splash duration
    const minDuration = 2000; // 2 seconds
    
    // Start timer to complete splash
    const timer = setTimeout(completeSplash, minDuration);

    return () => clearTimeout(timer);
  }, [completeSplash]);

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-mint-soft transition-all duration-700 ease-in-out ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      <div className="flex flex-col items-center">
        <img 
          src="/logo-with-cart.png" 
          alt="FreshOn.in Logo" 
          className="w-48 md:w-72 animate-emerge" 
        />
        <div className="mt-4 overflow-hidden">
          <p className="text-forest font-display text-xl font-bold opacity-0 animate-[fade-in_0.5s_ease-out_0.6s_forwards]">
            Freshness Delivered
          </p>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
