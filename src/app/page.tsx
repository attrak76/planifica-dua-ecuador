"use client";

import { useState } from "react";

export default function Home() {
  const [asignatura, setAsignatura] = useState("");
  const [grado, setGrado] = useState("");
  const [unidad, setUnidad] = useState("");
  const [destreza, setDestreza] = useState("");

  const [plan, setPlan] = useState<string>("");

  function generarPlanificacion() {
    const texto = `
PLANIFICACIÓN MICROCURRICULAR (ERCA + DUA)

1) DATOS INFORMATIVOS
- Asignatura: ${asignatura}
- Grado/Curso: ${grado}
- Unidad: ${unidad}
- Destreza con criterio de desempeño: ${destreza}

2) OBJETIVO DE APRENDIZAJE (Borrador)
- Al finalizar la clase, el estudiante aplicará la destreza propuesta mediante actividades estructuradas en ERCA, con apoyos DUA.

3) ERCA (con DUA)

E - EXPERIENCIA
- Actividad: Situación inicial breve relacionada con la destreza.
- DUA (Representación): ejemplo visual + consigna oral.
- DUA (Acción/Expresión): responder de forma oral, escrita o con dibujo.
- DUA (Compromiso): elección entre 2 opciones de actividad.

R - REFLEXIÓN
- Actividad: Preguntas guía: ¿Qué observaste?, ¿qué te resultó difícil?, ¿qué estrategia usaste?
- DUA (Representación): organizador gráfico simple (tabla o mapa).
- DUA (Acción/Expresión): explicar con audio, texto corto o lista de ideas.

C - CONCEPTUALIZACIÓN
- Actividad: Explicación del concepto/procedimiento clave + ejemplo resuelto.
- DUA (Representación): paso a paso + ejemplo + mini video (opcional).
- DUA (Acción/Expresión): completar un ejemplo guiado.
- DUA (Compromiso): reto por niveles (básico / medio / avanzado).

A - APLICACIÓN
- Actividad: Ejercicios / problema contextualizado alineado a la destreza.
- DUA (Acción/Expresión): entregar en hoja, digital o exposición breve.
- DUA (Compromiso): trabajo individual o en pareja, con roles.

4) EVALUACIÓN
- Evidencia: producto de la fase Aplicación.
- Instrumento: lista de cotejo / rúbrica breve.
- Criterios: comprensión, procedimiento, comunicación, precisión.

5) ADAPTACIONES / APOYOS DUA
- Andamiajes: ejemplos, plantilla, tiempo extra, lectura en voz alta si se requiere.
- Enriquecimiento: desafío extra para quien termina antes.
`.trim();

    setPlan(texto);
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial", maxWidth: 900 }}>
      <h1>📘 Planificador ERCA Ecuador</h1>
      <p>
        Genera una planificación base con estructura <b>ERCA</b> y apoyos <b>DUA</b>.
      </p>

      <hr />

      <h2>👩‍🏫 Datos del docente</h2>

      <div style={{ maxWidth: 520 }}>
        <label>
          Asignatura:
          <input
            value={asignatura}
            onChange={(e) => setAsignatura(e.target.value)}
            style={{ width: "100%", margin: "6px 0 14px", padding: 8 }}
          />
        </label>

        <label>
          Grado / Curso:
          <input
            value={grado}
            onChange={(e) => setGrado(e.target.value)}
            style={{ width: "100%", margin: "6px 0 14px", padding: 8 }}
          />
        </label>

        <label>
          Unidad:
          <input
            value={unidad}
            onChange={(e) => setUnidad(e.target.value)}
            style={{ width: "100%", margin: "6px 0 14px", padding: 8 }}
          />
        </label>

        <label>
          Destreza con criterio de desempeño:
          <textarea
            value={destreza}
            onChange={(e) => setDestreza(e.target.value)}
            style={{ width: "100%", margin: "6px 0 14px", padding: 8, minHeight: 90 }}
          />
        </label>

        <button
          type="button"
          onClick={generarPlanificacion}
          style={{ padding: "10px 14px", cursor: "pointer" }}
        >
          Generar planificación (ERCA)
        </button>
      </div>

      <hr />

      <h2>🧾 Planificación generada</h2>

      {!plan ? (
        <p>Completa los datos y pulsa “Generar planificación”.</p>
      ) : (
        <pre
          style={{
            whiteSpace: "pre-wrap",
            background: "#f5f5f5",
            padding: 16,
            borderRadius: 8,
            border: "1px solid #ddd",
          }}
        >
          {plan}
        </pre>
      )}
    </main>
  );
}
