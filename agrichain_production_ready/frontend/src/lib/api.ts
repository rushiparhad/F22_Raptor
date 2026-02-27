const API_BASE = "http://127.0.0.1:8000";

interface BackendAgriChainResponse {
  decision: {
    harvest_after_days: number;
    sell_market: string;
    expected_price: number;
    price_trend: "UP" | "DOWN" | "STABLE";
    price_range: { min: number; max: number };
    spoilage_risk: "LOW" | "MEDIUM" | "HIGH";
    advice: string;
  };
  price_intelligence: {
    forecast_days: number;
    trend_description: string;
    volatility: string;
    other_markets: Array<{ market: string; avg_price: number; trend: string }>;
  };
  spoilage_analysis: {
    risk_level: string;
    travel_time_hours: number;
    temperature_effect: string;
    recommendation: string;
  };
  explanation: string;
}

export interface AgriChainResult {
  crop?: string;
  location?: string;
  harvest_after_days?: number;
  sell_market?: string;
  expected_price?: number;
  price_trend?: string;
  price_range_min?: number;
  price_range_max?: number;
  spoilage_risk?: string;
  advice?: string;
  forecast_days?: number;
  trend_description?: string;
  volatility?: string;
  top_markets?: Array<{ market: string; price: number; trend?: string }>;
  spoilage_analysis?: {
    risk_level: string;
    travel_time_hours: number;
    temperature_effect: string;
    recommendation: string;
  };
  explanation?: string;
  [key: string]: unknown;
}

// Keep one backend base URL so frontend/backend always use the same host.
export async function analyzeCrop(crop: string, location: string): Promise<AgriChainResult> {
  const res = await fetch(
    `${API_BASE}/agrichain?crop=${encodeURIComponent(crop)}&location=${encodeURIComponent(location)}`,
    { signal: AbortSignal.timeout(20000) }
  );
  if (!res.ok) throw new Error("API request failed");

  const payload = (await res.json()) as Partial<BackendAgriChainResponse>;
  const decision = payload.decision ?? {
    harvest_after_days: 0,
    sell_market: "Unknown Market",
    expected_price: 0,
    price_trend: "STABLE",
    price_range: { min: 0, max: 0 },
    spoilage_risk: "LOW",
    advice: "Proceed with standard handling.",
  };
  const priceIntelligence = payload.price_intelligence ?? {
    forecast_days: 7,
    trend_description: "Price trend unavailable.",
    volatility: "Medium",
    other_markets: [],
  };
  const spoilageAnalysis = payload.spoilage_analysis ?? {
    risk_level: decision.spoilage_risk ?? "LOW",
    travel_time_hours: 0,
    temperature_effect: "Temperature impact is manageable.",
    recommendation: "Use standard transport handling.",
  };

  return {
    crop,
    location,
    harvest_after_days: Number(decision.harvest_after_days ?? 0),
    sell_market: String(decision.sell_market ?? "Unknown Market"),
    expected_price: Number(decision.expected_price ?? 0),
    price_trend: String(decision.price_trend ?? "STABLE"),
    price_range_min: Number(decision.price_range?.min ?? 0),
    price_range_max: Number(decision.price_range?.max ?? 0),
    spoilage_risk: String(decision.spoilage_risk ?? "LOW"),
    advice: String(decision.advice ?? "Proceed with standard handling."),
    forecast_days: Number(priceIntelligence.forecast_days ?? 7),
    trend_description: String(priceIntelligence.trend_description ?? "Price trend unavailable."),
    volatility: String(priceIntelligence.volatility ?? "Medium"),
    top_markets: (priceIntelligence.other_markets ?? []).map((m) => ({
      market: String(m.market ?? "Unknown Market"),
      price: Number(m.avg_price ?? 0),
      trend: String(m.trend ?? "STABLE"),
    })),
    spoilage_analysis: {
      risk_level: String(spoilageAnalysis.risk_level ?? "LOW"),
      travel_time_hours: Number(spoilageAnalysis.travel_time_hours ?? 0),
      temperature_effect: String(spoilageAnalysis.temperature_effect ?? "Temperature impact is manageable."),
      recommendation: String(spoilageAnalysis.recommendation ?? "Use standard transport handling."),
    },
    explanation: String(payload.explanation ?? ""),
  };
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(5000) });
    return res.ok;
  } catch {
    return false;
  }
}
