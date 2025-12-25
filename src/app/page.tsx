"use client";

import { useState } from "react";

export default function Home() {
  const [asignatura, setAsignatura] = useState("");
  const [grado, setGrado] = useState("");
  const [unidad, setUnidad] = useState("");
  const [destreza, setDestreza] = useState("");

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>📘 Planificador DUA Ecuador</h1>

      <p>
        Aplicación web para generar planificaciones basadas en el Currículo de
        Educación del Ecuador con enfoque DUA.
      </p>

      <hr />

      <h2>👩‍🏫 Datos del docente</h2>

      <form style={{ maxWidth: "500px" }}>
        <label>
          Asignatura:
          <input
            type="text"
            value={asignatura}
            onChange={(e) => setAsignatura(e.target.value)}
            style={{ width: "100%", marginBottom: "1rem" }}
          />
        </label>

        <label>
          Grado / Curso:
          <input
            type="text"
            value={grado}
            onChange={(e) => setGrado(e.target.value)}
            style={{ width: "100%", marginBottom: "1rem" }}
          />
        </label>

        <label>
          Unidad:
          <input
            type="text"
            value={unidad}
            onChange={(e) => setUnidad(e.target.value)}
            style={{ width: "100%", marginBottom: "1rem" }}
          />
        </label>

        <label>
          Destreza con criterio de desempeño:
          <textarea
            value={destreza}
            onChange={(e) => setDestreza(e.target.value)}
            style={{ width: "100%", marginBottom: "1rem" }}
          />
        </label>

        <button
          type="button"
          onClick={() => {
            alert(
              `Asignatura: ${asignatura}\nGrado: ${grado}\nUnidad: ${unidad}\nDestreza: ${destreza}`
            );
          }}
        >
          Generar planificación
        </button>
      </form>

      <hr />

      <h2>🎯 Objetivo</h2>
      <p>
        Generar automáticamente una planificación con destrezas, actividades y
        evaluación alineadas al DUA.
      </p>
    </main>
  );
}
