import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  BookOpen, Shield, Users, Truck, Handshake, ChevronDown, ChevronRight,
  Lock, Settings, BarChart2, FileText, MapPin, MessageSquare, UserPlus,
  CheckCircle2, AlertTriangle, Key, Mail, Phone, Globe, Navigation,
  CreditCard, Building2, Fingerprint, Upload, Eye, Edit3, Trash2,
  PlusCircle, Link as LinkIcon, Download, Bell, LayoutDashboard, Car,
} from "lucide-react";

type Role = "admin" | "investidor" | "motorista" | "parceiro";

interface Section {
  title: string;
  icon: React.ElementType;
  content: React.ReactNode;
}

function AccordionItem({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between p-5 bg-card hover:bg-white/5 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <span className="font-bold text-white text-sm">{title}</span>
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-white/40" /> : <ChevronRight className="w-4 h-4 text-white/40" />}
      </button>
      {open && (
        <div className="px-5 pb-5 pt-2 bg-card/50 text-white/70 text-sm leading-relaxed space-y-2">
          {children}
        </div>
      )}
    </div>
  );
}

function Step({ n, text }: { n: number; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-6 h-6 rounded-full bg-primary text-black text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">{n}</span>
      <p>{text}</p>
    </div>
  );
}

function Tag({ label, color = "primary" }: { label: string; color?: string }) {
  const cls: Record<string, string> = {
    primary: "bg-primary/10 text-primary border-primary/20",
    green: "bg-green-400/10 text-green-400 border-green-400/20",
    red: "bg-red-400/10 text-red-400 border-red-400/20",
    yellow: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
    blue: "bg-blue-400/10 text-blue-400 border-blue-400/20",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${cls[color] ?? cls.primary}`}>
      {label}
    </span>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return <code className="bg-white/10 text-primary px-2 py-0.5 rounded text-xs font-mono">{children}</code>;
}

const ROLES: { id: Role; label: string; icon: React.ElementType; color: string; desc: string }[] = [
  { id: "admin",      label: "Administrador", icon: Shield,    color: "text-red-400",    desc: "Acesso total ao sistema — gerencia investidores, frota, contratos e blog." },
  { id: "investidor", label: "Investidor",    icon: BarChart2, color: "text-primary",    desc: "Acesso ao portal do investidor — visualiza dados financeiros, frota e assina contratos." },
  { id: "motorista",  label: "Motorista",     icon: Truck,     color: "text-blue-400",   desc: "Acesso pelo app do motorista — inicia viagens, envia localização GPS e compartilha link." },
  { id: "parceiro",   label: "Parceiro",      icon: Handshake, color: "text-green-400",  desc: "Cadastro público — aguarda aprovação para acessar benefícios parceiros." },
];

const adminSections: Section[] = [
  {
    title: "Acesso ao Painel Admin",
    icon: Lock,
    content: (
      <div className="space-y-3">
        <Step n={1} text={`Acesse ${window.location.origin}/admin no navegador.`} />
        <Step n={2} text="Digite a senha de administrador (variável de ambiente ADMIN_PASSWORD)." />
        <Step n={3} text="Clique em Entrar. O painel será liberado para esta sessão (armazenado em sessionStorage)." />
        <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl px-4 py-3 mt-2">
          <div className="flex items-center gap-2 text-yellow-400 font-bold mb-1"><AlertTriangle className="w-4 h-4" /> Atenção</div>
          <p className="text-yellow-400/80 text-xs">Para alterar a senha, atualize o segredo <Code>ADMIN_PASSWORD</Code> nas configurações de Secrets do Replit e reinicie o servidor.</p>
        </div>
      </div>
    ),
  },
  {
    title: "Gerenciar Candidatos Investidores",
    icon: UserPlus,
    content: (
      <div className="space-y-3">
        <p>Em <Code>/portal/candidatos</Code> você visualiza todos os pedidos de acesso ao portal do investidor.</p>
        <Step n={1} text="Abra o menu lateral → Candidatos Investidor." />
        <Step n={2} text="Revise os dados do candidato: nome, CPF, RG, endereço, status KYC." />
        <Step n={3} text="Clique em Aprovar para liberar o acesso completo ao portal, ou em Suspender para bloquear." />
        <div className="flex gap-2 flex-wrap mt-1">
          <Tag label="pending_kyc" color="yellow" />
          <Tag label="under_review" color="blue" />
          <Tag label="approved" color="green" />
          <Tag label="suspended" color="red" />
        </div>
      </div>
    ),
  },
  {
    title: "Gerenciar Blog (Soro IA + Manual)",
    icon: Edit3,
    content: (
      <div className="space-y-3">
        <p>Em <Code>/portal/blog</Code> você cria, edita e publica posts no blog.</p>
        <Step n={1} text="Clique em Novo Post para criar manualmente." />
        <Step n={2} text="Preencha título, resumo, conteúdo HTML, categoria e imagem de capa." />
        <Step n={3} text="Toggle Publicado para ativar ou ocultar o post." />
        <p className="text-white/50 text-xs">O agente Soro IA publica automaticamente às 08:00 BRT todos os dias com SEO otimizado para rotas VaideVan.</p>
      </div>
    ),
  },
  {
    title: "Gerenciar Contratos e Modelos",
    icon: FileText,
    content: (
      <div className="space-y-3">
        <p><strong className="text-white">Modelos:</strong> Em <Code>/portal/modelos</Code> você edita os modelos de contrato com variáveis <Code>{"{{nome}}"}</Code>, <Code>{"{{cpf}}"}</Code> etc.</p>
        <p><strong className="text-white">Contratos:</strong> Em <Code>/portal/contratos</Code> você cria contratos vinculando um investidor + cliente + modelo. O sistema preenche as variáveis automaticamente.</p>
        <Step n={1} text="Selecione o modelo CCB ou de locação." />
        <Step n={2} text="Vincule ao investidor e ao cliente correspondente." />
        <Step n={3} text="Clique em Gerar Contrato — um PDF será gerado e enviado para assinatura via Gov.br." />
      </div>
    ),
  },
  {
    title: "Rastreamento GPS de Motoristas",
    icon: Navigation,
    content: (
      <div className="space-y-3">
        <p>Em <Code>/portal/rastreamento</Code> você acompanha a localização de todos os motoristas em tempo real.</p>
        <Step n={1} text="O mapa mostra a posição de cada motorista com pings a cada 30 segundos." />
        <Step n={2} text="Clique em um pin para ver detalhes: motorista, placa, velocidade, precisão do GPS." />
        <Step n={3} text="Para cadastrar um motorista: clique em Novo Motorista, informe nome, telefone e PIN." />
        <p className="text-white/50 text-xs">O PIN é usado pelo motorista para entrar no app <Code>/motorista</Code> — nunca compartilhe com terceiros.</p>
      </div>
    ),
  },
  {
    title: "Gerenciar Frota e Catálogo",
    icon: Car,
    content: (
      <div className="space-y-3">
        <p><strong className="text-white">Frota operacional:</strong> <Code>/portal/admin-veiculos</Code> — placa, modelo, ano, status (disponível/em viagem/manutenção), URL do rastreador físico.</p>
        <p><strong className="text-white">Catálogo de vendas:</strong> <Code>/portal/catalogo</Code> — veículos à venda com fotos, preço, descrição e status de disponibilidade.</p>
        <Step n={1} text="Clique em Adicionar Veículo e preencha os dados." />
        <Step n={2} text="Para rastreador físico, cole a URL do painel GPS (Cobli, Samsara etc.) no campo URL Rastreador." />
      </div>
    ),
  },
  {
    title: "Gestão Financeira",
    icon: CreditCard,
    content: (
      <div className="space-y-3">
        <p>Em <Code>/portal/financeiro</Code> você visualiza receitas, despesas e resultado por período e categoria.</p>
        <Step n={1} text="Para lançar uma entrada ou saída, acesse Financeiro → Novo Lançamento." />
        <Step n={2} text="Informe: tipo (receita/despesa), categoria, valor, data e operação associada." />
        <Step n={3} text="Os gráficos atualizam automaticamente a cada 30 segundos ou ao clicar no botão de refresh." />
      </div>
    ),
  },
  {
    title: "Gerenciar Reservas",
    icon: Building2,
    content: (
      <div className="space-y-3">
        <p>Em <Code>/portal/reservas</Code> você vê todos os pedidos de orçamento e reservas recebidos pelo site.</p>
        <Step n={1} text="Filtre por status: pendente, confirmada, cancelada, concluída." />
        <Step n={2} text="Clique em uma reserva para ver detalhes: rota, data/hora, passageiros, observações." />
        <Step n={3} text="Altere o status e adicione notas internas para controle." />
        <p className="text-white/50 text-xs">Reservas com pagamento via Stripe ou MercadoPago têm status de pagamento atualizado automaticamente via webhook.</p>
      </div>
    ),
  },
  {
    title: "Formulário de Contato e E-mails",
    icon: Mail,
    content: (
      <div className="space-y-3">
        <p>Todos os formulários do site enviam os dados diretamente para <strong className="text-white">contato@vaidevan.com</strong>.</p>
        <p>Para configurar o SMTP (necessário para envio real):</p>
        <Step n={1} text="Adicione os secrets SMTP_HOST, SMTP_PORT, SMTP_USER e SMTP_PASS no Replit." />
        <Step n={2} text="Reinicie o servidor API após adicionar os secrets." />
        <Step n={3} text="Teste o formulário de contato na home page para confirmar o recebimento." />
        <div className="bg-blue-400/10 border border-blue-400/20 rounded-xl px-4 py-3">
          <p className="text-blue-400/90 text-xs">Se não há secrets SMTP configurados, os leads são salvos no banco de dados em <Code>contact_leads</Code> e podem ser visualizados via consulta SQL.</p>
        </div>
      </div>
    ),
  },
  {
    title: "Variáveis de Ambiente e Secrets",
    icon: Key,
    content: (
      <div className="space-y-3">
        <p>Acesse a aba <strong className="text-white">Secrets</strong> no Replit (ícone de cadeado no painel lateral) para gerenciar:</p>
        <div className="grid gap-2">
          {[
            { key: "ADMIN_PASSWORD",    desc: "Senha do painel /admin" },
            { key: "SESSION_SECRET",     desc: "Chave JWT (mude para produção)" },
            { key: "SMTP_HOST",          desc: "Host do servidor de e-mail" },
            { key: "SMTP_PORT",          desc: "Porta SMTP (geralmente 587 ou 465)" },
            { key: "SMTP_USER",          desc: "Usuário SMTP (e-mail remetente)" },
            { key: "SMTP_PASS",          desc: "Senha SMTP" },
            { key: "VITE_GOOGLE_MAPS_API_KEY", desc: "Google Maps API Key (para rotas reais)" },
          ].map(({ key, desc }) => (
            <div key={key} className="flex items-start gap-3">
              <Code>{key}</Code>
              <span className="text-white/50 text-xs mt-0.5">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: "Deploy para Napoleon Host (cPanel)",
    icon: Globe,
    content: (
      <div className="space-y-3">
        <Step n={1} text="No Replit Shell, execute: cd artifacts/vaidevan && BASE_PATH='/' PORT=3000 pnpm run build" />
        <Step n={2} text="O arquivo vaidevan-napoleon-deploy.zip será gerado na raiz do workspace." />
        <Step n={3} text="No cPanel, extraia o ZIP em public_html/." />
        <Step n={4} text="Certifique-se de que o .htaccess está configurado para React Router SPA (redirecionamento para index.html)." />
        <p className="text-white/50 text-xs">O build inclui todas as imagens de van, fontes locais e o manifest.json. O sitemap e robots.txt também são copiados automaticamente.</p>
      </div>
    ),
  },
];

const investorSections: Section[] = [
  {
    title: "Como acessar o Portal",
    icon: Lock,
    content: (
      <div className="space-y-3">
        <Step n={1} text={`Acesse ${window.location.origin}/portal`} />
        <Step n={2} text="Entre com seu e-mail e senha cadastrados, ou use biometria (Face ID / digital) se já configurou." />
        <Step n={3} text="Após o login, você será redirecionado ao Dashboard com o resumo das suas operações." />
        <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl px-4 py-3">
          <p className="text-yellow-400/80 text-xs"><AlertTriangle className="inline w-3 h-3 mr-1" />Se a conta estiver pendente de aprovação, você verá a tela de espera até o administrador liberar seu acesso.</p>
        </div>
      </div>
    ),
  },
  {
    title: "Dashboard — Visão Geral",
    icon: LayoutDashboard,
    content: (
      <div className="space-y-3">
        <p>O Dashboard exibe em tempo real:</p>
        <ul className="space-y-1.5 pl-2">
          {[
            "Operações ativas e veículos em frota",
            "Contratos ativos e pendentes de assinatura",
            "Resultado líquido (receitas − despesas)",
            "Gráfico de evolução mensal dos últimos 6 meses",
          ].map(item => (
            <li key={item} className="flex items-start gap-2"><CheckCircle2 className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />{item}</li>
          ))}
        </ul>
        <p className="text-white/50 text-xs">Os dados atualizam automaticamente a cada 30 segundos. Você também pode clicar no botão de refresh manual no canto superior direito.</p>
      </div>
    ),
  },
  {
    title: "Configurar Biometria (Face ID / Digital)",
    icon: Fingerprint,
    content: (
      <div className="space-y-3">
        <Step n={1} text="Acesse Portal → Meu Perfil." />
        <Step n={2} text="Role até a seção Dispositivos Biométricos." />
        <Step n={3} text="Clique em Cadastrar Novo Dispositivo." />
        <Step n={4} text="Siga as instruções do navegador para registrar Face ID, digital ou Windows Hello." />
        <p className="text-white/50 text-xs">Você pode cadastrar múltiplos dispositivos (celular + computador). Para remover, clique no ícone de lixeira ao lado do dispositivo.</p>
      </div>
    ),
  },
  {
    title: "Simulador de Investimento",
    icon: BarChart2,
    content: (
      <div className="space-y-3">
        <p>Em <Code>/portal/simulador</Code> você simula o retorno de diferentes modalidades de investimento.</p>
        <Step n={1} text="Selecione a modalidade (Cota Ativa, Cota Passiva, Franquia etc.)." />
        <Step n={2} text="Informe o valor do investimento e o prazo em meses." />
        <Step n={3} text="Veja o gráfico com 3 cenários: conservador, moderado e otimista." />
        <Step n={4} text="Clique em Salvar Simulação para registrar no histórico." />
      </div>
    ),
  },
  {
    title: "Contratos — Assinatura Digital",
    icon: FileText,
    content: (
      <div className="space-y-3">
        <p>Em <Code>/portal/contratos</Code> você visualiza e assina contratos de locação via Gov.br.</p>
        <Step n={1} text="Contratos com status Aguardando assinatura requerem sua ação." />
        <Step n={2} text="Clique em Ver Contrato para abrir o PDF." />
        <Step n={3} text="Clique em Assinar via Gov.br para ser redirecionado ao portal de assinatura digital." />
        <p className="text-white/50 text-xs">Contratos assinados ficam arquivados e podem ser baixados a qualquer momento.</p>
      </div>
    ),
  },
  {
    title: "Rastreamento de Veículos",
    icon: MapPin,
    content: (
      <div className="space-y-3">
        <p>Em <Code>/portal/rastreamento</Code> você acompanha a frota em tempo real no mapa.</p>
        <p>Cada pin representa um motorista ativo. Clique para ver:</p>
        <ul className="space-y-1 pl-2">
          {["Nome do motorista", "Placa e modelo do veículo", "Velocidade e precisão GPS", "Link para rastreador físico (se disponível)"].map(i => (
            <li key={i} className="flex items-start gap-2"><ChevronRight className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />{i}</li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    title: "Verificação KYC (documentos)",
    icon: Upload,
    content: (
      <div className="space-y-3">
        <p>Em <Code>/portal/perfil</Code> você completa a verificação de identidade (KYC):</p>
        <Step n={1} text="Faça upload da sua CNH (frente e verso em boa resolução)." />
        <Step n={2} text="Faça upload de um comprovante de residência recente (últimos 3 meses)." />
        <Step n={3} text="Complete a verificação facial via Gov.br." />
        <div className="flex gap-2 flex-wrap mt-1">
          <Tag label="Pendente" color="yellow" />
          <Tag label="Em análise" color="blue" />
          <Tag label="Aprovado" color="green" />
          <Tag label="Rejeitado" color="red" />
        </div>
        <p className="text-white/50 text-xs">O processo leva até 2 dias úteis. Você receberá uma notificação por e-mail ao ser aprovado.</p>
      </div>
    ),
  },
];

const driverSections: Section[] = [
  {
    title: "Como usar o App do Motorista",
    icon: Truck,
    content: (
      <div className="space-y-3">
        <Step n={1} text={`Acesse ${window.location.origin}/motorista no celular.`} />
        <Step n={2} text="Digite seu telefone e PIN fornecidos pelo administrador." />
        <Step n={3} text="Clique em Entrar. Você verá a tela de status da viagem." />
        <div className="bg-blue-400/10 border border-blue-400/20 rounded-xl px-4 py-3">
          <p className="text-blue-400/80 text-xs">O app funciona em qualquer navegador mobile. Adicione à tela inicial para acesso rápido.</p>
        </div>
      </div>
    ),
  },
  {
    title: "Iniciar e Encerrar Viagem",
    icon: Navigation,
    content: (
      <div className="space-y-3">
        <Step n={1} text="Na tela principal, informe a placa do veículo que está usando." />
        <Step n={2} text="Clique em Iniciar Viagem. O sistema começa a registrar sua localização GPS a cada 30 segundos." />
        <Step n={3} text="Ao chegar ao destino, clique em Encerrar Viagem." />
        <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl px-4 py-3">
          <p className="text-yellow-400/80 text-xs"><AlertTriangle className="inline w-3 h-3 mr-1" />Mantenha a tela aberta durante a viagem para o GPS funcionar corretamente. Não feche o navegador.</p>
        </div>
      </div>
    ),
  },
  {
    title: "Compartilhar Localização via WhatsApp",
    icon: MessageSquare,
    content: (
      <div className="space-y-3">
        <p>Durante uma viagem ativa, toque em <strong className="text-white">Compartilhar Localização</strong>.</p>
        <Step n={1} text="O app abre o WhatsApp com uma mensagem pronta contendo o link de rastreamento ao vivo." />
        <Step n={2} text="Envie para o passageiro ou gestor para que eles acompanhem em tempo real." />
        <p className="text-white/50 text-xs">O link expira quando a viagem é encerrada.</p>
      </div>
    ),
  },
  {
    title: "Rastreador Físico do Veículo",
    icon: MapPin,
    content: (
      <div className="space-y-3">
        <p>Se o veículo tem um rastreador físico (Cobli, Samsara, etc.), você pode abrir o painel diretamente do app.</p>
        <Step n={1} text="Na tela de viagem, toque no botão de GPS externo (ícone de satélite)." />
        <Step n={2} text="O painel do rastreador físico abre em uma nova aba." />
        <p className="text-white/50 text-xs">Se o botão não aparecer, o veículo não tem rastreador físico cadastrado. Fale com o administrador.</p>
      </div>
    ),
  },
];

const partnerSections: Section[] = [
  {
    title: "Como se tornar Parceiro VaideVan",
    icon: Handshake,
    content: (
      <div className="space-y-3">
        <Step n={1} text={`Acesse ${window.location.origin} e role até a seção 'Seja nosso parceiro'.`} />
        <Step n={2} text="Preencha o formulário com nome, e-mail, telefone, tipo de parceria e mensagem." />
        <Step n={3} text="Clique em Enviar. Você receberá um e-mail de confirmação." />
        <Step n={4} text="A equipe VaideVan analisará sua proposta e entrará em contato em até 3 dias úteis." />
        <div className="flex gap-2 flex-wrap mt-1">
          <Tag label="Investidor" color="primary" />
          <Tag label="Corporativo" color="blue" />
          <Tag label="Revendedor" color="green" />
          <Tag label="Motorista" color="yellow" />
        </div>
      </div>
    ),
  },
  {
    title: "Acompanhar status do cadastro",
    icon: Eye,
    content: (
      <div className="space-y-3">
        <p>Após o cadastro, o administrador pode aprovar, colocar em análise ou recusar sua solicitação.</p>
        <p>Você será notificado por e-mail quando houver atualização no status do seu cadastro.</p>
        <div className="flex gap-2 flex-wrap mt-1">
          <Tag label="Pendente" color="yellow" />
          <Tag label="Em análise" color="blue" />
          <Tag label="Aprovado" color="green" />
          <Tag label="Recusado" color="red" />
        </div>
      </div>
    ),
  },
  {
    title: "Contatos e Suporte",
    icon: Phone,
    content: (
      <div className="space-y-3">
        <div className="grid gap-3">
          {[
            { icon: Phone,   label: "WhatsApp",  value: "+55 (11) 99929-4694" },
            { icon: Mail,    label: "E-mail",    value: "contato@vaidevan.com" },
            { icon: Globe,   label: "Site",      value: "vaidevan.com" },
            { icon: MapPin,  label: "Cobertura", value: "12 estados — 49+ cidades" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-white/50" />
              </div>
              <div>
                <p className="text-white/40 text-xs">{label}</p>
                <p className="text-white font-semibold text-sm">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export default function Tutorial() {
  const [activeRole, setActiveRole] = useState<Role>("admin");

  const sectionsMap: Record<Role, Section[]> = {
    admin:      adminSections,
    investidor: investorSections,
    motorista:  driverSections,
    parceiro:   partnerSections,
  };

  const activeRoleMeta = ROLES.find(r => r.id === activeRole)!;
  const sections = sectionsMap[activeRole];

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-black text-white">Tutorial do Sistema</h1>
              <p className="text-white/50 text-sm">Guia completo para cada perfil de usuário VaideVan</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {ROLES.map(role => (
            <button
              key={role.id}
              onClick={() => setActiveRole(role.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all text-center ${
                activeRole === role.id
                  ? "border-primary bg-primary/10"
                  : "border-white/10 bg-card hover:border-white/20 hover:bg-white/5"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeRole === role.id ? "bg-primary/20" : "bg-white/5"}`}>
                <role.icon className={`w-5 h-5 ${activeRole === role.id ? "text-primary" : "text-white/50"}`} />
              </div>
              <span className={`font-black text-sm ${activeRole === role.id ? "text-primary" : "text-white/70"}`}>
                {role.label}
              </span>
            </button>
          ))}
        </div>

        <div className="bg-card border border-white/10 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-3">
            <activeRoleMeta.icon className={`w-5 h-5 ${activeRoleMeta.color}`} />
            <div>
              <h2 className="font-black text-white">{activeRoleMeta.label}</h2>
              <p className="text-white/50 text-sm">{activeRoleMeta.desc}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {sections.map(section => (
            <AccordionItem key={section.title} title={section.title} icon={section.icon}>
              {section.content}
            </AccordionItem>
          ))}
        </div>

        <div className="mt-8 p-5 rounded-2xl border border-white/10 bg-card text-center">
          <p className="text-white/40 text-sm">VaideVan — Transporte Executivo Premium · 20+ anos · 12 estados · 49+ cidades</p>
          <p className="text-white/20 text-xs mt-1">Para suporte técnico: <span className="text-primary/60">contato@vaidevan.com</span></p>
        </div>
      </div>
    </DashboardLayout>
  );
}
