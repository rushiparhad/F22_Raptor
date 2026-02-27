import { useState } from "react";
import { HelpCircle, X, ChevronRight } from "lucide-react";

const steps = [
  {
    title: "Step 1 — Enter Your Crop",
    body: "Type the name of the crop you are growing. For example: Tomato, Rice, Wheat, Onion. Use the name that matches your local market.",
  },
  {
    title: "Step 2 — Enter Your Location",
    body: "Type the name of your village, town, district or state. This helps the system find nearby markets and prices. Example: Nashik, Punjab.",
  },
  {
    title: "Step 3 — Click Analyze",
    body: "Press the green Analyze button. The system will contact market databases and give you a recommendation within seconds.",
  },
  {
    title: "Step 4 — Read the Results",
    body: "The Decision Summary shows when to harvest, where to sell, and the expected price. Green badges are good, red badges mean caution.",
  },
  {
    title: "Step 5 — Understand Risk & Trend",
    body: "Price Trend (UP/DOWN/STABLE) tells you if prices are rising or falling. Spoilage Risk (LOW/MEDIUM/HIGH) tells you how quickly to sell. If risk is HIGH, sell as soon as possible.",
  },
];

const HelpButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:opacity-90 transition"
        aria-label="Help & Tutorial"
      >
        <HelpCircle className="w-5 h-5" />
        <span className="hidden sm:inline">Help</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm animate-fade-in p-4">
          <div className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
            <div className="agri-gradient-hero px-5 py-4 flex items-center justify-between">
              <h2 className="text-lg font-display font-bold text-primary-foreground">
                🌾 Farmer's Guide
              </h2>
              <button onClick={() => setOpen(false)} className="text-primary-foreground/80 hover:text-primary-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4">
              {steps.map((s, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{s.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{s.body}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2 rounded-lg bg-agri-green-light p-3 text-sm text-foreground">
                <ChevronRight className="w-4 h-4 text-primary" />
                <span>Tip: You can run the analysis as many times as you like with different crops!</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HelpButton;
