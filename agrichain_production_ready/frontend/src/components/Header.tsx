import { Sprout, Wifi, WifiOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSelector from "./LanguageSelector";
import ThemeToggle from "./ThemeToggle";

interface HeaderProps {
  healthy: boolean | null;
  onRecheck: () => void;
}

const Header = ({ healthy, onRecheck }: HeaderProps) => {
  const { t } = useTranslation();
  return (
    <header className="agri-gradient-hero px-4 py-8 sm:py-10">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary-foreground/20 backdrop-blur-sm">
            <Sprout className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-primary-foreground tracking-tight">
              {t("title")}
            </h1>
            <p className="text-primary-foreground/75 text-sm font-medium">
              {t("tagline")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSelector />
          <ThemeToggle />
          <button
            onClick={onRecheck}
            className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold tracking-wide uppercase transition-colors bg-primary-foreground/15 backdrop-blur-sm text-primary-foreground hover:bg-primary-foreground/25"
            title="API Health Status"
          >
            {healthy === null ? (
              <>
                <div className="w-2 h-2 rounded-full bg-primary-foreground/50 animate-pulse-gentle" />
                {t("healthChecking")}
              </>
            ) : healthy ? (
              <>
                <Wifi className="w-3.5 h-3.5" />
                {t("backendOnline")}
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                {t("backendOffline")}
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
