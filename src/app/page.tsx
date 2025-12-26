"use client";

import { useEffect, useMemo, useState } from "react";
import { matematicaPriorizado } from "@/data/curriculo/priorizado/matematica-egb";

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

function cleanText(x: string) {
  return (x || "").replace(/\s+/g, " ").trim();
}

function detectarSubnivelPorGrado(nivel: "EGB" | "BGU", gradoStr: string) {
  const n = parseInt(gradoStr, 10);
  if (nivel === "BGU") return "BGU";
  if (!Number.isFinite(n)) return "EGB Preparatoria";
  if (n <= 1) return "EGB Preparatoria";
  if (n <= 4) return "EGB Elemental";
  if (n <= 7) return "EGB Media";
  return "EGB Superior";
}

function prefijoDestrezaPorSubnivel(subnivel: string) {
  const sn = cleanText(subnivel);
  if (sn === "EGB Preparatoria") return "M.1.";
  if (sn === "EGB Elemental") return "M.2.";
  if (sn === "EGB Media") return "M.3.";
  if (sn === "EGB Superior") return "M.4.";
  // BGU depende del documento; si en tu PDF viene como M.5., M.BGU, etc. lo ajustas aquí.
  return null;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function sugerirTiempos(total: number) {
  const t = clamp(Math.round(total), 10, 300);
  const base = Math.floor(t / 4);
  const rem = t - base * 4;
  return {
    minE: base + (rem > 0 ? 1 : 0),
    minR: base + (rem > 1 ? 1 : 0),
    minC: base + (rem > 2 ? 1 : 0),
    minA: base,
  };
}

export default function Home() {
  const [inputs, setInputs] = useState<PlanInputs>({
    asignatura: "Matemática",
    nivel: "EGB",
    grado: "1",
    unidad: "1",
    tema: "",

    subnivel: "EGB Preparatoria",
    destrezaCodigo: "",

    duracionTotal: 40,
    minE: 10,
    minR: 10,
    minC: 10,
    minA: 10,
  });

  // === Subnivel sugerido por grado/nivel ===
  const subnivelSugerido = useMemo(
    () => detectarSubnivelPorGrado(inputs.nivel, inputs.grado),
    [inputs.nivel, inputs.grado]
  );

  // === lista subniveles existentes en JSON (normalizados) ===
  const subnivelesDisponibles = useMemo(() => {
    const keys = Object.keys(matematicaPriorizado.subniveles || {}).map(cleanText);
    // orden preferido
    const order = ["EGB Preparatoria", "EGB Elemental", "EGB Media", "EGB Superior", "BGU"];
    keys.sort((a, b) => order.indexOf(a) - order.indexOf(b));
    return keys;
  }, []);

  // === data del subnivel seleccionado ===
  const dataSubnivel = useMemo(() => {
    const key = cleanText(inputs.subnivel);
    return matematicaPriorizado.subniveles[key];
  }, [inputs.subnivel]);

  // ✅ FILTRO CLAVE: evita que aparezcan M.1 en Elemental etc.
  const destrezasFiltradas = useMemo(() => {
    const list = dataSubnivel?.destrezas ?? [];
    const pref = prefijoDestrezaPorSubnivel(inputs.subnivel);
    if (!pref) return list;

    return list.filter((d) => cleanText(String(d.codigo || "")).startsWith(pref));
  }, [dataSubnivel, inputs.subnivel]);

  // === set automático de subnivel al cambiar grado/nivel (si el usuario no lo cambió manualmente) ===
  useEffect(() => {
    // si el subnivel actual no coincide con el sugerido y además no existe, lo corregimos
    const current = cleanText(inputs.subnivel);
    const sug = cleanText(subnivelSugerido);

    // si el usuario puso BGU pero no existe en tu JSON, igual lo dejamos, pero será vacío
    if (!subnivelesDisponibles.includes(current)) {
      setInputs((p) => ({ ...p, subnivel: sug }));
    }
  }, [subnivelSugerido, subnivelesDisponibles]); // eslint-disable-line react-hooks/exhaustive-deps

  // === si destreza seleccionada no está en la lista filtrada, elegimos la primera ===
  useEffect(() => {
    const exists = destrezasFiltradas.some((d) => d.codigo === inputs.destrezaCodigo);
    if (!exists) {
      setInputs((p) => ({ ...p, destrezaCodigo: destrezasFiltradas[0]?.codigo ?? "" }));
    }
  }, [destrezasFiltradas]); // eslint-disable-line react-hooks/exhaustive-deps

  // === genera plan ===
  const [planTexto, setPlanTexto] = useState("");

  const destrezaSel = useMemo(
    () => destrezasFiltradas.find((d) => d.codigo === inputs.destrezaCodigo),
    [destrezasFiltradas, inputs.destrezaCodigo]
  );

  const objetivoSel = useMemo(() => {
    // Objetivo referencial (si hay varios, toma el primero)
    const objs = dataSubnivel?.objetivos ?? [];
    return objs[0];
  }, [dataSubnivel]);

  const sugerencia = useMemo(
    () => `E=${inputs.minE} | R=${inputs.minR} | C=${inputs.minC} | A=${inputs.minA}`,
    [inputs.minE, inputs.minR, inputs.minC, inputs.minA]
  );

  function generarPlan() {
    const area = matematicaPriorizado.area;
    const fuente = matematicaPriorizado.fuente;
    const subnivel = cleanText(inputs.subnivel);

    const objTxt = objetivoSel
      ? `- ${objetivoSel.codigo}: ${objetivoSel.descripcion}`
      : "- (No hay objetivos cargados para este subnivel)";

    const desTxt = destrezaSel
      ? `- ${destrezaSel.codigo}: ${destrezaSel.descripcion}`
      : "- (No hay destreza seleccionada)";

    const inds = destrezaSel?.indicadores ?? [];
    const indTxt =
      inds.length > 0
        ? inds.map((i) => `- ${i.codigo}: ${i.descripcion}`).join("\n")
        : "- (No hay indicadores cargados para esta destreza)";

    const out = `
PLANIFICACIÓN MICROCURRICULAR (ERCA + DUA) — Currículo Priorizado por Competencias
Área: ${area}
Fuente: ${fuente}
Subnivel: ${subnivel}

1) DATOS INFORMATIVOS
- Asignatura: ${cleanText(inputs.asignatura)}
- Nivel: ${inputs.nivel}
- Grado/Curso: ${cleanText(inputs.grado)}
- Unidad: ${cleanText(inputs.unidad)}
- Tema: ${cleanText(inputs.tema)}

2) OBJETIVO (Currículo)
${objTxt}

3) DESTREZA CON CRITERIO DE DESEMPEÑO (Currículo)
${desTxt}

4) INDICADORES DE EVALUACIÓN (Currículo)
${indTxt}

5) TIEMPO (ERCA)
- Duración total: ${inputs.duracionTotal} min
- Distribución ERCA: ${sugerencia}

6) ERCA + DUA (Borrador base)
E — EXPERIENCIA
- Actividad: Situación inicial breve relacionada con el tema y la destreza.
- DUA (Representación): ejemplo visual / material concreto / pictograma.
- DUA (Acción y expresión): responder oral, escrito o con dibujo.
- DUA (Compromiso): elegir entre 2 opciones de actividad.

R — REFLEXIÓN
- Actividad: preguntas guía (¿qué observaste?, ¿qué estrategia usaste?, ¿qué te faltó?).
- DUA (Representación): organizador gráfico simple (tabla o mapa).
- DUA (Acción y expresión): audio corto / lista de ideas / explicación breve.

C — CONCEPTUALIZACIÓN
- Actividad: construcción del concepto/procedimiento (modelo → ejemplo → regla).
- DUA (Representación): pasos numerados + ejemplo resuelto.
- DUA (Acción y expresión): completar una ficha / ejemplo guiado.

A — APLICACIÓN
- Actividad: ejercicios o problema contextualizado acorde al subnivel.
- Evaluación: lista de cotejo / rúbrica breve vinculada a indicadores.
- DUA (Acción y expresión): diferentes productos (resolver, explicar, representar).
`.trim();

    setPlanTexto(out);
  }

  return (
    <main style={{ padding: 24, fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ margin: 0 }}>📘 Planificador ERCA Ecuador</h1>
      <p style={{ marginTop: 6 }}>
        Genera una planificación base con estructura <b>ERCA</b> y apoyos <b>DUA</b>, vinculada al{" "}
        <b>Currículo Priorizado por Competencias</b> (Matemática).
      </p>

      <hr />

      <h2>🧑‍🏫 Datos del docente</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, maxWidth: 980 }}>
        <label>
          Asignatura:
          <input
            value={inputs.asignatura}
            onChange={(e) => setInputs((p) => ({ ...p, asignatura: e.target.value }))}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>

        <label>
          Nivel:
          <select
            value={inputs.nivel}
            onChange={(e) => setInputs((p) => ({ ...p, nivel: e.target.value as any }))}
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
            onChange={(e) => setInputs((p) => ({ ...p, grado: e.target.value }))}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>
            Subnivel sugerido: <b>{subnivelSugerido}</b>
          </div>
        </label>

        <label>
          Unidad:
          <input
            value={inputs.unidad}
            onChange={(e) => setInputs((p) => ({ ...p, unidad: e.target.value }))}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>
      </div>

      <label style={{ display: "block", marginTop: 14, maxWidth: 980 }}>
        Tema:
        <input
          value={inputs.tema}
          onChange={(e) => setInputs((p) => ({ ...p, tema: e.target.value }))}
          style={{ width: "100%", padding: 8, marginTop: 6 }}
          placeholder="Ej: fracciones equivalentes"
        />
      </label>

      <hr style={{ marginTop: 18 }} />

      <h2>📌 Currículo (Matemática)</h2>

      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 16, maxWidth: 980 }}>
        <label>
          Subnivel:
          <select
            value={inputs.subnivel}
            onChange={(e) => setInputs((p) => ({ ...p, subnivel: cleanText(e.target.value) }))}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          >
            {subnivelesDisponibles.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>(Se llena desde matematica.json)</div>
        </label>

        <label>
          Destreza (Currículo) — {cleanText(inputs.subnivel)}:
          <select
            value={inputs.destrezaCodigo}
            onChange={(e) => setInputs((p) => ({ ...p, destrezaCodigo: e.target.value }))}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          >
            {destrezasFiltradas.length === 0 ? (
              <option value="">(No hay destrezas cargadas en este subnivel)</option>
            ) : (
              destrezasFiltradas.map((d) => (
                <option key={d.codigo} value={d.codigo}>
                  {d.codigo} — {d.descripcion}
                </option>
              ))
            )}
          </select>

          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
            Seleccionada: <b>{destrezaSel ? `${destrezaSel.codigo} — ${destrezaSel.descripcion}` : "(ninguna)"}</b>
          </div>
        </label>
      </div>

      <hr style={{ marginTop: 18 }} />

      <h2>⏱️ Tiempo (ERCA)</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 12, maxWidth: 980 }}>
        <label>
          Duración total (min):
          <input
            type="number"
            value={inputs.duracionTotal}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10) || 40;
              const sug = sugerirTiempos(v);
              setInputs((p) => ({ ...p, duracionTotal: v, ...sug }));
            }}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>

        <label>
          E (min):
          <input
            type="number"
            value={inputs.minE}
            onChange={(e) => setInputs((p) => ({ ...p, minE: parseInt(e.target.value, 10) || 0 }))}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>

        <label>
          R (min):
          <input
            type="number"
            value={inputs.minR}
            onChange={(e) => setInputs((p) => ({ ...p, minR: parseInt(e.target.value, 10) || 0 }))}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>

        <label>
          C (min):
          <input
            type="number"
            value={inputs.minC}
            onChange={(e) => setInputs((p) => ({ ...p, minC: parseInt(e.target.value, 10) || 0 }))}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>

        <label>
          A (min):
          <input
            type="number"
            value={inputs.minA}
            onChange={(e) => setInputs((p) => ({ ...p, minA: parseInt(e.target.value, 10) || 0 }))}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>
      </div>

      <div style={{ fontSize: 12, opacity: 0.75, marginTop: 8 }}>
        Sugerencia: {sugerencia} (ajusta según tu clase)
      </div>

      <button
        onClick={generarPlan}
        style={{
          marginTop: 16,
          padding: "10px 16px",
          border: "2px solid #000",
          background: "#fff",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Generar planificación (ERCA + Currículo)
      </button>

      <hr style={{ marginTop: 18 }} />

      <h2>📄 Planificación generada</h2>
      <pre
        style={{
          whiteSpace: "pre-wrap",
          background: "#f7f7f7",
          padding: 14,
          borderRadius: 8,
          border: "1px solid #ddd",
          maxWidth: 980,
        }}
      >
        {planTexto || "Aún no has generado la planificación."}
      </pre>
    </main>
  );
}
