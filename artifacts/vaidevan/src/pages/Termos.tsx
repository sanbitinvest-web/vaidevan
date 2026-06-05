import { Link } from "wouter";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export default function Termos() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" aria-label="VaideVan - Início">
            <img src="/logo-black-sm.webp" alt="VaideVan" className="h-12 w-auto object-contain cursor-pointer" width="120" height="48" />
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-semibold hover:text-primary transition-colors">Início</Link>
            <Link href="/blog" className="text-sm font-semibold hover:text-primary transition-colors">Blog</Link>
          </nav>
        </div>
      </header>

      <main className="pt-32 pb-24 px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-4xl font-black mb-2">Termos de Uso</h1>
          <p className="text-white/40 text-sm mb-10">Última atualização: abril de 2025</p>

          <div className="space-y-8 text-white/80 leading-relaxed">
            <section>
              <h2 className="text-xl font-black text-white mb-3">1. Aceitação dos Termos</h2>
              <p>Ao acessar e utilizar o site vaidevan.com, o aplicativo VaideVan ou qualquer serviço prestado pela <strong>VaideVan Transporte Executivo Ltda.</strong>, você concorda com estes Termos de Uso. Se não concordar com qualquer parte destes termos, não utilize nossos serviços.</p>
            </section>

            <section>
              <h2 className="text-xl font-black text-white mb-3">2. Sobre os Serviços</h2>
              <p>A VaideVan opera exclusivamente sob o regime de <strong>locação de veículo com ou sem motorista</strong>, conforme disciplinado pelo Código Civil Brasileiro (Lei 10.406/02, arts. 565 e seguintes). A atividade <strong>não configura transporte de passageiros nem fretamento</strong>, conforme jurisprudência consolidada (TJMG, Jurisp. Mineira, a. 55, n° 170, p. 63-310, out./dez. 2004), sendo, portanto, regulada exclusivamente pelo direito privado contratual. Os serviços abrangem: locação de van executiva com motorista, locação corporativa mensal, transfer aeroportuário, locação para eventos e excursões — todos formalizados por contrato de locação de coisa (veículo), com motorista como serviço acessório.</p>
            </section>

            <section>
              <h2 className="text-xl font-black text-white mb-3">3. Contratação e Pagamento</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>A contratação dos serviços é realizada mediante solicitação via WhatsApp, e-mail ou formulário de contato, seguida de proposta formal e assinatura de contrato.</li>
                <li>O pagamento deve ser realizado conforme as condições estabelecidas no contrato específico.</li>
                <li>Para eventos e transfers pontuais, pode ser exigido sinal ou pagamento integral antecipado.</li>
                <li>Cancelamentos devem ser comunicados com antecedência mínima conforme especificado em contrato.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-white mb-3">4. Responsabilidades da VaideVan</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Fornecer veículos em perfeitas condições de manutenção e segurança.</li>
                <li>Disponibilizar motoristas habilitados, treinados e adequadamente apresentados.</li>
                <li>Cumprir os horários e rotas estabelecidos em contrato.</li>
                <li>Manter seguro app para cobertura de passageiros.</li>
                <li>Substituir o veículo em caso de pane mecânica em até 2 horas.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-white mb-3">5. Responsabilidades do Contratante</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Fornecer informações corretas sobre o número de passageiros, rota e horários.</li>
                <li>Tratar o veículo e o motorista com respeito e urbanidade.</li>
                <li>Não solicitar ao motorista que exceda os limites de velocidade ou realize manobras ilegais.</li>
                <li>Informar com antecedência qualquer alteração de rota ou horário.</li>
                <li>Respeitar a capacidade máxima de passageiros do veículo.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-white mb-3">6. Cancelamentos e Reembolsos</h2>
              <p>As políticas de cancelamento variam conforme o tipo de serviço contratado e estão especificadas no contrato individual. Em geral:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong>Cancelamento com mais de 48h de antecedência:</strong> Reembolso integral do sinal.</li>
                <li><strong>Cancelamento entre 24h e 48h:</strong> Reembolso de 50% do sinal.</li>
                <li><strong>Cancelamento com menos de 24h:</strong> Sinal não reembolsável.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-white mb-3">7. Limitação de Responsabilidade</h2>
              <p>A VaideVan não se responsabiliza por atrasos causados por condições climáticas extremas, acidentes de terceiros, fechamento de estradas por autoridades ou outros eventos de força maior. Em tais situações, a empresa envidará todos os esforços para minimizar os impactos e comunicar os contratantes com antecedência.</p>
            </section>

            <section>
              <h2 className="text-xl font-black text-white mb-3">8. Propriedade Intelectual</h2>
              <p>Todos os conteúdos do site vaidevan.com — textos, imagens, logotipos, ícones e softwares — são propriedade da VaideVan ou de seus licenciadores e estão protegidos pela legislação de direitos autorais brasileira. É vedada a reprodução total ou parcial sem autorização expressa.</p>
            </section>

            <section>
              <h2 className="text-xl font-black text-white mb-3">9. Lei Aplicável e Foro</h2>
              <p>Estes Termos de Uso são regidos pela legislação brasileira. Qualquer disputa será resolvida no Foro da Comarca de São Paulo/SP, com renúncia expressa a qualquer outro foro.</p>
            </section>

            <section>
              <h2 className="text-xl font-black text-white mb-3">10. Contato</h2>
              <p>Para dúvidas sobre estes Termos de Uso:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong>E-mail:</strong> juridico@vaidevan.com</li>
                <li><strong>WhatsApp:</strong> +55 11 99929-4694</li>
              </ul>
            </section>
          </div>
        </div>
      </main>

      <footer className="bg-card border-t border-white/10 py-10 px-4 text-center">
        <Link href="/">
          <img src="/logo-black-sm.webp" alt="VaideVan" className="h-12 mx-auto mb-4 object-contain cursor-pointer" width="120" height="48" />
        </Link>
        <p className="text-white/30 text-sm">&copy; {new Date().getFullYear()} VaideVan. Todos os direitos reservados.</p>
      </footer>

      <WhatsAppButton />
    </div>
  );
}
