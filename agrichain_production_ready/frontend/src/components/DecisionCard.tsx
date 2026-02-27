import { Calendar, ShoppingCart, IndianRupee, TrendingUp, TrendingDown, Minus, AlertTriangle, Lightbulb } from "lucide-react";
import type { AgriChainResult } from "@/lib/api";
import { useTranslation } from "react-i18next";

const trendConfig: Record<string, { icon: typeof TrendingUp; className: string }> = {
  UP: { icon: TrendingUp, className: "bg-agri-green-light text-agri-trend-up" },
  DOWN: { icon: TrendingDown, className: "bg-destructive/10 text-agri-trend-down" },
  STABLE: { icon: Minus, className: "bg-secondary text-agri-trend-stable" },
};

const riskConfig: Record<string, string> = {
  LOW: "bg-agri-green-light text-agri-success",
  MEDIUM: "bg-accent/15 text-accent",
  HIGH: "bg-destructive/10 text-destructive",
};

const Fallback = ({ label }: { label: string }) => (
  <span className="text-muted-foreground italic text-sm">{label}</span>
);

const DecisionCard = ({ data }: { data: AgriChainResult }) => {
  const { t } = useTranslation();
  const trend = (data.price_trend ?? "").toUpperCase();
  const risk = (data.spoilage_risk ?? "").toUpperCase();
  const TrendIcon = trendConfig[trend]?.icon ?? Minus;
  const trendClass = trendConfig[trend]?.className ?? "bg-muted text-muted-foreground";
  const riskClass = riskConfig[risk] ?? "bg-muted text-muted-foreground";

  return (
    <div className="agri-card animate-slide-up" style={{ animationDelay: "0.1s" }}>
      <h2 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-accent" />
        {t("decisionSummary", "Decision Summary")}
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{t("harvestAfter", "Harvest After")}</p>
          <p className="text-xl font-bold text-foreground flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-primary" />
            {data.harvest_after_days != null ? `${data.harvest_after_days} days` : <Fallback label="N/A" />}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{t("sellMarket", "Sell Market")}</p>
          <p className="text-xl font-bold text-foreground flex items-center gap-1.5">
            <ShoppingCart className="w-4 h-4 text-primary" />
            {data.sell_market ?? <Fallback label="N/A" />}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{t("expectedPrice", "Expected Price")}</p>
          <p className="text-xl font-bold text-foreground flex items-center gap-1">
            <IndianRupee className="w-4 h-4 text-primary" />
            {data.expected_price != null ? `₹${data.expected_price.toLocaleString("en-IN")}` : <Fallback label="N/A" />}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{t("priceRange", "Price Range")}</p>
          <p className="text-sm font-semibold text-foreground">
            {data.price_range_min != null && data.price_range_max != null
              ? `₹${data.price_range_min.toLocaleString("en-IN")} – ₹${data.price_range_max.toLocaleString("en-IN")}`
              : <Fallback label="N/A" />}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <span className={`agri-badge ${trendClass}`}>
          <TrendIcon className="w-3.5 h-3.5" />
          {trend || t("na")} {t("trend")}
        </span>
        <span className={`agri-badge ${riskClass}`}>
          <AlertTriangle className="w-3.5 h-3.5" />
          {risk || t("na")} {t("spoilageRisk")}
        </span>
      </div>

      {data.advice && (
        <div className="mt-4 rounded-lg bg-agri-green-light p-3 text-sm text-foreground">
          <p className="font-semibold text-primary mb-1">💡 {t("advice")}</p>
          {data.advice}
        </div>
      )}
    </div>
  );
};

export default DecisionCard;
