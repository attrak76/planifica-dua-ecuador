"use client";

import { useMemo, useState } from "react";
import { matematicaPriorizado, filtroDestrezasPorSubnivel, type Destreza } from "@/data/curriculo/priorizado/matematica-egb";

type PlanInputs = {
  asignatura: string;
  nivel: "EGB" | "BGU";
  grado: string;
  unidad: string;
  tema: string;

  subnivel: string;
  destrezaCodigo: string;

  duracionTotal: number;
  minE: number;
  minR: number;
  minC: number;
  minA: number;
};

function detectarSubnivelSugerido(nivel: "EGB" | "BGU", gradoStr: string): string {
  const g = parseInt(gradoStr, 10);
  if (nivel === "BGU") return "BGU";

  // EGB: 1=Preparatoria, 2-4=Elemental, 5-7=Media, 8-10=Superior (ajusta si tu institución maneja distinto)
  if (!Number.isFinite(g)) return "EGB Preparatoria";
  if (g <= 1) return "EGB Preparatoria";
  if (g <= 4) return "EGB Elemental";
  if (g <= 7) return "EGB Media";
  return "EGB Superior";
}

function sugerirDistribucionERCA(total: number) {
  const t = Math.max(10, Math.floor(total));
  const base = Math.floor(t / 4);
  let e = base, r = base, c = base, a = base;
  let rem = t - (base * 4);
  while (rem > 0) {
    e++; rem--;
    if (rem <= 0) break;
    r++; rem--;
    if (rem <= 0) break;
    c++; rem--;
    if (rem <= 0) break;
    a++; rem--;
  }
  return { e, r, c, a };
}

export default function Home() {
  const [inputs, setInputs] = useState<PlanInputs>(() => {
    const total = 40;
    const dist = sugerirDistribucionERCA(total);
    return {
      asignatura: "Matemática",
      nivel: "EGB",
      grado: "1",
      unidad: "1",
      tema: "",

      subnivel: "EGB Preparatoria",
      destrezaCodigo: "",

      duracionTotal: total,
      minE: dist.e,
      minR: dist.r,
      minC: dist.c,
      minA: dist.a,
    };
  });

  const subnivelSugerido = useMemo(
    () => detectarSubnivelSugerido(inputs.nivel, inputs.grado),
    [inputs.nivel, inputs.grado]
  );

  const subnivelesDisponibles = useMemo(() => {
    // si estás en EGB, muestra EGB* + BGU (por si quieren ver)
    const keys = Object.keys(matematicaPriorizado.subniveles);
    return keys.length ? keys : ["EGB Preparatoria", "EGB Elemental", "EGB Media", "EGB Superior", "BGU"];
  }, []);

  const destrezasFiltradas: Destreza[] = useMemo(() => {
    const sub = matematicaPriorizado.subniveles[inputs.subnivel];
    if (!sub) return [];
    // ✅ AQUÍ ESTÁ LA CLAVE
    return filtroDestrezasPorSubnivel(inputs.subnivel, sub.destrezas);
  }, [inputs.subnivel]);

  const destrezaSeleccionada = useMemo(() => {
    return destrezasFiltradas.find((d) => d.codigo === inputs.destrezaCodigo) || null;
  }, [destrezasFiltradas, inputs.destrezaCodigo]);

  const objetivosSubnivel = useMemo(() => {
    const sub = matematicaPriorizado.subniveles[inputs.subnivel];
    return sub?.objetivos || [];
  }, [inputs.subnivel]);

  const [planText, setPlanText] = useState<string>("");

  function onChange<K extends keyof PlanInputs>(k: K, v: PlanInputs[K]) {
    setInputs((prev) => ({ ...prev, [k]: v }));
  }

  function generarPlan() {
    if (!destrezaSeleccionada) {
      setPlanText("⚠️ Selecciona una destreza del currículo para generar la planificación.");
      return;
    }

    const objetivosTxt = objetivosSubnivel
      .map((o) => `- ${o.codigo}: ${o.descripcion}`)
      .join("\n");

    const indicadoresTxt = (destrezaSeleccionada.indicadores || [])
      .map((i) => `- ${i.codigo}: ${i.descripcion}`)
      .join("\n");

    const txt = `
PLANIFICACIÓN MICROCURRICULAR (ERCA + DUA) — Currículo Priorizado por Competencias (Matemática)

ÁREA: ${matematicaPriorizado.area}
FUENTE: ${matematicaPriorizado.fuente}
SUBNIVEL: ${inputs.subnivel}

1) DATOS INFORMATIVOS
- Asignatura: ${inputs.asignatura}
- Nivel: ${inputs.nivel}
- Grado/Curso: ${inputs.grado}
- Unidad: ${inputs.unidad}
- Tema: ${inputs.tema || "-"}

2) OBJETIVOS DEL SUBNIVEL
${objetivosTxt || "- (Sin objetivos cargados)"}

3) DESTREZA CON CRITERIO DE DESEMPEÑO (Currículo)
- ${destrezaSeleccionada.codigo}: ${destrezaSeleccionada.descripcion}

4) INDICADORES DE EVALUACIÓN
${indicadoresTxt || "- (Sin indicadores cargados)"}

5) TIEMPO (ERCA)
- Duración total: ${inputs.duracionTotal} min
- Distribución: E=${inputs.minE} | R=${inputs.minR} | C=${inputs.minC} | A=${inputs.minA}

6) ERCA (con apoyos DUA) — BORRADOR BASE
E — EXPERIENCIA:
- Actividad inicial breve conectada al tema/destreza.
- DUA (Representación): apoyos visuales + ejemplos concretos.
- DUA (Acción/Expresión): opciones (oral/escrito/dibujo/manipulativo).
- DUA (Compromiso): elección entre 2 alternativas.

R — REFLEXIÓN:
- Preguntas guía: ¿qué observaste?, ¿qué te resultó difícil?, ¿qué estrategia usaste?
- DUA: organizadores gráficos simples / lista de ideas / audio breve.

C — CONCEPTUALIZACIÓN:
- Construcción del concepto con ejemplos y contraejemplos.
- DUA: explicación multimodal + práctica guiada.

A — APLICACIÓN:
- Resolución de 2–3 ejercicios/problemas contextualizados.
- DUA: niveles de apoyo (andamiaje) y reto.
`.trim();

    setPlanText(txt);
  }

  // cuando cambias subnivel, resetea destreza para evitar selecciones inválidas
  function onSubnivelChange(newSub: string) {
    onChange("subnivel", newSub);
    onChange("destrezaCodigo", "");
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>📘 Planificador ERCA Ecuador</h1>
      <p>
        Genera una planificación base con estructura <b>ERCA</b> y apoyos <b>DUA</b>, vinculada al{" "}
        <b>Currículo Priorizado por Competencias</b> (Matemática).
      </p>

      <hr />

      <h2>👩‍🏫 Datos del docente</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", maxWidth: 900 }}>
        <label>
          Asignatura:
          <input
            value={inputs.asignatura}
            onChange={(e) => onChange("asignatura", e.target.value)}
            style={{ width: "100%" }}
          />
        </label>

        <label>
          Nivel:
          <select value={inputs.nivel} onChange={(e) => onChange("nivel", e.target.value as any)} style={{ width: "100%" }}>
            <option value="EGB">EGB</option>
            <option value="BGU">BGU</option>
          </select>
        </label>

        <label>
          Grado / Curso:
          <input value={inputs.grado} onChange={(e) => onChange("grado", e.target.value)} style={{ width: "100%" }} />
        </label>

        <label>
          Unidad:
          <input value={inputs.unidad} onChange={(e) => onChange("unidad", e.target.value)} style={{ width: "100%" }} />
        </label>

        <label style={{ gridColumn: "1 / -1" }}>
          Tema:
          <input
            placeholder="Ej: fracciones equivalentes"
            value={inputs.tema}
            onChange={(e) => onChange("tema", e.target.value)}
            style={{ width: "100%" }}
          />
        </label>
      </div>

      <p style={{ marginTop: 6, fontSize: 13, color: "#444" }}>
        Subnivel sugerido: <b>{subnivelSugerido}</b>
      </p>

      <hr />

      <h2>📌 Currículo (Matemática)</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem", maxWidth: 1100 }}>
        <label>
          Subnivel:
          <select value={inputs.subnivel} onChange={(e) => onSubnivelChange(e.target.value)} style={{ width: "100%" }}>
            {subnivelesDisponibles.map((sn) => (
              <option key={sn} value={sn}>
                {sn}
              </option>
            ))}
          </select>
          <div style={{ fontSize: 12, color: "#666" }}>(Se llena desde matematica.json)</div>
        </label>

        <label>
          Destreza (Currículo) — <b>{inputs.subnivel}</b>:
          <select
            value={inputs.destrezaCodigo}
            onChange={(e) => onChange("destrezaCodigo", e.target.value)}
            style={{ width: "100%" }}
          >
            <option value="">Selecciona una destreza...</option>
            {destrezasFiltradas.map((d) => (
              <option key={d.codigo} value={d.codigo}>
                {d.codigo} — {d.descripcion}
              </option>
            ))}
          </select>

          <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
            Seleccionada: {destrezaSeleccionada ? <b>{destrezaSeleccionada.codigo}</b> : <b>(ninguna)</b>}
          </div>
        </label>
      </div>

      <hr />

      <h2>⏱️ Tiempo (ERCA)</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: "1rem", maxWidth: 900 }}>
        <label>
          Duración total (min):
          <input
            type="number"
            value={inputs.duracionTotal}
            onChange={(e) => onChange("duracionTotal", Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </label>

        <label>
          E (min):
          <input type="number" value={inputs.minE} onChange={(e) => onChange("minE", Number(e.target.value))} style={{ width: "100%" }} />
        </label>

        <label>
          R (min):
          <input type="number" value={inputs.minR} onChange={(e) => onChange("minR", Number(e.target.value))} style={{ width: "100%" }} />
        </label>

        <label>
          C (min):
          <input type="number" value={inputs.minC} onChange={(e) => onChange("minC", Number(e.target.value))} style={{ width: "100%" }} />
        </label>

        <label>
          A (min):
          <input type="number" value={inputs.minA} onChange={(e) => onChange("minA", Number(e.target.value))} style={{ width: "100%" }} />
        </label>
      </div>

      <p style={{ fontSize: 12, color: "#666" }}>
        Sugerencia: E=10 | R=10 | C=10 | A=10 (ajusta según tu clase)
      </p>

      <button
        type="button"
        onClick={generarPlan}
        style={{ padding: "10px 14px", border: "2px solid #000", background: "#fff", cursor: "pointer" }}
      >
        Generar planificación (ERCA + Currículo)
      </button>

      <hr />

      <h2>📄 Planificación generada</h2>
      <pre style={{ whiteSpace: "pre-wrap", background: "#f5f5f5", padding: "1rem", borderRadius: 6 }}>
        {planText || "Aún no se ha generado una planificación."}
      </pre>
    </main>
  );
}
