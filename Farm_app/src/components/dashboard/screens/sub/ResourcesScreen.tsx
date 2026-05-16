import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Icon } from "@/components/freshon/Icon";
import { useProfile } from "@/hooks/useFarmer";
import { useTranslation } from "react-i18next";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  onBack: () => void;
}

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  wind: number;
  forecast: Array<{ day: string; high: number; low: number; icon: string }>;
}

const PRICE_MOCK = [
  { d: "Mon", spinach: 45, tomato: 32, carrot: 28 },
  { d: "Tue", spinach: 48, tomato: 30, carrot: 30 },
  { d: "Wed", spinach: 46, tomato: 35, carrot: 29 },
  { d: "Thu", spinach: 50, tomato: 33, carrot: 31 },
  { d: "Fri", spinach: 52, tomato: 36, carrot: 32 },
  { d: "Sat", spinach: 49, tomato: 34, carrot: 30 },
  { d: "Sun", spinach: 51, tomato: 38, carrot: 33 },
];

const KNOWLEDGE_ITEMS = [
  { title: "Composting 101", duration: "5 min", icon: "compost" },
  { title: "Natural Pest Control", duration: "8 min", icon: "pest_control" },
  { title: "Soil Health Basics", duration: "6 min", icon: "grass" },
  { title: "Water Conservation", duration: "4 min", icon: "water_drop" },
  { title: "Seed Saving Guide", duration: "7 min", icon: "spa" },
];

export const ResourcesScreen = ({ onBack }: Props) => {
  const { t } = useTranslation();
  const { data: profile } = useProfile();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [showPledge, setShowPledge] = useState(false);

  const lat = profile?.latitude ?? 12.9716;
  const lon = profile?.longitude ?? 77.5946;

  useEffect(() => {
    const fetchWeather = async () => {
      setWeatherLoading(true);
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`
        );
        const data = await res.json();
        const code = data.current.weather_code;
        const condition = weatherCodeToLabel(code);
        const forecast = data.daily.time.slice(0, 5).map((t: string, i: number) => ({
          day: new Date(t).toLocaleDateString("en-IN", { weekday: "short" }),
          high: Math.round(data.daily.temperature_2m_max[i]),
          low: Math.round(data.daily.temperature_2m_min[i]),
          icon: weatherCodeToIcon(data.daily.weather_code[i]),
        }));
        setWeather({
          temp: Math.round(data.current.temperature_2m),
          condition,
          humidity: data.current.relative_humidity_2m,
          wind: Math.round(data.current.wind_speed_10m),
          forecast,
        });
      } catch {
        setWeather(null);
      } finally {
        setWeatherLoading(false);
      }
    };
    fetchWeather();
  }, [lat, lon]);

  const pledgeDate = profile?.organic_pledge_accepted_at
    ? new Date(profile.organic_pledge_accepted_at).toLocaleDateString("en-IN")
    : new Date().toLocaleDateString("en-IN");

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col animate-in slide-in-from-right duration-300">
      <header className="px-5 h-16 flex items-center gap-4 border-b border-border/60">
        <button onClick={onBack} className="size-10 rounded-xl glass flex items-center justify-center tap">
          <Icon name="arrow_back" />
        </button>
        <h1 className="text-xl font-bold">{t("resources.knowledgeBase")}</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Weather Widget */}
        <section className="rounded-[28px] bg-gradient-forest text-background p-5 shadow-deep relative overflow-hidden">
          <div className="absolute -top-8 -right-8 size-32 rounded-full bg-primary/20 blur-2xl" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary">{t("resources.weather")}</p>
              {weatherLoading ? (
                <div className="mt-2">
                  <div className="h-8 w-24 bg-background/10 rounded animate-pulse" />
                </div>
              ) : weather ? (
                <>
                  <h3 className="text-4xl font-extrabold tracking-tight mt-1">{weather.temp}°C</h3>
                  <p className="text-sm text-background/70 font-medium">{weather.condition}</p>
                </>
              ) : (
                <p className="text-sm text-background/70">Weather unavailable</p>
              )}
            </div>
            <div className="size-16 rounded-2xl bg-background/15 flex items-center justify-center">
              <Icon name="partly_cloudy_day" className="text-3xl text-primary" />
            </div>
          </div>
          {weather && (
            <div className="relative mt-4 flex gap-4 text-xs">
              <span className="flex items-center gap-1 text-background/70">
                <Icon name="water_drop" className="text-primary" />
                {weather.humidity}%
              </span>
              <span className="flex items-center gap-1 text-background/70">
                <Icon name="air" className="text-primary" />
                {weather.wind} km/h
              </span>
            </div>
          )}
          {weather?.forecast && (
            <div className="relative mt-4 grid grid-cols-5 gap-2">
              {weather.forecast.map((f) => (
                <div key={f.day} className="text-center bg-background/10 rounded-xl p-2">
                  <p className="text-[10px] font-bold text-background/60">{f.day}</p>
                  <Icon name={f.icon} className="text-primary text-lg my-1" />
                  <p className="text-xs font-bold">{f.high}°</p>
                  <p className="text-[10px] text-background/50">{f.low}°</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Price Trends */}
        <section className="rounded-[28px] glass p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">{t("resources.dailyPriceTrends")}</p>
              <h3 className="text-lg font-extrabold tracking-tight text-foreground">Weekly Mandi Rates</h3>
            </div>
            <span className="pill bg-secondary/10 text-secondary text-[10px]">Rs / kg</span>
          </div>
          <div className="h-44 -ml-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={PRICE_MOCK}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 600 }} />
                <YAxis hide />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12, fontWeight: 600 }} />
                <Line type="monotone" dataKey="spinach" name="Spinach" stroke="hsl(var(--secondary))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="tomato" name="Tomato" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="carrot" name="Carrot" stroke="#f97316" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-2 justify-center">
            <span className="flex items-center gap-1 text-[10px] font-bold text-foreground/60"><span className="size-2 rounded-full bg-secondary" /> Spinach</span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-foreground/60"><span className="size-2 rounded-full bg-primary" /> Tomato</span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-foreground/60"><span className="size-2 rounded-full bg-orange-500" /> Carrot</span>
          </div>
        </section>

        {/* Organic Pledge Certificate */}
        {profile?.organic_pledge_accepted && (
          <section className="rounded-[28px] bg-primary/5 border border-primary/10 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Icon name="verified" filled />
              </div>
              <div>
                <p className="font-bold text-sm">Organic Pledge Certificate</p>
                <p className="text-xs text-foreground/50">Signed on {pledgeDate}</p>
              </div>
            </div>
            <button
              onClick={() => setShowPledge(true)}
              className="w-full h-12 rounded-2xl bg-primary text-secondary-deep font-bold text-sm tap flex items-center justify-center gap-2"
            >
              <Icon name="download" className="text-base" />
              {t("resources.viewCertificate")}
            </button>
          </section>
        )}

        {/* Knowledge Base */}
        <section>
          <p className="text-[10px] font-bold uppercase tracking-wider text-secondary mb-2">{t("resources.organicBestPractices")}</p>
          <h3 className="text-lg font-extrabold tracking-tight text-foreground mb-3">{t("resources.videoTutorials")}</h3>
          <div className="space-y-2">
            {KNOWLEDGE_ITEMS.map((item, i) => (
              <motion.button
                key={item.title}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="w-full glass rounded-2xl p-3 flex items-center gap-3 text-left tap"
              >
                <div className="size-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                  <Icon name={item.icon} className="text-secondary text-xl" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{item.title}</p>
                  <p className="text-[11px] text-foreground/50">{item.duration}</p>
                </div>
                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon name="play_arrow" className="text-primary text-sm" filled />
                </div>
              </motion.button>
            ))}
          </div>
        </section>
      </main>

      {/* Pledge Certificate Modal */}
      {showPledge && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-background flex flex-col"
        >
          <header className="px-5 h-16 flex items-center gap-4 border-b border-border/60">
            <button onClick={() => setShowPledge(false)} className="size-10 rounded-xl glass flex items-center justify-center tap">
              <Icon name="arrow_back" />
            </button>
            <h1 className="text-xl font-bold">Certificate</h1>
          </header>
          <main className="flex-1 overflow-y-auto p-6">
            <div className="bg-white rounded-2xl p-8 shadow-lg border-4 border-primary/20 text-center space-y-4 max-w-md mx-auto">
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Icon name="verified" className="text-3xl text-primary" filled />
              </div>
              <h2 className="text-2xl font-extrabold text-secondary-deep">Organic Farming Pledge</h2>
              <div className="h-px bg-border/40" />
              <p className="text-sm text-foreground/70 leading-relaxed">
                I, <span className="font-bold text-foreground">{profile?.name || "Farmer"}</span>, pledge to uphold the principles of organic farming and sustainable agriculture.
              </p>
              <p className="text-xs text-foreground/50">
                I commit to using no synthetic pesticides, chemical fertilizers, or genetically modified organisms in my farming practices.
              </p>
              <div className="pt-4">
                <p className="text-xs text-foreground/40 uppercase tracking-wider">Signed</p>
                <p className="font-bold text-lg text-secondary-deep mt-1">{profile?.organic_pledge_signature || profile?.name || "Farmer"}</p>
                <p className="text-xs text-foreground/50 mt-1">{pledgeDate}</p>
              </div>
              <div className="pt-2">
                <span className="inline-block px-3 py-1 rounded-full bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-wider">
                  FreshOn Verified
                </span>
              </div>
            </div>
          </main>
        </motion.div>
      )}
    </div>
  );
};

function weatherCodeToLabel(code: number): string {
  if (code === 0) return "Clear sky";
  if (code <= 3) return "Partly cloudy";
  if (code <= 48) return "Foggy";
  if (code <= 67) return "Rainy";
  if (code <= 77) return "Snowy";
  if (code <= 82) return "Showers";
  if (code <= 99) return "Thunderstorm";
  return "Unknown";
}

function weatherCodeToIcon(code: number): string {
  if (code === 0) return "sunny";
  if (code <= 3) return "partly_cloudy_day";
  if (code <= 48) return "foggy";
  if (code <= 67) return "rainy";
  if (code <= 77) return "ac_unit";
  if (code <= 82) return "rainy";
  if (code <= 99) return "thunderstorm";
  return "cloud";
}
