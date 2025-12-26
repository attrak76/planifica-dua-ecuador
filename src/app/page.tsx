"use client";

import { useMemo, useState } from "react";
import { matematicaPriorizado } from "@/data/curriculo/priorizado/matematica-egb";
type PlanInputs = {
  asignatura: string;
  nivel: "EGB" | "BGU";
  grado: string;
  unidad: string;
  tema: string;

  // Selecciones de currículo
  subnivel: string;
  destrezaCodigo: string;

  // Tiempo ERCA
  duracionTotal: number;
  minE: number;
  minR: number;
  minC: number;
  minA: number;
};

function detectarSubnivelPorGrado(nivel: "EGB" | "BGU", gradoStr: string) {
  const n = parseInt(gradoStr, 10);
  if (nivel === "BGU") return "BGU";
  // EGB (1 a 10). Ajusta si tu institución usa otra forma.
  if (!Number.isFinite(n)) return "EGB Media";
  if (n <= 1) return "EGB Preparatoria";
  if (n >= 2 && n <= 4) return "EGB Elemental";
  if (n >= 5 && n <= 7) return "EGB Media";
  return "EGB Superior";
}

function clampMin(v: number) {
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.floor(v));
}

export default function Home() {
  const [inputs, setInputs] = useState<PlanInputs>({
    asignatura: "Matemática",
    nivel: "EGB",
    grado: "7",
    unidad: "2",
    tema: "fracciones equivalentes",

    subnivel: "EGB Media",
    destrezaCodigo: "",

    duracionTotal: 40,
    minE: 10,
    minR: 10,
    minC: 10,
    minA: 10,
  });

  const subnivelesDisponibles = useMemo(() => {
    const keys = Object.keys(matematicaPriorizado.subniveles);
    // Si eliges BGU, mostramos solo BGU; si EGB, mostramos los EGB*
    if (inputs.nivel === "BGU") return keys.filter((k) => k === "BGU");
    return keys.filter((k) => k.startsWith("EGB "));
  }, [inputs.nivel]);

  // Auto-detección de subnivel cuando cambia grado o nivel
  const subnivelDetectado = useMemo(() => {
    return detectarSubnivelPorGrado(inputs.nivel, inputs.grado);
  }, [inputs.nivel, inputs.grado]);

  const subnivelFinal = useMemo(() => {
    // Si el usuario eligió un subnivel válido, respeta su selección
    if (subnivelesDisponibles.includes(inputs.subnivel)) return inputs.subnivel;
    return subnivelDetectado;
  }, [inputs.subnivel, subnivelDetectado, subnivelesDisponibles]);

  const dataSubnivel = matematicaPriorizado.subniveles[subnivelFinal];

  const destrezasDelSubnivel = dataSubnivel?.destrezas ?? [];

  // Si no hay destreza seleccionada, toma la primera disponible
  const destrezaSeleccionada: Destreza | undefined = useMemo(() => {
    if (!destrezasDelSubnivel.length) return undefined;
    const found = destrezasDelSubnivel.find((d) => d.codigo === inputs.destrezaCodigo);
    return found ?? destrezasDelSubnivel[0];
  }, [destrezasDelSubnivel, inputs.destrezaCodigo]);

  const objetivoCurricular = useMemo(() => {
    if (!dataSubnivel?.objetivos?.length) return null;
    // por simplicidad tomamos el primero; si quieres, puedes elegirlo con otro <select>
    return dataSubnivel.objetivos[0];
  }, [dataSubnivel]);

  const [plan, setPlan] = useState<string>("");

  function setField<K extends keyof PlanInputs>(key: K, value: PlanInputs[K]) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  function generarPlan() {
    const dTotal = clampMin(inputs.duracionTotal);
    const e = clampMin(inputs.minE);
    const r = clampMin(inputs.minR);
    const c = clampMin(inputs.minC);
    const a = clampMin(inputs.minA);

    const dest = destrezaSeleccionada;

    const objetivoTxt = objetivoCurricular
      ? `- ${objetivoCurricular.codigo}: ${objetivoCurricular.descripcion}`
      : "- (Sin objetivo cargado todavía para este subnivel)";

    const destrezaTxt = dest
      ? `- ${dest.codigo}: ${dest.descripcion}`
      : "- (Sin destreza seleccionada / sin destrezas cargadas)";

    const indicadoresTxt = dest?.indicadores?.length
      ? dest.indicadores
          .map((i) => `- ${i.codigo}: ${i.descripcion}`)
          .join("\n")
      : "- (Sin indicadores cargados para esta destreza)";

    const texto = `PLANIFICACIÓN MICROCURRICULAR (ERCA + DUA) — Currículo Priorizado (vigente)

Área: ${matematicaPriorizado.area}
Subnivel: ${subnivelFinal}

1) DATOS INFORMATIVOS
- Asignatura: ${inputs.asignatura}
- Nivel: ${inputs.nivel}
- Grado/Curso: ${inputs.grado}
- Unidad: ${inputs.unidad}
- Tema: ${inputs.tema}

2) OBJETIVO (Currículo)
${objetivoTxt}

3) DESTREZA CON CRITERIO DE DESEMPEÑO (Currículo)
${destrezaTxt}

4) INDICADORES DE EVALUACIÓN (Currículo)
${indicadoresTxt}

5) TIEMPO
- Duración total: ${dTotal} min
- Distribución ERCA: E=${e} | R=${r} | C=${c} | A=${a}

6) ERCA + DUA (borrador generado)
E — EXPERIENCIA (con apoyos DUA)
- Actividad de inicio: situación breve y contextualizada sobre "${inputs.tema}".
- DUA (Representación): ejemplo visual + explicación oral corta.
- DUA (Acción/Expresión): responder oral/escrito/dibujo.
- DUA (Compromiso): elección entre 2 opciones de entrada.

R — REFLEXIÓN (con apoyos DUA)
- Preguntas guía: ¿Qué observaste?, ¿qué te resultó difícil?, ¿qué estrategia usaste?
- DUA (Representación): organizador gráfico (tabla/mapa).
- DUA (Acción/Expresión): audio corto / lista de ideas / mini explicación.

C — CONCEPTUALIZACIÓN (con apoyos DUA)
- Construcción del concepto vinculado a la destreza: ${dest ? dest.codigo : "(sin código)"}.
- Modelado guiado + ejemplo resuelto.
- DUA (Representación): pasos numerados + ejemplo alternativo.
- DUA (Acción/Expresión): resolver 2 ejercicios (uno guiado, uno autónomo).
- DUA (Compromiso): reto por niveles.

A — APLICACIÓN (con apoyos DUA)
- Producto rápido: ejercicio contextualizado o mini problema.
- Evidencia: procedimiento + respuesta + explicación breve.
- Evaluación: lista de cotejo alineada a indicadores.
- Ajustes razonables y apoyos (DUA): tiempo extra / material concreto / lectura fácil / opción oral.
`;

    setPlan(texto);
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif", maxWidth: 980, margin: "0 auto" }}>
      <h1>📘 Planificador ERCA Ecuador</h1>
      <p>
        Genera una planificación base con estructura <b>ERCA</b> y apoyos <b>DUA</b>, vinculada al{" "}
        <b>Currículo Priorizado vigente</b> (Matemática).
      </p>

      <hr />

      <h2>🧑‍🏫 Datos del docente</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <label>
          Asignatura:
          <input
            value={inputs.asignatura}
            onChange={(e) => setField("asignatura", e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>

        <label>
          Nivel:
          <select
            value={inputs.nivel}
            onChange={(e) => {
              const nv = e.target.value as "EGB" | "BGU";
              setField("nivel", nv);
              const sub = detectarSubnivelPorGrado(nv, inputs.grado);
              setField("subnivel", sub);
              setField("destrezaCodigo", "");
            }}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          >
            <option value="EGB">EGB</option>
            <option value="BGU">BGU</option>
          </select>
        </label>

        <label>
          Grado / Curso:
          <input
            value={inputs.grado}
            onChange={(e) => {
              const g = e.target.value;
              setField("grado", g);
              const sub = detectarSubnivelPorGrado(inputs.nivel, g);
              setField("subnivel", sub);
              setField("destrezaCodigo", "");
            }}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>
            Subnivel detectado: <b>{subnivelDetectado}</b>
          </div>
        </label>

        <label>
          Unidad:
          <input
            value={inputs.unidad}
            onChange={(e) => setField("unidad", e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>

        <label style={{ gridColumn: "1 / -1" }}>
          Tema:
          <input
            value={inputs.tema}
            onChange={(e) => setField("tema", e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>

        <label style={{ gridColumn: "1 / -1" }}>
          Subnivel (seleccionable):
          <select
            value={subnivelFinal}
            onChange={(e) => {
              setField("subnivel", e.target.value);
              setField("destrezaCodigo", "");
            }}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          >
            {subnivelesDisponibles.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label style={{ gridColumn: "1 / -1" }}>
          Destreza (Currículo):
          <select
            value={destrezaSeleccionada?.codigo ?? ""}
            onChange={(e) => setField("destrezaCodigo", e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          >
            {destrezasDelSubnivel.length === 0 ? (
              <option value="">(Aún no hay destrezas cargadas para {subnivelFinal})</option>
            ) : (
              destrezasDelSubnivel.map((d) => (
                <option key={d.codigo} value={d.codigo}>
                  {d.codigo} — {d.descripcion.slice(0, 90)}
                  {d.descripcion.length > 90 ? "..." : ""}
                </option>
              ))
            )}
          </select>

          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 6 }}>
            Seleccionada:{" "}
            <b>{destrezaSeleccionada ? `${destrezaSeleccionada.codigo} — ${destrezaSeleccionada.descripcion}` : "(ninguna)"}</b>
          </div>
        </label>
      </div>

      <hr />

      <h2>⏱️ Tiempo (ERCA)</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 12 }}>
        <label>
          Total (min):
          <input
            type="number"
            value={inputs.duracionTotal}
            onChange={(e) => setField("duracionTotal", Number(e.target.value))}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>
        <label>
          E (min):
          <input
            type="number"
            value={inputs.minE}
            onChange={(e) => setField("minE", Number(e.target.value))}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>
        <label>
          R (min):
          <input
            type="number"
            value={inputs.minR}
            onChange={(e) => setField("minR", Number(e.target.value))}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>
        <label>
          C (min):
          <input
            type="number"
            value={inputs.minC}
            onChange={(e) => setField("minC", Number(e.target.value))}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>
        <label>
          A (min):
          <input
            type="number"
            value={inputs.minA}
            onChange={(e) => setField("minA", Number(e.target.value))}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>
      </div>

      <div style={{ marginTop: 18 }}>
        <button
          type="button"
          onClick={generarPlan}
          style={{ padding: "10px 16px", border: "2px solid #000", cursor: "pointer" }}
        >
          Generar planificación (ERCA + Currículo)
        </button>
      </div>

      <hr />

      <h2>📄 Planificación generada</h2>
      <pre
        style={{
          whiteSpace: "pre-wrap",
          background: "#f6f6f6",
          padding: 16,
          borderRadius: 10,
          border: "1px solid #ddd",
        }}
      >
        {plan || "Aún no se genera. Completa los campos y presiona el botón."}
      </pre>
    </main>
  );
}
