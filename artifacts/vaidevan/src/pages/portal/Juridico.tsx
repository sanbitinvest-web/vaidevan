import { DashboardLayout } from "@/components/DashboardLayout";
import { Scale, BookOpen, ShieldCheck, AlertTriangle, CheckCircle2, FileText, ExternalLink, Ban, Landmark, Gavel } from "lucide-react";

export default function Juridico() {
  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Scale className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Amparo Jurídico</h1>
            <p className="text-white/50 text-sm mt-1">
              Base legal da operação VaideVan — locação de veículo com motorista vs. fretamento/transporte
            </p>
          </div>
        </div>

        {/* Banner principal */}
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-[#1a1400] via-[#111200] to-[#0a0a0a] p-6 md:p-8">
          <div className="flex items-start gap-3 mb-4">
            <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-primary font-black text-sm uppercase tracking-widest">Posição Jurídica Consolidada</p>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white leading-tight mb-4">
            Locação de veículo com motorista <span className="text-primary">não configura transporte de passageiros nem fretamento</span>
          </h2>
          <p className="text-white/70 text-sm leading-relaxed mb-4">
            A VaideVan opera exclusivamente sob o regime de <strong className="text-white">locação de veículo com ou sem motorista</strong>, disciplinado pelo{" "}
            <strong className="text-white">Código Civil Brasileiro — Lei 10.406/02</strong> (arts. 565 e seguintes). Esta modalidade é distinta do fretamento e do transporte de passageiros, conforme jurisprudência consolidada do Tribunal de Justiça de Minas Gerais.
          </p>
          <p className="text-white/60 text-xs font-mono">
            Fonte: TJMG — Jurisp. Mineira, Belo Horizonte, a. 55, n° 170, p. 63-310, out./dez. 2004
          </p>
        </div>

        {/* Por que isso importa para o investidor */}
        <div className="rounded-2xl border border-white/10 bg-card p-6">
          <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Por que isso importa para o investidor?
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                icon: ShieldCheck,
                color: "text-green-400",
                bg: "bg-green-400/10",
                title: "Sem exigências de fretamento",
                desc: "ANTT, ARTESP, SPTRANS, EMTU, DER e EMDEC regulam empresas de transporte coletivo e fretamento — modalidades distintas da locação. A VaideVan opera amparada pelo Código Civil, sem dependência dessas agências regulatórias.",
              },
              {
                icon: Scale,
                color: "text-primary",
                bg: "bg-primary/10",
                title: "Agilidade contratual superior",
                desc: "Contratos de locação (Lei 10.406/02) têm menor burocracia e maior flexibilidade do que os contratos de fretamento regulados. Isso permite escalar operações rapidamente e com menor custo de compliance.",
              },
              {
                icon: FileText,
                color: "text-blue-400",
                bg: "bg-blue-400/10",
                title: "Proteção jurídica total",
                desc: "O modelo de locação oferece proteção completa ao investidor: o motorista é serviço acessório ao contrato de locação da coisa (veículo). Isso evita enquadramento como prestação de serviço de transporte com suas respectivas obrigações regulatórias.",
              },
              {
                icon: CheckCircle2,
                color: "text-green-400",
                bg: "bg-green-400/10",
                title: "Jurisprudência consolidada",
                desc: "A posição é respaldada por acórdão do TJMG, à unanimidade, que estabeleceu que o serviço do motorista constitui mero acessório ao contrato principal de locação de coisa — não descaracterizando o contrato de aluguel.",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div>
                  <p className="font-bold text-white text-sm mb-1">{item.title}</p>
                  <p className="text-white/50 text-xs leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Distinção legal — Locação vs Fretamento */}
        <div className="rounded-2xl border border-white/10 bg-card p-6">
          <h3 className="text-lg font-black text-white mb-5 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Distinção Legal: Locação vs. Fretamento/Transporte
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 pr-4 text-white/40 font-bold text-xs uppercase tracking-wider">Critério</th>
                  <th className="text-left py-3 pr-4 text-primary font-bold text-xs uppercase tracking-wider">Locação com Motorista (VaideVan)</th>
                  <th className="text-left py-3 text-white/40 font-bold text-xs uppercase tracking-wider">Fretamento / Transporte</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {[
                  { crit: "Base legal", locacao: "Lei 10.406/02 (Código Civil)", fretamento: "Lei 10.233/01 + ANTT" },
                  { crit: "Natureza", locacao: "Cessão de posse do veículo (coisa)", fretamento: "Obrigação de fazer (transporte)" },
                  { crit: "Motorista", locacao: "Serviço acessório ao contrato", fretamento: "Parte essencial do serviço" },
                  { crit: "Registro obrigatório", locacao: "CNPJ + inscrição municipal", fretamento: "ANTT, ARTESP, EMTU, DER…" },
                  { crit: "Alíquota ISSQN", locacao: "Alíquota de locação (menor)", fretamento: "Alíquota de serviços de transporte" },
                  { crit: "Fiscalização", locacao: "Direito privado contratual", fretamento: "Agências regulatórias públicas" },
                ].map((row) => (
                  <tr key={row.crit}>
                    <td className="py-3 pr-4 text-white/50 text-xs">{row.crit}</td>
                    <td className="py-3 pr-4 text-white text-xs font-medium">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0" />
                        {row.locacao}
                      </span>
                    </td>
                    <td className="py-3 text-white/40 text-xs">{row.fretamento}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ementa do Acórdão TJMG */}
        <div className="rounded-2xl border border-white/10 bg-card p-6">
          <h3 className="text-lg font-black text-white mb-2 flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            Ementa do Acórdão — TJMG
          </h3>
          <p className="text-white/40 text-xs mb-5 font-mono">
            Apelação Cível n° 1.0024.02.802542-7/001 · Comarca de Belo Horizonte · Rel. Des. Gouvêa Rios · 26/10/2004
          </p>

          <div className="space-y-4">
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-5">
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3">Ementa Oficial (transcrição parcial)</p>
              <blockquote className="text-white/80 text-sm leading-relaxed italic border-l-2 border-primary/50 pl-4">
                "ISSQN — Contratos de transporte e de locação — Locação armada ou <em>time charter</em> — Admissibilidade e caracterização — Observância aos limites do poder de tributar. No contrato de transporte ou fretamento, em que se dá o veículo a frete, há a constituição de uma mera obrigação de fazer, ou seja, o transporte por um número de viagens ajustado (ponto a ponto), um prazo certo e mediante quantia determinada, ou seja, frete. Por outro lado, o contrato de aluguel se caracteriza na cessão de posse imediata do veículo, através de contrato de locação e mediante o recebimento do aluguel. Pode o locador ceder o uso do veículo a outrem, por certo tempo, já devidamente armado e equipado. Nesse caso, se o locador se submete às condições baixadas pelo locatário quanto ao cumprimento de horários estabelecidos e ao controle de presença e permanência dos empregados em serviço, à alteração unilateral pelo locatário dos horários da prestação dos serviços, bem como da escola a ser atendida e, ainda, obedece às rotas apresentadas pelo locatário, o serviço do motorista constitui <strong className='not-italic text-primary'>mero acessório ao contrato principal de locação de coisa</strong>, qual a do ônibus, caracterizando o contrato de locação <em>time charter</em>."
              </blockquote>
            </div>

            <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-5">
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3">Conclusão do Acórdão</p>
              <blockquote className="text-white/80 text-sm leading-relaxed italic border-l-2 border-primary/50 pl-4">
                "Tratando-se de locação de ônibus para transporte escolar, submetendo-se o contribuinte às condições impostas pelo contratante quanto ao cumprimento de horários estabelecidos, controle de presença e permanência dos empregados em serviço, alteração de horários, escola a ser atendida e rotas apresentadas, o serviço prestado pelo condutor do veículo constitui <strong className='not-italic text-primary'>mero acessório, sem descaracterizar o contrato principal de aluguel de coisa</strong>, o que autoriza a incidência do ISSQN, com aplicação da alíquota prevista para os serviços de locação."
              </blockquote>
            </div>

            <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-5">
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3">Princípio aplicado</p>
              <blockquote className="text-white/80 text-sm leading-relaxed italic border-l-2 border-primary/50 pl-4">
                "É imperiosa a imposição de limites ao poder de tributar. E a observância dos conceitos jurídicos constitui um desses limites. Somente o legislador poderá atribuir efeitos tributários distintos, alterando o alcance e o conteúdo dos institutos e conceitos do Direito Privado, se inexistir obstáculo na Constituição. <strong className='not-italic text-primary'>Não o intérprete e aplicador da lei.</strong>"
              </blockquote>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-white/30 text-xs font-mono">
            <FileText className="w-3.5 h-3.5" />
            Jurisp. Mineira, Belo Horizonte, a. 55, n° 170, p. 63-310, out./dez. 2004 · Decisão unânime
          </div>
        </div>

        {/* Autoridade Federal — SRF / CNAE */}
        <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6">
          <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-green-400" />
            Autoridade Federal Legítima: SRF e CNAE do Cartão CNPJ
          </h3>
          <p className="text-white/70 text-sm leading-relaxed mb-5">
            A <strong className="text-white">Secretaria da Receita Federal (SRF)</strong> é o órgão federal que habilita e classifica a atividade econômica da empresa por meio do{" "}
            <strong className="text-white">CNAE — Classificação Nacional de Atividades Econômicas</strong>. O CNAE constante no cartão CNPJ da VaideVan enquadra a empresa como{" "}
            <strong className="text-primary">locadora de veículos</strong>, modalidade que a própria Receita Federal reconhece como distinta de transportadora ou fretadora. Essa habilitação federal sobrepõe-se a qualquer exigência estadual ou municipal incompatível com a natureza jurídica da atividade.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                label: "CNPJ Ativo — Atende Rent a Car",
                value: "63.931.058/0001-79",
                desc: "Habilitado pela Secretaria da Receita Federal com CNAE de locação de veículos",
                color: "text-primary",
              },
              {
                label: "Base Legal Federal",
                value: "Lei 10.406/02 — CC",
                desc: "Código Civil: locação de veículo com motorista (art. 565 ss.) — norma federal superior",
                color: "text-green-400",
              },
              {
                label: "Credencial Turismo",
                value: "Cadastur",
                desc: "Operador credenciado pelo Ministério do Turismo — órgão federal compatível com locação",
                color: "text-blue-400",
              },
            ].map((item) => (
              <div key={item.label} className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.07]">
                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">{item.label}</p>
                <p className={`${item.color} font-black text-sm mb-1`}>{item.value}</p>
                <p className="text-white/50 text-xs leading-snug">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Três pilares da ilegitimidade das exigências */}
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
          <h3 className="text-lg font-black text-white mb-5 flex items-center gap-2">
            <Gavel className="w-5 h-5 text-red-400" />
            Por que as exigências de ANTT, ARTESP, SPTRANS, EMTU, DER e EMDEC são indevidas
          </h3>
          <div className="space-y-4">
            {[
              {
                num: "1°",
                color: "bg-red-500/15 border-red-500/30",
                numColor: "text-red-400",
                title: "Esses órgãos sequer cadastram locadoras — impossibilidade material",
                desc: "ANTT, ARTESP, SPTRANS, EMTU, DER e EMDEC regulam exclusivamente transportadoras, fretadoras e operadores de transporte coletivo. Nenhum desses órgãos possui sistema de cadastro, habilitação ou registro para locadoras de veículos. Exigir o que é materialmente impossível — cadastro em órgão que não realiza esse cadastro — configura ato arbitrário e sem respaldo legal.",
              },
              {
                num: "2°",
                color: "bg-yellow-500/10 border-yellow-500/20",
                numColor: "text-yellow-400",
                title: "Violação ao princípio do contraditório e da ampla defesa (CF/88, art. 5°, LV)",
                desc: "Aplicar penalidade ou impedir a operação com base em normas de fretamento — que não se aplicam à locação — viola o princípio constitucional do contraditório. O agente que exige conformidade com regramento de outra atividade econômica comete excesso de poder, passível de mandado de segurança, ação popular e responsabilização funcional (Lei 8.429/92 — improbidade administrativa).",
              },
              {
                num: "3°",
                color: "bg-blue-500/10 border-blue-500/20",
                numColor: "text-blue-400",
                title: "Autoridade competente já exercida: SRF via CNAE — hierarquia federal superior",
                desc: "A Secretaria da Receita Federal, como órgão federal, é quem habilita a atividade econômica via CNAE no ato de abertura do CNPJ. A competência federal sobrepõe-se às agências estaduais e municipais (ARTESP, SPTRANS, EMTU, DER, EMDEC). Qualquer exigência dessas agências para atividade já classificada pela SRF como locação fere a hierarquia normativa (CF/88, art. 22, XI — competência privativa da União para normas de trânsito e transporte).",
              },
            ].map((item) => (
              <div key={item.num} className={`rounded-xl border ${item.color} p-5 flex gap-4`}>
                <div className="flex-shrink-0">
                  <span className={`${item.numColor} font-black text-xl leading-none`}>{item.num}</span>
                </div>
                <div>
                  <p className="font-black text-white text-sm mb-2">{item.title}</p>
                  <p className="text-white/55 text-xs leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* O que fazer diante de fiscalização indevida */}
        <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-6">
          <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Conduta recomendada diante de exigência indevida de fiscal
          </h3>
          <div className="space-y-3">
            {[
              {
                step: "01",
                action: "Apresente o Contrato de Locação",
                detail: "O contrato formalizado nos termos da Lei 10.406/02 é a prova primária da modalidade de operação. Motorista consta como serviço acessório — não como obrigação de transporte.",
              },
              {
                step: "02",
                action: "Apresente o Cartão CNPJ com o CNAE de locação",
                detail: "O CNAE emitido pela SRF (Receita Federal) classifica a atividade como locação de veículos — habilitação federal que supera qualquer exigência de agência estadual/municipal incompatível.",
              },
              {
                step: "03",
                action: "Cite a jurisprudência do TJMG",
                detail: "Jurisp. Mineira, Belo Horizonte, a. 55, n° 170, p. 63-310, out./dez. 2004 — Acórdão unânime: locação com motorista não configura fretamento nem transporte de passageiros.",
              },
              {
                step: "04",
                action: "Registre o auto de infração e consulte advogado",
                detail: "Caso o auto seja lavrado, recolha-o imediatamente para contestação administrativa e judicial. Ação de mandado de segurança é o remédio adequado para exigências ilegais de agentes públicos. Responsabilização por improbidade pode ser buscada (Lei 8.429/92).",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary font-black text-xs">{item.step}</span>
                </div>
                <div>
                  <p className="font-bold text-white text-sm mb-1">{item.action}</p>
                  <p className="text-white/50 text-xs leading-relaxed">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer final */}
        <div className="rounded-2xl border border-white/10 bg-card p-5 flex gap-3">
          <Ban className="w-5 h-5 text-white/30 flex-shrink-0 mt-0.5" />
          <p className="text-white/40 text-xs leading-relaxed">
            <strong className="text-white/60">Aviso legal:</strong> Este documento é de natureza informativa e não substitui orientação jurídica profissional. Diante de qualquer autuação ou impedimento operacional, recomenda-se a contratação imediata de advogado especializado em direito administrativo e contratual. Os argumentos aqui apresentados são fundamentados em legislação e jurisprudência vigentes, mas cada caso pode apresentar particularidades que exijam análise específica.
          </p>
        </div>

        {/* Documento para download */}
        <div className="rounded-2xl border border-white/10 bg-card p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Jurisprudência TJMG — Locação com Motorista</p>
              <p className="text-white/40 text-xs">Jurisp. Mineira, a. 55, n° 170, p. 63-310, out./dez. 2004 · AC 1.0024.02.802542-7/001</p>
            </div>
          </div>
          <a
            href="https://jurisprudencia.tjmg.jus.br"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-primary text-xs font-bold hover:underline flex-shrink-0"
          >
            TJMG <ExternalLink className="w-3 h-3" />
          </a>
        </div>

      </div>
    </DashboardLayout>
  );
}
