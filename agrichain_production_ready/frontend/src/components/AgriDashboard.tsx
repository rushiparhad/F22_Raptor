import { useCallback, useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  BarChart3,
  Bot,
  Calculator,
  CloudSun,
  Gauge,
  LineChart as LineChartIcon,
  Loader2,
  MapPinned,
  Menu,
  Moon,
  Navigation,
  Sprout,
  Sun,
  TrendingUp,
  Wifi,
  WifiOff,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AgriChainResult } from "@/lib/api";
import AppErrorBoundary from "./AppErrorBoundary";
import FarmerTutorial from "./FarmerTutorial";
import IndiaLaunchpad from "./IndiaLaunchpad";
import MarketMap from "./MarketMap";

type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
type Trend = "UP" | "DOWN" | "STABLE";

interface MarketInsight {
  market: string;
  price: number;
  trend: Trend;
  travelTime: number;
  spoilageRisk: RiskLevel;
}

interface DashboardProps {
  language: string;
  setLanguage: (language: string) => void;
  healthy: boolean | null;
  onRecheck: () => void;
  result: AgriChainResult | null;
  loading: boolean;
  error: string | null;
  onAnalyze: (crop: string, location: string) => void;
  onReset: () => void;
}

const riskScore: Record<RiskLevel, number> = {
  LOW: 28,
  MEDIUM: 58,
  HIGH: 86,
};

const getTrend = (value?: string): Trend => {
  if (value === "UP" || value === "DOWN" || value === "STABLE") return value;
  return "STABLE";
};

const getRisk = (value?: string): RiskLevel => {
  if (value === "LOW" || value === "MEDIUM" || value === "HIGH") return value;
  return "LOW";
};

const getVolatilityPercent = (volatility?: string) => {
  const v = (volatility ?? "").toLowerCase();
  if (v.includes("high")) return 82;
  if (v.includes("low")) return 34;
  return 58;
};

const LOCATION_COORDS: Record<string, [number, number]> = {
  pune: [18.5204, 73.8567],
  nashik: [19.9975, 73.7898],
  nagpur: [21.1458, 79.0882],
  aurangabad: [19.8762, 75.3433],
  mumbai: [19.076, 72.8777],
  solapur: [17.6599, 75.9064],
  satara: [17.6805, 74.0183],
  ahmednagar: [19.0946, 74.7384],
  sangli: [16.8524, 74.5815],
  jalgaon: [21.0077, 75.5626],
  kolhapur: [16.705, 74.2433],
};

const MARKET_COORDS: Record<string, [number, number]> = {
  manchar: [19.0045, 73.9439],
  kamthi: [21.2237, 79.1912],
  manjri: [18.4889, 73.9789],
  pimpri: [18.6298, 73.7997],
  moshi: [18.673, 73.8403],
  narayangaon: [19.0952, 73.9233],
  junnar: [19.2088, 73.8746],
  lasalgaon: [20.1423, 74.2398],
  kalwan: [20.5003, 74.0265],
  satana: [20.5925, 74.2031],
  yeola: [20.0428, 74.4894],
  malegaon: [20.5537, 74.5287],
  pimplagaon: [20.1511, 73.9446],
  umred: [20.8539, 79.3247],
  hingna: [21.0947, 78.9747],
};

const normalize = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, " ");

const findCoords = (text: string, source: Record<string, [number, number]>): [number, number] | null => {
  const normalized = normalize(text);
  for (const [key, coords] of Object.entries(source)) {
    if (normalized.includes(key)) return coords;
  }
  return null;
};

const toRadians = (value: number) => (value * Math.PI) / 180;

const distanceInKm = (from: [number, number], to: [number, number]) => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(to[0] - from[0]);
  const dLon = toRadians(to[1] - from[1]);
  const lat1 = toRadians(from[0]);
  const lat2 = toRadians(to[0]);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

const forecastForDay = (base: number, trend: Trend, volatilityPercent: number, day: number) => {
  const direction = trend === "UP" ? 1 : trend === "DOWN" ? -1 : 0;
  const drift = base * (0.012 + volatilityPercent / 1000) * day * direction;
  const wave = Math.sin(day * 0.9) * (base * ((volatilityPercent / 100) * 0.015));
  return Math.max(0, base + drift + wave);
};

const colorForRisk = (risk: RiskLevel) => {
  if (risk === "HIGH") return "#ef4444";
  if (risk === "MEDIUM") return "#f59e0b";
  return "#22c55e";
};

const SUPPORTED_CROPS = [
  "Cabbage",
  "Carrot",
  "Garlic",
  "Green Chilli",
  "Pumpkin",
  "Onion",
  "Potato",
  "Tomato",
];

const SUPPORTED_LOCATIONS = [
  "Nagpur",
  "Pune",
  "Nashik",
  "Aurangabad",
  "Amravati",
  "Kolhapur",
  "Solapur",
  "Kamthi",
];

const AgriDashboard = ({
  language,
  setLanguage,
  healthy,
  onRecheck,
  result,
  loading,
  error,
  onAnalyze,
  onReset,
}: DashboardProps) => {
  const { t, i18n } = useTranslation();
  const { resolvedTheme, setTheme } = useTheme();
  const [crop, setCrop] = useState("");
  const [location, setLocation] = useState("");
  const [quantity, setQuantity] = useState(10);
  const [selectedMarket, setSelectedMarket] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [enteredDashboard, setEnteredDashboard] = useState(false);
  const [activeMenu, setActiveMenu] = useState("overview-section");

  const highlightSection = useCallback((element: HTMLElement) => {
    element.classList.remove("section-highlight");
    void element.offsetWidth;
    element.classList.add("section-highlight");
    window.setTimeout(() => {
      element.classList.remove("section-highlight");
    }, 2000);
  }, []);

  const scrollToSection = useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (!el) return;
      const highlightTarget =
        el.tagName.toLowerCase() === "section" && el.firstElementChild instanceof HTMLElement
          ? el.firstElementChild
          : el;

      const mainContent = document.querySelector(".main-content");
      if (mainContent instanceof HTMLElement) {
        const top =
          el.getBoundingClientRect().top -
          mainContent.getBoundingClientRect().top +
          mainContent.scrollTop -
          12;
        mainContent.scrollTo({
          top: Math.max(0, top),
          behavior: "smooth",
        });
      } else {
        el.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }

      highlightSection(highlightTarget);
      setActiveMenu(id);
      if (window.innerWidth < 1024) setSidebarOpen(false);
    },
    [highlightSection]
  );

  useEffect(() => {
    if (language && language !== i18n.language) {
      void i18n.changeLanguage(language);
      localStorage.setItem("i18nextLng", language);
    }
    const launchState = localStorage.getItem("agri-launch-entered");
    setEnteredDashboard(launchState === "1");
  }, [i18n, language]);

  const marketInsights = useMemo<MarketInsight[]>(() => {
    if (!result) return [];
    const baseTravel = Number(result.spoilage_analysis?.travel_time_hours ?? 2);
    const baseRisk = getRisk(String(result.spoilage_analysis?.risk_level ?? result.spoilage_risk));
    const baseTrend = getTrend(String(result.price_trend));

    const items = (result.top_markets ?? []).slice(0, 5).map((market, idx) => {
      const localTrend = getTrend(String(market.trend ?? baseTrend));
      const risk: RiskLevel =
        idx === 0 ? baseRisk : idx % 3 === 0 ? "HIGH" : idx % 2 === 0 ? "MEDIUM" : "LOW";
      return {
        market: market.market,
        price: Number(market.price ?? 0),
        trend: localTrend,
        travelTime: Number((baseTravel + idx * 0.6).toFixed(1)),
        spoilageRisk: risk,
      };
    });

    const hasBest = items.some((m) => m.market === result.sell_market);
    if (!hasBest && result.sell_market) {
      items.unshift({
        market: String(result.sell_market),
        price: Number(result.expected_price ?? 0),
        trend: baseTrend,
        travelTime: Number(baseTravel.toFixed(1)),
        spoilageRisk: baseRisk,
      });
    }
    return items.slice(0, 5);
  }, [result]);

  useEffect(() => {
    if (!result) return;
    if (!selectedMarket && result.sell_market) setSelectedMarket(result.sell_market);
  }, [result, selectedMarket]);

  const selectedMarketData = useMemo(() => {
    if (!marketInsights.length) return null;
    return (
      marketInsights.find((m) => m.market === selectedMarket) ??
      marketInsights.find((m) => m.market === result?.sell_market) ??
      marketInsights[0]
    );
  }, [marketInsights, result?.sell_market, selectedMarket]);

  const volatilityPercent = getVolatilityPercent(String(result?.volatility ?? ""));
  const lineForecast = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, idx) => ({
        day: `${t("dayShort")} ${idx + 1}`,
        price: Number(
          forecastForDay(
            Number(selectedMarketData?.price ?? result?.expected_price ?? 0),
            getTrend(String(selectedMarketData?.trend ?? result?.price_trend)),
            volatilityPercent,
            idx + 1
          ).toFixed(2)
        ),
      })),
    [
      result?.expected_price,
      result?.price_trend,
      selectedMarketData?.price,
      selectedMarketData?.trend,
      t,
      volatilityPercent,
    ]
  );

  const bestMarket = result?.sell_market ?? selectedMarketData?.market ?? t("na");
  const expectedPrice = selectedMarketData?.price ?? Number(result?.expected_price ?? 0);
  const riskLevel = getRisk(String(selectedMarketData?.spoilageRisk ?? result?.spoilage_risk));
  const travelHours = selectedMarketData?.travelTime ?? Number(result?.spoilage_analysis?.travel_time_hours ?? 0);
  const expectedRevenue = expectedPrice * quantity;

  const comparison = marketInsights.map((market) => {
    const revenue = market.price * quantity;
    return {
      ...market,
      revenue,
      delta: revenue - expectedRevenue,
    };
  });

  const runAnalysis = () => {
    if (!crop.trim() || !location.trim()) return;
    onAnalyze(crop.trim(), location.trim());
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    runAnalysis();
  };

  const reset = () => {
    setCrop("");
    setLocation("");
    setSelectedMarket("");
    onReset();
  };

  const isDark = resolvedTheme === "dark";

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    void i18n.changeLanguage(lang);
    localStorage.setItem("i18nextLng", lang);
    localStorage.setItem("agri_language", lang);
  };

  const enterDashboard = () => {
    localStorage.setItem("agri-launch-entered", "1");
    setEnteredDashboard(true);
  };

  const resetLaunch = () => {
    localStorage.removeItem("agri-launch-entered");
    setEnteredDashboard(false);
  };

  const locationName = String(result?.location ?? location ?? "your area");
  const cropName = String(result?.crop ?? crop ?? "crop");
  const harvestDays = Number(result?.harvest_after_days ?? 0);
  const spoilageSimple = riskLevel === "HIGH" ? "high" : riskLevel === "MEDIUM" ? "medium" : "low";
  const farmerCoord = findCoords(locationName, LOCATION_COORDS);
  const marketCoord = findCoords(String(bestMarket), MARKET_COORDS) ?? findCoords(String(bestMarket), LOCATION_COORDS);
  const routeDistanceKm = farmerCoord && marketCoord ? distanceInKm(farmerCoord, marketCoord) : 0;
  const distanceText =
    routeDistanceKm > 0
      ? `${routeDistanceKm.toFixed(1)} km`
      : `${Math.max(1, Math.round(travelHours * 35))} km`;

  const harvestLine =
    harvestDays <= 1
      ? `Harvest your ${cropName} today.`
      : `Harvest your ${cropName} in ${harvestDays} days.`;

  const transportLine =
    riskLevel === "HIGH"
      ? "Transport quickly in the morning and avoid delay."
      : riskLevel === "MEDIUM"
        ? "Transport in the morning to avoid heat."
        : "Transport in the morning and keep produce shaded.";

  const farmerAdvice = [
    `You are in ${locationName}.`,
    harvestLine,
    `The best market is ${bestMarket}.`,
    `Expected price is Rs. ${expectedPrice.toFixed(2)} per quintal.`,
    `It is ${distanceText} from your location.`,
    `Spoilage risk is ${spoilageSimple}.`,
    transportLine,
  ].join(" ");

  if (!enteredDashboard) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-background text-foreground transition-colors duration-500">
        <div className="pointer-events-none absolute inset-0 agri-bg-layer opacity-90" />
        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 md:px-8">
          <header className="mb-5 flex items-center justify-between rounded-2xl border border-border/70 bg-card/80 px-4 py-3 backdrop-blur-xl">
            <div>
              <p className="font-display text-xl">{t("titlePro")}</p>
              <p className="text-xs text-muted-foreground">{t("taglinePro")}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="rounded-xl border border-border p-2 transition hover:bg-muted/70"
                aria-label={t("theme")}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <select
                value={language}
                onChange={(event) => changeLanguage(event.target.value)}
                className="rounded-xl border border-border bg-card px-2 py-2 text-sm"
                aria-label={t("language")}
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
                <option value="mr">मराठी</option>
              </select>
            </div>
          </header>
          <IndiaLaunchpad onEnter={enterDashboard} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground transition-colors duration-500">
      <div className="pointer-events-none absolute inset-0 agri-bg-layer opacity-80" />
      <div className="pointer-events-none absolute -top-36 left-1/3 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative z-10 flex min-h-screen">
        <aside
          data-tour="sidebar-overview"
          className={`fixed inset-y-0 left-0 z-30 w-72 border-r border-border/70 bg-sidebar/90 p-5 text-sidebar-foreground backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Sprout className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-xl leading-none">AgriChain Pro</p>
              <p className="text-xs text-muted-foreground">{t("enterpriseOps")}</p>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { icon: BarChart3, key: "navOverview", sectionId: "overview-section" },
              { icon: MapPinned, key: "navMarkets", sectionId: "markets-section" },
              { icon: Gauge, key: "navRisk", sectionId: "spoilage-section" },
              { icon: Calculator, key: "navProfit", sectionId: "profit-section" },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => scrollToSection(item.sectionId)}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm transition ${
                  activeMenu === item.sectionId ? "active-menu" : "hover:bg-sidebar-accent"
                }`}
              >
                <item.icon className="h-4 w-4 text-primary" />
                <span>{t(item.key)}</span>
              </button>
            ))}
          </nav>

          <form onSubmit={submit} className="mt-8 space-y-3 rounded-2xl border border-border/70 bg-background/75 p-4">
            <p className="text-sm font-semibold">{t("analysisControls")}</p>
            <label className="block text-xs font-medium text-muted-foreground">
              🌾 {t("crop")}
            </label>
            <select
              data-tour="crop-selection"
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              aria-label={t("crop")}
            >
              <option value="" disabled>
                {t("crop")}
              </option>
              {SUPPORTED_CROPS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <label className="block text-xs font-medium text-muted-foreground">
              📍 {t("location")}
            </label>
            <select
              data-tour="location-selection"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              aria-label={t("location")}
            >
              <option value="" disabled>
                {t("location")}
              </option>
              {SUPPORTED_LOCATIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                data-tour="run-analysis"
                type="button"
                onClick={runAnalysis}
                disabled={loading || !crop || !location}
                className="flex-1 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
              >
                {loading ? t("analyzing") : t("runAnalysis")}
              </button>
              <button
                type="button"
                onClick={reset}
                className="rounded-xl border border-border px-3 py-2 text-sm transition hover:bg-muted/70"
              >
                {t("reset")}
              </button>
            </div>
          </form>
        </aside>

        <div className="flex-1 lg:ml-72">
          <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-xl md:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen((prev) => !prev)}
                className="rounded-xl border border-border p-2 lg:hidden"
                aria-label={t("menu")}
              >
                <Menu className="h-4 w-4" />
              </button>
              <div>
                <p className="font-display text-lg">{t("titlePro")}</p>
                <p className="text-xs text-muted-foreground">{t("taglinePro")}</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={resetLaunch}
                  className="hidden rounded-xl border border-border px-3 py-2 text-xs font-semibold transition hover:bg-muted/70 sm:block"
                >
                  {t("backToLaunch")}
                </button>
                <button
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                  className="rounded-xl border border-border p-2 transition hover:bg-muted/70"
                  aria-label={t("theme")}
                >
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
                <select
                  value={language}
                  onChange={(event) => changeLanguage(event.target.value)}
                  className="rounded-xl border border-border bg-card px-2 py-2 text-sm"
                  aria-label={t("language")}
                >
                  <option value="en">English</option>
                  <option value="hi">हिंदी</option>
                  <option value="mr">मराठी</option>
                </select>
                <button
                  onClick={onRecheck}
                  className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold"
                  title={t("backendStatus")}
                >
                  {healthy === null ? (
                    <>
                      <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-yellow-500" />
                      {t("healthChecking")}
                    </>
                  ) : healthy ? (
                    <>
                      <Wifi className="h-3.5 w-3.5 text-green-500" />
                      {t("backendOnline")}
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-3.5 w-3.5 text-red-500" />
                      {t("backendOffline")}
                    </>
                  )}
                </button>
              </div>
            </div>
          </header>
          {loading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80">
              <div className="rounded-2xl border border-border bg-card/95 px-6 py-5 text-center shadow-xl">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                <p className="mt-2 text-sm font-medium">{t("analyzing")}</p>
                <p className="text-xs text-muted-foreground">{t("fetchingMarketIntelligence")}</p>
              </div>
            </div>
          )}

          <main className="main-content space-y-6 px-4 py-6 md:px-6">
            {error && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-300">
                {error}
              </div>
            )}

            <section id="overview-section" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: t("kpiExpectedPrice"),
                  value: `Rs. ${expectedPrice.toFixed(2)}`,
                  icon: TrendingUp,
                },
                {
                  label: t("kpiBestMarket"),
                  value: bestMarket,
                  icon: MapPinned,
                },
                {
                  label: t("kpiHarvestWindow"),
                  value: `${result?.harvest_after_days ?? 0} ${t("days")}`,
                  icon: Navigation,
                },
                {
                  label: t("kpiRiskLevel"),
                  value: riskLevel,
                  icon: AlertTriangle,
                },
              ].map((card) => (
                <article
                  key={card.label}
                  className="group rounded-2xl border border-border/70 bg-card/80 p-4 shadow-[0_8px_24px_-16px_rgba(0,0,0,0.35)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_20px_36px_-18px_rgba(0,0,0,0.35)]"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{card.label}</p>
                    <card.icon className="h-4 w-4 text-primary" />
                  </div>
                  <p className="truncate text-lg font-semibold">{card.value}</p>
                </article>
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <article id="markets-section" className="rounded-2xl border border-border/70 bg-card/80 p-4">
                <div data-tour="market-map">
                <div className="mb-4 flex items-center gap-2">
                  <MapPinned className="h-4 w-4 text-primary" />
                  <p className="font-semibold">{t("marketIntelligenceMap")}</p>
                </div>
                <AppErrorBoundary
                  fallbackTitle="Map section crashed."
                  fallbackMessage="Map is temporarily unavailable. Other insights are still active."
                >
                  {result?.location ? (
                    <MarketMap
                      location={result.location}
                      markets={marketInsights.map((market) => ({
                        market: market.market,
                        price: market.price,
                        travelTime: market.travelTime,
                        spoilageRisk: market.spoilageRisk,
                        expectedRevenue: market.price * quantity,
                      }))}
                      bestMarket={bestMarket}
                      selectedMarket={selectedMarketData?.market}
                      onMarketSelect={setSelectedMarket}
                    />
                  ) : (
                    <p className="py-10 text-center text-sm text-muted-foreground">{t("enterCropLocationHint")}</p>
                  )}
                </AppErrorBoundary>
                </div>
              </article>

              <article data-tour="price-forecast" className="rounded-2xl border border-border/70 bg-card/80 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <LineChartIcon className="h-4 w-4 text-primary" />
                  <p className="font-semibold">{t("forecast7Day")}</p>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineForecast}>
                      <CartesianGrid strokeDasharray="4 4" opacity={0.25} />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => `Rs. ${value.toFixed(2)}`} />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#16a34a"
                        strokeWidth={3}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                        isAnimationActive
                        animationDuration={800}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </article>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <article className="rounded-2xl border border-border/70 bg-card/80 p-4">
                <p className="mb-4 font-semibold">{t("priceComparisonTop5")}</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={marketInsights}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="market" tick={{ fontSize: 11 }} />
                      <YAxis />
                      <Tooltip formatter={(value: number) => `Rs. ${value.toFixed(2)}`} />
                      <Bar dataKey="price" radius={[8, 8, 0, 0]} isAnimationActive animationDuration={700}>
                        {marketInsights.map((entry, index) => (
                          <Cell key={`${entry.market}-${index}`} fill={entry.market === bestMarket ? "#16a34a" : "#84cc16"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs">
                    <span>{t("volatilityIndicator")}</span>
                    <span>{`${volatilityPercent}%`}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-700"
                      style={{ width: `${volatilityPercent}%` }}
                    />
                  </div>
                </div>
              </article>

              <article id="spoilage-section" data-tour="spoilage-risk" className="rounded-2xl border border-border/70 bg-card/80 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-primary" />
                  <p className="font-semibold">{t("spoilageRiskVisualization")}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                    <p className="text-xs text-muted-foreground">{t("riskMeter")}</p>
                    <p className="mb-2 text-lg font-semibold">{riskLevel}</p>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${riskScore[riskLevel]}%`, backgroundColor: colorForRisk(riskLevel) }}
                      />
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {t("travelTimeHours")}: {travelHours.toFixed(1)}h
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <CloudSun className="h-4 w-4 text-primary" />
                      {result?.spoilage_analysis?.temperature_effect ?? t("na")}
                    </p>
                  </div>

                  <div className="flex items-center justify-center rounded-2xl border border-border/70 bg-background/80 p-4">
                    <div className="relative h-32 w-32">
                      <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
                        <circle cx="60" cy="60" r="48" stroke="hsl(var(--muted))" strokeWidth="10" fill="none" />
                        <circle
                          cx="60"
                          cy="60"
                          r="48"
                          stroke={colorForRisk(riskLevel)}
                          strokeWidth="10"
                          fill="none"
                          strokeDasharray={301.6}
                          strokeDashoffset={301.6 - (301.6 * riskScore[riskLevel]) / 100}
                          className="transition-all duration-700"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <p className="text-2xl font-bold">{riskScore[riskLevel]}%</p>
                        <p className="text-xs text-muted-foreground">{t("riskScore")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <article id="profit-section" data-tour="profit-intelligence" className="rounded-2xl border border-border/70 bg-card/80 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-primary" />
                  <p className="font-semibold">{t("profitCalculator")}</p>
                </div>
                <label className="mb-3 block text-sm text-muted-foreground">
                  {t("quantityQuintals")}
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </label>
                <div className="rounded-2xl border border-primary/25 bg-primary/5 p-3">
                  <p className="text-xs text-muted-foreground">{t("expectedRevenue")}</p>
                  <p className="text-2xl font-bold text-primary">Rs. {expectedRevenue.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("selectedMarket")}: {selectedMarketData?.market ?? t("na")}
                  </p>
                </div>
                <div className="mt-3 space-y-2">
                  {comparison.map((market) => (
                    <div key={market.market} className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2 text-sm">
                      <span>{market.market}</span>
                      <span className={market.delta >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500"}>
                        {market.delta >= 0 ? "+" : ""}Rs. {market.delta.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </article>

              <article data-tour="final-recommendation" className="relative overflow-hidden rounded-2xl border border-primary/40 bg-card/80 p-4 shadow-[0_0_0_1px_rgba(16,185,129,0.18),0_16px_45px_-26px_rgba(16,185,129,0.9)]">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-emerald-500/10" />
                <div className="relative">
                  <div className="mb-3 flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    <p className="font-semibold">{t("aiRecommendationPanel")}</p>
                  </div>
                  <p className="rounded-xl border border-primary/30 bg-background/80 p-3 text-sm leading-6">
                    {farmerAdvice}
                  </p>
                </div>
              </article>
            </section>
          </main>
          <FarmerTutorial enabled={enteredDashboard} language={language} onLanguageChange={changeLanguage} />
        </div>
      </div>
    </div>
  );
};

export default AgriDashboard;
