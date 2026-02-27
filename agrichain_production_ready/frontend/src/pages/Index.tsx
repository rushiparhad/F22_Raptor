import AgriDashboard from "@/components/AgriDashboard";
import AppErrorBoundary from "@/components/AppErrorBoundary";
import { useAgriChain, useHealthCheck } from "@/hooks/useAgriChain";

interface IndexProps {
  language: string;
  setLanguage: (language: string) => void;
}

const Index = ({ language, setLanguage }: IndexProps) => {
  const { healthy, recheck } = useHealthCheck();
  const { result, loading, error, analyze, reset } = useAgriChain();

  return (
    <AppErrorBoundary
      fallbackTitle="Dashboard render failed."
      fallbackMessage="A runtime error occurred. Please share the detail shown here."
    >
      <AgriDashboard
        language={language}
        setLanguage={setLanguage}
        healthy={healthy}
        onRecheck={recheck}
        result={result}
        loading={loading}
        error={error}
        onAnalyze={analyze}
        onReset={reset}
      />
    </AppErrorBoundary>
  );
};

export default Index;
