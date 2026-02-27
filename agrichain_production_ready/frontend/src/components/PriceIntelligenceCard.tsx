import { BarChart3, Activity } from "lucide-react";
import type { AgriChainResult } from "@/lib/api";
import { useTranslation } from "react-i18next";
// chart components
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

const PriceIntelligenceCard = ({ data }: { data: AgriChainResult }) => {
  const { t } = useTranslation();
  const markets = data.top_markets ?? [];
  // for chart, map into simple array with name and price
  const chartData = markets.slice(0, 5).map((m) => ({ name: m.market, price: m.price }));

  return (
    <div className="agri-card animate-slide-up" style={{ animationDelay: "0.2s" }}>
      <h2 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary" />
        {t("priceIntelligence", "Price Intelligence")}
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{t("forecastDays", "Forecast Days")}</p>
          <p className="text-lg font-bold text-foreground">
            {data.forecast_days ?? <span className="text-muted-foreground italic text-sm">N/A</span>}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{t("trend", "Trend")}</p>
          <p className="text-sm font-semibold text-foreground">
            {data.trend_description ?? <span className="text-muted-foreground italic text-sm">N/A</span>}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{t("volatility", "Volatility")}</p>
          <p className="text-sm font-semibold text-foreground flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-accent" />
            {data.volatility ?? <span className="text-muted-foreground italic">N/A</span>}
          </p>
        </div>
      </div>

      {markets.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">{t("topMarkets", "Top Markets")}</p>
          {/* chart area */}
          <div className="h-40 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={120} />
                <Tooltip formatter={(value: any) => [`₹${Number(value).toLocaleString("en-IN")}`, t("price", "Price")]} />
                <Bar dataKey="price" fill="var(--accent)" radius={[0, 6, 6, 0]}>
                  {chartData.map((entry, idx) => (
                    <Cell key={idx} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left px-3 py-2 font-semibold text-foreground">#</th>
                  <th className="text-left px-3 py-2 font-semibold text-foreground">{t("market", "Market")}</th>
                  <th className="text-right px-3 py-2 font-semibold text-foreground">{t("price", "Price")} (₹)</th>
                </tr>
              </thead>
              <tbody>
                {markets.slice(0, 5).map((m, i) => (
                  <tr key={i} className="border-t border-border hover:bg-muted/50 transition-colors">
                    <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                    <td className="px-3 py-2 font-medium text-foreground">{m.market}</td>
                    <td className="px-3 py-2 text-right font-semibold text-foreground">
                      ₹{m.price.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceIntelligenceCard;
