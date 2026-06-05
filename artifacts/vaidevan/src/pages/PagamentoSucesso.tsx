import { useParams } from "wouter";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { CheckCircle2, ArrowLeft, Phone } from "lucide-react";

export default function PagamentoSucesso() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  return (
    <>
      <Helmet>
        <title>{`Pagamento Confirmado — Reserva #${id} — VaideVan`}</title>
      </Helmet>
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-sm w-full">
          {/* Ícone de sucesso */}
          <div className="w-24 h-24 bg-green-400/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-green-400/20">
            <CheckCircle2 className="w-12 h-12 text-green-400" />
          </div>

          {/* Mensagem */}
          <h1 className="text-3xl font-black text-white mb-3">Pagamento Confirmado!</h1>
          <p className="text-white/60 mb-2">
            Protocolo <span className="text-primary font-black">#{id}</span>
          </p>
          <p className="text-white/50 text-sm leading-relaxed mb-8">
            Recebemos seu pagamento com sucesso. Nossa equipe confirmará sua reserva em breve e você receberá todas as informações pelo WhatsApp e e-mail.
          </p>

          {/* CTA WhatsApp */}
          <a
            href={`https://wa.me/5511999294694?text=Olá!%20Acabei%20de%20pagar%20a%20reserva%20%23${id}.%20Aguardo%20confirmação.`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white font-black rounded-full h-12 px-7 text-sm transition-colors shadow-[0_0_20px_rgba(37,211,102,0.2)] mb-4 w-full justify-center"
          >
            <Phone className="w-4 h-4" /> Confirmar pelo WhatsApp
          </a>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao site
          </Link>
        </div>
      </div>
    </>
  );
}
