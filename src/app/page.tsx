"use client";

import React, { useMemo, useState } from "react";
import { matematicaEGB2016 } from "../data/curriculo/ecuador2016/matematica-egb";
type PlanInputs = {
  asignatura: string;
  nivel: "EGB" | "BGU";
  grado: number; // 1-10 para EGB, 1-3 para BGU
  unidad: string;
  tema: string;

  // selección real del currículo
  subnivelKey: string;
  destrezaCodigo: string;

  // tiempos ERCA
  duracionTotal: number;
  minE: number;
  minR: number;
  minC: number;
  minA: number;
};

type Objetivo = { codigo: string; descripcion: string };
type Indicador = { codigo: string; descripcion: string };
type Destreza = { codigo: string; descripcion: string; indicadores: Indicador[] };
type Subnivel = { objetivos: Objetivo[]; destrezas: Destreza[] };

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function subnivelFromEGB(grado: number) {
  // Currículo 2016 – EGB (mapeo típico por subnivel)
  if (grado === 1) return "EGB Preparatoria";
  if (grado >= 2 && grado <= 4) return "EGB Elemental";
  if (grado >= 5 && grado <= 7) return "EGB Media";
  return "EGB Superior"; // 8-10
}

function subnivelFromInputs(nivel: "EGB" | "BGU", grado: number) {
  if (nivel === "BGU") return "BGU"; // si luego agregas data BGU, lo conectas aquí
  return subnivelFromEGB(grado);
}

function buildERCAPlan(args: {
  asignatura: string;
  gradoLabel: string;
  unidad: string;
  tema: string;
  duracionTotal: number;
  minE: number;
  minR: number;
  minC: number;
  minA: number;
  objetivo?: Objetivo;
  destreza?: Destreza;
  indicadores: Indicador[];
}) {
  const {
    asignatura,
    gradoLabel,
    unidad,
    tema,
    duracionTotal,
    minE,
    minR,
    minC,
    minA,
    objetivo,
    destreza,
    indicadores,
  } = args;

  const objetivoTxt = objetivo
    ? `- ${objetivo.codigo}: ${objetivo.descripcion}`
    : `- (No disponible en data)`;

  const destrezaTxt = destreza
    ? `- ${destreza.codigo}: ${destreza.descripcion}`
    : `- (No seleccionada / no encontrada)`;

  const indicadoresTxt =
    indicadores.length > 0
      ? indicadores.map((i) => `- ${i.codigo}: ${i.descripcion}`).join("\n")
      : `- (No disponibles en data)`;

  // ERCA + DUA (plantilla base)
  return `PLANIFICACIÓN MICROCURRICULAR (ERCA + DUA) — Currículo Ecuador 2016

1) DATOS INFORMATIVOS
- Asignatura: ${asignatura}
- Grado/Curso: ${gradoLabel}
- Unidad: ${unidad}
- Tema: ${tema}

2) TIEMPO
- Duración total: ${duracionTotal} minutos
- Distribución ERCA: E=${minE} min | R=${minR} min | C=${minC} min | A=${minA} min

3) OBJETIVO (Currículo 2016)
${objetivoTxt}

4) DESTREZA CON CRITERIO DE DESEMPEÑO (Currículo 2016)
${destrezaTxt}

5) INDICADORES DE EVALUACIÓN (Currículo 2016)
${indicadoresTxt}

6) ERCA (con apoyos DUA)

E — EXPERIENCIA (${minE} min)
- Actividad: Situación problema breve conectada con “${tema}” (contexto cercano del estudiante).
- DUA (Representación): usar ejemplo visual (fracciones/recta/figuras) + explicación oral corta.
- DUA (Acción y expresión): permitir resolver con material concreto, dibujo o procedimiento escrito.
- DUA (Compromiso): elegir entre 2 opciones de ejercicio (fácil/retador).

R — REFLEXIÓN (${minR} min)
- Actividad: preguntas guía (¿qué observaste?, ¿qué estrategia funcionó?, ¿qué te costó?).
- DUA (Representación): organizador simple (tabla “equivalencias” / lista de pasos).
- DUA (Acción y expresión): compartir respuesta oral, en parejas o por escrito (según necesidad).
- DUA (Compromiso): retroalimentación breve y positiva + metas pequeñas.

C — CONCEPTUALIZACIÓN (${minC} min)
- Actividad: construcción de la regla/idea clave del tema con ejemplos y contraejemplos.
- DUA (Representación): explicación + ejemplo en pizarra + mini guía impresa/digital.
- DUA (Acción y expresión): completar un ejemplo guiado y uno independiente.
- DUA (Compromiso): checklist de avance (lo entiendo / necesito apoyo / ya lo domino).

A — APLICACIÓN (${minA} min)
- Actividad: práctica (individual/parejas) + mini reto contextualizado.
- DUA (Acción y expresión): permitir entregar respuestas en distintos formatos (procedimiento, esquema o explicación breve).
- Evaluación formativa: lista de cotejo (cumple procedimiento, verifica equivalencia, justifica).
- Cierre: 1 “ticket de salida” (1 ejercicio corto + 1 pregunta de reflexión).
`;
}

export default function Home() {
  // ====== Estado del formulario ======
  const [inputs, setInputs] = useState<PlanInputs>({
    asignatura: "Matemática",
    nivel: "EGB",
    grado: 7,
    unidad: "2",
    tema: "fracciones equivalentes",

    subnivelKey: subnivelFromInputs("EGB", 7),
    destrezaCodigo: "",

    duracionTotal: 40,
    minE: 10,
    minR: 10,
    minC: 10,
    minA: 10,
  });

  const [planText, setPlanText] = useState<string>("");

  // ====== Data del currículo (subniveles disponibles) ======
  const subnivelesDisponibles = useMemo(() => {
    // Espera: matematicaEGB2016.subniveles = { "EGB Superior": {...}, ... }
    const keys = Object.keys(matematicaEGB2016?.subniveles ?? {});
    return keys;
  }, []);

  const subnivelAuto = useMemo(() => {
    const key = subnivelFromInputs(inputs.nivel, inputs.grado);
    // Si no existe en tu data (por ahora solo tienes “EGB Superior”), usa el primero disponible.
    if (subnivelesDisponibles.includes(key)) return key;
    return subnivelesDisponibles[0] ?? "EGB Superior";
  }, [inputs.nivel, inputs.grado, subnivelesDisponibles]);

  const subData: Subnivel | null = useMemo(() => {
    const obj = (matematicaEGB2016?.subniveles as any)?.[subnivelAuto];
    if (!obj) return null;
    return obj as Subnivel;
  }, [subnivelAuto]);

  // Lista de destrezas para el select
  const destrezas = useMemo(() => {
    return subData?.destrezas ?? [];
  }, [subData]);

  // Objetivo (por ahora: primero)
  const objetivo = useMemo(() => {
    return subData?.objetivos?.[0];
  }, [subData]);

  // Destreza seleccionada
  const destrezaSeleccionada = useMemo(() => {
    if (!subData) return undefined;
    const code = inputs.destrezaCodigo || destrezas?.[0]?.codigo || "";
    return subData.destrezas.find((d) => d.codigo === code) ?? subData.destrezas[0];
  }, [subData, inputs.destrezaCodigo, destrezas]);

  const indicadores = useMemo(() => {
    return destrezaSeleccionada?.indicadores ?? [];
  }, [destrezaSeleccionada]);

  // Cuando cambia subnivel, asegura una destreza válida
  React.useEffect(() => {
    const first = destrezas?.[0]?.codigo ?? "";
    setInputs((p) => ({
      ...p,
      subnivelKey: subnivelAuto,
      destrezaCodigo: p.destrezaCodigo && destrezas.some((d) => d.codigo === p.destrezaCodigo) ? p.destrezaCodigo : first,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subnivelAuto]);

  // ====== Helpers ======
  function update<K extends keyof PlanInputs>(key: K, value: PlanInputs[K]) {
    setInputs((p) => ({ ...p, [key]: value }));
  }

  function recomputeMinutes(total: number) {
    const t = clamp(total, 20, 200);
    const q = Math.floor(t / 4);
    setInputs((p) => ({
      ...p,
      duracionTotal: t,
      minE: q,
      minR: q,
      minC: q,
      minA: t - q * 3,
    }));
  }

  function handleGenerate() {
    const gradoLabel = inputs.nivel === "EGB" ? `${inputs.grado} EGB` : `${inputs.grado} BGU`;

    const text = buildERCAPlan({
      asignatura: inputs.asignatura,
      gradoLabel,
      unidad: inputs.unidad,
      tema: inputs.tema,
      duracionTotal: inputs.duracionTotal,
      minE: inputs.minE,
      minR: inputs.minR,
      minC: inputs.minC,
      minA: inputs.minA,
      objetivo,
      destreza: destrezaSeleccionada,
      indicadores,
    });

    setPlanText(text);

    // scroll a resultado
    setTimeout(() => {
      const el = document.getElementById("resultado-plan");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  const gradoMax = inputs.nivel === "EGB" ? 10 : 3;

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif", maxWidth: 980, margin: "0 auto" }}>
      <h1 style={{ margin: 0 }}>📘 Planificador ERCA Ecuador</h1>
      <p style={{ marginTop: 6 }}>
        Genera una planificación base con estructura <b>ERCA</b> y apoyos <b>DUA</b>, vinculada al <b>Currículo Ecuador 2016</b> (Matemática).
      </p>

      <hr />

      <h2 style={{ marginBottom: 8 }}>👩‍🏫 Datos del docente</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <label>
          Asignatura:
          <input
            value={inputs.asignatura}
            onChange={(e) => update("asignatura", e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>

        <label>
          Nivel:
          <select
            value={inputs.nivel}
            onChange={(e) => {
              const nivel = e.target.value as "EGB" | "BGU";
              update("nivel", nivel);
              // Ajusta grado si sale de rango
              setInputs((p) => ({
                ...p,
                nivel,
                grado: clamp(p.grado, 1, nivel === "EGB" ? 10 : 3),
              }));
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
            type="number"
            min={1}
            max={gradoMax}
            value={inputs.grado}
            onChange={(e) => update("grado", clamp(Number(e.target.value || 1), 1, gradoMax))}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
          <div style={{ fontSize: 12, marginTop: 4, opacity: 0.75 }}>
            Subnivel detectado: <b>{subnivelAuto || "—"}</b>
          </div>
          {inputs.nivel === "BGU" && (
            <div style={{ fontSize: 12, marginTop: 4, opacity: 0.75 }}>
              Nota: para BGU debes agregar data BGU en tu archivo. Por ahora se usará lo que exista en la data cargada.
            </div>
          )}
        </label>

        <label>
          Unidad:
          <input
            value={inputs.unidad}
            onChange={(e) => update("unidad", e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>

        <label style={{ gridColumn: "1 / -1" }}>
          Tema:
          <input value={inputs.tema} onChange={(e) => update("tema", e.target.value)} style={{ width: "100%", padding: 8, marginTop: 6 }} />
        </label>

        <label style={{ gridColumn: "1 / -1" }}>
          Destreza (Currículo 2016) — Subnivel: <b>{subnivelAuto}</b>
          <select
            value={inputs.destrezaCodigo}
            onChange={(e) => update("destrezaCodigo", e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
            disabled={!destrezas.length}
          >
            {!destrezas.length ? (
              <option value="">(No hay destrezas cargadas en este subnivel)</option>
            ) : (
              destrezas.map((d) => (
                <option key={d.codigo} value={d.codigo}>
                  {d.codigo} — {d.descripcion.length > 120 ? d.descripcion.slice(0, 120) + "..." : d.descripcion}
                </option>
              ))
            )}
          </select>
          <div style={{ fontSize: 12, marginTop: 6, opacity: 0.8 }}>
            {destrezaSeleccionada ? (
              <>
                <b>Seleccionada:</b> {destrezaSeleccionada.codigo} — {destrezaSeleccionada.descripcion}
              </>
            ) : (
              <>Selecciona una destreza para generar.</>
            )}
          </div>
        </label>
      </div>

      <hr />

      <h2 style={{ marginBottom: 8 }}>⏱️ Tiempo (ERCA)</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <label>
          Duración total (min):
          <input
            type="number"
            min={20}
            max={200}
            value={inputs.duracionTotal}
            onChange={(e) => recomputeMinutes(Number(e.target.value || 40))}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
          <div style={{ fontSize: 12, marginTop: 4, opacity: 0.75 }}>
            Distribución sugerida: E={inputs.minE} | R={inputs.minR} | C={inputs.minC} | A={inputs.minA}
          </div>
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <label>
            E (min):
            <input type="number" min={0} value={inputs.minE} onChange={(e) => update("minE", Number(e.target.value || 0))} style={{ width: "100%", padding: 8, marginTop: 6 }} />
          </label>
          <label>
            R (min):
            <input type="number" min={0} value={inputs.minR} onChange={(e) => update("minR", Number(e.target.value || 0))} style={{ width: "100%", padding: 8, marginTop: 6 }} />
          </label>
          <label>
            C (min):
            <input type="number" min={0} value={inputs.minC} onChange={(e) => update("minC", Number(e.target.value || 0))} style={{ width: "100%", padding: 8, marginTop: 6 }} />
          </label>
          <label>
            A (min):
            <input type="number" min={0} value={inputs.minA} onChange={(e) => update("minA", Number(e.target.value || 0))} style={{ width: "100%", padding: 8, marginTop: 6 }} />
          </label>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <button
          type="button"
          onClick={handleGenerate}
          style={{
            padding: "10px 14px",
            border: "2px solid #111",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          Generar planificación (ERCA + Currículo 2016)
        </button>
      </div>

      <hr />

      <h2 id="resultado-plan" style={{ marginBottom: 8 }}>
        📄 Planificación generada
      </h2>

      <div
        style={{
          background: "#f5f5f5",
          border: "1px solid #ddd",
          padding: 14,
          borderRadius: 8,
          whiteSpace: "pre-wrap",
          fontFamily: "Consolas, monospace",
          fontSize: 13,
          minHeight: 220,
        }}
      >
        {planText || "Aún no se ha generado. Completa el formulario y presiona “Generar planificación”."}
      </div>

      <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
        Tip: Si no aparecen destrezas/indicadores para un subnivel, revisa que tu archivo de data tenga ese subnivel en{" "}
        <code>matematicaEGB2016.subniveles</code>.
      </div>
    </main>
  );
}
