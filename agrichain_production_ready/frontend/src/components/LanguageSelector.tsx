import { useTranslation } from "react-i18next";
import { useEffect } from "react";

const LANGS: { code: string; label: string }[] = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "mr", label: "मराठी" },
];

const LanguageSelector = () => {
  const { i18n, t } = useTranslation();

  const change = (lng: string) => {
    void i18n.changeLanguage(lng);
    localStorage.setItem("i18nextLng", lng);
  };

  useEffect(() => {
    const stored = localStorage.getItem("i18nextLng");
    if (stored && stored !== i18n.language) {
      void i18n.changeLanguage(stored);
    }
  }, [i18n]);

  return (
    <select
      value={i18n.language}
      onChange={(e) => change(e.target.value)}
      className="rounded-md border border-input bg-background px-2 py-1 text-sm"
      aria-label={t("language")}
    >
      {LANGS.map((l) => (
        <option key={l.code} value={l.code}>
          {l.label}
        </option>
      ))}
    </select>
  );
};

export default LanguageSelector;
