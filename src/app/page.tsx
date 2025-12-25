"use client";

import { useMemo, useState } from "react";
import { matematicaEGB2016 } from "@/data/curriculo/ecuador2016/matematica-egb";

type SubnivelKey = keyof typeof matematicaEGB2016.subniveles;

export default function Home() {
  // =========================
  // Inputs del docente
  // =========================
  const [asignatura, setAsignatura] = useState("Matemática");
  const [grado, setGrado] = useState("7 EGB");
  const [unidad, setUnidad] = useState("2");
  const [tema, setTema] = useState("");

  // Subnivel y destreza elegida
  const subniveles = useMemo(() => Object.keys(matematicaEGB2016.subniveles) as SubnivelKey[], []);
  const [subnivel, setSubnivel] = useState<SubnivelKey>(subniveles[0] ?? "EGB Superior");

  const dataSubnivel = matematicaEGB2016.subniveles[subnivel];

  const [destrezaIndex, setDestrezaIndex] = useState<number>(0);

  // Botón generar
  const [mostrarPlan, setMostrarPlan] = useState(false);

  // =========================
  // Selecciones curriculares
  // =========================
  const objetivo = useMemo(() => {
    // toma el 1er objetivo del subnivel (puedes cambiar luego a selector)
    return dataSubnivel?.objetivos?.[0] ?? null;
  }, [dataSubnivel]);

  const destrezas = useMemo(() => {
    return dataSubnivel?.destrezas ?? [];
  }, [dataSubnivel]);

  const destreza = useMemo(() => {
    return destrezas?.[destrezaIndex] ?? null;
  }, [destrezas, destrezaIndex]);

  const indicadores = useMemo(() => {
    return destreza?.indicadores ?? [];
  }, [destreza]);

  // Si cambias subnivel, resetea índice para evitar "undefined"
  function onChangeSubnivel(newSubnivel: SubnivelKey) {
    setSubnivel(newSubnivel);
    setDestrezaIndex(0);
    setMostrarPlan(false);
  }

  // =========================
  // Texto de planificación ERCA
  // =========================
  const planTexto = useMemo(() => {
    if (!objetivo || !destreza) return "";

    const indText =
      indicadores.length > 0
        ? indicadores
            .map((i) => `- ${i.codigo}: ${i.descripcion}`)
            .join("\n")
        : "- (No hay indicadores cargados para esta destreza aún)";

    const temaText = tema?.trim() ? tema.trim() : "(Tema no especificado)";

    return `PLANIFICACIÓN MICROCURRICULAR (ERCA + DUA) — Currículo Ecuador 2016
Área: ${matematicaEGB2016.area} | Año: ${matematicaEGB2016.anio}
Subnivel: ${subnivel}

1) DATOS INFORMATIVOS
- Asignatura: ${asignatura}
- Grado/Curso: ${grado}
- Unidad: ${unidad}
- Tema: ${temaText}

2) OBJETIVO (Currículo 2016)
- ${objetivo.codigo}: ${objetivo.descripcion}

3) DESTREZA CON CRITERIO DE DESEMPEÑO (Currículo 2016)
- ${destreza.codigo}: ${destreza.descripcion}

4) INDICADORES DE EVALUACIÓN (Currículo 2016)
${indText}

5) ERCA (con apoyos DUA)

E — EXPERIENCIA
- Actividad: Situación inicial breve relacionada al tema (“${temaText}”) y a la destreza.
- DUA (Representación): usar ejemplo visual + consigna oral y escrita.
- DUA (Acción/Expresión): permitir responder de forma oral, escrita o con organizador gráfico.
- DUA (Compromiso): elección entre 2 opciones de actividad (individual/parejas).

R — REFLEXIÓN
- Actividad: Preguntas guía: ¿Qué observaste?, ¿qué te resultó difícil?, ¿qué estrategia usaste?
- DUA (Representación): organizar ideas en tabla/mapa mental.
- DUA (Acción/Expresión): explicar con audio, texto corto o lista de ideas.

C — CONCEPTUALIZACIÓN
- Actividad: Construcción del concepto/regla/procedimiento del tema.
- DUA (Representación): mini-guía paso a paso + ejemplo resuelto.
- DUA (Acción/Expresión): completar un ejemplo similar con apoyo.
- DUA (Compromiso): reto opcional “nivel avanzado”.

A — APLICACIÓN
- Actividad: Resolución de 3 ejercicios graduados (básico–medio–desafío) alineados a la destreza.
- Evaluación formativa: lista de cotejo basada en el/los indicador(es).
- DUA (Acción/Expresión): permitir entregar respuesta como procedimiento escrito, explicación oral o captura/foto del cuaderno.
`;
  }, [asignatura, grado, unidad, tema, subnivel, objetivo, destreza, indicadores]);

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ marginBottom: "0.25rem" }}>📘 Planificador ERCA Ecuador</h1>
      <p style={{ marginTop: 0 }}>
        Genera una planificación base con estructura <b>ERCA</b> y apoyos <b>DUA</b>, usando datos reales (Currículo 2016) desde tu archivo local.
      </p>

      <hr />

      <h2>👩‍🏫 Datos del docente</h2>

      <div style={{ maxWidth: 720 }}>
        <label style={{ display: "block", marginBottom: 10 }}>
          Asignatura:
          <input
            type="text"
            value={asignatura}
            onChange={(e) => setAsignatura(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>

        <label style={{ display: "block", marginBottom: 10 }}>
          Grado / Curso:
          <input
            type="text"
            value={grado}
            onChange={(e) => setGrado(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>

        <label style={{ display: "block", marginBottom: 10 }}>
          Unidad:
          <input
            type="text"
            value={unidad}
            onChange={(e) => setUnidad(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>

        <label style={{ display: "block", marginBottom: 10 }}>
          Tema (opcional):
          <input
            type="text"
            value={tema}
            onChange={(e) => setTema(e.target.value)}
            placeholder="Ej: Fracciones equivalentes"
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>

        <hr style={{ margin: "16px 0" }} />

        <h2>📌 Currículo 2016 (Matemática)</h2>

        <label style={{ display: "block", marginBottom: 10 }}>
          Subnivel:
          <select
            value={subnivel}
            onChange={(e) => onChangeSubnivel(e.target.value as SubnivelKey)}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          >
            {subniveles.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "block", marginBottom: 10 }}>
          Destreza (real):
          <select
            value={destrezaIndex}
            onChange={(e) => {
              setDestrezaIndex(Number(e.target.value));
              setMostrarPlan(false);
            }}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          >
            {destrezas.length === 0 && <option value={0}>(No hay destrezas cargadas)</option>}
            {destrezas.map((d, idx) => (
              <option key={`${d.codigo}-${idx}`} value={idx}>
                {d.codigo} — {d.descripcion.slice(0, 80)}
                {d.descripcion.length > 80 ? "..." : ""}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={() => setMostrarPlan(true)}
          style={{
            padding: "10px 14px",
            fontWeight: "bold",
            cursor: "pointer",
            border: "2px solid #000",
            background: "#fff",
          }}
        >
          Generar planificación (ERCA)
        </button>
      </div>

      <hr style={{ margin: "20px 0" }} />

      <h2>📄 Planificación generada</h2>

      {!mostrarPlan ? (
        <p style={{ opacity: 0.8 }}>
          Completa los campos y presiona <b>“Generar planificación (ERCA)”</b>.
        </p>
      ) : (
        <div
          style={{
            maxWidth: 920,
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: 14,
            background: "#fafafa",
            whiteSpace: "pre-wrap",
            lineHeight: 1.35,
          }}
        >
          {planTexto}
        </div>
      )}
    </main>
  );
}
