"use client";

import { useMemo, useState, useEffect } from "react";
import { matematicaPriorizado } from "@/data/curriculo/priorizado/matematica-egb";

type PlanInputs = {
  asignatura: string;
  nivel: "EGB" | "BGU";
  grado: string;
  unidad: string;
  tema: string;

  // currículo
  subnivel: string;
  destrezaCodigo: string;

  // tiempo ERCA
  duracionTotal: number;
  minE: number;
  minR: number;
  minC: number;
  minA: number;
};

function detectarSubnivelPorGrado(nivel: "EGB" | "BGU", gradoStr: string): string {
  const n = parseInt(gradoStr, 10);
  if (nivel === "BGU") return "BGU";
  if (!Number.isFinite(n)) return "EGB Preparatoria";
  if (n <= 1) return "EGB Preparatoria";
  if (n <= 4) return "EGB Elemental";
  if (n <= 7) return "EGB Media";
  return "EGB Superior";
}

const PREFIJO_POR_SUBNIVEL: Record<string, string> = {
  "EGB Preparatoria": "M.1.",
  "EGB Elemental": "M.2.",
  "EGB Media": "M.3.",
  "EGB Superior": "M.4.",
  "BGU": "M.5.", // AJUSTA si tu BGU usa otro prefijo
};

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

  const [plan, setPlan] = useState<string>("");

  const subnivelesDisponibles = useMemo(() => {
    return Object.keys(matematicaPriorizado.subniveles ?? {});
  }, []);

  // Sugiere subnivel al cambiar nivel/grado (pero permite elegir manualmente)
  useEffect(() => {
    const sugerido = detectarSubnivelPorGrado(inputs.nivel, inputs.grado);
    if (subnivelesDisponibles.includes(sugerido) && sugerido !== inputs.subnivel) {
      setInputs((p) => ({ ...p, subnivel: sugerido, destrezaCodigo: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputs.nivel, inputs.grado, subnivelesDisponibles.join("|")]);

  const dataSubnivel = useMemo(() => {
    return matematicaPriorizado.subniveles[inputs.subnivel];
  }, [inputs.subnivel]);

  // ✅ FILTRO CLAVE: solo destrezas del subnivel por prefijo (evita que aparezcan M.1 en Elemental)
  const destrezasFiltradas = useMemo(() => {
    const all = dataSubnivel?.destrezas ?? [];
    const pref = PREFIJO_POR_SUBNIVEL[inputs.subnivel];

    if (!pref) return all; // si no hay mapeo, no filtra
    return all.filter((d) => (d?.codigo ?? "").startsWith(pref));
  }, [dataSubnivel, inputs.subnivel]);

  // si la destreza seleccionada no existe en el filtro, resetea
  useEffect(() => {
    if (!inputs.destrezaCodigo) return;
    const ok = destrezasFiltradas.some((d) => d.codigo === inputs.destrezaCodigo);
    if (!ok) setInputs((p) => ({ ...p, destrezaCodigo: "" }));
  }, [destrezasFiltradas, inputs.destrezaCodigo]);

  const destrezaSeleccionada = useMemo(() => {
    if (!inputs.destrezaCodigo) return null;
    return destrezasFiltradas.find((d) => d.codigo === inputs.destrezaCodigo) ?? null;
  }, [destrezasFiltradas, inputs.destrezaCodigo]);

  const objetivoElegido = useMemo(() => {
    // usa el primero del subnivel (puedes mejorar luego para elegir por destreza/tema)
    return (dataSubnivel?.objetivos ?? [])[0] ?? null;
  }, [dataSubnivel]);

  function generarPlan() {
    const area = matematicaPriorizado.area ?? "Matemática";
    const fuente = matematicaPriorizado.fuente ?? "Currículo Priorizado por Competencias (MINEDUC)";
    const subnivel = inputs.subnivel;

    const obj = objetivoElegido
      ? `- ${objetivoElegido.codigo}: ${objetivoElegido.descripcion}`
      : "- (No hay objetivos cargados para este subnivel)";

    const dest = destrezaSeleccionada
      ? `- ${destrezaSeleccionada.codigo}: ${destrezaSeleccionada.descripcion}`
      : "- (No se seleccionó destreza)";

    const inds =
      destrezaSeleccionada?.indicadores?.length
        ? destrezaSeleccionada.indicadores
            .map((i) => `- ${i.codigo}: ${i.descripcion}`)
            .join("\n")
        : "- (No hay indicadores cargados para esta destreza)";

    const texto = [
      `PLANIFICACIÓN MICROCURRICULAR (ERCA + DUA) — ${fuente}`,
      `Área: ${area}`,
      `Subnivel: ${subnivel}`,
      ``,
      `1) DATOS INFORMATIVOS`,
      `- Asignatura: ${inputs.asignatura}`,
      `- Nivel: ${inputs.nivel}`,
      `- Grado/Curso: ${inputs.grado}`,
      `- Unidad: ${inputs.unidad}`,
      `- Tema: ${inputs.tema || "-"}`,
      ``,
      `2) OBJETIVO (Currículo)`,
      obj,
      ``,
      `3) DESTREZA CON CRITERIO DE DESEMPEÑO (Currículo)`,
      dest,
      ``,
      `4) INDICADORES DE EVALUACIÓN (Currículo)`,
      inds,
      ``,
      `5) TIEMPO`,
      `- Duración total: ${inputs.duracionTotal} min`,
      `- Distribución ERCA: E=${inputs.minE} | R=${inputs.minR} | C=${inputs.minC} | A=${inputs.minA}`,
      ``,
      `6) ERCA (con apoyos DUA)`,
      `E – EXPERIENCIA`,
      `- Actividad: Situación inicial breve relacionada con el tema "${inputs.tema || "la destreza seleccionada"}".`,
      `- DUA (Representación): ejemplo visual + consigna oral.`,
      `- DUA (Acción/Expresión): responder oral/escrito/dibujo.`,
      `- DUA (Compromiso): elegir entre 2 opciones de actividad.`,
      ``,
      `R – REFLEXIÓN`,
      `- Preguntas guía: ¿Qué observaste?, ¿qué te resultó difícil?, ¿qué estrategia usaste?`,
      `- DUA (Representación): organizador gráfico simple (tabla/mapa).`,
      `- DUA (Acción/Expresión): audio/texto/lista de ideas.`,
      ``,
      `C – CONCEPTUALIZACIÓN`,
      `- Construcción del concepto clave y ejemplo guiado.`,
      `- DUA (Representación): pasos modelados + material concreto.`,
      `- DUA (Acción/Expresión): resolver 1–2 ejercicios guiados.`,
      ``,
      `A – APLICACIÓN`,
      `- Resolver un problema contextualizado y socializar procedimiento.`,
      `- DUA (Acción/Expresión): producto corto (respuesta + explicación).`,
      `- DUA (Compromiso): reto con opción A/B según nivel de apoyo.`,
    ].join("\n");

    setPlan(texto);
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>📘 Planificador ERCA Ecuador</h1>
      <p>
        Genera una planificación base con estructura <b>ERCA</b> y apoyos <b>DUA</b>, vinculada al{" "}
        <b>Currículo Priorizado por Competencias</b> (Matemática).
      </p>

      <hr />

      <h2>🧑‍🏫 Datos del docente</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", maxWidth: 1100 }}>
        <label>
          Asignatura:
          <input
            type="text"
            value={inputs.asignatura}
            onChange={(e) => setInputs((p) => ({ ...p, asignatura: e.target.value }))}
            style={{ width: "100%" }}
          />
        </label>

        <label>
          Nivel:
          <select
            value={inputs.nivel}
            onChange={(e) =>
              setInputs((p) => ({
                ...p,
                nivel: e.target.value as "EGB" | "BGU",
                destrezaCodigo: "",
              }))
            }
            style={{ width: "100%" }}
          >
            <option value="EGB">EGB</option>
            <option value="BGU">BGU</option>
          </select>
        </label>

        <label>
          Grado / Curso:
          <input
            type="text"
            value={inputs.grado}
            onChange={(e) => setInputs((p) => ({ ...p, grado: e.target.value }))}
            style={{ width: "100%" }}
          />
          <small style={{ display: "block", opacity: 0.75, marginTop: 4 }}>
            Subnivel sugerido: {detectarSubnivelPorGrado(inputs.nivel, inputs.grado)}
          </small>
        </label>

        <label>
          Unidad:
          <input
            type="text"
            value={inputs.unidad}
            onChange={(e) => setInputs((p) => ({ ...p, unidad: e.target.value }))}
            style={{ width: "100%" }}
          />
        </label>

        <label style={{ gridColumn: "1 / -1" }}>
          Tema:
          <input
            type="text"
            placeholder="Ej: fracciones equivalentes"
            value={inputs.tema}
            onChange={(e) => setInputs((p) => ({ ...p, tema: e.target.value }))}
            style={{ width: "100%" }}
          />
        </label>
      </div>

      <hr style={{ marginTop: 18 }} />

      <h2>📌 Currículo (Matemática)</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, maxWidth: 1100 }}>
        <label>
          Subnivel:
          <select
            value={inputs.subnivel}
            onChange={(e) =>
              setInputs((p) => ({
                ...p,
                subnivel: e.target.value,
                destrezaCodigo: "", // ✅ reset al cambiar subnivel
              }))
            }
            style={{ width: "100%" }}
          >
            {subnivelesDisponibles.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <small style={{ display: "block", opacity: 0.75, marginTop: 4 }}>(Se llena desde matematica.json)</small>
        </label>

        <label>
          Destreza (Currículo) — <b>{inputs.subnivel}</b>:
          <select
            value={inputs.destrezaCodigo}
            onChange={(e) => setInputs((p) => ({ ...p, destrezaCodigo: e.target.value }))}
            style={{ width: "100%" }}
          >
            <option value="">
              {destrezasFiltradas.length ? "Selecciona una destreza..." : "(No hay destrezas cargadas en este subnivel)"}
            </option>

            {destrezasFiltradas.map((d) => (
              <option key={d.codigo} value={d.codigo}>
                {d.codigo} — {d.descripcion}
              </option>
            ))}
          </select>
          <small style={{ display: "block", opacity: 0.75, marginTop: 4 }}>
            Seleccionada: {destrezaSeleccionada ? `${destrezaSeleccionada.codigo} — ${destrezaSeleccionada.descripcion}` : "(ninguna)"}
          </small>
        </label>
      </div>

      <hr style={{ marginTop: 18 }} />

      <h2>⏱️ Tiempo (ERCA)</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 12, maxWidth: 1100 }}>
        <label>
          Duración total (min):
          <input
            type="number"
            value={inputs.duracionTotal}
            onChange={(e) => setInputs((p) => ({ ...p, duracionTotal: Number(e.target.value || 0) }))}
            style={{ width: "100%" }}
          />
        </label>
        <label>
          E (min):
          <input
            type="number"
            value={inputs.minE}
            onChange={(e) => setInputs((p) => ({ ...p, minE: Number(e.target.value || 0) }))}
            style={{ width: "100%" }}
          />
        </label>
        <label>
          R (min):
          <input
            type="number"
            value={inputs.minR}
            onChange={(e) => setInputs((p) => ({ ...p, minR: Number(e.target.value || 0) }))}
            style={{ width: "100%" }}
          />
        </label>
        <label>
          C (min):
          <input
            type="number"
            value={inputs.minC}
            onChange={(e) => setInputs((p) => ({ ...p, minC: Number(e.target.value || 0) }))}
            style={{ width: "100%" }}
          />
        </label>
        <label>
          A (min):
          <input
            type="number"
            value={inputs.minA}
            onChange={(e) => setInputs((p) => ({ ...p, minA: Number(e.target.value || 0) }))}
            style={{ width: "100%" }}
          />
        </label>
      </div>

      <div style={{ marginTop: 12 }}>
        <button
          type="button"
          onClick={generarPlan}
          style={{ padding: "10px 14px", border: "2px solid #000", background: "#fff", cursor: "pointer" }}
        >
          Generar planificación (ERCA + Currículo)
        </button>
        <small style={{ display: "block", opacity: 0.75, marginTop: 6 }}>
          Sugerencia: E=10 | R=10 | C=10 | A=10 (ajusta según tu clase)
        </small>
      </div>

      <hr style={{ marginTop: 18 }} />

      <h2>📄 Planificación generada</h2>
      <pre
        style={{
          whiteSpace: "pre-wrap",
          border: "1px solid #ddd",
          padding: 12,
          borderRadius: 8,
          maxWidth: 1100,
          background: "#fafafa",
        }}
      >
        {plan || "Aún no se ha generado una planificación."}
      </pre>
    </main>
  );
}
