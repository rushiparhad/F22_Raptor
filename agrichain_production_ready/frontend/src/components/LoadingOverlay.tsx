import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const LoadingOverlay = () => {
  const { t } = useTranslation();
  return (
    <div className="agri-card flex flex-col items-center justify-center py-12 animate-fade-in">
      <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
      <p className="text-sm font-medium text-foreground">{t("analyzingCropData", "Analyzing crop data…")}</p>
      <p className="text-xs text-muted-foreground mt-1">{t("fetchingMarketIntelligence", "Fetching market intelligence for you")}</p>
    </div>
  );
};

export default LoadingOverlay;
