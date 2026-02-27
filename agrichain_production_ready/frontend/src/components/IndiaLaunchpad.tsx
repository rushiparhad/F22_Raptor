import { useTranslation } from "react-i18next";
import { ArrowRight, MapPinned, ShieldCheck, Sparkles, Truck, Wheat } from "lucide-react";

interface IndiaLaunchpadProps {
  onEnter: () => void;
}

const IndiaLaunchpad = ({ onEnter }: IndiaLaunchpadProps) => {
  const { t } = useTranslation();
  const heroImages = [
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80",
  ];

  return (
    <div className="mx-auto max-w-6xl rounded-3xl border border-border/70 bg-card/85 p-5 shadow-[0_20px_60px_-30px_rgba(20,83,45,0.4)] backdrop-blur-xl md:p-8">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-3xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50/90 to-lime-100/70 p-4 dark:border-emerald-900/60 dark:from-emerald-950/45 dark:to-emerald-900/25">
          <div className="mb-4 flex items-center justify-between">
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <MapPinned className="h-3.5 w-3.5" />
              {t("launchBadge")}
            </p>
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">{t("serviceAvailable")}</p>
          </div>

          <div className="grid gap-3">
            <div className="relative h-44 overflow-hidden rounded-2xl border border-emerald-300/50 bg-gradient-to-br from-emerald-200/60 to-lime-200/40">
              <img
                src={heroImages[0]}
                alt="Farming field"
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
              <p className="absolute bottom-3 left-3 rounded-full bg-black/45 px-3 py-1 text-xs font-semibold text-white">
                Smart Farming, Better Selling
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative overflow-hidden rounded-2xl border border-emerald-300/50 bg-gradient-to-br from-emerald-100 to-lime-100 p-3">
                <img
                  src={heroImages[1]}
                  alt="Market logistics"
                  className="absolute right-0 top-0 h-full w-full object-cover opacity-30"
                  loading="lazy"
                />
                <div className="relative">
                  <p className="inline-flex items-center gap-1 rounded-full bg-emerald-700/10 px-2 py-1 text-xs font-semibold text-emerald-800">
                    <Truck className="h-3.5 w-3.5" />
                    Transport Tip
                  </p>
                  <p className="mt-2 text-sm font-semibold text-emerald-900">Send produce in morning</p>
                  <p className="text-xs text-emerald-800">Cooler hours help keep freshness.</p>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-2xl border border-emerald-300/50 bg-gradient-to-br from-lime-100 to-emerald-100 p-3">
                <img
                  src={heroImages[2]}
                  alt="Onion crop"
                  className="absolute right-0 top-0 h-full w-full object-cover opacity-25"
                  loading="lazy"
                />
                <div className="relative">
                  <p className="inline-flex items-center gap-1 rounded-full bg-emerald-700/10 px-2 py-1 text-xs font-semibold text-emerald-800">
                    <Wheat className="h-3.5 w-3.5" />
                    Crop Focus
                  </p>
                  <p className="mt-2 text-sm font-semibold text-emerald-900">Check mandi before harvest</p>
                  <p className="text-xs text-emerald-800">Choose the market with better price.</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-300/50 bg-white/80 p-3 dark:bg-slate-900/45">
              <p className="mb-2 text-xs font-semibold tracking-wide text-emerald-800 dark:text-emerald-200">INDIA MAP</p>
              <div className="relative h-[250px] overflow-hidden rounded-xl border border-emerald-200/60 bg-white">
                <iframe
                  title="India map overview"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=67.32%2C6.55%2C97.40%2C36.80&layer=mapnik"
                  className="h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="pointer-events-none absolute left-[46%] top-[52%]">
                  <div className="relative">
                    <span className="absolute -left-6 -top-6 h-12 w-12 animate-pulse rounded-full border-4 border-emerald-500/80" />
                    <span className="absolute left-0 top-0 h-3.5 w-3.5 rounded-full bg-emerald-600 shadow-[0_0_0_6px_rgba(34,197,94,0.25)]" />
                    <span className="absolute left-5 -top-1 rounded-full bg-emerald-700 px-2 py-1 text-[10px] font-bold text-white">
                      Maharashtra
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>

        <article className="flex flex-col justify-between rounded-3xl border border-border/70 bg-background/80 p-6">
          <div>
            <h1 className="font-display text-3xl leading-tight md:text-4xl">{t("launchTitle")}</h1>
            <p className="mt-3 text-sm text-muted-foreground md:text-base">{t("launchSubtitle")}</p>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl border border-border/70 bg-card/80 p-3">
                <p className="text-sm font-semibold">{t("launchOverviewTitle")}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t("launchOverviewDesc")}</p>
              </div>
              <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-3 text-sm">
                <p className="font-semibold text-amber-700 dark:text-amber-300">{t("launchMaharashtraOnly")}</p>
                <p className="mt-1 text-muted-foreground">{t("clickToEnter")}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-2 text-sm text-muted-foreground">
              <p className="inline-flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" />{t("launchFeature1")}</p>
              <p className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" />{t("launchFeature2")}</p>
              <p className="inline-flex items-center gap-2"><MapPinned className="h-4 w-4 text-primary" />{t("launchFeature3")}</p>
            </div>
          </div>

          <button
            onClick={onEnter}
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:scale-[1.01] hover:opacity-95"
          >
            {t("launchCta")}
            <ArrowRight className="h-4 w-4" />
          </button>
        </article>
      </div>
    </div>
  );
};

export default IndiaLaunchpad;
