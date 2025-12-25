"use client";

import { useMemo, useState } from "react";

type PlanInputs = {
  asignatura: string;
  grado: string;
  unidad: string;
  destreza: string;
};

function construirObjetivo({ asignatura, grado, unidad, destreza }: PlanInputs) {
  const d = (destreza || "").trim();
  const base = d
    ? `Al finalizar la clase, el estudiante desarrollará la destreza propuesta: “${d}”, `
    : `Al finalizar la clase, el estudiante desarrollará la destreza propuesta, `;
  return (
    base +
    `mediante actividades estructuradas en ERCA, utilizando apoyos DUA (representación, acción/expresión y compromiso).`
  );
}

function construirPlanERCA_DUA(inputs: PlanInputs) {
  const { asignatura, grado, unidad, destreza } = inputs;

  const objetivo = construirObjetivo(inputs);

  // Plantilla ERCA + DUA (texto listo para copiar/pegar)
  return `
PLANIFICACIÓN MICROCURRICULAR (ERCA + DUA)

1) DATOS INFORMATIVOS
- Asignatura: ${asignatura || "—"}
- Grado/Curso: ${grado || "—"}
- Unidad: ${unidad || "—"}
- Destreza con criterio de desempeño: ${destreza || "—"}

2) OBJETIVO DE APRENDIZAJE
- ${objetivo}

3) ESTRATEGIA METODOLÓGICA: ERCA CON APOYOS DUA

E — EXPERIENCIA (Activación y contextualización)
- Propósito: activar conocimientos previos y conectar con una situación real.
- Actividad (inicio breve):
  • Presenta un caso/situación contextual (ej.: problema cotidiano, imagen, mini video, material concreto).
  • Pregunta detonante: “¿Qué observas? ¿Qué crees que pasará? ¿Por qué?”
- DUA (Representación):
  • Presenta la consigna en 2 formatos: oral + escrito (y/o pictogramas/ejemplo resuelto).
- DUA (Acción y Expresión):
  • Respuesta alternativa: oral / escrita / esquema / dibujo / manipulación de material.
- DUA (Compromiso):
  • Ofrece elección: trabajar individual o en pareja; escoger entre 2 ejemplos.

R — REFLEXIÓN (Metacognición y socialización)
- Propósito: analizar estrategias, errores y hallazgos.
- Actividad:
  • Conversatorio guiado + registro breve.
  • Preguntas guía: “¿Qué fue fácil/difícil? ¿Qué estrategia usaste? ¿Qué cambiarías?”
- DUA (Representación):
  • Organizador gráfico simple (tabla, mapa, lista de pasos).
- DUA (Acción y Expresión):
  • Explicar con audio (si aplica), texto corto o lista de ideas.
- DUA (Compromiso):
  • Roles: portavoz, registrador, verificador (para participación equitativa).

C — CONCEPTUALIZACIÓN (Construcción del aprendizaje)
- Propósito: formalizar el concepto/procedimiento y lenguaje matemático/científico.
- Actividad:
  • Presenta el concepto/regla/pasos con ejemplos graduados (de simple a complejo).
  • Modelado del docente: “Pienso en voz alta” mostrando cómo se resuelve.
  • Mini práctica guiada: 2–3 ítems con acompañamiento.
- DUA (Representación):
  • Ejemplo resuelto + pasos numerados.
  • Vocabulario clave (glosario corto).
  • Apoyo visual: resaltado de partes importantes.
- DUA (Acción y Expresión):
  • Plantilla de resolución (pasos) para estudiantes que lo requieran.
  • Uso de calculadora/tabla/material concreto según el tema.
- DUA (Compromiso):
  • Retroalimentación inmediata: “semáforo” (verde/amarillo/rojo) o pulgares.

A — APLICACIÓN (Transferencia y desempeño)
- Propósito: aplicar lo aprendido en una tarea auténtica (producto o resolución).
- Actividad:
  • Tarea de desempeño (independiente o en equipos):
    - Resolver 3 ejercicios: (1 básico, 1 medio, 1 reto) relacionados con la destreza.
    - O elaborar un producto breve (afiche, explicación, mini informe, ejemplo propio).
- DUA (Representación):
  • Presenta la tarea con ejemplo + criterios claros.
- DUA (Acción y Expresión):
  • Opciones de producto: resolución escrita / video corto / exposición / infografía.
- DUA (Compromiso):
  • Relevancia: conecta con contexto local (hogar, comunidad, escuela).

4) RECURSOS
- Pizarra / cuaderno / marcadores
- Material concreto (según tema) / fichas / hojas de trabajo
- Recurso digital opcional: video corto o simulador simple

5) EVALUACIÓN (Formativa y sumativa)
- Evidencias:
  • Participación en E y R
  • Resolución guiada en C
  • Tarea de desempeño en A
- Instrumento sugerido:
  • Lista de cotejo (rápida) + retroalimentación
- Criterios (borrador):
  1) Comprende la consigna y organiza el procedimiento.
  2) Aplica el concepto/pasos correctamente.
  3) Justifica o explica su respuesta con claridad.
  4) Participa y coopera respetando roles.

6) ADECUACIONES / ATENCIÓN A LA DIVERSIDAD (DUA)
- Apoyos:
  • Tiempo adicional y fragmentación de la tarea.
  • Ejemplos con menor carga cognitiva.
  • Andamiaje: plantilla de pasos, pistas, banco de palabras.
  • Evaluación flexible: oral, escrita o con organizador gráfico.

7) TAREA PARA CASA (opcional)
- 1 ejercicio de refuerzo + 1 ejercicio de aplicación en contexto (vida diaria).
`.trim();
}

export default function Home() {
  const [asignatura, setAsignatura] = useState("");
  const [grado, setGrado] = useState("");
  const [unidad, setUnidad] = useState("");
  const [destreza, setDestreza] = useState("");

  const inputs: PlanInputs = useMemo(
    () => ({ asignatura, grado, unidad, destreza }),
    [asignatura, grado, unidad, destreza]
  );

  const [planGenerado, setPlanGenerado] = useState<string>("");

  const generar = () => {
    const plan = construirPlanERCA_DUA(inputs);
    setPlanGenerado(plan);
  };

  const limpiar = () => {
    setAsignatura("");
    setGrado("");
    setUnidad("");
    setDestreza("");
    setPlanGenerado("");
  };

  const copiar = async () => {
    if (!planGenerado) return;
    await navigator.clipboard.writeText(planGenerado);
    alert("✅ Planificación copiada al portapapeles");
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif", maxWidth: 980 }}>
      <h1 style={{ marginBottom: 6 }}>📘 Planificador ERCA Ecuador</h1>
      <p style={{ marginTop: 0 }}>
        Genera una planificación base con estructura <b>ERCA</b> y apoyos <b>DUA</b>.
      </p>

      <hr />

      <h2 style={{ marginBottom: 10 }}>🧑‍🏫 Datos del docente</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, maxWidth: 800 }}>
        <label>
          Asignatura:
          <input
            value={asignatura}
            onChange={(e) => setAsignatura(e.target.value)}
            type="text"
            style={{ width: "100%", padding: 8, marginTop: 6 }}
            placeholder="Ej: Matemática"
          />
        </label>

        <label>
          Grado / Curso:
          <input
            value={grado}
            onChange={(e) => setGrado(e.target.value)}
            type="text"
            style={{ width: "100%", padding: 8, marginTop: 6 }}
            placeholder="Ej: 7 EGB"
          />
        </label>

        <label>
          Unidad:
          <input
            value={unidad}
            onChange={(e) => setUnidad(e.target.value)}
            type="text"
            style={{ width: "100%", padding: 8, marginTop: 6 }}
            placeholder="Ej: 2"
          />
        </label>

        <label style={{ gridColumn: "1 / -1" }}>
          Destreza con criterio de desempeño:
          <textarea
            value={destreza}
            onChange={(e) => setDestreza(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 6, minHeight: 90 }}
            placeholder="Pega aquí la destreza del Currículo 2016 (con criterio)."
          />
        </label>
      </div>

      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={generar} style={{ padding: "10px 14px", cursor: "pointer" }}>
          Generar planificación (ERCA)
        </button>
        <button onClick={copiar} disabled={!planGenerado} style={{ padding: "10px 14px", cursor: "pointer" }}>
          Copiar
        </button>
        <button onClick={limpiar} style={{ padding: "10px 14px", cursor: "pointer" }}>
          Limpiar
        </button>
      </div>

      <hr style={{ marginTop: 18 }} />

      <h2 style={{ marginBottom: 10 }}>📄 Planificación generada</h2>

      {!planGenerado ? (
        <p style={{ opacity: 0.8 }}>
          Ingresa los datos y presiona <b>Generar planificación</b> para ver el resultado aquí.
        </p>
      ) : (
        <pre
          style={{
            whiteSpace: "pre-wrap",
            background: "#f5f5f5",
            padding: 14,
            borderRadius: 10,
            border: "1px solid #e0e0e0",
            lineHeight: 1.35,
          }}
        >
          {planGenerado}
        </pre>
      )}
    </main>
  );
}
