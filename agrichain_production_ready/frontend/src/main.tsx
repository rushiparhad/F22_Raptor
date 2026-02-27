import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import App from "./App.tsx";
import "./index.css";
import "./i18n"; // initialize internationalization
import "driver.js/dist/driver.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="light" storageKey="agrichain-theme">
    <App />
  </ThemeProvider>
);
