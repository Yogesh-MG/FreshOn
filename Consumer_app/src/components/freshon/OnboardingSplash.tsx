import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface OnboardingSplashProps {
  onFinish?: () => void;
  showNavigation?: boolean;
  autoplay?: boolean;
  autoplayInterval?: number;
}

const OnboardingSplash: React.FC<OnboardingSplashProps> = ({
  onFinish,
  showNavigation = true,
  autoplay = true,
  autoplayInterval = 5000,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(autoplay);

  const slides = [
    {
      id: 1,
      title: "ಬೆಂಗಳೂರಿನ ಅತಿ ದೊಡ್ಡ ಏಕ-ಬ್ರ್ಯಾಂಡ್ ಸಾವಯವ ಸಂಸ್ಥೆಗೆ ಸ್ವಾಗತ",
      subtitle: "2014 ರಿಂದ ನಿಮ್ಮ ಆರೋಗ್ಯಕ್ಕಾಗಿ",
      engTitle: "Welcome to Bengaluru's Biggest Single-Brand Organic Company",
      engSubtitle: "Serving honest organic food since 2014",
      anchor: "ಇದು ವ್ಯಾಪಾರವಲ್ಲ. ಇದು ಆತ್ಮಸಾಕ್ಷಿ.",
      bgColor: "bg-gradient-to-br from-emerald-50 to-amber-50",
      image: "/slide-01-welcome.jpg",
    },
    {
      id: 2,
      title: '"ಕೆಲವರಿಗೆ ಇದು ವ್ಯಾಪಾರ ಮಾತ್ರ, ಆದರೆ ನಮಗೆ ಆರೋಗ್ಯಕರ ಆಹಾರದ ಜವಾಬ್ದಾರಿಯು ಕೂಡ."',
      founder: "— ಸತ್ಯ, ಸಂಸ್ಥಾಪಕ ಮತ್ತು CEO, FreshOn.in",
      engTitle:
        '"Others may see a business here. We see a responsibility — to your health, and to the farmer who feeds you."',
      engFounder: "— Sattya, Founder & CEO, FreshOn.in",
      bgColor: "bg-gradient-to-br from-green-900 to-emerald-800",
      textColor: "text-white",
      quoteOnly: true,
    },
    {
      id: 3,
      title: "ನಾವು ಬೇರೆ ಬ್ರ್ಯಾಂಡ್‌ಗಳನ್ನು ಮಾರುವುದಿಲ್ಲ",
      subtitle: "ನಿಜವಾದ ಆರ್ಗಾನಿಕ್ ರೈತರೊಂದಿಗೆ ನಮ್ಮದೇ ಉತ್ಪನ್ನಗಳನ್ನು ಸೃಷ್ಟಿಸುತ್ತೇವೆ.",
      engTitle: "We don't sell other brands —",
      engSubtitle: "We work with genuine organic farmers to create our own products.",
      bgColor: "bg-gradient-to-br from-amber-50 to-orange-50",
      image: "/slide-03-products.jpg",
    },
    {
      id: 4,
      title: "ನಮ್ಮ ಪ್ರಯತ್ನ",
      subtitle: "ಗ್ರಾಹಕರನ್ನೂ ರೈತರನ್ನೂ ಬೆಳೆಸುವುದು, ಬಳಸಿಕೊಳ್ಳುವುದಲ್ಲ.",
      engTitle: "Our purpose —",
      engSubtitle: "To grow with our customers and farmers, not profit at their expense.",
      bgColor: "bg-gradient-to-br from-green-50 to-teal-50",
      image: "/slide-04-purpose.jpg",
    },
    {
      id: 5,
      title: "ಪ್ರತಿ ಉತ್ಪನ್ನಕ್ಕೂ ಒಂದು ಕಥೆ ಇದೆ",
      subtitle: "ಮೂಲದಿಂದ ನಿಮ್ಮ ಮನೆಯವರೆಗೆ — ಪ್ರತಿ ಹಂತದಲ್ಲೂ ಗುಣಮಟ್ಟ.",
      engTitle: "Every product has a story.",
      engSubtitle: "From sourcing to your doorstep — every step tested and honestly selected.",
      stats: [
        { number: "1,600+", label: "Products" },
        { number: "14", label: "Categories" },
        { number: "10+", label: "Years" },
      ],
      bgColor: "bg-gradient-to-br from-emerald-50 to-green-50",
      image: "/slide-05-story.jpg",
    },
    {
      id: 6,
      title: "PRIDE ಸದಸ್ಯರಿಗೆ",
      subtitle: "ನಿಜ MRP ಮೇಲೆ 50% ವರೆಗೂ ಉಳಿತಾಯ. ಪ್ರತಿ ಖರೀದಿಯಲ್ಲೂ.",
      engTitle: "For those who believe in what we do — PRIDE Membership.",
      engSubtitle: "Invest in FreshOn.in. Save up to 50% on genuine MRP on every purchase.",
      bgColor: "bg-gradient-to-br from-amber-100 to-yellow-50",
      image: "/slide-06-pride.jpg",
    },
    {
      id: 7,
      title: "ಸಾವಯವ ಅಡುಗೆಮನೆ",
      subtitle: "ಆರೋಗ್ಯ ಕುಟುಂಬ.",
      engTitle: "Organic kitchen.",
      engSubtitle: "Healthy family.",
      cta: true,
      closing: "ಇದು ವ್ಯಾಪಾರವಲ್ಲ. ಇದು ಆತ್ಮಸಾಕ್ಷಿ.",
      engClosing: "This is not commerce. This is conscience.",
      bgColor: "bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900",
      textColor: "text-white",
    },
  ];

  useEffect(() => {
    if (!isAutoplay) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, autoplayInterval);

    return () => clearInterval(interval);
  }, [isAutoplay, autoplayInterval, slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoplay(false);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoplay(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoplay(false);
  };

  const slide = slides[currentSlide];

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Slides Container */}
      <div className="relative w-full h-full">
        {slides.map((s, index) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            } ${s.bgColor}`}
          >
            {/* Background Image if exists */}
            {s.image && (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-60"
                style={{ backgroundImage: `url(${s.image})` }}
              />
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/20" />

            {/* Content */}
            <div className="relative h-full flex flex-col">
              {/* Logo */}
              <div className="pt-8 pl-6 md:pl-10">
                <img
                  src="/logo-with-cart.png"
                  alt="FreshOn.in"
                  className="h-12 md:h-16 w-auto"
                />
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 pb-24">
                {s.quoteOnly ? (
                  // Quote Slide (Slide 2)
                  <div className="text-center max-w-3xl">
                    <p
                      className={`text-3xl md:text-5xl font-bold leading-tight mb-6 ${
                        s.textColor || 'text-forest'
                      }`}
                    >
                      {s.title}
                    </p>
                    <p
                      className={`text-lg md:text-xl font-semibold mb-8 ${
                        s.textColor || 'text-forest'
                      }`}
                    >
                      {s.founder}
                    </p>
                    <p
                      className={`text-sm md:text-base italic ${
                        s.textColor || 'text-gray-600'
                      }`}
                    >
                      {s.engTitle}
                    </p>
                    <p
                      className={`text-xs md:text-sm mt-2 ${
                        s.textColor || 'text-gray-600'
                      }`}
                    >
                      {s.engFounder}
                    </p>
                  </div>
                ) : s.stats ? (
                  // Stats Slide (Slide 5)
                  <div className="text-center max-w-3xl">
                    <p className="text-4xl md:text-5xl font-bold text-forest mb-3">
                      {s.title}
                    </p>
                    <p className="text-lg md:text-xl text-forest mb-2">{s.subtitle}</p>
                    <p className="text-sm text-gray-600 mb-12">{s.engTitle}</p>

                    {/* Stats Boxes */}
                    <div className="flex justify-center gap-8 mt-12">
                      {s.stats.map((stat, idx) => (
                        <div
                          key={idx}
                          className="bg-white/80 backdrop-blur-sm rounded-lg px-8 py-6 shadow-lg"
                        >
                          <p className="text-3xl md:text-4xl font-bold text-amber-600">
                            {stat.number}
                          </p>
                          <p className="text-sm md:text-base text-forest font-semibold mt-2">
                            {stat.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : s.cta ? (
                  // CTA Slide (Slide 7)
                  <div className="text-center">
                    <p className="text-4xl md:text-6xl font-bold mb-3 text-white">
                      {s.title}
                    </p>
                    <p className="text-2xl md:text-3xl font-semibold mb-8 text-amber-300">
                      {s.subtitle}
                    </p>
                    <p className="text-sm md:text-base text-white/90 mb-4">{s.engTitle}</p>
                    <p className="text-sm text-white/80 mb-12">{s.engSubtitle}</p>

                    <button className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 md:px-12 rounded-lg text-lg transition-colors duration-200 mb-12">
                      ಈಗಲೇ ಆರ್ಡರ್ ಮಾಡಿ / Order Now
                    </button>

                    <p className="text-xs md:text-sm text-white/60 italic">{s.closing}</p>
                    <p className="text-xs text-white/50 mt-2">{s.engClosing}</p>
                  </div>
                ) : (
                  // Standard Content Slides
                  <div className="text-center max-w-3xl">
                    <p className="text-4xl md:text-5xl font-bold text-forest mb-3">
                      {s.title}
                    </p>
                    <p className="text-lg md:text-xl text-forest/80 mb-8">{s.subtitle}</p>
                    <p className="text-sm md:text-base text-gray-600 mb-2">{s.engTitle}</p>
                    <p className="text-sm text-gray-500">{s.engSubtitle}</p>
                  </div>
                )}
              </div>

              {/* Navigation Dots */}
              {showNavigation && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => goToSlide(idx)}
                      className={`h-3 rounded-full transition-all duration-300 ${
                        idx === currentSlide
                          ? 'bg-amber-500 w-8'
                          : 'bg-white/40 hover:bg-white/60 w-3'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Arrow Navigation */}
              {showNavigation && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors duration-200"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors duration-200"
                    aria-label="Next slide"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}

              {/* Slide Counter */}
              {showNavigation && (
                <div className="absolute bottom-32 right-6 md:right-10 text-sm font-semibold bg-black/30 text-white px-4 py-2 rounded-full">
                  {currentSlide + 1} / {slides.length}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OnboardingSplash;
