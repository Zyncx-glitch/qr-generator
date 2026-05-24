import { useState, useCallback, useEffect, useRef } from "react";
import QRCode from "qrcode";

// ─── Paleta & estilos globales ────────────────────────────────────────────────
const G = {
  bg: "#0a0a0f",
  card: "#13131a",
  border: "#1e1e2e",
  accent: "#00f5a0",
  accent2: "#00d9f5",
  text: "#f0f0ff",
  muted: "#6b6b8a",
  danger: "#ff4d6d",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;800&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: ${G.bg};
    color: ${G.text};
    font-family: 'Syne', sans-serif;
    min-height: 100vh;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: ${G.bg}; }
  ::-webkit-scrollbar-thumb { background: ${G.accent}; border-radius: 2px; }

  .app {
    max-width: 1100px;
    margin: 0 auto;
    padding: 32px 20px 80px;
  }

  /* Header */
  .header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 48px;
  }
  .header-logo {
    width: 48px; height: 48px;
    background: linear-gradient(135deg, ${G.accent}, ${G.accent2});
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; font-weight: 800; color: #000;
    font-family: 'Space Mono', monospace;
    flex-shrink: 0;
  }
  .header-title { font-size: clamp(22px,4vw,32px); font-weight: 800; letter-spacing: -1px; }
  .header-sub { font-size: 13px; color: ${G.muted}; font-family: 'Space Mono', monospace; margin-top: 2px; }
  .badge {
    margin-left: auto;
    background: ${G.accent}22;
    border: 1px solid ${G.accent}55;
    color: ${G.accent};
    font-size: 11px;
    font-family: 'Space Mono', monospace;
    padding: 4px 12px;
    border-radius: 20px;
    white-space: nowrap;
  }

  /* Tabs */
  .tabs {
    display: flex;
    gap: 4px;
    background: ${G.card};
    border: 1px solid ${G.border};
    border-radius: 14px;
    padding: 6px;
    margin-bottom: 28px;
    overflow-x: auto;
  }
  .tab {
    flex: 1;
    padding: 10px 16px;
    border: none;
    background: transparent;
    color: ${G.muted};
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 600;
    border-radius: 10px;
    cursor: pointer;
    transition: all .2s;
    white-space: nowrap;
    display: flex; align-items: center; gap: 6px; justify-content: center;
  }
  .tab:hover { color: ${G.text}; background: ${G.border}; }
  .tab.active {
    background: linear-gradient(135deg, ${G.accent}22, ${G.accent2}22);
    border: 1px solid ${G.accent}44;
    color: ${G.accent};
  }

  /* Main grid */
  .main-grid {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 20px;
    align-items: start;
  }
  @media (max-width: 720px) {
    .main-grid { grid-template-columns: 1fr; }
  }

  /* Card */
  .card {
    background: ${G.card};
    border: 1px solid ${G.border};
    border-radius: 18px;
    padding: 28px;
  }
  .card-title {
    font-size: 14px;
    font-weight: 600;
    color: ${G.muted};
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 20px;
    font-family: 'Space Mono', monospace;
  }

  /* Inputs */
  .field { margin-bottom: 16px; }
  .field label {
    display: block;
    font-size: 12px;
    color: ${G.muted};
    margin-bottom: 6px;
    font-family: 'Space Mono', monospace;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .field input, .field select, .field textarea {
    width: 100%;
    background: ${G.bg};
    border: 1px solid ${G.border};
    border-radius: 10px;
    padding: 12px 14px;
    color: ${G.text};
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    outline: none;
    transition: border .2s;
  }
  .field input:focus, .field select:focus, .field textarea:focus {
    border-color: ${G.accent}88;
    box-shadow: 0 0 0 3px ${G.accent}11;
  }
  .field select option { background: ${G.card}; }
  .field textarea { resize: vertical; min-height: 80px; }
  .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  /* Slider */
  .slider-wrap { display: flex; align-items: center; gap: 12px; }
  .slider-wrap input[type=range] {
    flex: 1;
    -webkit-appearance: none;
    height: 4px;
    background: ${G.border};
    border-radius: 2px;
    outline: none;
    border: none;
    padding: 0;
  }
  .slider-wrap input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px; height: 16px;
    background: ${G.accent};
    border-radius: 50%;
    cursor: pointer;
  }
  .slider-val {
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    color: ${G.accent};
    width: 45px;
    text-align: right;
  }

  /* Color pickers */
  .color-row { display: flex; gap: 12px; }
  .color-field { flex: 1; }
  .color-field label {
    display: block;
    font-size: 11px;
    color: ${G.muted};
    margin-bottom: 6px;
    font-family: 'Space Mono', monospace;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .color-input-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    background: ${G.bg};
    border: 1px solid ${G.border};
    border-radius: 10px;
    padding: 8px 12px;
  }
  .color-input-wrap input[type=color] {
    width: 28px; height: 28px;
    border: none; background: none;
    padding: 0; cursor: pointer;
    border-radius: 6px;
  }
  .color-input-wrap span {
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    color: ${G.muted};
  }

  /* Toggle */
  .toggle-wrap { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
  .toggle {
    width: 40px; height: 22px;
    background: ${G.border};
    border-radius: 11px;
    position: relative;
    cursor: pointer;
    border: none;
    transition: background .2s;
    flex-shrink: 0;
  }
  .toggle.on { background: ${G.accent}; }
  .toggle::after {
    content: '';
    position: absolute;
    width: 16px; height: 16px;
    background: #fff;
    border-radius: 50%;
    top: 3px; left: 3px;
    transition: left .2s;
  }
  .toggle.on::after { left: 21px; }
  .toggle-label { font-size: 13px; color: ${G.muted}; }

  /* Buttons */
  .btn-group { display: flex; gap: 10px; margin-top: 24px; flex-wrap: wrap; }
  .btn {
    flex: 1;
    min-width: 120px;
    padding: 13px 20px;
    border: none;
    border-radius: 12px;
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all .2s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .btn-primary {
    background: linear-gradient(135deg, ${G.accent}, ${G.accent2});
    color: #000;
  }
  .btn-primary:hover { opacity: .85; transform: translateY(-1px); }
  .btn-secondary {
    background: ${G.border};
    color: ${G.text};
    border: 1px solid ${G.border};
  }
  .btn-secondary:hover { border-color: ${G.accent}55; color: ${G.accent}; }
  .btn-ghost {
    background: transparent;
    color: ${G.danger};
    border: 1px solid ${G.danger}33;
  }
  .btn-ghost:hover { background: ${G.danger}11; }
  .btn:disabled { opacity: .4; cursor: not-allowed; transform: none; }

  /* QR Preview */
  .qr-card { position: sticky; top: 20px; }
  .qr-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 20px;
    min-height: 200px;
  }
  .qr-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: #ccc;
    font-size: 13px;
    font-family: 'Space Mono', monospace;
  }
  .qr-placeholder-icon { font-size: 48px; opacity: .3; }
  .qr-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  .qr-type {
    font-size: 11px;
    font-family: 'Space Mono', monospace;
    color: ${G.accent};
    background: ${G.accent}11;
    border: 1px solid ${G.accent}33;
    padding: 3px 10px;
    border-radius: 20px;
  }
  .qr-size { font-size: 11px; color: ${G.muted}; font-family: 'Space Mono', monospace; }

  /* History */
  .history-list { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
  .history-item {
    display: flex;
    align-items: center;
    gap: 12px;
    background: ${G.bg};
    border: 1px solid ${G.border};
    border-radius: 12px;
    padding: 10px 14px;
    cursor: pointer;
    transition: border .2s;
  }
  .history-item:hover { border-color: ${G.accent}44; }
  .history-thumb {
    width: 40px; height: 40px;
    background: #fff;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    overflow: hidden;
  }
  .history-thumb img { width: 36px; height: 36px; }
  .history-info { flex: 1; min-width: 0; }
  .history-type { font-size: 11px; color: ${G.accent}; font-family: 'Space Mono', monospace; }
  .history-val { font-size: 12px; color: ${G.muted}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .history-del {
    background: none;
    border: none;
    color: ${G.muted};
    cursor: pointer;
    font-size: 16px;
    padding: 4px;
    border-radius: 6px;
    transition: color .2s;
  }
  .history-del:hover { color: ${G.danger}; }
  .empty-history {
    text-align: center;
    padding: 20px;
    color: ${G.muted};
    font-size: 12px;
    font-family: 'Space Mono', monospace;
  }

  /* Toast */
  .toast-container {
    position: fixed;
    bottom: 24px;
    right: 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    z-index: 9999;
  }
  .toast {
    background: ${G.card};
    border: 1px solid ${G.accent}55;
    color: ${G.text};
    padding: 12px 18px;
    border-radius: 12px;
    font-size: 13px;
    font-family: 'Space Mono', monospace;
    animation: slideIn .3s ease;
    display: flex; align-items: center; gap: 8px;
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }

  /* Divider */
  .divider {
    border: none;
    border-top: 1px solid ${G.border};
    margin: 20px 0;
  }

  .section-label {
    font-size: 11px;
    color: ${G.muted};
    font-family: 'Space Mono', monospace;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 14px;
  }
`;

// ─── Utilidades ───────────────────────────────────────────────────────────────

function generateQRDataURL(text, size, fgColor, bgColor) {
  return QRCode.toDataURL(text || " ", {
    width: size,
    margin: 2,
    color: { dark: fgColor, light: bgColor },
    errorCorrectionLevel: "M",
  });
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((msg, icon = "✓") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, icon }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2500);
  }, []);
  return { toasts, show };
}

function useHistory() {
  const KEY = "qr_history_v1";
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  });
  const save = useCallback((item) => {
    setHistory((h) => {
      const next = [item, ...h].slice(0, 10);
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);
  const remove = useCallback((id) => {
    setHistory((h) => {
      const next = h.filter((x) => x.id !== id);
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);
  const clear = useCallback(() => {
    setHistory([]); localStorage.removeItem(KEY);
  }, []);
  return { history, save, remove, clear };
}

// ─── Generadores de texto QR ─────────────────────────────────────────────────

function buildWifi(ssid, pass, sec, hidden) {
  return `WIFI:T:${sec};S:${ssid};P:${pass};H:${hidden ? "true" : "false"};;`;
}
function buildVCard(f) {
  return `BEGIN:VCARD\nVERSION:3.0\nFN:${f.name}\nTEL:${f.phone}\nEMAIL:${f.email}\nURL:${f.web}\nORG:${f.company}\nTITLE:${f.role}\nEND:VCARD`;
}
function buildSMS(phone, msg, isWa) {
  return isWa
    ? `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`
    : `sms:${phone}?body=${encodeURIComponent(msg)}`;
}

// ─── Componentes de formulario ────────────────────────────────────────────────

function Field({ label, children }) {
  return <div className="field"><label>{label}</label>{children}</div>;
}

function FormSimple({ onQR }) {
  const [val, setVal] = useState("");
  useEffect(() => { onQR(val || "", "URL/Texto"); }, [val]);
  return (
    <div>
      <Field label="URL o Texto">
        <input placeholder="https://ejemplo.com o cualquier texto…" value={val}
          onChange={e => setVal(e.target.value)} />
      </Field>
    </div>
  );
}

function FormWifi({ onQR }) {
  const [f, setF] = useState({ ssid: "", pass: "", sec: "WPA", hidden: false });
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  useEffect(() => {
    onQR(f.ssid ? buildWifi(f.ssid, f.pass, f.sec, f.hidden) : "", "WiFi");
  }, [f]);
  return (
    <div>
      <Field label="Nombre de la red (SSID)">
        <input placeholder="Mi Red WiFi" value={f.ssid} onChange={set("ssid")} />
      </Field>
      <Field label="Contraseña">
        <input type="password" placeholder="••••••••" value={f.pass} onChange={set("pass")} />
      </Field>
      <Field label="Seguridad">
        <select value={f.sec} onChange={set("sec")}>
          <option value="WPA">WPA/WPA2</option>
          <option value="WEP">WEP</option>
          <option value="nopass">Sin contraseña</option>
        </select>
      </Field>
      <div className="toggle-wrap">
        <button className={`toggle ${f.hidden ? "on" : ""}`}
          onClick={() => setF(p => ({ ...p, hidden: !p.hidden }))} />
        <span className="toggle-label">Red oculta</span>
      </div>
    </div>
  );
}

function FormVCard({ onQR }) {
  const [f, setF] = useState({ name: "", phone: "", email: "", web: "", company: "", role: "" });
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  useEffect(() => { onQR(f.name ? buildVCard(f) : "", "Contacto"); }, [f]);
  return (
    <div>
      <Field label="Nombre completo *"><input placeholder="Ana García" value={f.name} onChange={set("name")} /></Field>
      <div className="field-row">
        <Field label="Teléfono"><input placeholder="+52 55 1234 5678" value={f.phone} onChange={set("phone")} /></Field>
        <Field label="Email"><input placeholder="ana@mail.com" value={f.email} onChange={set("email")} /></Field>
      </div>
      <div className="field-row">
        <Field label="Empresa"><input placeholder="Mi Empresa" value={f.company} onChange={set("company")} /></Field>
        <Field label="Puesto"><input placeholder="CEO" value={f.role} onChange={set("role")} /></Field>
      </div>
      <Field label="Sitio web"><input placeholder="https://miempresa.com" value={f.web} onChange={set("web")} /></Field>
    </div>
  );
}

function FormSMS({ onQR }) {
  const [f, setF] = useState({ phone: "", msg: "", wa: false });
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  useEffect(() => { onQR(f.phone ? buildSMS(f.phone, f.msg, f.wa) : "", f.wa ? "WhatsApp" : "SMS"); }, [f]);
  return (
    <div>
      <div className="toggle-wrap" style={{ marginBottom: 16 }}>
        <button className={`toggle ${f.wa ? "on" : ""}`}
          onClick={() => setF(p => ({ ...p, wa: !p.wa }))} />
        <span className="toggle-label">{f.wa ? "WhatsApp" : "SMS"}</span>
      </div>
      <Field label="Número de teléfono">
        <input placeholder="+52 55 1234 5678" value={f.phone} onChange={set("phone")} />
      </Field>
      <Field label="Mensaje">
        <textarea placeholder="Hola, te contacto desde…" value={f.msg} onChange={set("msg")} />
      </Field>
    </div>
  );
}

// ─── Panel de personalización ─────────────────────────────────────────────────

function Customizer({ size, setSize, fg, setFg, bg, setBg }) {
  return (
    <div>
      <div className="section-label">Personalizar</div>
      <div className="field">
        <label>Tamaño del QR</label>
        <div className="slider-wrap">
          <input type="range" min={150} max={500} value={size}
            onChange={e => setSize(Number(e.target.value))} />
          <span className="slider-val">{size}px</span>
        </div>
      </div>
      <div className="color-row">
        <div className="color-field">
          <label>Color QR</label>
          <div className="color-input-wrap">
            <input type="color" value={fg} onChange={e => setFg(e.target.value)} />
            <span>{fg}</span>
          </div>
        </div>
        <div className="color-field">
          <label>Fondo</label>
          <div className="color-input-wrap">
            <input type="color" value={bg} onChange={e => setBg(e.target.value)} />
            <span>{bg}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────────

const TABS = [
  { id: "url", label: "Simple", icon: "🔗" },
  { id: "wifi", label: "WiFi", icon: "📶" },
  { id: "vcard", label: "Contacto", icon: "👤" },
  { id: "sms", label: "Mensaje", icon: "💬" },
];

export default function App() {
  const [tab, setTab] = useState("url");
  const [qrText, setQrText] = useState("");
  const [qrType, setQrType] = useState("URL/Texto");
  const [qrDataURL, setQrDataURL] = useState(null);
  const [size, setSize] = useState(280);
  const [fg, setFg] = useState("#000000");
  const [bg, setBg] = useState("#ffffff");
  const { toasts, show } = useToast();
  const { history, save, remove, clear } = useHistory();
  // BUG2 FIX: flag para ignorar el primer dispatch del subformulario al montar
  const ignorNextQR = useRef(false);

  useEffect(() => {
    if (!qrText) { setQrDataURL(null); return; }
    generateQRDataURL(qrText, size, fg, bg)
      .then(setQrDataURL)
      .catch(() => setQrDataURL(null));
  }, [qrText, size, fg, bg]);

  const handleQR = useCallback((text, type) => {
    if (ignorNextQR.current) { ignorNextQR.current = false; return; }
    setQrText(text);
    setQrType(type);
  }, []);

  const handleTabChange = useCallback((id) => {
    ignorNextQR.current = true; // ignorar el primer efecto del nuevo formulario
    setTab(id);
    setQrText("");
    setQrDataURL(null);
  }, []);

  const handleDownload = useCallback(async () => {
    if (!qrText) return;
    // BUG3 FIX: siempre generamos desde qrText fresco con dimensiones fijas
    const big = await generateQRDataURL(qrText, 600, fg, bg);
    const a = document.createElement("a");
    a.href = big;
    a.download = `qr_${qrType.toLowerCase().replace(/\//g,"_")}_${Date.now()}.png`;
    a.click();
    // BUG1 FIX: guardamos fullText separado del label de display
    save({
      id: Date.now(),
      type: qrType,
      val: qrText.slice(0, 40),   // solo para mostrar en UI
      fullText: qrText,            // texto completo para regenerar
      dataURL: qrDataURL,
    });
    show("QR descargado ✓", "⬇️");
  }, [qrDataURL, qrText, qrType, fg, bg]);

  const handleCopy = useCallback(async () => {
    if (!qrText) return;
    try {
      // BUG3 FIX: regeneramos a tamaño fijo 512px via canvas para evitar problemas de alpha
      const dataURL = await generateQRDataURL(qrText, 512, fg, bg);
      const img = new Image();
      img.src = dataURL;
      await new Promise(r => { img.onload = r; });
      const canvas = document.createElement("canvas");
      canvas.width = 512; canvas.height = 512;
      const ctx = canvas.getContext("2d");
      // Fondo explícito para evitar transparencia rota
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 512, 512);
      ctx.drawImage(img, 0, 0, 512, 512);
      canvas.toBlob(async (blob) => {
        try {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
          show("¡Copiado al portapapeles!", "📋");
        } catch {
          show("Tu navegador no permite copiar imágenes", "⚠️");
        }
      }, "image/png");
    } catch {
      show("No se pudo copiar el QR", "⚠️");
    }
  }, [qrText, fg, bg]);

  const handleReset = () => { setQrText(""); setQrDataURL(null); };

  // Mapeo de tipo guardado → id de pestaña
  const TYPE_TO_TAB = {
    "URL/Texto": "url",
    "WiFi":      "wifi",
    "Contacto":  "vcard",
    "SMS":       "sms",
    "WhatsApp":  "sms",
  };

  // BUG1 FIX + UX FIX: restaura texto completo Y cambia la pestaña correcta
  const handleHistoryClick = useCallback((item) => {
    const original = item.fullText || item.val;
    const targetTab = TYPE_TO_TAB[item.type] || "url";

    // Cambiar pestaña sin disparar el efecto del formulario nuevo
    ignorNextQR.current = true;
    setTab(targetTab);
    setQrType(item.type);

    // Regenerar QR desde texto completo
    generateQRDataURL(original, size, fg, bg)
      .then(url => {
        setQrDataURL(url);
        setQrText(original);
      })
      .catch(() => show("No se pudo cargar el QR", "⚠️"));
    show(`QR ${item.type} cargado`, "🔄");
  }, [size, fg, bg]);

  return (
    <>
      <style>{css}</style>
      <div className="app">
        {/* Header */}
        <div className="header">
          <div className="header-logo">QR</div>
          <div>
            <div className="header-title">Generador de QR</div>
            <div className="header-sub">// Crea códigos QR en segundos</div>
          </div>
          <div className="badge">100% Gratis</div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {TABS.map(t => (
            <button key={t.id} className={`tab ${tab === t.id ? "active" : ""}`}
              onClick={() => handleTabChange(t.id)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="main-grid">
          {/* Formulario */}
          <div>
            <div className="card">
              <div className="card-title">Datos del QR</div>
              {tab === "url" && <FormSimple onQR={handleQR} />}
              {tab === "wifi" && <FormWifi onQR={handleQR} />}
              {tab === "vcard" && <FormVCard onQR={handleQR} />}
              {tab === "sms" && <FormSMS onQR={handleQR} />}

              <hr className="divider" />
              <Customizer size={size} setSize={setSize} fg={fg} setFg={setFg} bg={bg} setBg={setBg} />

              <div className="btn-group">
                <button className="btn btn-primary" onClick={handleDownload} disabled={!qrDataURL}>
                  ⬇️ Descargar PNG
                </button>
                <button className="btn btn-secondary" onClick={handleCopy} disabled={!qrDataURL}>
                  📋 Copiar
                </button>
                <button className="btn btn-ghost" onClick={handleReset}>
                  ✕ Limpiar
                </button>
              </div>
            </div>

            {/* Historial */}
            {history.length > 0 && (
              <div className="card" style={{ marginTop: 20 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div className="card-title" style={{ marginBottom: 0 }}>Historial</div>
                  <button className="btn btn-ghost" style={{ flex: "none", minWidth: 0, padding: "6px 12px", fontSize: 12 }}
                    onClick={clear}>Limpiar todo</button>
                </div>
                <div className="history-list">
                  {history.map(item => (
                    <div key={item.id} className="history-item" onClick={() => handleHistoryClick(item)}>
                      <div className="history-thumb">
                        {item.dataURL && <img src={item.dataURL} alt="qr" />}
                      </div>
                      <div className="history-info">
                        <div className="history-type">{item.type}</div>
                        <div className="history-val">{item.val}</div>
                      </div>
                      <button className="history-del" onClick={e => { e.stopPropagation(); remove(item.id); }}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* QR Preview */}
          <div className="card qr-card">
            <div className="card-title">Vista previa</div>
            <div className="qr-info">
              <span className="qr-type">{qrType}</span>
              <span className="qr-size">{size}×{size}px</span>
            </div>
            <div className="qr-preview" style={{ background: bg }}>
              {qrDataURL
                ? <img src={qrDataURL} alt="QR Code" style={{ width: Math.min(size, 260), height: Math.min(size, 260) }} />
                : <div className="qr-placeholder">
                    <div className="qr-placeholder-icon">▦</div>
                    <span>Ingresa datos para<br/>generar tu QR</span>
                  </div>
              }
            </div>
            {qrDataURL && (
              <div style={{ fontSize: 11, color: G.muted, fontFamily: "'Space Mono', monospace", textAlign: "center", marginTop: 8 }}>
                ✓ QR listo para usar
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toasts */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className="toast">{t.icon} {t.msg}</div>
        ))}
      </div>
    </>
  );
}
