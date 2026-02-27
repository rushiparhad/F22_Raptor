import { ThermometerSun, Truck, ShieldAlert } from "lucide-react";
import type { AgriChainResult } from "@/lib/api";
import { useTranslation } from "react-i18next";

const SpoilageAnalysisCard = ({ data }: { data: AgriChainResult }) => {
  const { t } = useTranslation();
  const spoilage = data.spoilage_analysis ?? {
    risk_level: data.spoilage_risk ?? "LOW",
    travel_time_hours: 0,
    temperature_effect: "Temperature impact is manageable with standard handling.",
    recommendation: "Use standard logistics with regular checks.",
  };

  return (
    <div className="agri-card animate-slide-up" style={{ animationDelay: "0.25s" }}>
      <h2 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
        <ShieldAlert className="w-5 h-5 text-destructive" />
        {t("spoilageAnalysis", "Spoilage Analysis")}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{t("riskLevel", "Risk Level")}</p>
          <p className="text-lg font-bold text-foreground">{spoilage.risk_level}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{t("travelTimeHours", "Travel Time (Hours)")}</p>
          <p className="text-lg font-bold text-foreground flex items-center gap-1">
            <Truck className="w-4 h-4 text-primary" />
            {spoilage.travel_time_hours.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="font-semibold text-foreground mb-1 flex items-center gap-1">
            <ThermometerSun className="w-4 h-4 text-accent" />
            {t("temperatureEffect", "Temperature Effect")}
          </p>
          <p className="text-muted-foreground">{spoilage.temperature_effect}</p>
        </div>
        <div className="rounded-lg bg-agri-green-light p-3">
          <p className="font-semibold text-primary mb-1">{t("recommendation", "Recommendation")}</p>
          <p className="text-foreground">{spoilage.recommendation}</p>
        </div>
      </div>
    </div>
  );
};

export default SpoilageAnalysisCard;
