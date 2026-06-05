import { Link } from "wouter";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export default function Privacidade() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" aria-label="VaideVan - Início">
            <img src="/logo-black-sm.webp" alt="VaideVan" className="h-12 w-auto object-contain cursor-pointer" width="48" height="48" />
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-semibold hover:text-primary transition-colors">Início</Link>
            <Link href="/blog" className="text-sm font-semibold hover:text-primary transition-colors">Blog</Link>
          </nav>
        </div>
      </header>

      <main className="pt-32 pb-24 px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-4xl font-black mb-2">Política de Privacidade</h1>
          <p className="text-white/40 text-sm mb-10">Última atualização: abril de 2025</p>

          <div className="prose prose-invert max-w-none space-y-8 text-white/80 leading-relaxed">

            <section>
              <h2 className="text-xl font-black text-white mb-3">1. Quem somos</h2>
              <p>A <strong>VaideVan Transporte Executivo Ltda.</strong>, CNPJ XX.XXX.XXX/0001-XX, com sede em São Paulo/SP, é responsável pelo aplicativo e site VaideVan (vaidevan.com). Neste documento chamamos nossa empresa de "VaideVan", "nós" ou "nos".</p>
            </section>

            <section>
              <h2 className="text-xl font-black text-white mb-3">2. Quais dados coletamos</h2>
              <p>O aplicativo e site VaideVan <strong>não coletam dados pessoais de forma automática</strong>. As únicas informações que podemos receber são:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong>Dados fornecidos voluntariamente:</strong> nome, telefone e informações de contato que você envia via WhatsApp ao solicitar um orçamento.</li>
                <li><strong>Dados de acesso ao Portal do Investidor:</strong> e-mail e senha utilizados para autenticação, armazenados de forma criptografada.</li>
                <li><strong>Dados de navegação anônimos:</strong> métricas de acesso agregadas (sem identificação pessoal) para melhoria do serviço.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-white mb-3">3. Como usamos os dados</h2>
              <p>Utilizamos os dados coletados exclusivamente para:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Responder solicitações de orçamento e atender clientes</li>
                <li>Fornecer acesso ao Portal do Investidor</li>
                <li>Melhorar a experiência de navegação no site e app</li>
                <li>Cumprir obrigações legais e regulatórias</li>
              </ul>
              <p className="mt-3"><strong>Não vendemos, cedemos nem compartilhamos seus dados pessoais com terceiros para fins comerciais.</strong></p>
            </section>

            <section>
              <h2 className="text-xl font-black text-white mb-3">4. Cookies e rastreamento</h2>
              <p>O site VaideVan utiliza cookies técnicos essenciais para o funcionamento correto das páginas. Não utilizamos cookies de rastreamento publicitário ou de terceiros para fins de marketing.</p>
            </section>

            <section>
              <h2 className="text-xl font-black text-white mb-3">5. Segurança dos dados</h2>
              <p>Os dados do Portal do Investidor são protegidos por criptografia AES-256 em repouso e TLS 1.3 em trânsito. As senhas são armazenadas com hash bcrypt. Realizamos auditorias periódicas de segurança.</p>
            </section>

            <section>
              <h2 className="text-xl font-black text-white mb-3">6. Seus direitos (LGPD)</h2>
              <p>Nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Confirmar a existência de tratamento dos seus dados</li>
                <li>Acessar, corrigir ou excluir seus dados</li>
                <li>Revogar seu consentimento a qualquer momento</li>
                <li>Obter informações sobre o compartilhamento de dados</li>
              </ul>
              <p className="mt-3">Para exercer esses direitos, entre em contato pelo e-mail: <strong>privacidade@vaidevan.com</strong></p>
            </section>

            <section>
              <h2 className="text-xl font-black text-white mb-3">7. Retenção de dados</h2>
              <p>Dados de contato enviados via WhatsApp são retidos pelo tempo necessário para atendimento do serviço solicitado. Dados de acesso ao Portal são retidos enquanto a conta estiver ativa.</p>
            </section>

            <section>
              <h2 className="text-xl font-black text-white mb-3">8. Contato</h2>
              <p>Para dúvidas sobre esta Política de Privacidade ou sobre o tratamento dos seus dados:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong>E-mail:</strong> privacidade@vaidevan.com</li>
                <li><strong>WhatsApp:</strong> +55 11 99929-4694</li>
                <li><strong>Encarregado de Dados (DPO):</strong> disponível mediante solicitação</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-white mb-3">9. Alterações nesta política</h2>
              <p>Podemos atualizar esta Política de Privacidade periodicamente. A data de "última atualização" no topo desta página indica quando a versão atual foi publicada. Recomendamos que você revise esta política regularmente.</p>
            </section>

          </div>
        </div>
      </main>

      <footer className="bg-card border-t border-white/10 py-10 px-4 text-center">
        <Link href="/">
          <img src="/logo-black-sm.webp" alt="VaideVan" className="h-12 mx-auto mb-4 object-contain cursor-pointer" width="48" height="48" />
        </Link>
        <p className="text-white/30 text-sm">&copy; {new Date().getFullYear()} VaideVan. Todos os direitos reservados.</p>
      </footer>

      <WhatsAppButton />
    </div>
  );
}
