import { lazy, Suspense, useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/context/AuthContext";
import PwaInstallBanner from "@/components/PwaInstallBanner";
import LgpdBanner from "@/components/LgpdBanner";
import FeedbackButton from "@/components/FeedbackButton";

// Critical path — carregado imediatamente
import Home from "@/pages/Home";

// Todas as outras rotas (com QueryClient + TooltipProvider + Toaster) — lazy
const NonHomeRoutes = lazy(() => import("./NonHomeRoutes"));

const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

function Router() {
  return (
    <Switch>
      {/* Rota home — carrega sem nenhum provider pesado */}
      <Route path="/" component={Home} />

      {/* Todas as demais rotas — lazy com QueryClient + TooltipProvider */}
      <Route>
        <Suspense fallback={<PageLoader />}>
          <NonHomeRoutes />
        </Suspense>
      </Route>
    </Switch>
  );
}

function App() {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if ((e.target as HTMLElement).tagName === "IMG") e.preventDefault();
    };
    document.addEventListener("contextmenu", handler);
    return () => document.removeEventListener("contextmenu", handler);
  }, []);

  return (
    <HelmetProvider>
      <AuthProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <PwaInstallBanner />
        <LgpdBanner />
        <FeedbackButton />
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
