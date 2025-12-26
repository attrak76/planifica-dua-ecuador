"use client";

import { useMemo, useState } from "react";
import { matematicaPriorizado, Destreza } from "@/data/curriculo/priorizado/matematica-egb";

type Nivel = "EGB" | "BGU";

type PlanInputs = {
  asignatura: string;
  nivel: Nivel;
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

function detectarSubnivelEGB(gradoStr: string): string {
  const n = parseInt(gradoStr, 10);
  if (Number.isNaN(n)) return "EGB Media";
  if (n === 1) return "EGB Preparatoria";
  if (n >= 2 && n <= 4) return "EGB Elemental";
  if (n >= 5 && n <= 7) return "EGB Media";
  return "EGB Superior"; // 8,9,10
}

function formatoMin(min: number) {
  return `${Math.max(0, Math.floor(min))} min`;
}

export default function Home() {
  const [asignatura, setAsignatura] = useState("Matemática");
  const [nivel, setNivel] = useState<Nivel>("EGB");
  const [grado, setGrado] = useState("7");
  const [unidad, setUnidad] = useState("2");
  const [tema, setTema] = useState("fracciones equivalentes");

  const [duracionTotal, setDuracionTotal] = useState(40);
  const [minE, setMinE] = useState(10);
  const [minR, setMinR] = useState(10);
  const [minC, setMinC] = useState(10);
  const [minA, setMinA] = useState(10);

  // Subnivel: si nivel=BGU -> "BGU"; si EGB -> según grado
  const subnivelDetectado = useMemo(() => {
    return nivel === "BGU" ? "BGU" : detectarSubnivelEGB(grado);
  }, [nivel, grado]);

  const subnivel = useMemo(() => {
    // asegura que exista
    return matematicaPriorizado.subniveles[subnivelDetectado]
      ? subnivelDetectado
      : "EGB Media";
  }, [subnivelDetectado]);

  const destrezasDisponibles: Destreza[] = useMemo(() => {
    return matematicaPriorizado.subniveles[subnivel]?.destrezas ?? [];
  }, [subnivel]);

  const [destrezaCodigo, setDestrezaCodigo] = useState("");

  // si cambia el subnivel o la lista, auto-selecciona primera destreza
  useMemo(() => {
    if (!destrezaCodigo && destrezasDisponibles.length > 0) {
      setDestrezaCodigo(destrezasDisponibles[0].codigo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subnivel, destrezasDisponibles.length]);

  const destrezaSeleccionada = useMemo(() => {
    return destrezasDisponibles.find((d) => d.codigo === destrezaCodigo) ?? null;
  }, [destrezasDisponibles, destrezaCodigo]);

  const objetivosSubnivel = useMemo(() => {
    return matematicaPriorizado.subniveles[subnivel]?.objetivos ?? [];
  }, [subnivel]);

  const [planTexto, setPlanTexto] = useState("");

  function generarPlan() {
    const obj = objetivosSubnivel[0]; // por ahora toma el primero del subnivel
    const d = destrezaSeleccionada;

    const suma = minE + minR + minC + minA;
    const advertenciaTiempo =
      suma !== duracionTotal
        ? `\n⚠ Nota: La suma ERCA (${suma} min) no coincide con la duración total (${duracionTotal} min).`
        : "";

    const indicadores = d?.indicadores ?? [];

    const texto = [
      `PLANIFICACIÓN MICROCURRICULAR (ERCA + DUA) — Currículo Priorizado`,
      `Área: ${matematicaPriorizado.area} | Fuente: ${matematicaPriorizado.fuente}`,
      `Subnivel: ${subnivel}`,
      ``,
      `1) DATOS INFORMATIVOS`,
      `- Asignatura: ${asignatura}`,
      `- Nivel: ${nivel}`,
      `- Grado/Curso: ${grado}`,
      `- Unidad: ${unidad}`,
      `- Tema: ${tema}`,
      ``,
      `2) OBJETIVO (Currículo)`,
      obj
        ? `- ${obj.codigo}: ${obj.descripcion}`
        : `- (Sin objetivo cargado aún para ${subnivel}. Pega los objetivos reales en matematica.json)`,
      ``,
      `3) DESTREZA CON CRITERIO DE DESEMPEÑO (Currículo)`,
      d
        ? `- ${d.codigo}: ${d.descripcion}`
        : `- (Sin destreza seleccionada. Revisa que el subnivel tenga destrezas en matematica.json)`,
      ``,
      `4) INDICADORES (Currículo)`,
      indicadores.length > 0
        ? indicadores.map((i) => `- ${i.codigo}: ${i.descripcion}`).join("\n")
        : `- (Sin indicadores cargados para esta destreza. Pega los indicadores reales en matematica.json)`,
      ``,
      `5) TIEMPO (ERCA)`,
      `- Duración total: ${formatoMin(duracionTotal)}`,
      `- Distribución: E=${formatoMin(minE)} | R=${formatoMin(minR)} | C=${formatoMin(minC)} | A=${formatoMin(minA)}`,
      `${advertenciaTiempo}`,
      ``,
      `6) ERCA (con apoyos DUA)`,
      ``,
      `E — EXPERIENCIA`,
      `- Actividad: Situación inicial breve relacionada con el tema "${tema}" (contexto real / cotidiano).`,
      `- DUA (Representación): ejemplo visual (gráfico, material concreto, esquema) + consigna clara.`,
      `- DUA (Acción/Expresión): respuesta oral, escrita o con organizador gráfico.`,
      `- DUA (Compromiso): opción A/B de actividad (elección guiada).`,
      ``,
      `R — REFLEXIÓN`,
      `- Actividad: preguntas guía: ¿qué observaste?, ¿qué te resultó difícil?, ¿qué estrategia usaste?, ¿qué patrón encontraste?`,
      `- DUA (Representación): tabla de comparación / mapa de ideas.`,
      `- DUA (Acción/Expresión): audio corto o lista de ideas (según preferencia).`,
      `- DUA (Compromiso): trabajo en parejas con roles (lector/a – verificador/a).`,
      ``,
      `C — CONCEPTUALIZACIÓN`,
      `- Actividad: construcción del concepto/procedimiento con ejemplos y contraejemplos.`,
      `- DUA (Representación): explicación paso a paso + ejemplo resuelto + mini guía.`,
      `- DUA (Acción/Expresión): resolver 2 ejercicios graduados (básico → medio) con apoyo.`,
      `- DUA (Compromiso): metas cortas por intento y retroalimentación inmediata.`,
      ``,
      `A — APLICACIÓN`,
      `- Actividad: problema contextualizado aplicando la destreza (individual o equipo).`,
      `- DUA (Representación): enunciado con apoyos (iconos, datos resaltados).`,
      `- DUA (Acción/Expresión): producto a elegir: procedimiento escrito / explicación oral / infografía simple.`,
      `- DUA (Compromiso): reto por niveles (opción estándar y opción extendida).`,
      ``,
      `7) EVALUACIÓN (alineada a indicadores)`,
      `- Técnica: observación + resolución de problemas.`,
      `- Instrumento: lista de cotejo (por indicador) + evidencia del ejercicio aplicado.`,
      ``,
      `8) ADAPTACIONES / APOYOS (DUA)`,
      `- Presentación: ejemplos visuales, material concreto, vocabulario clave.`,
      `- Respuesta: alternativas de expresión (oral/escrita/gráfica).`,
      `- Participación: elección guiada, roles, tiempos flexibles.`,
      ``,
    ].join("\n");

    setPlanTexto(texto);
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif", maxWidth: 980, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 6 }}>📘 Planificador ERCA Ecuador</h1>
      <p style={{ marginTop: 0 }}>
        Genera una planificación con estructura <b>ERCA</b> y apoyos <b>DUA</b>, vinculada al{" "}
        <b>Currículo Priorizado por Competencias</b> (Matemática).
      </p>

      <hr />

      <h2>👩‍🏫 Datos del docente</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label>
            Asignatura:
            <input
              value={asignatura}
              onChange={(e) => setAsignatura(e.target.value)}
              style={{ width: "100%", padding: 8, marginTop: 6 }}
            />
          </label>
        </div>

        <div>
          <label>
            Nivel:
            <select
              value={nivel}
              onChange={(e) => setNivel(e.target.value as Nivel)}
              style={{ width: "100%", padding: 8, marginTop: 6 }}
            >
              <option value="EGB">EGB</option>
              <option value="BGU">BGU</option>
            </select>
          </label>
        </div>

        <div>
          <label>
            Grado / Curso:
            <input
              value={grado}
              onChange={(e) => setGrado(e.target.value)}
              style={{ width: "100%", padding: 8, marginTop: 6 }}
              placeholder={nivel === "BGU" ? "1, 2 o 3" : "1 a 10"}
            />
          </label>
          <div style={{ marginTop: 6, fontSize: 12, color: "#333" }}>
            Subnivel detectado: <b>{subnivel}</b>
          </div>
        </div>

        <div>
          <label>
            Unidad:
            <input
              value={unidad}
              onChange={(e) => setUnidad(e.target.value)}
              style={{ width: "100%", padding: 8, marginTop: 6 }}
            />
          </label>
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label>
            Tema:
            <input
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              style={{ width: "100%", padding: 8, marginTop: 6 }}
            />
          </label>
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label>
            Destreza (Currículo priorizado) — Subnivel: <b>{subnivel}</b>
            <select
              value={destrezaCodigo}
              onChange={(e) => setDestrezaCodigo(e.target.value)}
              style={{ width: "100%", padding: 8, marginTop: 6 }}
            >
              {destrezasDisponibles.length === 0 ? (
                <option value="">(No hay destrezas en este subnivel: completa matematica.json)</option>
              ) : (
                destrezasDisponibles.map((d) => (
                  <option key={d.codigo} value={d.codigo}>
                    {d.codigo} — {d.descripcion.length > 120 ? d.descripcion.slice(0, 120) + "..." : d.descripcion}
                  </option>
                ))
              )}
            </select>
          </label>

          <div style={{ marginTop: 6, fontSize: 12, color: "#333" }}>
            Seleccionada:{" "}
            {destrezaSeleccionada ? (
              <b>
                {destrezaSeleccionada.codigo} — {destrezaSeleccionada.descripcion}
              </b>
            ) : (
              <b>(ninguna)</b>
            )}
          </div>
        </div>
      </div>

      <hr />

      <h2>⏱️ Tiempo (ERCA)</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 12, alignItems: "end" }}>
        <label>
          Duración total (min):
          <input
            type="number"
            value={duracionTotal}
            onChange={(e) => setDuracionTotal(parseInt(e.target.value || "0", 10))}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>
        <label>
          E (min):
          <input
            type="number"
            value={minE}
            onChange={(e) => setMinE(parseInt(e.target.value || "0", 10))}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>
        <label>
          R (min):
          <input
            type="number"
            value={minR}
            onChange={(e) => setMinR(parseInt(e.target.value || "0", 10))}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>
        <label>
          C (min):
          <input
            type="number"
            value={minC}
            onChange={(e) => setMinC(parseInt(e.target.value || "0", 10))}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>
        <label>
          A (min):
          <input
            type="number"
            value={minA}
            onChange={(e) => setMinA(parseInt(e.target.value || "0", 10))}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>
      </div>

      <div style={{ marginTop: 16 }}>
        <button
          type="button"
          onClick={generarPlan}
          style={{
            padding: "10px 16px",
            border: "2px solid #000",
            background: "#fff",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Generar planificación (ERCA + Currículo priorizado)
        </button>
      </div>

      <hr />

      <h2>📄 Planificación generada</h2>
      <pre
        style={{
          whiteSpace: "pre-wrap",
          background: "#f7f7f7",
          border: "1px solid #ddd",
          padding: 16,
          borderRadius: 8,
          minHeight: 120,
        }}
      >
        {planTexto || "Aún no se ha generado. Completa los campos y presiona el botón."}
      </pre>
    </main>
  );
}
