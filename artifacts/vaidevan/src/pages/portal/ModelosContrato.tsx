import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { api, ApiContractTemplate } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { FileEdit, Plus, Pencil, Trash2, Eye, EyeOff, X, CheckCircle2, Info } from "lucide-react";

type FieldDef = { key: string; label: string; type: string; required: boolean; placeholder: string };

const FIELD_TYPES = ["text", "date", "number", "email", "cpf", "cnpj", "currency"];

const DEFAULT_BODY = `<div style="font-family:Arial,sans-serif;max-width:780px;margin:0 auto;color:#111;line-height:1.7">

<div style="text-align:center;border-bottom:2px solid #F5E642;padding-bottom:20px;margin-bottom:28px">
  <p style="font-size:11px;color:#555;margin:0 0 6px">CONTRATO REGIDO PELA LEI Nº 10.406/2002 — CÓDIGO CIVIL BRASILEIRO</p>
  <h2 style="font-size:20px;font-weight:900;margin:0 0 4px">CONTRATO DE LOCAÇÃO DE VEÍCULO EXECUTIVO</h2>
  <p style="font-size:12px;color:#666;margin:0">VaideVan Transportes Ltda. — São Paulo/SP</p>
</div>

<h3 style="font-size:13px;font-weight:700;border-left:3px solid #F5E642;padding-left:10px;margin:24px 0 10px">QUALIFICAÇÃO DAS PARTES</h3>
<p><strong>LOCADOR:</strong> VaideVan Transportes Ltda., pessoa jurídica de direito privado, inscrita no CNPJ sob o nº {{locador_cnpj}}, com sede na cidade de São Paulo/SP, doravante denominada simplesmente <strong>LOCADORA</strong>.</p>
<p><strong>LOCATÁRIO / INVESTIDOR:</strong> {{investidor_nome}}, CPF/CNPJ nº {{investidor_cpf}}, residente/domiciliado em {{investidor_cidade}}/{{investidor_estado}}, doravante denominado <strong>LOCATÁRIO</strong>.</p>
<p><strong>USUÁRIO FINAL / CONTRATANTE DOS SERVIÇOS:</strong> {{cliente_nome}}, CPF/CNPJ nº {{cliente_cpf}}, doravante denominado <strong>USUÁRIO</strong>.</p>

<h3 style="font-size:13px;font-weight:700;border-left:3px solid #F5E642;padding-left:10px;margin:24px 0 10px">CLÁUSULA 1ª — DO OBJETO</h3>
<p>1.1 O presente contrato tem por objeto a locação de <strong>{{tipo_veiculo}}</strong>, modelo <strong>{{modelo_veiculo}}</strong>, para a prestação de serviços de transporte executivo com motorista, nos termos dos arts. 565 a 578 do Código Civil Brasileiro (Lei nº 10.406/2002).</p>
<p>1.2 Os serviços abrangem: {{objeto}}.</p>

<h3 style="font-size:13px;font-weight:700;border-left:3px solid #F5E642;padding-left:10px;margin:24px 0 10px">CLÁUSULA 2ª — DO PRAZO</h3>
<p>2.1 O prazo de locação será de <strong>{{prazo}}</strong>, iniciando-se em {{data_inicio}}, renovando-se automaticamente por igual período, salvo comunicação em contrário por qualquer das partes com antecedência mínima de 30 (trinta) dias, conforme art. 574 do CCB.</p>

<h3 style="font-size:13px;font-weight:700;border-left:3px solid #F5E642;padding-left:10px;margin:24px 0 10px">CLÁUSULA 3ª — DO VALOR E DA FORMA DE PAGAMENTO</h3>
<p>3.1 O valor total acordado é de <strong>R$ {{valor}}</strong> ({{valor_extenso}}), a ser pago conforme segue: {{forma_pagamento}}.</p>
<p>3.2 O inadimplemento acarretará multa de 2% (dois por cento) sobre o valor em atraso, acrescida de juros moratórios de 1% ao mês e correção monetária pelo IPCA/IBGE, nos termos dos arts. 394 e 395 do CCB.</p>

<h3 style="font-size:13px;font-weight:700;border-left:3px solid #F5E642;padding-left:10px;margin:24px 0 10px">CLÁUSULA 4ª — DAS OBRIGAÇÕES DA LOCADORA (arts. 566 e 569 do CCB)</h3>
<p>4.1 Entregar o veículo em perfeito estado de uso, higiene e conservação.</p>
<p>4.2 Manter o veículo segurado contra danos de terceiros, roubo e colisão.</p>
<p>4.3 Realizar a manutenção preventiva e corretiva do veículo às suas expensas.</p>
<p>4.4 Substituir o veículo em caso de pane ou indisponibilidade em até 72 (setenta e duas) horas.</p>
<p>4.5 Fornecer motorista devidamente habilitado, uniformizado e treinado para serviços executivos.</p>

<h3 style="font-size:13px;font-weight:700;border-left:3px solid #F5E642;padding-left:10px;margin:24px 0 10px">CLÁUSULA 5ª — DAS OBRIGAÇÕES DO LOCATÁRIO (arts. 569 e 570 do CCB)</h3>
<p>5.1 Efetuar os pagamentos nas datas acordadas.</p>
<p>5.2 Utilizar o veículo exclusivamente para os fins previstos neste contrato.</p>
<p>5.3 Não sublocar ou ceder o uso do veículo a terceiros sem anuência prévia e por escrito da LOCADORA.</p>
<p>5.4 Comunicar imediatamente qualquer sinistro, dano ou irregularidade envolvendo o veículo.</p>

<h3 style="font-size:13px;font-weight:700;border-left:3px solid #F5E642;padding-left:10px;margin:24px 0 10px">CLÁUSULA 6ª — DA RESCISÃO (arts. 571 a 573 do CCB)</h3>
<p>6.1 O presente contrato poderá ser rescindido por qualquer das partes mediante notificação prévia de 30 (trinta) dias.</p>
<p>6.2 A rescisão imotivada pela LOCADORA ensejará devolução proporcional dos valores pagos e pagamento de indenização equivalente a 1 (uma) parcela mensal.</p>
<p>6.3 A rescisão imotivada pelo LOCATÁRIO antes do término do prazo original implicará multa equivalente a 20% (vinte por cento) do valor das parcelas remanescentes.</p>

<h3 style="font-size:13px;font-weight:700;border-left:3px solid #F5E642;padding-left:10px;margin:24px 0 10px">CLÁUSULA 7ª — DA RESPONSABILIDADE CIVIL (arts. 927 a 954 do CCB)</h3>
<p>7.1 A LOCADORA é responsável por danos causados a terceiros em decorrência de falha mecânica do veículo ou conduta do motorista no exercício de suas funções.</p>
<p>7.2 O LOCATÁRIO responde pelos danos causados por uso indevido ou em desacordo com as condições pactuadas neste instrumento.</p>

<h3 style="font-size:13px;font-weight:700;border-left:3px solid #F5E642;padding-left:10px;margin:24px 0 10px">CLÁUSULA 8ª — DA PROTEÇÃO DE DADOS (LGPD — Lei nº 13.709/2018)</h3>
<p>8.1 As partes comprometem-se a tratar os dados pessoais eventualmente compartilhados em conformidade com a Lei Geral de Proteção de Dados (LGPD), utilizando-os exclusivamente para fins de execução deste contrato.</p>

<h3 style="font-size:13px;font-weight:700;border-left:3px solid #F5E642;padding-left:10px;margin:24px 0 10px">CLÁUSULA 9ª — DO FORO</h3>
<p>9.1 Fica eleito o foro da Comarca de São Paulo/SP para dirimir quaisquer controvérsias decorrentes do presente instrumento, com renúncia expressa a qualquer outro, por mais privilegiado que seja, nos termos do art. 63 do CPC.</p>

<h3 style="font-size:13px;font-weight:700;border-left:3px solid #F5E642;padding-left:10px;margin:24px 0 10px">CLÁUSULA 10ª — DISPOSIÇÕES GERAIS</h3>
<p>10.1 Este contrato é regido e interpretado de acordo com as leis da República Federativa do Brasil, em especial o Código Civil (Lei nº 10.406/2002) e o Código de Defesa do Consumidor (Lei nº 8.078/1990).</p>
<p>10.2 A assinatura digital possui plena validade jurídica nos termos da MP 2.200-2/2001, da Lei 14.063/2020 e do Decreto 10.543/2020.</p>
<p>10.3 Qualquer alteração a este instrumento somente terá validade se formalizada por aditivo contratual assinado por ambas as partes.</p>

<div style="margin-top:40px;border-top:1px solid #ddd;padding-top:24px">
  <p style="text-align:center">São Paulo, {{data_assinatura}}</p>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:32px">
    <div style="text-align:center">
      <div style="border-top:1px solid #000;padding-top:8px;margin-top:48px">
        <p style="margin:0;font-weight:700">VaideVan Transportes Ltda.</p>
        <p style="margin:0;font-size:11px;color:#555">CNPJ: {{locador_cnpj}} — LOCADORA</p>
      </div>
    </div>
    <div style="text-align:center">
      <div style="border-top:1px solid #000;padding-top:8px;margin-top:48px">
        <p style="margin:0;font-weight:700">{{investidor_nome}}</p>
        <p style="margin:0;font-size:11px;color:#555">CPF/CNPJ: {{investidor_cpf}} — LOCATÁRIO</p>
      </div>
    </div>
  </div>
  <p style="text-align:center;font-size:10px;color:#888;margin-top:24px">
    Assinatura digital com validade jurídica — Lei 14.063/2020 · MP 2.200-2/2001 · Decreto 10.543/2020<br>
    Gerado pela plataforma VaideVan · vaidevan.com
  </p>
</div>

</div>`;

const BODY_CLIENTE = `<div style="font-family:Arial,sans-serif;max-width:780px;margin:0 auto;color:#111;line-height:1.7">

<div style="text-align:center;border-bottom:2px solid #F5E642;padding-bottom:20px;margin-bottom:28px">
  <p style="font-size:11px;color:#555;margin:0 0 4px">CNPJ: {{locador_cnpj}} — São Paulo/SP — vaidevan.com</p>
  <p style="font-size:11px;color:#555;margin:0 0 6px">CONTRATO REGIDO PELA LEI Nº 10.406/2002 — CÓDIGO CIVIL BRASILEIRO · CDC LEI Nº 8.078/1990</p>
  <h2 style="font-size:20px;font-weight:900;margin:0 0 2px">CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE TRANSPORTE</h2>
  <h3 style="font-size:14px;font-weight:700;margin:0;color:#444">Transporte Executivo com Motorista — VaideVan</h3>
</div>

<h3 style="font-size:13px;font-weight:700;border-left:3px solid #F5E642;padding-left:10px;margin:24px 0 10px">IDENTIFICAÇÃO DAS PARTES</h3>
<table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:12px">
  <tr style="background:#f8f8f8"><td style="padding:8px 12px;font-weight:700;width:35%">PRESTADORA DOS SERVIÇOS</td><td style="padding:8px 12px">VaideVan Transportes Ltda.</td></tr>
  <tr><td style="padding:8px 12px;font-weight:700">CNPJ</td><td style="padding:8px 12px">{{locador_cnpj}}</td></tr>
  <tr style="background:#f8f8f8"><td style="padding:8px 12px;font-weight:700">ENDEREÇO</td><td style="padding:8px 12px">São Paulo/SP — Brasil</td></tr>
  <tr><td style="padding:8px 12px;font-weight:700">CONTATO</td><td style="padding:8px 12px">+55 (11) 99929-4694 · contato@vaidevan.com</td></tr>
</table>
<table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:20px">
  <tr style="background:#fff9d6"><td style="padding:8px 12px;font-weight:700;width:35%">CONTRATANTE / CLIENTE</td><td style="padding:8px 12px">{{cliente_nome}}</td></tr>
  <tr><td style="padding:8px 12px;font-weight:700">CPF / CNPJ</td><td style="padding:8px 12px">{{cliente_cpf}}</td></tr>
  <tr style="background:#fff9d6"><td style="padding:8px 12px;font-weight:700">RG / IDENTIDADE</td><td style="padding:8px 12px">{{cliente_rg}}</td></tr>
  <tr><td style="padding:8px 12px;font-weight:700">ENDEREÇO</td><td style="padding:8px 12px">{{cliente_endereco}}, {{cliente_cidade}}/{{cliente_estado}} — CEP {{cliente_cep}}</td></tr>
  <tr style="background:#fff9d6"><td style="padding:8px 12px;font-weight:700">TELEFONE / WHATSAPP</td><td style="padding:8px 12px">{{cliente_telefone}}</td></tr>
  <tr><td style="padding:8px 12px;font-weight:700">E-MAIL</td><td style="padding:8px 12px">{{cliente_email}}</td></tr>
</table>

<h3 style="font-size:13px;font-weight:700;border-left:3px solid #F5E642;padding-left:10px;margin:24px 0 10px">DADOS DO SERVIÇO</h3>
<table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:20px">
  <tr style="background:#f8f8f8"><td style="padding:8px 12px;font-weight:700;width:35%">TIPO DE VEÍCULO</td><td style="padding:8px 12px">{{tipo_veiculo}}</td></tr>
  <tr><td style="padding:8px 12px;font-weight:700">MODELO / PLACA</td><td style="padding:8px 12px">{{modelo_veiculo}} — Placa: {{placa_veiculo}}</td></tr>
  <tr style="background:#f8f8f8"><td style="padding:8px 12px;font-weight:700">SERVIÇO</td><td style="padding:8px 12px">{{tipo_servico}}</td></tr>
  <tr><td style="padding:8px 12px;font-weight:700">ROTA / DESTINO</td><td style="padding:8px 12px">{{rota_destino}}</td></tr>
  <tr style="background:#f8f8f8"><td style="padding:8px 12px;font-weight:700">DATA / HORA DE INÍCIO</td><td style="padding:8px 12px">{{data_inicio}} às {{hora_inicio}}</td></tr>
  <tr><td style="padding:8px 12px;font-weight:700">DATA / HORA DE TÉRMINO</td><td style="padding:8px 12px">{{data_fim}} às {{hora_fim}}</td></tr>
  <tr style="background:#f8f8f8"><td style="padding:8px 12px;font-weight:700">Nº DE PASSAGEIROS</td><td style="padding:8px 12px">{{num_passageiros}}</td></tr>
  <tr><td style="padding:8px 12px;font-weight:700">MOTORISTA RESPONSÁVEL</td><td style="padding:8px 12px">{{motorista_nome}} — CNH: {{motorista_cnh}}</td></tr>
</table>

<h3 style="font-size:13px;font-weight:700;border-left:3px solid #F5E642;padding-left:10px;margin:24px 0 10px">VALORES E PAGAMENTO</h3>
<table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:20px">
  <tr style="background:#f8f8f8"><td style="padding:8px 12px;font-weight:700;width:35%">VALOR TOTAL</td><td style="padding:8px 12px"><strong>R$ {{valor_total}}</strong> ({{valor_extenso}})</td></tr>
  <tr><td style="padding:8px 12px;font-weight:700">FORMA DE PAGAMENTO</td><td style="padding:8px 12px">{{forma_pagamento}}</td></tr>
  <tr style="background:#f8f8f8"><td style="padding:8px 12px;font-weight:700">DESCONTO / CORTESIA</td><td style="padding:8px 12px">{{desconto}}</td></tr>
  <tr><td style="padding:8px 12px;font-weight:700">VALOR COBRADO</td><td style="padding:8px 12px"><strong>R$ {{valor_cobrado}}</strong></td></tr>
</table>

<h3 style="font-size:13px;font-weight:700;border-left:3px solid #F5E642;padding-left:10px;margin:24px 0 10px">CLÁUSULA 1ª — DO OBJETO</h3>
<p style="font-size:12px">1.1 A CONTRATADA obriga-se a prestar ao CONTRATANTE os serviços de transporte executivo com motorista, conforme especificações acima, nos termos do art. 594 e seguintes do Código Civil Brasileiro (Lei nº 10.406/2002) e do Código de Defesa do Consumidor (Lei nº 8.078/1990).</p>

<h3 style="font-size:13px;font-weight:700;border-left:3px solid #F5E642;padding-left:10px;margin:24px 0 10px">CLÁUSULA 2ª — DAS OBRIGAÇÕES DA CONTRATADA</h3>
<p style="font-size:12px">2.1 Fornecer veículo em perfeitas condições de uso, higiene e segurança, com documentação em dia (CRLV, DPVAT/SPVAT, seguro).</p>
<p style="font-size:12px">2.2 Disponibilizar motorista habilitado (CNH compatível), uniformizado, com apresentação pessoal adequada ao padrão executivo.</p>
<p style="font-size:12px">2.3 Cumprir rigorosamente o roteiro e os horários pactuados.</p>
<p style="font-size:12px">2.4 Manter sigilo absoluto sobre informações, destinos e dados pessoais do CONTRATANTE (LGPD — Lei nº 13.709/2018).</p>
<p style="font-size:12px">2.5 Providenciar veículo substituto em caso de pane mecânica no menor tempo possível.</p>

<h3 style="font-size:13px;font-weight:700;border-left:3px solid #F5E642;padding-left:10px;margin:24px 0 10px">CLÁUSULA 3ª — DAS OBRIGAÇÕES DO CONTRATANTE</h3>
<p style="font-size:12px">3.1 Efetuar o pagamento conforme acordado.</p>
<p style="font-size:12px">3.2 Utilizar o veículo e seus serviços dentro da mais estrita legalidade.</p>
<p style="font-size:12px">3.3 Respeitar as normas de uso do veículo: proibido fumar, consumir alimentos sem autorização do motorista e portar objetos que causem danos ao veículo ou a terceiros.</p>
<p style="font-size:12px">3.4 Informar corretamente destinos e eventuais alterações de rota com antecedência.</p>
<p style="font-size:12px">3.5 Ressarcir danos causados ao veículo por mau uso ou negligência durante o período do serviço.</p>

<h3 style="font-size:13px;font-weight:700;border-left:3px solid #F5E642;padding-left:10px;margin:24px 0 10px">CLÁUSULA 4ª — TERMO DE RESPONSABILIDADE E CONDUTA (OBRIGATÓRIO)</h3>
<p style="font-size:12px;background:#fff3cd;padding:10px 14px;border-left:4px solid #F5E642;border-radius:4px"><strong>ATENÇÃO — LEIA COM ATENÇÃO ANTES DE ASSINAR:</strong> O CONTRATANTE declara, sob as penas da lei, que está CIENTE das seguintes proibições e responsabilidades durante a utilização dos serviços da VaideVan:</p>
<p style="font-size:12px"><strong>4.1 DROGAS E ENTORPECENTES (Lei nº 11.343/2006 — Lei de Drogas):</strong> É <strong>terminantemente proibido</strong> portar, transportar, guardar, ter em depósito ou qualquer forma de posse de drogas ilícitas ou substâncias entorpecentes dentro dos veículos da VaideVan. A violação configura crime com pena de <strong>reclusão de 5 a 15 anos</strong> e multa (art. 33, Lei nº 11.343/2006), respondendo o CONTRATANTE civil e criminalmente perante o Estado, independentemente da responsabilidade da CONTRATADA.</p>
<p style="font-size:12px"><strong>4.2 ARMAS DE FOGO, MUNIÇÕES E ARMAS BRANCAS (Lei nº 10.826/2003 — Estatuto do Desarmamento · Decreto nº 9.846/2019):</strong> É <strong>terminantemente proibido</strong> portar ou transportar armas de fogo, munições, armas brancas ou quaisquer instrumentos aptos a causar lesões corporais nos veículos da VaideVan, salvo pessoal devidamente autorizado por lei. O porte ilegal de arma de fogo de uso permitido é crime com pena de <strong>reclusão de 2 a 4 anos e multa</strong> (art. 14, Lei nº 10.826/2003). O porte de arma de fogo de uso restrito resulta em pena de <strong>reclusão de 3 a 6 anos</strong> (art. 16).</p>
<p style="font-size:12px"><strong>4.3 BEBIDAS ALCOÓLICAS AO VOLANTE E EMBRIAGUEZ (art. 165, CTB — Lei nº 9.503/1997, com redação da Lei nº 12.760/2012):</strong> O CONTRATANTE não poderá solicitar ou pressionar o motorista a conduzir o veículo sob qualquer influência de álcool ou substância psicoativa. O CONTRATANTE que embarcar visivelmente embriagado poderá ter o serviço recusado sem restituição dos valores pagos, nos termos do art. 13, inciso II, do CDC. O consumo de bebidas alcoólicas no interior do veículo somente é permitido mediante prévia e expressa autorização por escrito da CONTRATADA.</p>
<p style="font-size:12px"><strong>4.4 PRODUTOS ILÍCITOS, SEM PROCEDÊNCIA OU FALSIFICADOS (art. 180 do Código Penal — Receptação · art. 184 do CP — Violação de Direito Autoral · Lei nº 8.137/1990 — Crimes contra a Ordem Econômica):</strong> É <strong>terminantemente proibido</strong> transportar, guardar ou manter posse de mercadorias de origem desconhecida, produtos sem nota fiscal, mercadorias contrabandeadas, pirateadas ou falsificadas nos veículos da VaideVan. A receptação dolosa é crime com pena de <strong>reclusão de 1 a 4 anos e multa</strong> (art. 180 do CP), podendo ser qualificada com pena de <strong>reclusão de 3 a 8 anos</strong>. O CONTRATANTE responde civil e penalmente perante as autoridades competentes.</p>
<p style="font-size:12px"><strong>4.5 RESPONSABILIDADE CIVIL E CRIMINAL DO CONTRATANTE:</strong> O CONTRATANTE declara estar ciente de que a VaideVan colaborará plenamente com as autoridades policiais e órgãos públicos em caso de qualquer ilícito cometido durante a prestação de serviço. A responsabilidade civil pelos danos causados é integral e solidária, nos termos dos arts. 186, 187 e 927 do Código Civil Brasileiro (Lei nº 10.406/2002). A VaideVan não se responsabiliza, em hipótese alguma, por atos ilícitos praticados pelo CONTRATANTE.</p>

<h3 style="font-size:13px;font-weight:700;border-left:3px solid #F5E642;padding-left:10px;margin:24px 0 10px">CLÁUSULA 5ª — DO CANCELAMENTO</h3>
<p style="font-size:12px">5.1 Cancelamento com mais de 24h de antecedência: reembolso integral.</p>
<p style="font-size:12px">5.2 Cancelamento entre 24h e 2h de antecedência: reembolso de 50%.</p>
<p style="font-size:12px">5.3 Cancelamento com menos de 2h ou no-show: sem reembolso.</p>
<p style="font-size:12px">5.4 Cancelamento pela CONTRATADA sem justificativa: reembolso integral + indenização equivalente a 10% do valor contratado.</p>

<h3 style="font-size:13px;font-weight:700;border-left:3px solid #F5E642;padding-left:10px;margin:24px 0 10px">CLÁUSULA 6ª — DO FORO</h3>
<p style="font-size:12px">6.1 Fica eleito o foro da Comarca de São Paulo/SP, nos termos do art. 63 do CPC, para dirimir quaisquer controvérsias decorrentes do presente instrumento.</p>

<div style="margin-top:32px;background:#fffbe6;border:1px solid #F5E642;border-radius:6px;padding:16px 20px">
  <p style="font-size:11px;margin:0 0 8px"><strong>DECLARAÇÃO DO CONTRATANTE:</strong></p>
  <p style="font-size:11px;margin:0">Li e compreendi todas as cláusulas deste contrato, em especial a Cláusula 4ª — Termo de Responsabilidade e Conduta. Estou ciente das penalidades legais e me comprometo a cumprir integralmente as disposições aqui estabelecidas. <strong>[ ] SIM, LI E CONCORDO</strong></p>
</div>

<div style="margin-top:32px;border-top:1px solid #ddd;padding-top:24px">
  <p style="text-align:center;font-size:12px">São Paulo, {{data_assinatura}}</p>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:32px">
    <div style="text-align:center">
      <div style="border-top:1px solid #000;padding-top:8px;margin-top:56px">
        <p style="margin:0;font-weight:700;font-size:12px">VaideVan Transportes Ltda.</p>
        <p style="margin:0;font-size:10px;color:#555">CNPJ: {{locador_cnpj}} — CONTRATADA</p>
      </div>
    </div>
    <div style="text-align:center">
      <div style="border-top:1px solid #000;padding-top:8px;margin-top:56px">
        <p style="margin:0;font-weight:700;font-size:12px">{{cliente_nome}}</p>
        <p style="margin:0;font-size:10px;color:#555">CPF/CNPJ: {{cliente_cpf}} — CONTRATANTE</p>
      </div>
    </div>
  </div>
  <p style="text-align:center;font-size:10px;color:#888;margin-top:20px">
    Assinatura digital com validade jurídica — Lei 14.063/2020 · MP 2.200-2/2001 · Decreto 10.543/2020<br>
    Contrato nº {{numero_contrato}} · Gerado em {{data_geracao}} pela plataforma VaideVan · vaidevan.com
  </p>
</div>

</div>`;

const BODY_CHECKLIST = `<div style="font-family:Arial,sans-serif;max-width:780px;margin:0 auto;color:#111;line-height:1.6">

<div style="text-align:center;border-bottom:2px solid #F5E642;padding-bottom:16px;margin-bottom:24px">
  <p style="font-size:11px;color:#555;margin:0 0 4px">CNPJ: {{locador_cnpj}} — vaidevan.com</p>
  <h2 style="font-size:18px;font-weight:900;margin:0 0 2px">CHECKLIST DE VISTORIA DO VEÍCULO</h2>
  <p style="font-size:12px;color:#666;margin:0">Pré-Embarque · Pós-Viagem · Registro Fotográfico</p>
</div>

<h3 style="font-size:13px;font-weight:700;border-left:3px solid #F5E642;padding-left:10px;margin:20px 0 10px">IDENTIFICAÇÃO DO SERVIÇO</h3>
<table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:16px">
  <tr style="background:#f8f8f8"><td style="padding:7px 10px;font-weight:700;width:40%">Data / Hora da Vistoria</td><td style="padding:7px 10px">{{data_vistoria}} às {{hora_vistoria}}</td></tr>
  <tr><td style="padding:7px 10px;font-weight:700">Número do Contrato / OS</td><td style="padding:7px 10px">{{numero_os}}</td></tr>
  <tr style="background:#f8f8f8"><td style="padding:7px 10px;font-weight:700">Cliente</td><td style="padding:7px 10px">{{cliente_nome}} — CPF/CNPJ: {{cliente_cpf}}</td></tr>
  <tr><td style="padding:7px 10px;font-weight:700">Motorista Responsável</td><td style="padding:7px 10px">{{motorista_nome}} — CNH: {{motorista_cnh}}</td></tr>
</table>

<h3 style="font-size:13px;font-weight:700;border-left:3px solid #F5E642;padding-left:10px;margin:20px 0 10px">DADOS DO VEÍCULO</h3>
<table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:16px">
  <tr style="background:#f8f8f8"><td style="padding:7px 10px;font-weight:700;width:40%">Tipo / Modelo</td><td style="padding:7px 10px">{{tipo_veiculo}} — {{modelo_veiculo}}</td></tr>
  <tr><td style="padding:7px 10px;font-weight:700">Placa</td><td style="padding:7px 10px">{{placa_veiculo}}</td></tr>
  <tr style="background:#f8f8f8"><td style="padding:7px 10px;font-weight:700">Cor</td><td style="padding:7px 10px">{{cor_veiculo}}</td></tr>
  <tr><td style="padding:7px 10px;font-weight:700">Ano / Combustível</td><td style="padding:7px 10px">{{ano_veiculo}} — {{combustivel}}</td></tr>
  <tr style="background:#f8f8f8"><td style="padding:7px 10px;font-weight:700">KM na Saída</td><td style="padding:7px 10px">{{km_saida}} km</td></tr>
  <tr><td style="padding:7px 10px;font-weight:700">KM no Retorno</td><td style="padding:7px 10px">{{km_retorno}} km</td></tr>
  <tr style="background:#f8f8f8"><td style="padding:7px 10px;font-weight:700">Nível de Combustível — Saída</td><td style="padding:7px 10px">{{nivel_comb_saida}} &nbsp;[ ] Cheio &nbsp;[ ] 3/4 &nbsp;[ ] 1/2 &nbsp;[ ] 1/4 &nbsp;[ ] Reserva</td></tr>
  <tr><td style="padding:7px 10px;font-weight:700">Nível de Combustível — Retorno</td><td style="padding:7px 10px">{{nivel_comb_retorno}} &nbsp;[ ] Cheio &nbsp;[ ] 3/4 &nbsp;[ ] 1/2 &nbsp;[ ] 1/4 &nbsp;[ ] Reserva</td></tr>
</table>

<h3 style="font-size:13px;font-weight:700;border-left:3px solid #F5E642;padding-left:10px;margin:20px 0 10px">✅ CHECKLIST EXTERIOR (marque OK ou descreva avaria)</h3>
<table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:16px">
  <thead><tr style="background:#222;color:#fff"><th style="padding:7px 10px;text-align:left">Item</th><th style="padding:7px 10px;width:80px;text-align:center">Saída</th><th style="padding:7px 10px;width:80px;text-align:center">Retorno</th><th style="padding:7px 10px;text-align:left">Observações</th></tr></thead>
  <tbody>
  <tr style="background:#f8f8f8"><td style="padding:7px 10px">Para-choque dianteiro</td><td style="padding:7px 10px;text-align:center">[ ] OK [ ] ✗</td><td style="padding:7px 10px;text-align:center">[ ] OK [ ] ✗</td><td style="padding:7px 10px"></td></tr>
  <tr><td style="padding:7px 10px">Para-choque traseiro</td><td style="padding:7px 10px;text-align:center">[ ] OK [ ] ✗</td><td style="padding:7px 10px;text-align:center">[ ] OK [ ] ✗</td><td style="padding:7px 10px"></td></tr>
  <tr style="background:#f8f8f8"><td style="padding:7px 10px">Lataria lateral (esq/dir)</td><td style="padding:7px 10px;text-align:center">[ ] OK [ ] ✗</td><td style="padding:7px 10px;text-align:center">[ ] OK [ ] ✗</td><td style="padding:7px 10px"></td></tr>
  <tr><td style="padding:7px 10px">Teto / Vidro do teto</td><td style="padding:7px 10px;text-align:center">[ ] OK [ ] ✗</td><td style="padding:7px 10px;text-align:center">[ ] OK [ ] ✗</td><td style="padding:7px 10px"></td></tr>
  <tr style="background:#f8f8f8"><td style="padding:7px 10px">Vidros (todos)</td><td style="padding:7px 10px;text-align:center">[ ] OK [ ] ✗</td><td style="padding:7px 10px;text-align:center">[ ] OK [ ] ✗</td><td style="padding:7px 10px"></td></tr>
  <tr><td style="padding:7px 10px">Espelhos retrovisores</td><td style="padding:7px 10px;text-align:center">[ ] OK [ ] ✗</td><td style="padding:7px 10px;text-align:center">[ ] OK [ ] ✗</td><td style="padding:7px 10px"></td></tr>
  <tr style="background:#f8f8f8"><td style="padding:7px 10px">Rodas / Pneus (calibragem)</td><td style="padding:7px 10px;text-align:center">[ ] OK [ ] ✗</td><td style="padding:7px 10px;text-align:center">[ ] OK [ ] ✗</td><td style="padding:7px 10px"></td></tr>
  <tr><td style="padding:7px 10px">Faróis / Lanternas / LEDs</td><td style="padding:7px 10px;text-align:center">[ ] OK [ ] ✗</td><td style="padding:7px 10px;text-align:center">[ ] OK [ ] ✗</td><td style="padding:7px 10px"></td></tr>
  <tr style="background:#f8f8f8"><td style="padding:7px 10px">Estepe e macaco</td><td style="padding:7px 10px;text-align:center">[ ] OK [ ] ✗</td><td style="padding:7px 10px;text-align:center">[ ] OK [ ] ✗</td><td style="padding:7px 10px"></td></tr>
  </tbody>
</table>

<h3 style="font-size:13px;font-weight:700;border-left:3px solid #F5E642;padding-left:10px;margin:20px 0 10px">✅ CHECKLIST INTERIOR</h3>
<table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:16px">
  <thead><tr style="background:#222;color:#fff"><th style="padding:7px 10px;text-align:left">Item</th><th style="padding:7px 10px;width:80px;text-align:center">Saída</th><th style="padding:7px 10px;width:80px;text-align:center">Retorno</th><th style="padding:7px 10px;text-align:left">Observações</th></tr></thead>
  <tbody>
  <tr style="background:#f8f8f8"><td style="padding:7px 10px">Limpeza interna geral</td><td style="padding:7px 10px;text-align:center">[ ] OK [ ] ✗</td><td style="padding:7px 10px;text-align:center">[ ] OK [ ] ✗</td><td style="padding:7px 10px"></td></tr>
  <tr><td style="padding:7px 10px">Bancos (estado / manchas)</td><td style="padding:7px 10px;text-align:center">[ ] OK [ ] ✗</td><td style="padding:7px 10px;text-align:center">[ ] OK [ ] ✗</td><td style="padding:7px 10px"></td></tr>
  <tr style="background:#f8f8f8"><td style="padding:7px 10px">Ar-condicionado</td><td style="padding:7px 10px;text-align:center">[ ] OK [ ] ✗</td><td style="padding:7px 10px;text-align:center">[ ] OK [ ] ✗</td><td style="padding:7px 10px"></td></tr>
  <tr><td style="padding:7px 10px">Sistema de som / USB</td><td style="padding:7px 10px;text-align:center">[ ] OK [ ] ✗</td><td style="padding:7px 10px;text-align:center">[ ] OK [ ] ✗</td><td style="padding:7px 10px"></td></tr>
  <tr style="background:#f8f8f8"><td style="padding:7px 10px">Wi-Fi / Tomadas USB</td><td style="padding:7px 10px;text-align:center">[ ] OK [ ] ✗</td><td style="padding:7px 10px;text-align:center">[ ] OK [ ] ✗</td><td style="padding:7px 10px"></td></tr>
  <tr><td style="padding:7px 10px">Cinto de segurança (todos)</td><td style="padding:7px 10px;text-align:center">[ ] OK [ ] ✗</td><td style="padding:7px 10px;text-align:center">[ ] OK [ ] ✗</td><td style="padding:7px 10px"></td></tr>
  <tr style="background:#f8f8f8"><td style="padding:7px 10px">Porta-malas / Bagageiro</td><td style="padding:7px 10px;text-align:center">[ ] OK [ ] ✗</td><td style="padding:7px 10px;text-align:center">[ ] OK [ ] ✗</td><td style="padding:7px 10px"></td></tr>
  <tr><td style="padding:7px 10px">Documentação do veículo (CRLV)</td><td style="padding:7px 10px;text-align:center">[ ] OK [ ] ✗</td><td style="padding:7px 10px;text-align:center">[ ] OK [ ] ✗</td><td style="padding:7px 10px"></td></tr>
  <tr style="background:#f8f8f8"><td style="padding:7px 10px">Triângulo + Kit de 1ºs socorros</td><td style="padding:7px 10px;text-align:center">[ ] OK [ ] ✗</td><td style="padding:7px 10px;text-align:center">[ ] OK [ ] ✗</td><td style="padding:7px 10px"></td></tr>
  </tbody>
</table>

<h3 style="font-size:13px;font-weight:700;border-left:3px solid #F5E642;padding-left:10px;margin:20px 0 10px">📸 REGISTRO FOTOGRÁFICO OBRIGATÓRIO</h3>
<p style="font-size:12px;color:#555;margin-bottom:8px">Fotografe cada item marcado abaixo e anexe ao sistema ou envie via WhatsApp para <strong>+55 (11) 99929-4694</strong>. Fotos com data/hora automáticas.</p>
<table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:16px">
  <thead><tr style="background:#222;color:#fff"><th style="padding:7px 10px;text-align:left">Foto Necessária</th><th style="padding:7px 10px;width:80px;text-align:center">Saída</th><th style="padding:7px 10px;width:80px;text-align:center">Retorno</th></tr></thead>
  <tbody>
  <tr style="background:#f8f8f8"><td style="padding:7px 10px">Frontal do veículo (completo)</td><td style="padding:7px 10px;text-align:center">[ ] ✓</td><td style="padding:7px 10px;text-align:center">[ ] ✓</td></tr>
  <tr><td style="padding:7px 10px">Traseira do veículo (completo)</td><td style="padding:7px 10px;text-align:center">[ ] ✓</td><td style="padding:7px 10px;text-align:center">[ ] ✓</td></tr>
  <tr style="background:#f8f8f8"><td style="padding:7px 10px">Lateral esquerda</td><td style="padding:7px 10px;text-align:center">[ ] ✓</td><td style="padding:7px 10px;text-align:center">[ ] ✓</td></tr>
  <tr><td style="padding:7px 10px">Lateral direita</td><td style="padding:7px 10px;text-align:center">[ ] ✓</td><td style="padding:7px 10px;text-align:center">[ ] ✓</td></tr>
  <tr style="background:#f8f8f8"><td style="padding:7px 10px">Interior / Bancos</td><td style="padding:7px 10px;text-align:center">[ ] ✓</td><td style="padding:7px 10px;text-align:center">[ ] ✓</td></tr>
  <tr><td style="padding:7px 10px">Painel do veículo (KM + combustível)</td><td style="padding:7px 10px;text-align:center">[ ] ✓</td><td style="padding:7px 10px;text-align:center">[ ] ✓</td></tr>
  <tr style="background:#f8f8f8"><td style="padding:7px 10px">Placa traseira</td><td style="padding:7px 10px;text-align:center">[ ] ✓</td><td style="padding:7px 10px;text-align:center">[ ] ✓</td></tr>
  <tr><td style="padding:7px 10px">Avarias específicas (se houver)</td><td style="padding:7px 10px;text-align:center">[ ] ✓</td><td style="padding:7px 10px;text-align:center">[ ] ✓</td></tr>
  </tbody>
</table>

<h3 style="font-size:13px;font-weight:700;border-left:3px solid #F5E642;padding-left:10px;margin:20px 0 10px">OBSERVAÇÕES GERAIS</h3>
<div style="border:1px solid #ddd;border-radius:4px;padding:12px;min-height:60px;font-size:12px;color:#888">{{observacoes_gerais}}</div>

<div style="margin-top:28px;border-top:1px solid #ddd;padding-top:20px">
  <p style="text-align:center;font-size:12px">São Paulo, {{data_vistoria}}</p>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;margin-top:28px">
    <div style="text-align:center">
      <div style="border-top:1px solid #000;padding-top:6px;margin-top:48px">
        <p style="margin:0;font-size:11px;font-weight:700">{{motorista_nome}}</p>
        <p style="margin:0;font-size:10px;color:#555">Motorista — VaideVan</p>
      </div>
    </div>
    <div style="text-align:center">
      <div style="border-top:1px solid #000;padding-top:6px;margin-top:48px">
        <p style="margin:0;font-size:11px;font-weight:700">{{cliente_nome}}</p>
        <p style="margin:0;font-size:10px;color:#555">Cliente</p>
      </div>
    </div>
    <div style="text-align:center">
      <div style="border-top:1px solid #000;padding-top:6px;margin-top:48px">
        <p style="margin:0;font-size:11px;font-weight:700">Responsável Operacional</p>
        <p style="margin:0;font-size:10px;color:#555">VaideVan Transportes Ltda.</p>
      </div>
    </div>
  </div>
  <p style="text-align:center;font-size:10px;color:#888;margin-top:16px">
    OS nº {{numero_os}} · Gerado pela plataforma VaideVan · vaidevan.com
  </p>
</div>

</div>`;

const BODY_TERMO = `<div style="font-family:Arial,sans-serif;max-width:780px;margin:0 auto;color:#111;line-height:1.7">

<div style="text-align:center;border-bottom:3px solid #c00;padding-bottom:16px;margin-bottom:24px">
  <p style="font-size:10px;color:#555;margin:0 0 4px">VaideVan Transportes Ltda. — CNPJ: {{locador_cnpj}} — São Paulo/SP — vaidevan.com</p>
  <h2 style="font-size:19px;font-weight:900;margin:0 0 2px;color:#c00">⚠ TERMO DE RESPONSABILIDADE E CONDUTA</h2>
  <h3 style="font-size:13px;font-weight:700;margin:0;color:#444">Documento de Adesão Obrigatório — Leitura e Assinatura Compulsórias</h3>
</div>

<p style="font-size:13px;background:#fff3cd;padding:12px 16px;border-left:4px solid #F5E642;border-radius:4px;margin-bottom:20px">
  <strong>ATENÇÃO:</strong> Este Termo de Responsabilidade é parte integrante e indissociável de qualquer contrato de prestação de serviços da <strong>VaideVan Transportes Ltda.</strong> A sua assinatura é condição obrigatória para utilização dos serviços. O não cumprimento das disposições aqui contidas implica rescisão imediata do contrato, sem direito a reembolso, além das sanções civis e penais previstas em lei.
</p>

<h3 style="font-size:13px;font-weight:700;border-left:3px solid #333;padding-left:10px;margin:20px 0 10px">IDENTIFICAÇÃO DO USUÁRIO</h3>
<table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:20px">
  <tr style="background:#f8f8f8"><td style="padding:8px 12px;font-weight:700;width:35%">Nome completo</td><td style="padding:8px 12px">{{cliente_nome}}</td></tr>
  <tr><td style="padding:8px 12px;font-weight:700">CPF / CNPJ</td><td style="padding:8px 12px">{{cliente_cpf}}</td></tr>
  <tr style="background:#f8f8f8"><td style="padding:8px 12px;font-weight:700">RG / Documento</td><td style="padding:8px 12px">{{cliente_rg}}</td></tr>
  <tr><td style="padding:8px 12px;font-weight:700">Telefone / WhatsApp</td><td style="padding:8px 12px">{{cliente_telefone}}</td></tr>
  <tr style="background:#f8f8f8"><td style="padding:8px 12px;font-weight:700">Data / Local</td><td style="padding:8px 12px">{{data_assinatura}} — São Paulo/SP</td></tr>
  <tr><td style="padding:8px 12px;font-weight:700">Serviço / Contrato nº</td><td style="padding:8px 12px">{{numero_contrato}}</td></tr>
</table>

<h3 style="font-size:13px;font-weight:700;border-left:4px solid #c00;padding-left:10px;margin:24px 0 10px;color:#c00">I — PROIBIÇÃO DE DROGAS E ENTORPECENTES</h3>
<div style="border:1px solid #fcc;border-radius:6px;padding:14px 16px;background:#fff9f9;margin-bottom:16px">
<p style="font-size:12px;margin:0 0 8px"><strong>Base legal: Lei nº 11.343/2006 — Lei de Drogas</strong></p>
<p style="font-size:12px;margin:0 0 8px">É <strong>terminantemente proibido</strong> portar, transportar, guardar, ter em depósito, carregar ou por qualquer forma manter sob guarda, dentro dos veículos da VaideVan:</p>
<ul style="font-size:12px;margin:0 0 8px;padding-left:20px">
  <li>Drogas ilícitas de qualquer natureza (maconha, cocaína, crack, MDMA, LSD, etc.);</li>
  <li>Substâncias psicoativas não prescritas por médico habilitado;</li>
  <li>Precursores químicos utilizados na fabricação de entorpecentes;</li>
  <li>Equipamentos ou parafernálias relacionados ao uso ou tráfico de drogas.</li>
</ul>
<p style="font-size:12px;margin:0;background:#fdf3f3;padding:8px 10px;border-radius:4px"><strong>Penalidade legal:</strong> O tráfico de drogas é crime inafiançável com pena de <strong>reclusão de 5 a 15 anos e multa</strong> (art. 33, Lei 11.343/2006). O porte para uso pessoal implica advertência, prestação de serviços comunitários ou medida educativa, mas não exime o usuário de responsabilidade civil. A VaideVan comunicará imediatamente às autoridades qualquer suspeita de porte ou tráfico.</p>
</div>

<h3 style="font-size:13px;font-weight:700;border-left:4px solid #c00;padding-left:10px;margin:24px 0 10px;color:#c00">II — PROIBIÇÃO DE ARMAS DE FOGO, MUNIÇÕES E ARMAS BRANCAS</h3>
<div style="border:1px solid #fcc;border-radius:6px;padding:14px 16px;background:#fff9f9;margin-bottom:16px">
<p style="font-size:12px;margin:0 0 8px"><strong>Base legal: Lei nº 10.826/2003 — Estatuto do Desarmamento · Decreto nº 9.846/2019 · Código Penal, arts. 14 e 16</strong></p>
<p style="font-size:12px;margin:0 0 8px">É <strong>terminantemente proibido</strong> portar, transportar ou introduzir nos veículos da VaideVan:</p>
<ul style="font-size:12px;margin:0 0 8px;padding-left:20px">
  <li>Armas de fogo de qualquer calibre ou tipo, com ou sem autorização de porte;</li>
  <li>Munições, projéteis ou acessórios bélicos;</li>
  <li>Armas brancas com lâmina superior a 10 cm ou de uso ofensivo;</li>
  <li>Artefatos explosivos, petardos ou substâncias incendiárias de qualquer natureza.</li>
</ul>
<p style="font-size:12px;margin:0;background:#fdf3f3;padding:8px 10px;border-radius:4px"><strong>Penalidade legal:</strong> Porte ilegal de arma de fogo de uso permitido — <strong>reclusão de 2 a 4 anos e multa</strong> (art. 14, Lei 10.826/2003). Porte de arma de uso restrito — <strong>reclusão de 3 a 6 anos e multa</strong> (art. 16). Comércio ilegal de armas — <strong>reclusão de 6 a 12 anos</strong> (art. 17). <strong>Exceção:</strong> apenas agentes de segurança pública ou privada com autorização legal expressa e comunicação prévia à VaideVan.</p>
</div>

<h3 style="font-size:13px;font-weight:700;border-left:4px solid #c00;padding-left:10px;margin:24px 0 10px;color:#c00">III — BEBIDAS ALCOÓLICAS E SUBSTÂNCIAS PSICOATIVAS</h3>
<div style="border:1px solid #fcc;border-radius:6px;padding:14px 16px;background:#fff9f9;margin-bottom:16px">
<p style="font-size:12px;margin:0 0 8px"><strong>Base legal: art. 165 do CTB (Lei nº 9.503/1997, com redação da Lei nº 12.760/2012) · Resolução CONTRAN nº 432/2013</strong></p>
<p style="font-size:12px;margin:0 0 8px">Regras sobre álcool nos veículos da VaideVan:</p>
<ul style="font-size:12px;margin:0 0 8px;padding-left:20px">
  <li>O <strong>motorista NUNCA</strong> poderá conduzir o veículo sob efeito de álcool ou substâncias psicoativas (tolerância zero — art. 165-A do CTB). O passageiro que pressionar ou induzir o motorista a conduzir embriagado responde solidariamente pelos danos causados (art. 927 do CCB);</li>
  <li>O consumo de bebidas alcoólicas pelos passageiros dentro do veículo somente é permitido com <strong>autorização prévia e expressa por escrito</strong> da VaideVan;</li>
  <li>O usuário que embarcar visivelmente embriagado ou sob efeito de substâncias psicoativas poderá ter o serviço <strong>recusado ou interrompido</strong> sem direito a reembolso, nos termos do art. 13, II, do CDC (Lei nº 8.078/1990).</li>
</ul>
<p style="font-size:12px;margin:0;background:#fdf3f3;padding:8px 10px;border-radius:4px"><strong>Penalidade legal (motorista):</strong> Dirigir sob influência de álcool — infração gravíssima, multa de R$ 2.934,70, suspensão da CNH por 12 meses, apreensão do veículo e possível prisão em flagrante (art. 165 do CTB). <strong>Acidente com vítima sob embriaguez:</strong> reclusão de 2 a 4 anos (art. 306 do CTB) + responsabilidade civil integral.</p>
</div>

<h3 style="font-size:13px;font-weight:700;border-left:4px solid #c00;padding-left:10px;margin:24px 0 10px;color:#c00">IV — PRODUTOS ILÍCITOS, SEM PROCEDÊNCIA OU FALSIFICADOS</h3>
<div style="border:1px solid #fcc;border-radius:6px;padding:14px 16px;background:#fff9f9;margin-bottom:16px">
<p style="font-size:12px;margin:0 0 8px"><strong>Base legal: art. 180 do CP — Receptação · art. 184 do CP — Violação de Direito Autoral · Lei nº 8.137/1990 · Lei nº 9.609/1998 · Decreto-Lei nº 2.848/1940</strong></p>
<p style="font-size:12px;margin:0 0 8px">É <strong>terminantemente proibido</strong> transportar, guardar, esconder ou manter posse nos veículos da VaideVan de:</p>
<ul style="font-size:12px;margin:0 0 8px;padding-left:20px">
  <li>Mercadorias roubadas, furtadas ou de origem desconhecida;</li>
  <li>Produtos sem nota fiscal ou documentação fiscal de origem;</li>
  <li>Mercadorias contrabandeadas ou introduzidas ilegalmente no território nacional;</li>
  <li>Produtos falsificados, pirateados, adulterados ou com marca registrada usurpada;</li>
  <li>Produtos agrícolas, animais silvestres ou substâncias reguladas sem licença (IBAMA/ANVISA/Polícia Federal).</li>
</ul>
<p style="font-size:12px;margin:0;background:#fdf3f3;padding:8px 10px;border-radius:4px"><strong>Penalidade legal:</strong> Receptação dolosa — <strong>reclusão de 1 a 4 anos e multa</strong> (art. 180, CP); receptação qualificada — <strong>reclusão de 3 a 8 anos</strong>. Contrabando/descaminho — <strong>reclusão de 1 a 4 anos</strong> (arts. 334 e 334-A do CP). A VaideVan comunicará imediatamente às autoridades policiais e fiscais qualquer suspeita de porte desses produtos.</p>
</div>

<h3 style="font-size:13px;font-weight:700;border-left:4px solid #333;padding-left:10px;margin:24px 0 10px">V — RESPONSABILIDADE CIVIL E CRIMINAL DO USUÁRIO</h3>
<p style="font-size:12px">5.1 O usuário responde <strong>civil e criminalmente</strong>, de forma exclusiva, integral e irrestrita, por qualquer ato ilícito praticado durante a utilização dos serviços da VaideVan, nos termos dos arts. 186, 187 e 927 do Código Civil Brasileiro (Lei nº 10.406/2002).</p>
<p style="font-size:12px">5.2 A VaideVan Transportes Ltda. não se responsabiliza, em hipótese alguma, por atos ilícitos praticados pelos usuários e colaborará plenamente com Polícia Civil, Polícia Militar, Polícia Federal, Receita Federal, ANVISA, IBAMA e quaisquer outras autoridades competentes.</p>
<p style="font-size:12px">5.3 Todos os veículos da VaideVan possuem rastreamento GPS ativo 24 horas por dia. As rotas percorridas poderão ser utilizadas como prova em procedimentos investigativos, nos termos da Lei nº 9.296/1996 e do Código de Processo Penal.</p>
<p style="font-size:12px">5.4 O usuário que violar quaisquer das disposições deste Termo terá o serviço imediatamente suspenso, sem direito a reembolso, ficando vedada a contratação futura de quaisquer serviços da VaideVan.</p>

<h3 style="font-size:13px;font-weight:700;border-left:4px solid #333;padding-left:10px;margin:24px 0 10px">VI — DISPOSIÇÕES FINAIS</h3>
<p style="font-size:12px">6.1 Este Termo é regido pela legislação da República Federativa do Brasil. Foro eleito: Comarca de São Paulo/SP (art. 63 do CPC).</p>
<p style="font-size:12px">6.2 A assinatura digital possui plena validade jurídica nos termos da MP 2.200-2/2001, da Lei 14.063/2020 e do Decreto 10.543/2020.</p>

<div style="margin:28px 0;background:#c00;color:#fff;padding:14px 20px;border-radius:6px;text-align:center">
  <p style="font-size:13px;font-weight:900;margin:0">DECLARO QUE LI, COMPREENDI E CONCORDO COM TODAS AS DISPOSIÇÕES DESTE TERMO</p>
  <p style="font-size:11px;margin:4px 0 0;opacity:.85">Estou ciente das responsabilidades civis e criminais decorrentes do descumprimento das obrigações acima</p>
</div>

<div style="margin-top:24px;border-top:1px solid #ddd;padding-top:20px">
  <p style="text-align:center;font-size:12px">São Paulo, {{data_assinatura}}</p>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:28px">
    <div style="text-align:center">
      <div style="border-top:2px solid #000;padding-top:8px;margin-top:56px">
        <p style="margin:0;font-weight:700;font-size:12px">{{cliente_nome}}</p>
        <p style="margin:0;font-size:10px;color:#555">CPF: {{cliente_cpf}} — RG: {{cliente_rg}}</p>
        <p style="margin:0;font-size:10px;color:#555">USUÁRIO / RESPONSÁVEL</p>
      </div>
    </div>
    <div style="text-align:center">
      <div style="border-top:2px solid #000;padding-top:8px;margin-top:56px">
        <p style="margin:0;font-weight:700;font-size:12px">VaideVan Transportes Ltda.</p>
        <p style="margin:0;font-size:10px;color:#555">CNPJ: {{locador_cnpj}}</p>
        <p style="margin:0;font-size:10px;color:#555">PRESTADORA DOS SERVIÇOS</p>
      </div>
    </div>
  </div>
  <p style="text-align:center;font-size:10px;color:#888;margin-top:16px">
    Documento nº {{numero_contrato}} · {{data_assinatura}} · Gerado pela plataforma VaideVan · vaidevan.com<br>
    Assinatura digital com validade jurídica — Lei 14.063/2020 · MP 2.200-2/2001 · Decreto 10.543/2020
  </p>
</div>

</div>`;

const TEMPLATE_BODIES: Record<string, string> = {
  locacao: DEFAULT_BODY,
  locacao_cliente: BODY_CLIENTE,
  checklist: BODY_CHECKLIST,
  termo_responsabilidade: BODY_TERMO,
};

function FieldBuilder({ fields, onChange }: { fields: FieldDef[]; onChange: (f: FieldDef[]) => void }) {
  const add = () => onChange([...fields, { key: "", label: "", type: "text", required: false, placeholder: "" }]);
  const del = (i: number) => onChange(fields.filter((_, j) => j !== i));
  const upd = (i: number, k: keyof FieldDef, v: string | boolean) =>
    onChange(fields.map((f, j) => j === i ? { ...f, [k]: v } : f));

  const inp = "bg-background border border-white/10 rounded-lg px-3 py-2 text-white text-xs placeholder-white/30 focus:outline-none focus:border-primary/40 transition-colors w-full";

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-white/50 text-xs font-bold uppercase tracking-wider">Campos do Template</p>
        <button type="button" onClick={add} className="text-primary text-xs font-bold flex items-center gap-1 hover:text-primary/80">
          <Plus className="w-3.5 h-3.5" />Adicionar campo
        </button>
      </div>
      {fields.length === 0 && (
        <p className="text-white/30 text-xs text-center py-3 border border-dashed border-white/10 rounded-xl">
          Nenhum campo configurado. Use variáveis como {"{{campo}}"} no corpo do contrato.
        </p>
      )}
      <div className="flex flex-col gap-2">
        {fields.map((f, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 items-center bg-background/50 rounded-xl p-3 border border-white/5">
            <div className="col-span-3">
              <input className={inp} value={f.key} onChange={e => upd(i, "key", e.target.value)} placeholder="chave (ex: valor)" />
            </div>
            <div className="col-span-3">
              <input className={inp} value={f.label} onChange={e => upd(i, "label", e.target.value)} placeholder="Rótulo" />
            </div>
            <div className="col-span-2">
              <select className={inp} value={f.type} onChange={e => upd(i, "type", e.target.value)}>
                {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="col-span-3">
              <input className={inp} value={f.placeholder} onChange={e => upd(i, "placeholder", e.target.value)} placeholder="Placeholder..." />
            </div>
            <div className="col-span-1 flex items-center justify-end gap-2">
              <label className="flex items-center gap-1 cursor-pointer" title="Obrigatório">
                <input type="checkbox" checked={f.required} onChange={e => upd(i, "required", e.target.checked)} className="accent-primary w-3 h-3" />
                <span className="text-white/30 text-xs">*</span>
              </label>
              <button type="button" onClick={() => del(i)} className="text-red-400/50 hover:text-red-400"><X className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
      {fields.length > 0 && (
        <p className="text-white/20 text-xs mt-2 flex items-center gap-1">
          <Info className="w-3 h-3" />Use {"{{chave}}"} no corpo para referenciar o campo. Variáveis automáticas: {"{{investidor_nome}}, {{cliente_nome}}, {{cliente_cpf}}"} etc.
        </p>
      )}
    </div>
  );
}

function Modal({ tpl, onClose, onSave }: {
  tpl: ApiContractTemplate | null; onClose: () => void;
  onSave: (data: Partial<ApiContractTemplate>, id?: number) => Promise<void>;
}) {
  const [name, setName] = useState(tpl?.name || "");
  const [type, setType] = useState(tpl?.type || "locacao");
  const [description, setDescription] = useState(tpl?.description || "");
  const [body, setBody] = useState(tpl?.body || DEFAULT_BODY);
  const [templateLoaded, setTemplateLoaded] = useState(false);
  const [fields, setFields] = useState<FieldDef[]>(
    Array.isArray(tpl?.fields) ? (tpl.fields as FieldDef[]) : []
  );
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !body.trim()) { setError("Nome e corpo do contrato são obrigatórios"); return; }
    setSaving(true); setError("");
    try { await onSave({ name, type, description, body, fields }, tpl?.id); onClose(); }
    catch (err) { setError(err instanceof Error ? err.message : "Erro ao salvar"); }
    finally { setSaving(false); }
  };

  const inp = "w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-primary/50 transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-card border border-white/10 rounded-3xl w-full max-w-4xl max-h-[94vh] flex flex-col">
        <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="font-black text-white text-lg">{tpl ? "Editar Modelo" : "Novo Modelo de Contrato"}</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={submit} className="flex flex-col flex-1 min-h-0">
          <div className="p-6 flex-shrink-0 space-y-4 border-b border-white/5">
            {error && <p className="text-red-400 text-sm bg-red-400/10 rounded-xl px-4 py-2">{error}</p>}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1 block">Nome do Modelo *</label>
                <input className={inp} value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Contrato de Locação Executiva" required />
              </div>
              <div>
                <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1 block">Tipo</label>
                <select className={inp} value={type} onChange={e => { setType(e.target.value); setTemplateLoaded(false); }}>
                  <optgroup label="— Contratos para Clientes —">
                    <option value="locacao_cliente">Contrato de Serviço — Cliente</option>
                    <option value="checklist">Checklist de Vistoria</option>
                    <option value="termo_responsabilidade">Termo de Responsabilidade</option>
                  </optgroup>
                  <optgroup label="— Contratos de Locação —">
                    <option value="locacao">Locação de Van / Sprinter</option>
                    <option value="locacao_passeio">Locação — Veículo de Passeio</option>
                    <option value="locacao_blindado">Locação — Veículo Blindado</option>
                    <option value="locacao_microonibus">Locação — Microônibus</option>
                    <option value="locacao_onibus">Locação — Ônibus</option>
                    <option value="venda">Venda de Veículo</option>
                  </optgroup>
                  <optgroup label="— Outros —">
                    <option value="investimento">Investimento / Parceria</option>
                    <option value="fretamento">Fretamento Corporativo</option>
                    <option value="prestacao_servicos">Prestação de Serviços</option>
                  </optgroup>
                </select>
                {TEMPLATE_BODIES[type] && !templateLoaded && !tpl && (
                  <button
                    type="button"
                    onClick={() => { setBody(TEMPLATE_BODIES[type]); setTemplateLoaded(true); }}
                    className="mt-1.5 text-primary text-xs font-bold flex items-center gap-1 hover:text-primary/80"
                  >
                    <CheckCircle2 className="w-3 h-3" /> Carregar template padrão para este tipo
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1 block">Descrição</label>
              <input className={inp} value={description} onChange={e => setDescription(e.target.value)} placeholder="Breve descrição do modelo..." />
            </div>
          </div>

          <div className="flex border-b border-white/10 flex-shrink-0">
            {(["edit", "preview"] as const).map(t => (
              <button key={t} type="button" onClick={() => setTab(t)}
                className={`flex-1 py-3 text-sm font-bold transition-colors ${tab === t ? "text-primary border-b-2 border-primary" : "text-white/40 hover:text-white"}`}>
                {t === "edit" ? "Editar HTML" : "Visualizar"}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {tab === "edit" ? (
              <>
                <div>
                  <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1 block">
                    Corpo do Contrato (HTML com variáveis {"{{campo}}"})
                  </label>
                  <textarea
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-mono placeholder-white/30 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                    rows={14}
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    placeholder="Cole o HTML do contrato aqui..."
                    required
                  />
                </div>
                <FieldBuilder fields={fields} onChange={setFields} />
              </>
            ) : (
              <div className="bg-white text-black rounded-2xl p-8 min-h-[300px]">
                <div dangerouslySetInnerHTML={{ __html: body }} className="prose max-w-none text-sm leading-relaxed" />
              </div>
            )}
          </div>

          <div className="border-t border-white/10 p-6 flex gap-3 flex-shrink-0">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-11 rounded-full border-white/20 text-white/70">
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="flex-1 h-11 font-black rounded-full bg-primary text-black hover:bg-primary/90">
              {saving ? "Salvando..." : tpl ? "Salvar Alterações" : "Criar Modelo"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ModelosContrato() {
  const [templates, setTemplates] = useState<ApiContractTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ApiContractTemplate | null | "new">(null);
  const [toast, setToast] = useState("");

  const load = () => {
    setLoading(true);
    api.contractTemplates().then(setTemplates).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const handleSave = async (data: Partial<ApiContractTemplate>, id?: number) => {
    if (id) {
      const updated = await api.updateContractTemplate(id, data);
      setTemplates(p => p.map(t => t.id === id ? updated : t));
      showToast("Modelo atualizado com sucesso");
    } else {
      const created = await api.createContractTemplate(data);
      setTemplates(p => [created, ...p]);
      showToast("Modelo criado com sucesso");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Excluir este modelo? Contratos existentes não serão afetados.")) return;
    await api.deleteContractTemplate(id);
    setTemplates(p => p.filter(t => t.id !== id));
    showToast("Modelo excluído");
  };

  const TYPE_LABELS: Record<string, { label: string; color: string }> = {
    locacao_cliente:      { label: "Contrato Cliente",      color: "#22c55e" },
    checklist:            { label: "Checklist Vistoria",     color: "#3b82f6" },
    termo_responsabilidade: { label: "Termo de Responsab.", color: "#ef4444" },
    locacao:              { label: "Locação Van",            color: "#F5E642" },
    locacao_passeio:      { label: "Locação Passeio",        color: "#1C69D4" },
    locacao_blindado:     { label: "Locação Blindado",       color: "#C8A84B" },
    locacao_microonibus:  { label: "Locação Microônibus",    color: "#E2001A" },
    locacao_onibus:       { label: "Locação Ônibus",         color: "#F7901E" },
    venda:                { label: "Venda de Veículo",       color: "#a855f7" },
    investimento:         { label: "Investimento",           color: "#06b6d4" },
    fretamento:           { label: "Fretamento",             color: "#F5E642" },
    prestacao_servicos:   { label: "Prestação Serviços",     color: "#94a3b8" },
  };

  const QUICK_TEMPLATES = [
    { type: "locacao_cliente",      name: "Contrato de Serviço — Cliente",      description: "Contrato para clientes finais com Termo de Responsabilidade (CCB + CDC)" },
    { type: "checklist",            name: "Checklist de Vistoria",              description: "Vistoria pré/pós viagem com registro fotográfico obrigatório" },
    { type: "termo_responsabilidade", name: "Termo de Responsabilidade",        description: "Termo com leis sobre drogas, armas, álcool e produtos ilícitos" },
  ];

  const createQuickTemplate = async (qt: typeof QUICK_TEMPLATES[number]) => {
    const body = TEMPLATE_BODIES[qt.type];
    if (!body) return;
    try {
      await handleSave({ name: qt.name, type: qt.type, description: qt.description, body, fields: [] });
    } catch { /* handled in handleSave */ }
  };

  return (
    <DashboardLayout>
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-primary text-black font-bold px-5 py-3 rounded-2xl shadow-xl">
          <CheckCircle2 className="w-4 h-4 inline mr-2" />{toast}
        </div>
      )}

      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-white">Modelos de Contrato</h1>
            <p className="text-white/50 mt-1">Crie e edite templates com variáveis preenchíveis e validação Gov.br</p>
          </div>
          <Button onClick={() => setModal("new")} className="h-11 px-5 font-black rounded-full bg-primary text-black hover:bg-primary/90 flex-shrink-0">
            <Plus className="w-4 h-4 mr-2" />Novo Modelo
          </Button>
        </div>

        <div className="bg-card border border-primary/20 rounded-2xl p-4 mb-6 flex gap-3">
          <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm text-white/60 space-y-1">
            <p>Use variáveis <code className="bg-white/10 px-1.5 py-0.5 rounded text-primary text-xs">{"{{nome_do_campo}}"}</code> no corpo HTML para criar campos preenchíveis ao gerar contratos.</p>
            <p>Variáveis automáticas: <code className="bg-white/10 px-1 rounded text-primary/70 text-xs">{"{{investidor_nome}}, {{investidor_cpf}}, {{cliente_nome}}, {{cliente_cpf}}, {{cliente_email}}"}</code></p>
          </div>
        </div>

        {/* Quick Templates */}
        <div className="mb-6">
          <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-3">Templates prontos para clientes</p>
          <div className="grid md:grid-cols-3 gap-3">
            {QUICK_TEMPLATES.map(qt => {
              const already = templates.some(t => t.type === qt.type);
              const info = TYPE_LABELS[qt.type];
              return (
                <div key={qt.type} className="bg-card border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    {info && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: info.color + "22", color: info.color }}>
                        {info.label}
                      </span>
                    )}
                    {already && <span className="text-xs text-green-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Criado</span>}
                  </div>
                  <p className="font-bold text-white text-sm">{qt.name}</p>
                  <p className="text-white/40 text-xs leading-relaxed">{qt.description}</p>
                  <Button
                    onClick={() => createQuickTemplate(qt)}
                    disabled={already}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-bold rounded-xl border-white/10 hover:border-primary/40 mt-auto"
                  >
                    {already ? "Já existe" : <><Plus className="w-3 h-3 mr-1" />Criar template</>}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {loading ? (
          [...Array(2)].map((_, i) => <div key={i} className="h-24 bg-card rounded-2xl mb-3 animate-pulse" />)
        ) : templates.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            <FileEdit className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-bold">Nenhum modelo cadastrado</p>
            <p className="text-sm mt-1">Crie o primeiro modelo de contrato para começar</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {templates.map(t => (
              <div key={t.id} className="bg-card border border-white/10 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileEdit className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-black text-white truncate">{t.name}</p>
                      {TYPE_LABELS[t.type] ? (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: TYPE_LABELS[t.type].color + "22", color: TYPE_LABELS[t.type].color }}>
                          {TYPE_LABELS[t.type].label}
                        </span>
                      ) : (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/5 text-white/40">{t.type}</span>
                      )}
                      {!t.active && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-400/10 text-red-400">Inativo</span>}
                    </div>
                    {t.description && <p className="text-white/40 text-sm truncate">{t.description}</p>}
                    <p className="text-white/25 text-xs">
                      {Array.isArray(t.fields) ? t.fields.length : 0} campo(s) configurado(s)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button onClick={() => setModal(t)} variant="outline" size="sm" className="h-8 px-3 rounded-xl border-white/10 hover:border-primary/40 text-xs font-bold">
                    <Pencil className="w-3.5 h-3.5 mr-1" />Editar
                  </Button>
                  <Button onClick={() => handleDelete(t.id)} variant="outline" size="sm" className="h-8 w-8 p-0 rounded-xl border-red-400/20 hover:border-red-400/50 text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal !== null && (
        <Modal tpl={modal === "new" ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />
      )}
    </DashboardLayout>
  );
}
