import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const Blog = lazy(() => import("@/pages/Blog"));
const BlogPost = lazy(() => import("@/pages/BlogPost"));
const Privacidade = lazy(() => import("@/pages/Privacidade"));
const Termos = lazy(() => import("@/pages/Termos"));
const Login = lazy(() => import("@/pages/portal/Login"));
const Dashboard = lazy(() => import("@/pages/portal/Dashboard"));
const Financeiro = lazy(() => import("@/pages/portal/Financeiro"));
const Veiculos = lazy(() => import("@/pages/portal/Veiculos"));
const Contratos = lazy(() => import("@/pages/portal/Contratos"));
const Propostas = lazy(() => import("@/pages/portal/Propostas"));
const Simulador = lazy(() => import("@/pages/portal/Simulador"));
const BlogAdmin = lazy(() => import("@/pages/portal/BlogAdmin"));
const Clientes = lazy(() => import("@/pages/portal/Clientes"));
const ModelosContrato = lazy(() => import("@/pages/portal/ModelosContrato"));
const Perfil = lazy(() => import("@/pages/portal/Perfil"));
const Parceiros = lazy(() => import("@/pages/portal/Parceiros"));
const CandidatosInvestidores = lazy(() => import("@/pages/portal/CandidatosInvestidores"));
const CatalogoVeiculos = lazy(() => import("@/pages/portal/CatalogoVeiculos"));
const AdminVeiculos = lazy(() => import("@/pages/portal/AdminVeiculos"));
const AdminRastreamento = lazy(() => import("@/pages/portal/AdminRastreamento"));
const Documentos = lazy(() => import("@/pages/portal/Documentos"));
const Reservas = lazy(() => import("@/pages/portal/Reservas"));
const Motorista = lazy(() => import("@/pages/Motorista"));
const Reserva = lazy(() => import("@/pages/Reserva"));
const Pagamento = lazy(() => import("@/pages/Pagamento"));
const PagamentoSucesso = lazy(() => import("@/pages/PagamentoSucesso"));
const FretamentoCorporativo = lazy(() => import("@/pages/services/FretamentoCorporativo"));
const TransferAeroporto = lazy(() => import("@/pages/services/TransferAeroporto"));
const VanEventos = lazy(() => import("@/pages/services/VanEventos"));
const Excursoes = lazy(() => import("@/pages/services/Excursoes"));
const TransporteExecutivo = lazy(() => import("@/pages/services/TransporteExecutivo"));
const CompraVenda = lazy(() => import("@/pages/CompraVenda"));
const Customizacao = lazy(() => import("@/pages/Customizacao"));
const Frota = lazy(() => import("@/pages/Frota"));
const Escolta = lazy(() => import("@/pages/Escolta"));
const NotFound = lazy(() => import("@/pages/not-found"));
const AppScreenshots = lazy(() => import("@/pages/AppScreenshots"));
const Splash = lazy(() => import("@/pages/Splash"));
const AdminPanel = lazy(() => import("@/pages/AdminPanel"));
const PacoteDownload = lazy(() => import("@/pages/PacoteDownload"));
const Tutorial = lazy(() => import("@/pages/portal/Tutorial"));
const AguardandoAprovacao = lazy(() => import("@/pages/portal/AguardandoAprovacao"));
const Juridico = lazy(() => import("@/pages/portal/Juridico"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function NonHomeRoutes() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Suspense fallback={<PageLoader />}>
          <Switch>
            {/* Blog */}
            <Route path="/blog" component={Blog} />
            <Route path="/blog/:slug" component={BlogPost} />

            {/* Páginas de serviço */}
            <Route path="/fretamento-corporativo" component={FretamentoCorporativo} />
            <Route path="/transfer-aeroporto" component={TransferAeroporto} />
            <Route path="/van-para-eventos" component={VanEventos} />
            <Route path="/excursoes" component={Excursoes} />
            <Route path="/transporte-executivo" component={TransporteExecutivo} />
            <Route path="/compra-venda" component={CompraVenda} />
            <Route path="/customizacao" component={Customizacao} />
            <Route path="/frota" component={Frota} />
            <Route path="/escolta" component={Escolta} />

            {/* Reservas */}
            <Route path="/reserva" component={Reserva} />
            <Route path="/reserva/:id/pagar" component={Pagamento} />
            <Route path="/reserva/:id/sucesso" component={PagamentoSucesso} />

            {/* Legais */}
            <Route path="/privacidade" component={Privacidade} />
            <Route path="/termos" component={Termos} />

            {/* Portal do Investidor */}
            <Route path="/portal" component={Login} />
            <Route path="/portal/aguardando" component={AguardandoAprovacao} />
            <Route path="/portal/dashboard">
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            </Route>
            <Route path="/portal/financeiro">
              <ProtectedRoute><Financeiro /></ProtectedRoute>
            </Route>
            <Route path="/portal/veiculos">
              <ProtectedRoute><Veiculos /></ProtectedRoute>
            </Route>
            <Route path="/portal/contratos">
              <ProtectedRoute><Contratos /></ProtectedRoute>
            </Route>
            <Route path="/portal/propostas">
              <ProtectedRoute><Propostas /></ProtectedRoute>
            </Route>
            <Route path="/portal/simulador">
              <ProtectedRoute><Simulador /></ProtectedRoute>
            </Route>
            <Route path="/portal/blog">
              <ProtectedRoute><BlogAdmin /></ProtectedRoute>
            </Route>
            <Route path="/portal/clientes">
              <ProtectedRoute><Clientes /></ProtectedRoute>
            </Route>
            <Route path="/portal/modelos">
              <ProtectedRoute><ModelosContrato /></ProtectedRoute>
            </Route>
            <Route path="/portal/perfil">
              <ProtectedRoute><Perfil /></ProtectedRoute>
            </Route>
            <Route path="/portal/parceiros">
              <ProtectedRoute><Parceiros /></ProtectedRoute>
            </Route>
            <Route path="/portal/candidatos">
              <ProtectedRoute><CandidatosInvestidores /></ProtectedRoute>
            </Route>
            <Route path="/portal/catalogo">
              <ProtectedRoute><CatalogoVeiculos /></ProtectedRoute>
            </Route>
            <Route path="/portal/admin-veiculos">
              <ProtectedRoute><AdminVeiculos /></ProtectedRoute>
            </Route>
            <Route path="/portal/rastreamento">
              <ProtectedRoute><AdminRastreamento /></ProtectedRoute>
            </Route>
            <Route path="/portal/documentos">
              <ProtectedRoute><Documentos /></ProtectedRoute>
            </Route>
            <Route path="/portal/reservas">
              <ProtectedRoute><Reservas /></ProtectedRoute>
            </Route>
            <Route path="/portal/tutorial">
              <ProtectedRoute><Tutorial /></ProtectedRoute>
            </Route>
            <Route path="/portal/juridico">
              <ProtectedRoute><Juridico /></ProtectedRoute>
            </Route>

            {/* Documentação de App Store Screenshots */}
            <Route path="/app-screenshots" component={AppScreenshots} />
            <Route path="/splash" component={Splash} />

            {/* Painel Admin — acesso por senha separada, sem precisar de investidor aprovado */}
            <Route path="/admin" component={AdminPanel} />

            {/* Download do pacote de deploy */}
            <Route path="/pacote" component={PacoteDownload} />

            {/* Portal do Motorista — acesso público por PIN */}
            <Route path="/motorista" component={Motorista} />

            <Route component={NotFound} />
          </Switch>
        </Suspense>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
