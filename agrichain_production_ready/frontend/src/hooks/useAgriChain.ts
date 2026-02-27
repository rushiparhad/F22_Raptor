import { useState, useEffect, useCallback } from "react";
import { analyzeCrop, checkHealth, type AgriChainResult } from "@/lib/api";

export function useHealthCheck() {
  const [healthy, setHealthy] = useState<boolean | null>(null);

  const check = useCallback(async () => {
    setHealthy(null);
    const ok = await checkHealth();
    setHealthy(ok);
  }, []);

  useEffect(() => {
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [check]);

  return { healthy, recheck: check };
}

export function useAgriChain() {
  const [result, setResult] = useState<AgriChainResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (crop: string, location: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeCrop(crop, location);
      setResult(data);
    } catch (err) {
      const message = err instanceof Error ? err.message.toLowerCase() : "";
      if (message.includes("timeout") || message.includes("aborted")) {
        setError("Request timed out. Please try again.");
      } else {
        setError("Backend not connected. Please start server.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, loading, error, analyze, reset };
}
