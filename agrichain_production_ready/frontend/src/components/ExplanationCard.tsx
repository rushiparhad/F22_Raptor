import { FileText } from "lucide-react";
import type { AgriChainResult } from "@/lib/api";
import { useTranslation } from "react-i18next";

const ExplanationCard = ({ data }: { data: AgriChainResult }) => {
  const { t } = useTranslation();
  if (!data.explanation) return null;

  return (
    <div className="agri-card animate-slide-up" style={{ animationDelay: "0.3s" }}>
      <h2 className="text-lg font-display font-semibold text-foreground mb-3 flex items-center gap-2">
        <FileText className="w-5 h-5 text-agri-earth" />
        {t("detailedExplanation", "Detailed Explanation")}
      </h2>
      <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap rounded-lg bg-muted/50 p-4">
        {data.explanation}
      </div>
    </div>
  );
};

export default ExplanationCard;
