import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { api } from "@/lib/api";
import {
  MapPin, Navigation, Plus, Pencil, Trash2, Phone, RefreshCw,
  Wifi, WifiOff, Clock, Car, ExternalLink, Shield, ChevronDown, ChevronRight,
  CheckCircle2, X, Eye, EyeOff,
} from "lucide-react";

type Driver = {
  id: number; name: string; phone: string; trackerUrl: string | null;
  status: string; notes: string | null; active: boolean; createdAt: string;
};
type ActiveEntry = {
  trip: { id: number; vehiclePlate: string | null; vehicleModel: string | null; trackerUrl: string | null; startedAt: string };
  driver: { id: number; name: string; phone: string } | null;
  lastLocation: { lat: number; lng: number; accuracy: number | null; speed: number | null; timestamp: string } | null;
};

function fmtPhone(p: string) {
  const d = p.replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  return p;
}
function ago(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s atrás`;
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
  return `${Math.floor(diff / 3600)}h atrás`;
}

export default function AdminRastreamento() {
  const [active, setActive] = useState<ActiveEntry[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [tab, setTab] = useState<"live" | "drivers">("live");
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editDriver, setEditDriver] = useState<Driver | null>(null);
  const [showPin, setShowPin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", pin: "", trackerUrl: "", notes: "" });
  const [formError, setFormError] = useState("");

  const loadActive = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await api.trackingActive();
      setActive(data);
    } catch { /* silent */ }
    finally { setRefreshing(false); }
  }, []);

  const loadDrivers = useCallback(async () => {
    try { setDrivers(await api.trackingDrivers()); } catch { /* silent */ }
  }, []);

  useEffect(() => { loadActive(); loadDrivers(); }, []);
  useEffect(() => {
    const id = setInterval(loadActive, 30_000);
    return () => clearInterval(id);
  }, [loadActive]);

  function openCreate() {
    setEditDriver(null);
    setForm({ name: "", phone: "", pin: "", trackerUrl: "", notes: "" });
    setFormError("");
    setShowPin(false);
    setShowForm(true);
  }
  function openEdit(d: Driver) {
    setEditDriver(d);
    setForm({ name: d.name, phone: d.phone, pin: "", trackerUrl: d.trackerUrl ?? "", notes: d.notes ?? "" });
    setFormError("");
    setShowPin(false);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name || !form.phone) { setFormError("Nome e telefone são obrigatórios"); return; }
    if (!editDriver && !form.pin) { setFormError("PIN é obrigatório para novo motorista"); return; }
    setSaving(true); setFormError("");
    try {
      if (editDriver) {
        await api.updateTrackingDriver(editDriver.id, {
          name: form.name, phone: form.phone,
          pin: form.pin || undefined,
          trackerUrl: form.trackerUrl || null,
          notes: form.notes || null,
        });
      } else {
        await api.createTrackingDriver({ name: form.name, phone: form.phone, pin: form.pin, trackerUrl: form.trackerUrl || null, notes: form.notes || null });
      }
      setShowForm(false);
      loadDrivers();
    } catch (err: any) {
      setFormError(err.message || "Erro ao salvar");
    } finally { setSaving(false); }
  }

  async function handleDelete(d: Driver) {
    if (!confirm(`Desativar motorista ${d.name}?`)) return;
    try { await api.deleteTrackingDriver(d.id); loadDrivers(); } catch { /* silent */ }
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white">Rastreamento de Motoristas</h1>
            <p className="text-white/40 text-sm mt-1">GPS em tempo real · Links de rastreadores · Gestão de motoristas</p>
          </div>
          <button onClick={loadActive} disabled={refreshing} className="flex items-center gap-2 bg-white/5 border border-white/10 text-white/60 rounded-xl px-4 py-2.5 text-sm hover:bg-white/10 transition-all disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Atualizar
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: "live", label: `Ativos (${active.length})`, icon: Navigation },
            { id: "drivers", label: `Motoristas (${drivers.filter(d => d.active).length})`, icon: Shield },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === id ? "bg-primary text-black" : "bg-white/5 border border-white/10 text-white/60 hover:text-white"}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ─── Live ─── */}
        {tab === "live" && (
          <>
            {active.length === 0 ? (
              <div className="text-center py-20 text-white/30">
                <Navigation className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="font-bold">Nenhum motorista ativo no momento</p>
                <p className="text-sm mt-1">Quando um motorista iniciar uma viagem, aparecerá aqui.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {active.map(entry => {
                  const loc = entry.lastLocation;
                  const isExpanded = expanded === entry.trip.id;
                  const secAgo = loc ? Math.floor((Date.now() - new Date(loc.timestamp).getTime()) / 1000) : null;
                  const fresh = secAgo != null && secAgo < 90;
                  return (
                    <div key={entry.trip.id} className="bg-white/4 border border-white/10 rounded-2xl overflow-hidden">
                      <button
                        className="w-full text-left p-5 flex items-center gap-4"
                        onClick={() => setExpanded(isExpanded ? null : entry.trip.id)}
                      >
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 rounded-xl bg-white/8 flex items-center justify-center text-white font-black text-lg">
                            {entry.driver?.name?.[0] ?? "?"}
                          </div>
                          <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#0A0A0A] ${fresh ? "bg-green-400" : "bg-white/30"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-black">{entry.driver?.name ?? "Motorista"}</span>
                            {entry.trip.vehiclePlate && (
                              <span className="text-xs bg-white/10 text-white/60 font-mono rounded px-2 py-0.5">{entry.trip.vehiclePlate}</span>
                            )}
                          </div>
                          <div className="text-white/40 text-xs mt-0.5 flex items-center gap-3">
                            <span>{entry.trip.vehicleModel || "Veículo não informado"}</span>
                            {loc && <span className={`flex items-center gap-1 ${fresh ? "text-green-400" : "text-white/30"}`}>
                              {fresh ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                              {ago(loc.timestamp)}
                            </span>}
                          </div>
                        </div>
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-white/30 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-white/30 flex-shrink-0" />}
                      </button>

                      {isExpanded && (
                        <div className="px-5 pb-5 border-t border-white/8 pt-4 space-y-3">
                          {loc ? (
                            <div className="bg-black/30 rounded-xl p-4 space-y-2">
                              <div className="flex items-center gap-2 text-green-400 text-sm font-bold mb-2">
                                <MapPin className="w-4 h-4" />
                                Última localização GPS
                              </div>
                              <p className="text-white/60 text-xs font-mono">{loc.lat.toFixed(6)}, {loc.lng.toFixed(6)}</p>
                              {loc.accuracy != null && <p className="text-white/30 text-xs">Precisão: ±{Math.round(loc.accuracy)}m</p>}
                              {loc.speed != null && <p className="text-white/30 text-xs">Velocidade: {Math.round(loc.speed * 3.6)} km/h</p>}
                              <p className="text-white/20 text-xs">{new Date(loc.timestamp).toLocaleString("pt-BR")}</p>
                              <a
                                href={`https://maps.google.com/?q=${loc.lat},${loc.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-primary text-xs font-bold hover:underline mt-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Abrir no Google Maps
                              </a>
                            </div>
                          ) : (
                            <div className="bg-white/4 rounded-xl p-4 text-white/30 text-sm text-center">Ainda não há ping de localização GPS.</div>
                          )}

                          {(entry.trip.trackerUrl || entry.driver) && (() => {
                            const url = entry.trip.trackerUrl;
                            return url ? (
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 hover:bg-primary/20 transition-all"
                              >
                                <Navigation className="w-4 h-4 text-primary flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-primary font-bold text-sm">Abrir Rastreador do Veículo</p>
                                  <p className="text-primary/50 text-xs truncate">{url}</p>
                                </div>
                                <ExternalLink className="w-4 h-4 text-primary/60" />
                              </a>
                            ) : null;
                          })()}

                          <div className="flex gap-2">
                            {entry.driver?.phone && (
                              <a
                                href={`https://wa.me/55${entry.driver.phone.replace(/\D/g, "")}?text=${encodeURIComponent("VaideVan Central: precisamos de uma atualização da sua localização.")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-2 bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] font-bold rounded-xl py-2.5 text-sm hover:bg-[#25D366]/20 transition-all"
                              >
                                <Phone className="w-4 h-4" />
                                WhatsApp Motorista
                              </a>
                            )}
                            <div className="flex items-center gap-2 text-white/30 text-xs px-2">
                              <Clock className="w-3 h-3" />
                              {ago(entry.trip.startedAt)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ─── Motoristas ─── */}
        {tab === "drivers" && (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-white/40 text-sm">{drivers.filter(d => d.active).length} motoristas ativos</p>
              <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-black font-black rounded-xl px-4 py-2.5 text-sm hover:bg-primary/90 transition-all">
                <Plus className="w-4 h-4" />
                Novo Motorista
              </button>
            </div>

            {drivers.length === 0 ? (
              <div className="text-center py-20 text-white/30">
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="font-bold">Nenhum motorista cadastrado</p>
                <p className="text-sm mt-1">Clique em "Novo Motorista" para adicionar o primeiro.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {drivers.map(d => (
                  <div key={d.id} className={`bg-white/4 border rounded-2xl p-4 flex items-center gap-4 ${d.active ? "border-white/10" : "border-white/5 opacity-50"}`}>
                    <div className="w-10 h-10 rounded-xl bg-white/8 flex items-center justify-center text-white font-black">
                      {d.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">{d.name}</span>
                        {!d.active && <span className="text-xs bg-red-500/20 text-red-400 rounded-full px-2 py-0.5">Inativo</span>}
                      </div>
                      <p className="text-white/40 text-sm">{fmtPhone(d.phone)}</p>
                      {d.trackerUrl && (
                        <a href={d.trackerUrl} target="_blank" rel="noopener noreferrer" className="text-primary/60 text-xs hover:text-primary flex items-center gap-1 mt-0.5">
                          <Navigation className="w-3 h-3" />
                          Rastreador vinculado
                        </a>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(d)} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(d)} className="w-9 h-9 rounded-xl bg-red-500/5 border border-red-500/20 flex items-center justify-center text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ─── Modal de motorista ─── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-white">{editDriver ? "Editar Motorista" : "Novo Motorista"}</h2>
              <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              {[
                { label: "Nome", key: "name", placeholder: "João Silva", type: "text" },
                { label: "Telefone (WhatsApp)", key: "phone", placeholder: "11999990000", type: "tel" },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1.5 block">{f.label}</label>
                  <input
                    type={f.type}
                    value={(form as any)[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary/60"
                  />
                </div>
              ))}

              <div>
                <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1.5 block">PIN {editDriver ? "(deixe vazio para manter)" : ""}</label>
                <div className="relative">
                  <input
                    type={showPin ? "text" : "password"}
                    inputMode="numeric"
                    maxLength={6}
                    value={form.pin}
                    onChange={e => setForm(prev => ({ ...prev, pin: e.target.value.replace(/\D/g, "") }))}
                    placeholder={editDriver ? "Novo PIN (4-6 dígitos)" : "PIN de acesso (4-6 dígitos)"}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary/60 font-mono tracking-widest pr-12"
                  />
                  <button type="button" onClick={() => setShowPin(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1.5 block">Link do Rastreador (opcional)</label>
                <input
                  type="url"
                  value={form.trackerUrl}
                  onChange={e => setForm(prev => ({ ...prev, trackerUrl: e.target.value }))}
                  placeholder="https://ruhavik.gurtam.space/units/..."
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary/60 text-sm"
                />
                <p className="text-white/25 text-xs mt-1">URL do rastreador físico instalado no veículo (Gurtam, Wialon, Omnilink, etc.)</p>
              </div>

              <div>
                <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1.5 block">Observações (opcional)</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Informações adicionais sobre o motorista..."
                  rows={2}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary/60 text-sm resize-none"
                />
              </div>

              {formError && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                  <X className="w-4 h-4 flex-shrink-0" />
                  {formError}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 bg-white/5 border border-white/10 text-white/60 font-bold rounded-xl py-3 hover:bg-white/10 transition-all">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-primary text-black font-black rounded-xl py-3 hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {saving
                  ? <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  : <><CheckCircle2 className="w-4 h-4" />Salvar</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
