import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, Leaf, Package, LayoutGrid, Calendar } from "lucide-react";

const ONBOARDED_KEY = "freshon_onboarded";

type Slide = {
  id: number;
  title_kn: string;
  subtitle_kn: string;
  title_en: string;
  subtitle_en: string;
  image: string;
  bg: string;
  type: "hero" | "stats" | "quote" | "farming";
  stats?: Array<{ n: string; l: string; icon: any }>;
  quote?: { text: string; author: string; title?: string; author_en: string };
};

const slides: Slide[] = [
  {
    id: 1,
    type: "hero",
    bg: "from-[#f8f9ff] to-[#f8f9ff]",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCps_INdQNgA6g7LQOIUxbJNQ6aI-_vLVrulv3RnCTHXZW-5AfY0r10QVfTwFhEWkLjWavcnRIoZ4-qCjzceHbUPh_uQYHimEkAYy01PhOytc37oPCEMDqyTENLkjZ5y7qYCwXGw_pyox0nHi_f-TsVy1kmI4PoOHlWKqtVLr9qXIloLfKYlYKLOSTOE5DfY2xsroSt4MHSPnaj2t2sKLoroEIHLR0nIN_MiUjWNOKElcPpXYq48GyLnyIJKOjQqz45qFSAY3CGKYY",
    title_kn: "ಬೆಂಗಳೂರಿನ <span class='text-emerald-600 font-extrabold'>ಅತಿ ದೊಡ್ಡ ಏಕ-ಬ್ರ್ಯಾಂಡ್</span> ಸಾವಯವ ಸಂಸ್ಥೆಗೆ ಸ್ವಾಗತ",
    subtitle_kn: "2014 ರಿಂದ ನಿಮ್ಮ ಆರೋಗ್ಯಕ್ಕಾಗಿ",
    title_en: "Bengaluru's <span class='text-emerald-600 font-extrabold'>biggest single-brand</span> organic company",
    subtitle_en: "Serving honest organic food since 2014",
  },
  {
    id: 2,
    type: "stats",
    bg: "from-white to-[#f8f9ff]",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCe3TrB7TDIO94D27jrARfy86510Weahgsc58Zw9OjU1gbWt5Z6HuGxQDX3Rp7CbLPlY0h7_jA88yb1CncxlGdqRS2fZVBNLvJO_yo5xotD_7W9_sOvJXul8WhFhsK3euplZUzDaEcKw4dg14Pfo99LobhKfAfBWJWMjIbmduupxXqRN_AGGEkFMcSrEQH7flJhGT-v1aIMFjiOCnPqAFQbUdxKjkvZ856nue8p-ceo9KC5CkfpxtTDSPQoxbIyx5Bgh-2M4zQAbiY",
    title_kn: "ಪ್ರತಿ ಉತ್ಪನ್ನಕ್ಕೂ ಒಂದು ಕಥೆ ಇದೆ.",
    subtitle_kn: "ಮೂಲದಿಂದ ನಿಮ್ಮ ಮನೆಯವರೆಗೆ — ಪ್ರತಿ ಹಂತದಲ್ಲೂ ಗುಣಮಟ್ಟ.",
    title_en: "Every product has a story.",
    subtitle_en: "From sourcing to your doorstep — every step honestly tested.",
    stats: [
      { n: "1,600+", l: "Products", icon: Package },
      { n: "14", l: "Categories", icon: LayoutGrid },
      { n: "10+", l: "Years", icon: Calendar },
    ],
  },
  {
    id: 3,
    type: "quote",
    bg: "bg-[#06402b]",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCNkZbOxtGEfq1gZ2MQYTj6QcJxc12dKN5hiCYDU2expmUuOy3cpBAyNHlukDyCyc3XeqibWUKyVyaSeHW1l7BpjL7e-V87B2-zQ6s8rt5cNCAcJzqFB5_E3S3nAX6C2C4t4qRZJWXP3Lwgjk20qlADtQabC4LADfdq5b84tfI4r0-lttNJt8Zo31JlZCMwTcY7ReHI1bL7wcvW8jOpas_kfiLUMyuuOwElqdyX1J1h5F5j2kTGq7nEtGnYaukh2yOBLhjveo9V8RQ",
    title_kn: '"ಕೆಲವರಿಗೆ ಇದು ವ್ಯಾಪಾರ ಮಾತ್ರ, ಆದರೆ ನಮಗೆ ಆರೋಗ್ಯಕರ ಆಹಾರದ ಜವಾಬ್ದಾರಿಯು ಕೂಡ."',
    subtitle_kn: '"Others may see a business here. We see a responsibility — to your health, and to the farmer who feeds you."',
    title_en: "",
    subtitle_en: "",
    quote: {
      text: "ಕೆಲವರಿಗೆ ಇದು ವ್ಯಾಪಾರ ಮಾತ್ರ, ಆದರೆ ನಮಗೆ <span class='text-amber-400 font-extrabold'>ಆರೋಗ್ಯಕರ</span> ಆಹಾರದ ಜವಾಬ್ದಾರಿಯು ಕೂಡ.",
      author: "Sattya",
      title: "Founder & CEO, FreshOn.in",
      author_en: "Others may see a business here. We see a responsibility — to your health, and to the farmer who feeds you."
    }
  },
  {
    id: 4,
    type: "farming",
    bg: "from-white to-[#f8f9ff]",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAVv-CgBSqHONDOK49CKFO9vB4rnHbqvexq44kmdJyUyyyTNwZwM6eGwPBsrW1__PXzp5qUEfavi4xVLtFhFMchV8PzHWZm_824Tz_nPLvf3OGtZin0t-fcuN1blxLZe5TjHrQKVh7OxwmCRee0B1fudHNkEjFBWiFDIcCVq6Af2R824eGUNNIbrun50SaB-7w0ycl1X5X4Nkw_Z_09wAiaUKeS--v_meDiHxRUFn_dMZXWVykqNWqh3SJKWsPTlcbTrOx2PHFCJpc",
    title_kn: "ನಾವು ಬೇರೆ ಬ್ರ್ಯಾಂಡ್ಗಳನ್ನು ಮಾರುವುದಿಲ್ಲ — <span class='text-emerald-600 font-extrabold text-2xl'>ನಿಜವಾದ ಆರ್ಗಾನಿಕ್ ರೈತರೊಂದಿಗೆ</span> ನಮ್ಮದೇ ಉತ್ಪನ್ನಗಳನ್ನು ಸೃಷ್ಟಿಸುತ್ತೇವೆ.",
    subtitle_kn: "We don't sell other brands — we work with <span class='text-emerald-600 font-extrabold text-lg'>genuine organic farmers</span> to create our own.",
    title_en: "We don't sell other brands — we work with <span class='text-emerald-600 font-extrabold text-lg'>genuine organic farmers</span> to create our own.",
    subtitle_en: "",
  },
  {
    id: 5,
    type: "hero",
    bg: "from-[#f8f9ff] to-[#f8f9ff]",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCNkZbOxtGEfq1gZ2MQYTj6QcJxc12dKN5hiCYDU2expmUuOy3cpBAyNHlukDyCyc3XeqibWUKyVyaSeHW1l7BpjL7e-V87B2-zQ6s8rt5cNCAcJzqFB5_E3S3nAX6C2C4t4qRZJWXP3Lwgjk20qlADtQabC4LADfdq5b84tfI4r0-lttNJt8Zo31JlZCMwTcY7ReHI1bL7wcvW8jOpas_kfiLUMyuuOwElqdyX1J1h5F5j2kTGq7nEtGnYaukh2yOBLhjveo9V8RQ",
    title_kn: "ನಮ್ಮ ಪ್ರಯತ್ನ — ಗ್ರಾಹಕರನ್ನೂ ರೈತರನ್ನೂ <span class='text-emerald-600 font-extrabold'>ಬೆಳೆಸುವುದು</span>, ಬಳಸಿಕೊಳ್ಳುವುದಲ್ಲ.",
    subtitle_kn: "",
    title_en: "Our purpose — to <span class='text-emerald-600 font-extrabold'>grow</span> with our customers and farmers, not profit at their expense.",
    subtitle_en: "",
  },
  {
    id: 6,
    type: "stats",
    bg: "from-[#fdf8ee] to-[#f8f9ff]",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXUDcSz4qF9xwHVCLL4-Da-QE-ajdsMvfYVhnr6A6o_O7kZKIsOY_U81mlExrXD08i96T-FHzb0G1nrlQDTgPmo0uziNS-JxrH3suwRGjiRw8fb9ri6oi5O9FlD2hvwcRxcC0l8QACPGdQikheD9NWqmx7SP8yau7yHGXGsmMy9I9aILhXeFzSpopkTQeO08zdTxuvGiUQfYYVRY3A2yqJq1PrnXFpUsWjaAExyQZ75eLStoyWR6YpluZ-O4_EBeD59fjyZxDs32Q",
    title_kn: "PRIDE ಸದಸ್ಯರಿಗೆ",
    subtitle_kn: "ನಿಜ <span class='text-emerald-600 font-extrabold text-xl'>MRP</span> ಮೇಲೆ <span class='text-emerald-600 font-extrabold text-xl'>50%</span> ವರೆಗೂ ಉಳಿತಾಯ. ಪ್ರತಿ ಖರೀದಿಯಲ್ಲೂ.",
    title_en: "For those who believe in what we do — PRIDE Membership.",
    subtitle_en: "Save up to <span class='text-emerald-600 font-extrabold text-lg'>50%</span> on genuine <span class='text-emerald-600 font-extrabold text-lg'>MRP</span> on every purchase.",
    stats: [
      { n: "50%", l: "Saving", icon: ArrowRight },
      { n: "Direct", l: "Farmer", icon: Leaf },
      { n: "Honest", l: "Pricing", icon: Package },
    ],
  },
  {
    id: 7,
    type: "hero",
    bg: "from-[#f8f9ff] to-[#f8f9ff]",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAhXEuYFCEyK_HDMpL5LPrCjfbpAqy8ypsEmQ55NCc-ctRXDK16w-1rYeC4tzJCu5jemq-xyzpqFPR_KS7M7o3oWL3xYagqUIiQR3TGoN5T4tvyn8QzmJXMgE7umfGIjXIyo7-X8MKW0uAZi98X19I1ndhRmI3E3zJ5xofvXuw_ABM1dccQDd-XClnA9Aa1uIe1GPdscHZ_UIqDjTubiZeA9liwNCmR04cL-4Fz_W0H_NI7or3Hq0VD6O73T5fufn17UsB6I7ku2WI",
    title_kn: "ಸಾವಯವ ಅಡುಗೆಮನೆ — <span class='text-emerald-600 font-extrabold'>ಆರೋಗ್ಯ</span> ಕುಟುಂಬ.",
    subtitle_kn: "ಈಗಲೇ ಆರ್ಡರ್ ಮಾಡಿ →",
    title_en: "Organic kitchen. Healthy family.",
    subtitle_en: "Order Now →",
  },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const slide = slides[current];
  const isLast = current === slides.length - 1;

  const handleFinish = () => {
    localStorage.setItem(ONBOARDED_KEY, "1");
    navigate("/welcome", { replace: true });
  };

  const handleNext = () => {
    if (isLast) handleFinish();
    else setCurrent(current + 1);
  };

  const handleBack = () => {
    if (current > 0) setCurrent(current - 1);
  };

  return (
    <div className={`min-h-screen flex flex-col relative overflow-hidden transition-colors duration-700 ${slide.type === 'quote' ? 'bg-[#06402b]' : 'bg-[#f8f9ff]'}`}>
      {/* Top Header */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-5">
        <div className="flex items-center gap-2">
           <img src="/logo1.png" alt="FreshOn.in" className={`h-20 w-auto transition-all duration-500 ${slide.type === 'quote' ? 'brightness-0 invert' : ''}`} />
        </div>
        {!isLast && (
          <button 
            onClick={handleFinish}
            className={`text-sm font-semibold transition-colors duration-500 ${slide.type === 'quote' ? 'text-white/80' : 'text-slate-500'}`}
          >
            Skip
          </button>
        )}
      </header>

      {/* Main Slide Content */}
      <AnimatePresence mode="wait">
        <motion.main
          key={current}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 flex flex-col"
        >
          {/* Image Section */}
          <div className="relative w-full h-[45vh] md:h-[50vh] overflow-hidden">
            <motion.img 
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 10, ease: "linear" }}
              src={slide.image} 
              alt="" 
              className="w-full h-full object-cover" 
            />
            {slide.type !== 'quote' && (
              <div className="absolute inset-0 bg-gradient-to-t from-[#f8f9ff] via-[#f8f9ff]/20 to-transparent" />
            )}
            {slide.type === 'quote' && (
              <div className="absolute inset-0 bg-gradient-to-t from-[#06402b] via-transparent to-transparent" />
            )}
          </div>

          {/* Text Content */}
          <div className="flex-1 px-7 flex flex-col items-center text-center -mt-10 relative z-10">
             {slide.type === 'hero' && (
               <div className="space-y-6">
                 <div className="space-y-3">
                   <h2 
                      className="text-2xl font-bold text-[#002819] leading-tight font-kannada"
                      dangerouslySetInnerHTML={{ __html: slide.title_kn }}
                   />
                   <p 
                      className="text-base font-semibold text-[#904d00]"
                      dangerouslySetInnerHTML={{ __html: slide.subtitle_kn }}
                   />
                 </div>
                 <div className="flex flex-col gap-2 pt-2">
                   <p 
                     className="text-sm text-slate-600 max-w-[280px] mx-auto leading-relaxed"
                     dangerouslySetInnerHTML={{ __html: slide.title_en }}
                   />
                   <p 
                      className="text-xs text-slate-400"
                      dangerouslySetInnerHTML={{ __html: slide.subtitle_en }}
                   />
                 </div>
               </div>
             )}

             {slide.type === 'stats' && (
               <div className="space-y-6">
                 <div className="space-y-2">
                   <h2 
                      className="text-2xl font-bold text-[#002819] font-kannada leading-tight"
                      dangerouslySetInnerHTML={{ __html: slide.title_kn }}
                   />
                   <p 
                      className="text-sm text-slate-600 px-4"
                      dangerouslySetInnerHTML={{ __html: slide.subtitle_kn }}
                   />
                   {slide.title_en && (
                     <p 
                        className="text-xs text-slate-400 max-w-[280px] mx-auto pt-1"
                        dangerouslySetInnerHTML={{ __html: slide.title_en }}
                     />
                   )}
                   {slide.subtitle_en && (
                     <p 
                        className="text-xs text-slate-400 max-w-[280px] mx-auto"
                        dangerouslySetInnerHTML={{ __html: slide.subtitle_en }}
                     />
                   )}
                 </div>
                 
                 <div className="grid grid-cols-3 gap-3 w-full max-w-sm pt-2">
                    {slide.stats?.map((stat, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center mb-2 text-emerald-600">
                           <stat.icon className="h-4 w-4" />
                        </div>
                        <span className="text-lg font-bold text-[#002819]">{stat.n}</span>
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{stat.l}</span>
                      </div>
                    ))}
                 </div>
               </div>
             )}

             {slide.type === 'quote' && (
               <div className="space-y-6 text-white">
                 <blockquote className="max-w-md">
                    <p 
                      className="font-kannada text-2xl font-bold leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: slide.quote?.text || "" }}
                    />
                 </blockquote>
                 <div className="max-w-xs mx-auto space-y-4">
                    <p className="text-sm italic text-emerald-100/80 leading-snug">
                      "{slide.quote?.author_en}"
                    </p>
                    <div className="pt-2">
                      <span className="text-amber-400 font-bold text-lg block">
                        — {slide.quote?.author}
                      </span>
                      <span className="text-xs font-medium text-white/70 block mt-0.5">
                        {slide.quote?.title}
                      </span>
                    </div>
                 </div>
               </div>
             )}

             {slide.type === 'farming' && (
               <div className="space-y-6">
                 <div className="flex justify-center items-center gap-6 text-emerald-600/40">
                    <div className="flex flex-col items-center bg-white p-3 rounded-full shadow-sm">
                      <Leaf className="h-6 w-6 text-[#06402b]" />
                    </div>
                    <div className="flex flex-col items-center bg-white p-3 rounded-full shadow-sm">
                      <Leaf className="h-6 w-6 text-[#904d00]" />
                    </div>
                    <div className="flex flex-col items-center bg-white p-3 rounded-full shadow-sm">
                      <Leaf className="h-6 w-6 text-emerald-600" />
                    </div>
                 </div>
                 <h2 
                    className="text-xl font-bold text-[#002819] leading-snug font-kannada"
                    dangerouslySetInnerHTML={{ __html: slide.title_kn }}
                 />
                 <p 
                    className="text-sm text-slate-600 max-w-[300px] mx-auto italic"
                    dangerouslySetInnerHTML={{ __html: slide.subtitle_kn }}
                 />
               </div>
             )}
          </div>
        </motion.main>
      </AnimatePresence>

      {/* Footer Navigation */}
      <footer className="fixed bottom-0 left-0 w-full z-50 p-7 bg-transparent">
        <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
          {/* Progress Indicators */}
          <div className="flex gap-2">
            {slides.map((_, idx) => (
              <div 
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  idx === current 
                    ? `w-8 ${slide.type === 'quote' ? 'bg-white' : 'bg-[#06402b]'}` 
                    : `w-1.5 ${slide.type === 'quote' ? 'bg-white/30' : 'bg-slate-200'}`
                }`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex w-full gap-3">
            {current > 0 && (
              <button 
                onClick={handleBack}
                className={`flex items-center justify-center p-4 rounded-full border transition-all ${
                  slide.type === 'quote' 
                    ? 'border-white/20 text-white bg-white/10 hover:bg-white/20' 
                    : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                }`}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}
            <button 
              onClick={handleNext}
              className={`flex-1 flex items-center justify-center gap-2 rounded-full py-4 px-6 text-base font-bold shadow-lg transition-all active:scale-[0.98] ${
                slide.type === 'quote'
                  ? 'bg-white text-[#06402b] hover:bg-emerald-50'
                  : 'bg-[#002819] text-white hover:bg-[#003824]'
              }`}
            >
              <span>{isLast ? "Get Started" : "Next"}</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </footer>

      {/* Decorative Elements */}
      <div className={`fixed -bottom-10 -left-10 opacity-10 pointer-events-none transition-colors duration-500 ${slide.type === 'quote' ? 'text-white' : 'text-emerald-900'}`}>
        <Leaf className="w-40 h-40" />
      </div>
    </div>
  );
};

export default Onboarding;
