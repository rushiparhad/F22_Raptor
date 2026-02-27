import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, MapPin, Wheat, RotateCcw, Loader2 } from "lucide-react";

interface CropInputCardProps {
  onAnalyze: (crop: string, location: string) => void;
  onReset: () => void;
  loading: boolean;
  hasResult: boolean;
}

const CropInputCard = ({ onAnalyze, onReset, loading, hasResult }: CropInputCardProps) => {
  const { t } = useTranslation();
  const [crop, setCrop] = useState("");
  const [location, setLocation] = useState("");
  const [errors, setErrors] = useState<{ crop?: string; location?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!crop.trim()) e.crop = t("pleaseEnterCrop");
    if (!location.trim()) e.location = t("pleaseEnterLocation");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (validate()) onAnalyze(crop.trim(), location.trim());
  };

  const handleReset = () => {
    setCrop("");
    setLocation("");
    setErrors({});
    onReset();
  };

  return (
    <form onSubmit={handleSubmit} className="agri-card animate-slide-up">
      <h2 className="text-lg font-display font-semibold text-foreground mb-1">
        {t("analyze")} {t("crop")}
      </h2>
      <p className="text-sm text-muted-foreground mb-5">
        {t("enterCropLocationSub")}
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
            <Wheat className="w-4 h-4 text-primary" />
            {t("crop")}
          </label>
          <input
            type="text"
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            placeholder={t("cropPlaceholder", "e.g. Tomato, Rice, Wheat")}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
            title={t("cropTitle", "Name of the crop you want to analyze")}
          />
          {errors.crop && <p className="text-xs text-destructive mt-1">{errors.crop}</p>}
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
            <MapPin className="w-4 h-4 text-primary" />
            {t("location")}
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={t("locationPlaceholder", "e.g. Nashik, Punjab, Karnataka")}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
            title={t("locationTitle", "Your farming location or nearest market town")}
          />
          {errors.location && <p className="text-xs text-destructive mt-1">{errors.location}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3 mt-5">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60 transition"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          {loading ? t("analyzing") : t("analyze")}
        </button>
        {hasResult && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <RotateCcw className="w-4 h-4" />
            {t("reset")}
          </button>
        )}
      </div>
    </form>
  );
};

export default CropInputCard;
