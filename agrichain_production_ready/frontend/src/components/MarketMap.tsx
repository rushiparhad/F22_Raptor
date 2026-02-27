import { useMemo } from "react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import L from "leaflet";
import { Circle, MapContainer, Marker, Polygon, Polyline, Popup, TileLayer } from "react-leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";

type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

interface MarketMapMarket {
  market: string;
  price: number;
  travelTime: number;
  spoilageRisk: RiskLevel;
  expectedRevenue: number;
}

interface MarketMapProps {
  location: string;
  markets: MarketMapMarket[];
  bestMarket: string;
  selectedMarket?: string;
  onMarketSelect: (marketName: string) => void;
}

interface PositionedMarket extends MarketMapMarket {
  lat: number;
  lon: number;
}

const LOCATION_COORDS: Record<string, [number, number]> = {
  pune: [18.5204, 73.8567],
  nashik: [19.9975, 73.7898],
  nagpur: [21.1458, 79.0882],
  aurangabad: [19.8762, 75.3433],
  mumbai: [19.076, 72.8777],
  solapur: [17.6599, 75.9064],
  satara: [17.6805, 74.0183],
  ahmednagar: [19.0946, 74.7384],
  sangli: [16.8524, 74.5815],
  jalgaon: [21.0077, 75.5626],
  kolhapur: [16.705, 74.2433],
};

const MARKET_COORDS: Record<string, [number, number]> = {
  manchar: [19.0045, 73.9439],
  kamthi: [21.2237, 79.1912],
  manjri: [18.4889, 73.9789],
  pimpri: [18.6298, 73.7997],
  moshi: [18.673, 73.8403],
  narayangaon: [19.0952, 73.9233],
  junnar: [19.2088, 73.8746],
  lasalgaon: [20.1423, 74.2398],
  kalwan: [20.5003, 74.0265],
  satana: [20.5925, 74.2031],
  yeola: [20.0428, 74.4894],
  malegaon: [20.5537, 74.5287],
  pimplagaon: [20.1511, 73.9446],
  umred: [20.8539, 79.3247],
  hingna: [21.0947, 78.9747],
};

const MAHARASHTRA_POLY: [number, number][] = [
  [21.8, 72.7],
  [21.2, 75.5],
  [20.5, 79.8],
  [18.9, 80.8],
  [16.4, 80.4],
  [15.9, 74.8],
  [17.7, 73.0],
  [20.0, 72.8],
];

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const fallbackCenter: [number, number] = [19.7515, 75.7139];

const normalize = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, " ");

const findCoord = (
  text: string,
  source: Record<string, [number, number]>
): [number, number] | null => {
  const normalized = normalize(text);
  for (const [key, coords] of Object.entries(source)) {
    if (normalized.includes(key)) return coords;
  }
  return null;
};

const toRadians = (value: number) => (value * Math.PI) / 180;

const distanceInKm = (from: [number, number], to: [number, number]) => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(to[0] - from[0]);
  const dLon = toRadians(to[1] - from[1]);
  const lat1 = toRadians(from[0]);
  const lat2 = toRadians(to[0]);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

const MarketMap = ({ location, markets, bestMarket, selectedMarket, onMarketSelect }: MarketMapProps) => {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();

  const farmerCoords = useMemo(
    () => findCoord(location, LOCATION_COORDS) ?? fallbackCenter,
    [location]
  );

  const marketCoords = useMemo<PositionedMarket[]>(() => {
    return markets.map((market, index) => {
      const direct =
        findCoord(market.market, MARKET_COORDS) ??
        findCoord(market.market, LOCATION_COORDS);
      const fallback: [number, number] = [
        farmerCoords[0] + ((index % 2 === 0 ? 1 : -1) * (0.14 + index * 0.03)),
        farmerCoords[1] + ((index % 3 === 0 ? 1 : -1) * (0.18 + index * 0.04)),
      ];
      const [lat, lon] = direct ?? fallback;
      return {
        ...market,
        lat,
        lon,
      };
    });
  }, [farmerCoords, markets]);

  const tileUrl =
    resolvedTheme === "dark"
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const attribution =
    resolvedTheme === "dark"
      ? '&copy; <a href="https://carto.com/attributions">CARTO</a>'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

  const selectedTarget =
    marketCoords.find((m) => m.market === selectedMarket) ??
    marketCoords.find((m) => m.market === bestMarket) ??
    marketCoords[0];

  const routePoints: [number, number][] = selectedTarget
    ? [farmerCoords, [selectedTarget.lat, selectedTarget.lon]]
    : [];

  const activeDistanceKm = selectedTarget
    ? distanceInKm(farmerCoords, [selectedTarget.lat, selectedTarget.lon])
    : 0;

  return (
    <div className="h-[22rem] w-full overflow-hidden rounded-2xl border border-border/60">
      <MapContainer center={farmerCoords} zoom={7} scrollWheelZoom className="h-full w-full">
        <TileLayer attribution={attribution} url={tileUrl} />
        <Polygon positions={MAHARASHTRA_POLY} pathOptions={{ color: "#22c55e", fillOpacity: 0.08, weight: 2 }} />
        <Circle center={farmerCoords} radius={22000} pathOptions={{ color: "#14b8a6", fillOpacity: 0.2 }} />

        <Marker position={farmerCoords}>
          <Popup>
            <div className="space-y-1">
              <p className="font-semibold">{t("farmerLocation")}</p>
              <p>{location}</p>
              {selectedTarget ? (
                <p className="text-xs text-muted-foreground">
                  Route to {selectedTarget.market}: {activeDistanceKm.toFixed(1)} km
                </p>
              ) : null}
            </div>
          </Popup>
        </Marker>

        {routePoints.length === 2 ? (
          <Polyline
            positions={routePoints}
            pathOptions={{ color: "#2563eb", weight: 4, opacity: 0.85, dashArray: "8 8" }}
          />
        ) : null}

        {marketCoords.map((market) => {
          const isBest = market.market === bestMarket;
          const isSelected = selectedMarket === market.market;
          const marketDistance = distanceInKm(farmerCoords, [market.lat, market.lon]);

          return (
            <Marker
              key={`${market.market}-${market.lat}-${market.lon}`}
              position={[market.lat, market.lon]}
              eventHandlers={{ click: () => onMarketSelect(market.market) }}
            >
              <Popup>
                <div className="min-w-[220px] space-y-1 text-sm">
                  <p className="font-semibold">{market.market}</p>
                  {isSelected && (
                    <p className="inline-flex rounded-full bg-sky-500/15 px-2 py-0.5 text-xs font-semibold text-sky-700">
                      {t("selectedMarket")}
                    </p>
                  )}
                  {isBest && (
                    <p className="inline-flex rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                      {t("bestMandi")}
                    </p>
                  )}
                  <p>{t("priceForecast")}: Rs. {market.price.toFixed(2)}</p>
                  <p>Distance: {marketDistance.toFixed(1)} km</p>
                  <p>{t("travelTimeHours")}: {market.travelTime.toFixed(1)}h</p>
                  <p>{t("spoilageRisk")}: {market.spoilageRisk}</p>
                  <p>{t("expectedRevenue")}: Rs. {market.expectedRevenue.toFixed(2)}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MarketMap;
