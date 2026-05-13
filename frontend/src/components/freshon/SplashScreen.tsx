import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Initial display duration
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      // Wait for fade out animation to complete before calling onFinish
      const finishTimer = setTimeout(onFinish, 600);
      return () => clearTimeout(finishTimer);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onFinish]);

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
