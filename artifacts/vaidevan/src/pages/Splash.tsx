export default function Splash() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#0A0A0A",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* grade sutil de fundo */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage:
          "linear-gradient(rgba(245,230,66,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(245,230,66,0.035) 1px, transparent 1px)",
        backgroundSize: "52px 52px",
        pointerEvents: "none",
      }} />

      {/* glow amarelo atrás do logo */}
      <div style={{
        position: "absolute",
        top: "34%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 280,
        height: 280,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(245,230,66,0.28) 0%, transparent 68%)",
        pointerEvents: "none",
      }} />

      {/* badge topo */}
      <div style={{
        position: "absolute",
        top: 52,
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(245,230,66,0.1)",
        border: "1px solid rgba(245,230,66,0.3)",
        borderRadius: 99,
        padding: "6px 18px",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.13em",
        color: "#F5E642",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}>
        Marca Registrada · 20+ anos de mercado
      </div>

      {/* LOGOMARCA REAL — mix-blend-mode:lighten apaga o fundo preto */}
      <div style={{
        width: 152,
        height: 152,
        marginBottom: 24,
        position: "relative",
      }}>
        <img
          src="/icons/icon-512x512.png"
          alt="VaideVan logo"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            mixBlendMode: "screen",
          }}
        />
        {/* glow separado pois drop-shadow não funciona bem com mix-blend-mode */}
        <div style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          boxShadow: "0 0 40px 10px rgba(245,230,66,0.2)",
          pointerEvents: "none",
        }} />
      </div>

      {/* wordmark */}
      <div style={{
        fontSize: 54,
        fontWeight: 900,
        color: "#ffffff",
        letterSpacing: "-0.03em",
        lineHeight: 1,
        marginBottom: 10,
      }}>
        Vaide<span style={{ color: "#F5E642" }}>Van</span>
      </div>

      {/* tagline */}
      <div style={{
        fontSize: 14,
        color: "rgba(255,255,255,0.42)",
        fontWeight: 500,
        letterSpacing: "0.05em",
        marginBottom: 44,
        textAlign: "center",
      }}>
        Transporte Executivo · São Paulo
      </div>

      {/* stats */}
      <div style={{
        display: "flex",
        gap: 10,
        marginBottom: 52,
        justifyContent: "center",
      }}>
        {[
          { icon: "🚐", val: "17", label: "Categorias" },
          { icon: "📍", val: "49+", label: "Cidades" },
          { icon: "⭐", val: "5,0", label: "Google" },
        ].map(s => (
          <div key={s.label} style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 14,
            padding: "12px 18px",
            textAlign: "center",
            minWidth: 84,
          }}>
            <div style={{ fontSize: 18, marginBottom: 3 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#F5E642", lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.38)", marginTop: 3, fontWeight: 600, letterSpacing: "0.04em" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* CTA principal */}
      <div style={{
        background: "#F5E642",
        color: "#000",
        borderRadius: 16,
        padding: "16px 44px",
        fontSize: 15,
        fontWeight: 900,
        letterSpacing: "0.01em",
        marginBottom: 12,
        boxShadow: "0 4px 24px rgba(245,230,66,0.25)",
      }}>
        Solicitar Orçamento Grátis
      </div>

      {/* WhatsApp CTA */}
      <div style={{
        background: "rgba(37,211,102,0.1)",
        border: "1px solid rgba(37,211,102,0.28)",
        color: "#25D366",
        borderRadius: 12,
        padding: "10px 28px",
        fontSize: 13,
        fontWeight: 700,
      }}>
        💬 Chat no WhatsApp
      </div>

      {/* rodapé */}
      <div style={{
        position: "absolute",
        bottom: 38,
        left: "50%",
        transform: "translateX(-50%)",
        fontSize: 11,
        color: "rgba(255,255,255,0.18)",
        letterSpacing: "0.09em",
        whiteSpace: "nowrap",
      }}>
        vaidevan.com
      </div>
    </div>
  );
}
