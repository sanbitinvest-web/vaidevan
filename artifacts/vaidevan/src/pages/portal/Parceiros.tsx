import { useEffect, useState } from "react";
import { formatCoords } from "@/hooks/useGeolocation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { api, ApiPartner } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  UserPlus, CheckCircle2, Clock, XCircle, Phone, Mail,
  Building2, MapPin, MessageSquare, Trash2, ChevronDown,
  FileText, Eye, ThumbsUp, ThumbsDown, Users2,
} from "lucide-react";

const STATUS_MAP: Record<string, { label: string; cls: string; Icon: React.ElementType }> = {
  novo:       { label: "Novo",       cls: "text-blue-400  bg-blue-400/10",  Icon: Clock },
  contatado:  { label: "Contatado",  cls: "text-yellow-400 bg-yellow-400/10", Icon: Phone },
  aprovado:   { label: "Aprovado",   cls: "text-green-400  bg-green-400/10", Icon: CheckCircle2 },
  recusado:   { label: "Recusado",   cls: "text-red-400    bg-red-400/10",  Icon: XCircle },
};

const TYPE_LABELS: Record<string, string> = {
  investidor: "Investidor", cliente: "Cliente",
  revendedor: "Revendedor", motorista: "Motorista",
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] || STATUS_MAP.novo;
  return (
    <span className={`flex items-center gap-1.5 text-xs font-bold rounded-full px-3 py-1 ${s.cls}`}>
      <s.Icon className="w-3.5 h-3.5" />{s.label}
    </span>
  );
}

function DocStatusControl({ label, url, status, onUpdate }: {
  label: string; url: string | null; status: string;
  onUpdate: (status: string) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const handleDoc = async (s: string) => { setBusy(true); try { await onUpdate(s); } finally { setBusy(false); } };
  if (!url) return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-white/50 text-xs">{label}</span>
      <span className="text-white/20 text-xs italic">Não enviado</span>
    </div>
  );
  return (
    <div className="flex items-center justify-between py-1.5 gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <FileText className="w-3.5 h-3.5 text-white/40 shrink-0" />
        <a href={`/api/storage${url}`} target="_blank" rel="noopener noreferrer"
          className="text-primary/80 hover:text-primary text-xs underline truncate flex items-center gap-1">
          <Eye className="w-3 h-3" />{label}
        </a>
        {status === "aprovado" && <span className="text-green-400 text-xs font-bold">✓</span>}
        {status === "rejeitado" && <span className="text-red-400 text-xs font-bold">✗</span>}
        {status === "pendente" && <span className="text-yellow-400 text-xs font-bold">⏳</span>}
      </div>
      <div className="flex gap-1 shrink-0">
        <button disabled={busy || status === "aprovado"} onClick={() => handleDoc("aprovado")}
          className="p-1 text-green-400/40 hover:text-green-400 disabled:opacity-30 transition-colors" title="Aprovar">
          <ThumbsUp className="w-3.5 h-3.5" />
        </button>
        <button disabled={busy || status === "rejeitado"} onClick={() => handleDoc("rejeitado")}
          className="p-1 text-red-400/40 hover:text-red-400 disabled:opacity-30 transition-colors" title="Rejeitar">
          <ThumbsDown className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function PartnerCard({ partner, onStatusChange, onDocStatusChange, onDelete }: {
  partner: ApiPartner;
  onStatusChange: (id: number, status: string) => Promise<void>;
  onDocStatusChange: (id: number, field: string, status: string) => Promise<void>;
  onDelete: (id: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleStatus = async (status: string) => {
    setUpdating(true);
    try { await onStatusChange(partner.id, status); }
    finally { setUpdating(false); }
  };

  return (
    <div className="bg-card border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-colors">
      <div className="p-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-black text-lg">
            {partner.name[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-black text-white">{partner.name}</p>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/5 text-white/40">
                {TYPE_LABELS[partner.type] || partner.type}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="flex items-center gap-1 text-white/40 text-xs"><Mail className="w-3 h-3" />{partner.email}</span>
              {partner.phone && <span className="flex items-center gap-1 text-white/40 text-xs"><Phone className="w-3 h-3" />{partner.phone}</span>}
              {(partner.city || partner.state) && (
                <span className="flex items-center gap-1 text-white/40 text-xs">
                  <MapPin className="w-3 h-3" />{[partner.city, partner.state].filter(Boolean).join(" – ")}
                </span>
              )}
            </div>
            <div className="mt-2">
              <StatusBadge status={partner.status} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setExpanded(e => !e)}
            className="text-white/30 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-all"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
          <button
            onClick={() => onDelete(partner.id)}
            className="text-red-400/40 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-400/10 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-white/5 px-5 py-4 space-y-4">
          {partner.companyName && (
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="w-4 h-4 text-white/30 flex-shrink-0" />
              <span className="text-white/60">{partner.companyName}</span>
            </div>
          )}
          {partner.cpf && <p className="text-xs text-white/30">CPF: {partner.cpf}</p>}
          {partner.cnpj && <p className="text-xs text-white/30">CNPJ: {partner.cnpj}</p>}
          {partner.message && (
            <div className="bg-background/60 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-primary" />
                <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Mensagem</span>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">{partner.message}</p>
            </div>
          )}
          {partner.howFound && (
            <p className="text-xs text-white/40">Como nos encontrou: <span className="text-white/60">{partner.howFound}</span></p>
          )}
          <p className="text-xs text-white/25">
            Cadastrado em {new Date(partner.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
          </p>

          {/* Documentos */}
          <div className="bg-background/60 rounded-xl p-3 space-y-1">
            <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2">Documentos</p>
            <DocStatusControl
              label="CNH Digital"
              url={partner.cnhUrl}
              status={partner.cnhStatus}
              onUpdate={s => onDocStatusChange(partner.id, "cnhStatus", s)}
            />
            <DocStatusControl
              label="Comprovante de Endereço"
              url={partner.addressProofUrl}
              status={partner.addressProofStatus}
              onUpdate={s => onDocStatusChange(partner.id, "addressProofStatus", s)}
            />
            {partner.selfieUrl && (
              <DocStatusControl
                label="Selfie com Documento"
                url={partner.selfieUrl}
                status={partner.selfieStatus}
                onUpdate={s => onDocStatusChange(partner.id, "selfieStatus", s)}
              />
            )}
            {partner.crlvUrls && partner.crlvUrls.length > 0 && partner.crlvUrls.map((url, i) => (
              <div key={i} className="flex items-center gap-2 py-1">
                <FileText className="w-3.5 h-3.5 text-white/40 shrink-0" />
                <a href={`/api/storage${url}`} target="_blank" rel="noopener noreferrer"
                  className="text-primary/80 hover:text-primary text-xs underline flex items-center gap-1">
                  <Eye className="w-3 h-3" />CRLV Veículo {i + 1}
                </a>
              </div>
            ))}
            {partner.contratoSocialUrl && (
              <div className="flex items-center gap-2 py-1">
                <FileText className="w-3.5 h-3.5 text-white/40 shrink-0" />
                <a href={`/api/storage${partner.contratoSocialUrl}`} target="_blank" rel="noopener noreferrer"
                  className="text-primary/80 hover:text-primary text-xs underline flex items-center gap-1">
                  <Eye className="w-3 h-3" />Contrato Social
                </a>
              </div>
            )}
          </div>

          {/* Referências Comerciais */}
          {partner.commercialRefs && partner.commercialRefs.length > 0 && (
            <div className="bg-background/60 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Users2 className="w-3.5 h-3.5 text-primary" />
                <p className="text-white/40 text-xs font-bold uppercase tracking-wider">Referências Comerciais</p>
              </div>
              <div className="space-y-2">
                {partner.commercialRefs.map((ref, i) => (
                  <div key={i} className="text-xs text-white/60">
                    <span className="font-bold text-white/80">{ref.name}</span> ·{" "}
                    {ref.phone} · {ref.email}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GPS de registro */}
          {partner.registrationGeoLat != null && partner.registrationGeoLng != null ? (
            <div className="flex items-center gap-2 bg-green-400/5 border border-green-400/20 rounded-xl px-3 py-2">
              <MapPin className="w-3.5 h-3.5 text-green-400 shrink-0" />
              <div>
                <p className="text-green-300 text-xs font-bold">📍 Localização de registro</p>
                <p className="text-green-200/60 text-xs font-mono">
                  {formatCoords(partner.registrationGeoLat, partner.registrationGeoLng)}
                  {partner.registrationGeoAccuracy != null && ` · ±${Math.round(partner.registrationGeoAccuracy)}m`}
                </p>
                <a
                  href={`https://maps.google.com/?q=${partner.registrationGeoLat},${partner.registrationGeoLng}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-green-400/60 hover:text-green-400 text-xs underline"
                >
                  Ver no Maps →
                </a>
              </div>
            </div>
          ) : (
            <p className="text-xs text-white/20 italic">Sem localização de registro.</p>
          )}

          <div>
            <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2">Atualizar status</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(STATUS_MAP).map(([key, { label, cls }]) => (
                <button
                  key={key}
                  onClick={() => handleStatus(key)}
                  disabled={updating || partner.status === key}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all disabled:opacity-40 ${
                    partner.status === key
                      ? `${cls} border-transparent`
                      : "border-white/10 text-white/50 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {updating ? "..." : label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Parceiros() {
  const [partners, setPartners] = useState<ApiPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("todos");

  const load = () => {
    setLoading(true);
    api.partners().then(setPartners).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleStatus = async (id: number, status: string) => {
    const updated = await api.updatePartnerStatus(id, status);
    setPartners(p => p.map(x => x.id === id ? { ...x, ...updated } : x));
  };

  const handleDocStatus = async (id: number, field: string, status: string) => {
    const updated = await api.updatePartnerDocStatus(id, field, status);
    setPartners(p => p.map(x => x.id === id ? { ...x, ...updated } : x));
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remover este parceiro?")) return;
    await api.deletePartner(id);
    setPartners(p => p.filter(x => x.id !== id));
  };

  const filtered = filter === "todos" ? partners : partners.filter(p => p.status === filter);

  const counts = {
    todos: partners.length,
    novo: partners.filter(p => p.status === "novo").length,
    contatado: partners.filter(p => p.status === "contatado").length,
    aprovado: partners.filter(p => p.status === "aprovado").length,
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-black text-white flex items-center gap-3">
            <UserPlus className="w-7 h-7 text-primary" />
            Parceiros
          </h1>
          <p className="text-white/50 mt-1">Cadastros recebidos pelo formulário "Seja nosso parceiro"</p>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { key: "todos", label: "Total", count: counts.todos, cls: "text-white", border: "border-white/10" },
            { key: "novo", label: "Novos", count: counts.novo, cls: "text-blue-400", border: "border-blue-400/20" },
            { key: "contatado", label: "Contatados", count: counts.contatado, cls: "text-yellow-400", border: "border-yellow-400/20" },
            { key: "aprovado", label: "Aprovados", count: counts.aprovado, cls: "text-green-400", border: "border-green-400/20" },
          ].map(s => (
            <button
              key={s.key}
              onClick={() => setFilter(s.key)}
              className={`bg-card border ${s.border} rounded-2xl p-5 text-left transition-all ${filter === s.key ? "ring-2 ring-primary/30" : "hover:border-white/20"}`}
            >
              <p className="text-white/50 text-sm">{s.label}</p>
              <p className={`text-3xl font-black ${s.cls}`}>{s.count}</p>
            </button>
          ))}
        </div>

        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-24 bg-card rounded-2xl mb-3 animate-pulse" />)
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-bold">Nenhum parceiro {filter !== "todos" ? `com status "${filter}"` : "cadastrado"}</p>
            <p className="text-sm mt-1">Os cadastros do site aparecerão aqui automaticamente</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(p => (
              <PartnerCard key={p.id} partner={p} onStatusChange={handleStatus} onDocStatusChange={handleDocStatus} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
