"use client";

import { useMemo, useState } from "react";
import { matematicaPriorizado, prefijoPorSubnivel } from "@/data/curriculo/priorizado/matematica-egb";

type Nivel = "EGB" | "BGU";

function sugerirSubnivel(nivel: Nivel, gradoStr: string): string {
  const n = parseInt(gradoStr, 10);
  if (nivel === "BGU") return "BGU";

  // EGB (ajusta si tu institución maneja otra división)
  if (!Number.isFinite(n)) return "EGB Preparatoria";
  if (n <= 1) return "EGB Preparatoria";
  if (n >= 2 && n <= 4) return "EGB Elemental";
  if (n >= 5 && n <= 7) return "EGB Media";
  return "EGB Superior";
}

export default function Home() {
  const [asignatura] = useState("Matemática");
  const [nivel, setNivel] = useState<Nivel>("EGB");
  const [grado, setGrado] = useState("1");
  const [unidad, setUnidad] = useState("1");
  const [tema, setTema] = useState("");

  const subnivelesDisponibles = useMemo(() => {
    const keys = Object.keys(matematicaPriorizado.subniveles || {});
    if (nivel === "BGU") {
      return keys.filter(k => k.toLowerCase() === "bgu" || k.toLowerCase().includes("bgu"));
    }
    // EGB
    return keys.filter(k => k.toLowerCase().includes("egb"));
  }, [nivel]);

  const subnivelSugerido = useMemo(() => sugerirSubnivel(nivel, grado), [nivel, grado]);

  const [subnivel, setSubnivel] = useState<string>(() => sugerirSubnivel("EGB", "1"));
  const [destrezaCodigo, setDestrezaCodigo] = useState<string>("");

  // cuando cambia nivel/grado, intenta auto-ajustar subnivel si existe
  useMemo(() => {
    const s = subnivelSugerido;
    if (subnivelesDisponibles.includes(s)) {
      setSubnivel(s);
      setDestrezaCodigo("");
    } else if (subnivelesDisponibles.length) {
      setSubnivel(subnivelesDisponibles[0]);
      setDestrezaCodigo("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subnivelSugerido, subnivelesDisponibles.join("|")]);

  const subData = matematicaPriorizado.subniveles[subnivel];

  const destrezas = useMemo(() => {
    const list = subData?.destrezas ?? [];

    // ✅ doble seguro: filtra por prefijo según el subnivel seleccionado
    const rx = prefijoPorSubnivel(subnivel);
    return rx ? list.filter(d => rx.test(d.codigo)) : list;
  }, [subData, subnivel]);

  const destrezaSeleccionada = useMemo(() => {
    return destrezas.find(d => d.codigo === destrezaCodigo) ?? null;
  }, [destrezas, destrezaCodigo]);

  const objetivoPrincipal = useMemo(() => {
    return (subData?.objetivos && subData.objetivos.length > 0) ? subData.objetivos[0] : null;
  }, [subData]);

  const [duracionTotal, setDuracionTotal] = useState(40);
  const [minE, setMinE] = useState(10);
  const [minR, setMinR] = useState(10);
  const [minC, setMinC] = useState(10);
  const [minA, setMinA] = useState(10);

  const [plan, setPlan] = useState<string>("");

  function generarPlan() {
    const fuente = matematicaPriorizado.fuente;

    const objTxt = objetivoPrincipal
      ? `${objetivoPrincipal.codigo}: ${objetivoPrincipal.descripcion}`
      : "(No hay objetivos cargados en este subnivel)";

    const desTxt = destrezaSeleccionada
      ? `${destrezaSeleccionada.codigo}: ${destrezaSeleccionada.descripcion}`
      : "(No seleccionaste destreza)";

    const inds = (destrezaSeleccionada?.indicadores ?? [])
      .map(i => `- ${i.codigo}: ${i.descripcion}`)
      .join("\n");

    const indicadoresTxt = inds.length ? inds : "- (No hay indicadores cargados para esta destreza)";

    const out =
`PLANIFICACIÓN MICROCURRICULAR (ERCA + DUA) — Currículo Priorizado por Competencias
Área: ${matematicaPriorizado.area}
Fuente: ${fuente}

1) DATOS INFORMATIVOS
- Asignatura: ${asignatura}
- Nivel: ${nivel}
- Grado/Curso: ${grado}
- Unidad: ${unidad}
- Tema: ${tema || "(sin tema)"}
- Subnivel: ${subnivel}

2) OBJETIVO (Currículo)
- ${objTxt}

3) DESTREZA CON CRITERIO DE DESEMPEÑO (Currículo)
- ${desTxt}

4) INDICADORES DE EVALUACIÓN (Currículo)
${indicadoresTxt}

5) TIEMPO
- Duración total: ${duracionTotal} minutos
- Distribución ERCA: E=${minE} | R=${minR} | C=${minC} | A=${minA}

6) ERCA (con apoyos DUA)
E — EXPERIENCIA
- Actividad: situación inicial breve ligada al tema y destreza.
- DUA (Representación): ejemplo visual + material concreto.
- DUA (Acción/Expresión): respuesta oral / escrita / manipulativa.
- DUA (Compromiso): opción A/B de actividad.

R — REFLEXIÓN
- Preguntas guía: ¿qué observaste?, ¿qué te resultó difícil?, ¿qué estrategia usaste?
- DUA: organizador gráfico simple (tabla / esquema).

C — CONCEPTUALIZACIÓN
- Construcción del concepto con ejemplos y contraejemplos.
- DUA: mini-resumen en cartel / audio / mapa.

A — APLICACIÓN
- Ejercicios graduados + reto contextual.
- Evidencia: producto breve (lista de cotejo / rúbrica corta).
`;

    setPlan(out);
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial", maxWidth: 1100 }}>
      <h1>📘 Planificador ERCA Ecuador</h1>
      <p>
        Genera una planificación base con estructura ERCA y apoyos DUA, vinculada al
        Currículo Priorizado por Competencias (Matemática).
      </p>

      <hr />

      <h2>🧑‍🏫 Datos del docente</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <label>
          Asignatura:
          <input value={asignatura} readOnly style={{ width: "100%" }} />
        </label>

        <label>
          Nivel:
          <select value={nivel} onChange={(e) => { setNivel(e.target.value as Nivel); setDestrezaCodigo(""); }} style={{ width: "100%" }}>
            <option value="EGB">EGB</option>
            <option value="BGU">BGU</option>
          </select>
        </label>

        <label>
          Grado / Curso:
          <input value={grado} onChange={(e) => { setGrado(e.target.value); }} style={{ width: "100%" }} />
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
            Subnivel sugerido: {subnivelSugerido}
          </div>
        </label>

        <label>
          Unidad:
          <input value={unidad} onChange={(e) => setUnidad(e.target.value)} style={{ width: "100%" }} />
        </label>
      </div>

      <label style={{ display: "block", marginTop: 12 }}>
        Tema:
        <input value={tema} onChange={(e) => setTema(e.target.value)} style={{ width: "100%" }} placeholder="Ej: fracciones equivalentes" />
      </label>

      <hr />

      <h2>📌 Currículo (Matemática)</h2>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16, alignItems: "start" }}>
        <label>
          Subnivel:
          <select
            value={subnivel}
            onChange={(e) => { setSubnivel(e.target.value); setDestrezaCodigo(""); }}
            style={{ width: "100%" }}
          >
            {subnivelesDisponibles.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
          <div style={{ fontSize: 12, opacity: 0.7 }}>(Se llena desde matematica.json)</div>
        </label>

        <label>
          Destreza (Currículo) — {subnivel}:
          <select
            value={destrezaCodigo}
            onChange={(e) => setDestrezaCodigo(e.target.value)}
            style={{ width: "100%" }}
          >
            <option value="">Selecciona una destreza...</option>
            {destrezas.map((d) => (
              <option key={d.codigo} value={d.codigo}>
                {d.codigo} — {d.descripcion}
              </option>
            ))}
          </select>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
            Seleccionada: {destrezaSeleccionada ? `${destrezaSeleccionada.codigo} — ${destrezaSeleccionada.descripcion}` : "(ninguna)"}
          </div>
        </label>
      </div>

      <hr />

      <h2>⏱️ Tiempo (ERCA)</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 12 }}>
        <label>
          Duración total (min):
          <input type="number" value={duracionTotal} onChange={(e) => setDuracionTotal(parseInt(e.target.value || "0", 10))} style={{ width: "100%" }} />
        </label>
        <label>
          E (min):
          <input type="number" value={minE} onChange={(e) => setMinE(parseInt(e.target.value || "0", 10))} style={{ width: "100%" }} />
        </label>
        <label>
          R (min):
          <input type="number" value={minR} onChange={(e) => setMinR(parseInt(e.target.value || "0", 10))} style={{ width: "100%" }} />
        </label>
        <label>
          C (min):
          <input type="number" value={minC} onChange={(e) => setMinC(parseInt(e.target.value || "0", 10))} style={{ width: "100%" }} />
        </label>
        <label>
          A (min):
          <input type="number" value={minA} onChange={(e) => setMinA(parseInt(e.target.value || "0", 10))} style={{ width: "100%" }} />
        </label>
      </div>

      <div style={{ marginTop: 14 }}>
        <button
          type="button"
          onClick={generarPlan}
          style={{ padding: "10px 16px", border: "2px solid black", fontWeight: 700 }}
        >
          Generar planificación (ERCA + Currículo)
        </button>
      </div>

      <hr />

      <h2>📄 Planificación generada</h2>
      <pre style={{ whiteSpace: "pre-wrap", background: "#f5f5f5", padding: 12, borderRadius: 8 }}>
        {plan || "Aún no se ha generado una planificación."}
      </pre>
    </main>
  );
}
