import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

const ErrorCard = ({ message }: { message: string }) => {
  const { t } = useTranslation();
  return (
    <div className="agri-card border-destructive/30 animate-slide-up">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-foreground">{t("somethingWentWrong")}</p>
          <p className="text-sm text-muted-foreground mt-1">{message}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {t("checkAPIServer")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorCard;
