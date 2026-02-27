import { useCallback, useEffect, useMemo, useRef } from "react";
import { driver } from "driver.js";
import { tutorialText } from "../i18n/tutorialText";

const TUTORIAL_KEY = "agri_tutorial_done";

const waitForElements = (selectors, timeoutMs = 7000) =>
  new Promise((resolve) => {
    const start = Date.now();
    const interval = setInterval(() => {
      const allFound = selectors.every((selector) => document.querySelector(selector));
      const timedOut = Date.now() - start > timeoutMs;
      if (allFound || timedOut) {
        clearInterval(interval);
        resolve();
      }
    }, 150);
  });

const FarmerTutorial = ({ enabled, language = "en", onLanguageChange }) => {
  const driverRef = useRef(null);
  const autoStartedRef = useRef(false);
  const t = tutorialText[language] ?? tutorialText.en;

  const baseSteps = useMemo(
    () => [
      {
        selector: '[data-tour="sidebar-overview"]',
        title: t.titles.dashboard,
        description: t.welcome,
      },
      {
        selector: '[data-tour="crop-selection"]',
        title: t.titles.crop,
        description: t.crop,
      },
      {
        selector: '[data-tour="location-selection"]',
        title: t.titles.location,
        description: t.location,
      },
      {
        selector: '[data-tour="run-analysis"]',
        title: t.titles.run,
        description: t.run,
      },
      {
        selector: '[data-tour="market-map"]',
        title: t.titles.map,
        description: t.map,
      },
      {
        selector: '[data-tour="price-forecast"]',
        title: t.titles.price,
        description: t.price,
      },
      {
        selector: '[data-tour="spoilage-risk"]',
        title: t.titles.spoilage,
        description: t.spoilage,
      },
      {
        selector: '[data-tour="profit-intelligence"]',
        title: t.titles.profit,
        description: t.profit,
      },
      {
        selector: '[data-tour="final-recommendation"]',
        title: t.titles.recommendation,
        description: t.recommendation,
      },
      {
        title: t.titles.done,
        description: t.done,
      },
    ],
    [t]
  );

  const startTutorial = useCallback(
    async (markDone) => {
      if (!enabled) return;
      if (driverRef.current) {
        driverRef.current.destroy();
        driverRef.current = null;
      }

      const selectors = baseSteps
        .map((step) => step.selector)
        .filter(Boolean);

      await waitForElements(selectors);

      const isMobile = window.innerWidth < 768;
      const steps = baseSteps
        .map((step) => ({
          ...(step.selector
            ? { element: document.querySelector(step.selector) || undefined }
            : {}),
          popover: {
            title: step.title,
            description: step.description,
            side: isMobile ? "bottom" : "right",
            align: "start",
          },
        }));

      if (!steps.length) return;

      const tour = driver({
        showProgress: true,
        animate: true,
        overlayOpacity: 0.6,
        allowClose: true,
        smoothScroll: true,
        popoverClass: "farmer-tour-popover",
        doneBtnText: t.controls.done,
        nextBtnText: t.controls.next,
        prevBtnText: t.controls.back,
        onDestroyed: () => {
          if (markDone) localStorage.setItem(TUTORIAL_KEY, "true");
        },
      });

      driverRef.current = tour;
      tour.setSteps(steps);
      tour.drive();
    },
    [baseSteps, enabled, t.controls.back, t.controls.done, t.controls.next]
  );

  useEffect(() => {
    if (!enabled || autoStartedRef.current) return;
    autoStartedRef.current = true;

    if (!localStorage.getItem(TUTORIAL_KEY)) {
      const timer = setTimeout(() => {
        void startTutorial(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [enabled, startTutorial]);

  useEffect(() => {
    if (!enabled) return;
    if (!driverRef.current) return;

    driverRef.current.destroy();
    setTimeout(() => {
      void startTutorial(false);
    }, 300);
  }, [enabled, language, startTutorial]);

  useEffect(() => {
    window.startAgriTutorial = () => {
      localStorage.removeItem(TUTORIAL_KEY);
      void startTutorial(false);
    };

    return () => {
      if (window.startAgriTutorial) {
        delete window.startAgriTutorial;
      }
    };
  }, [startTutorial]);

  if (!enabled) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end gap-2">
      <label
        htmlFor="tutorial-language-selector"
        className="rounded-xl border-2 border-[#2e7d32] bg-[#e8f5e9] px-3 py-2 text-sm font-semibold text-black shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
      >
        <span className="mr-2">🌐 Language</span>
        <select
          id="tutorial-language-selector"
          value={language}
          onChange={(event) => onLanguageChange?.(event.target.value)}
          className="min-h-11 cursor-pointer rounded-md border border-[#2e7d32] bg-white px-2 text-sm text-black"
          aria-label="Tutorial language"
        >
          <option value="en">English</option>
          <option value="hi">हिंदी</option>
          <option value="mr">मराठी</option>
        </select>
      </label>
      <button
        type="button"
        onClick={() => window.startAgriTutorial?.()}
        className="min-h-11 cursor-pointer rounded-[50px] border-2 border-[#2e7d32] bg-[#e8f5e9] px-[18px] py-3 text-sm font-semibold text-black shadow-[0_4px_12px_rgba(0,0,0,0.2)] transition hover:bg-[#c8e6c9]"
      >
        🌾 Help / Tutorial
      </button>
    </div>
  );
};

export default FarmerTutorial;
