"use client";

import { useMemo, useState } from "react";

type PlanInputs = {
  asignatura: string;
  grado: string;
  unidad: string;
  tema: string;
  destreza: string;
  duracionTotal: number; // minutos
  minE: number;
  minR: number;
  minC: number;
  minA: number;
};

function safe(v: string) {
  return (v || "").trim();
}

function construirObjetivo({ destreza }: PlanInputs) {
  const d = safe(destreza);
  if (!d) {
    return `Al finalizar la clase, el estudiante desarrollará la destreza propuesta mediante actividades estructuradas en ERCA, con apoyos DUA (representación, acción/expresión y compromiso).`;
  }
  return `Al finalizar la clase, el estudiante desarrollará la destreza propuesta: “${d}”, mediante actividades estructuradas en ERCA, con apoyos DUA (representación, acción/expresión y compromiso).`;
}

function sugerirIndicadores(destreza: string) {
  const d = destreza.toLowerCase();

  // Heurística simple por verbos frecuentes (puedes ajustar cuando quieras)
  const base = [
    "Comprende la consigna y organiza el procedimiento (pasos claros).",
    "Aplica el procedimiento/concepto con precisión (cálculos/razonamiento correcto).",
    "Explica y justifica su respuesta con vocabulario matemático adecuado.",
    "Participa activamente y coopera respetando roles y acuerdos.",
  ];

  if (d.includes("resolver") || d.includes("soluciona") || d.includes("calcular")) {
    return [
      "Plantea correctamente datos y estrategia para resolver la situación.",
      "Realiza cálculos/procedimientos con exactitud y verifica resultados.",
      "Explica el proceso paso a paso (oral o escrito) usando lenguaje matemático.",
      "Relaciona la solución con el contexto del problema (interpretación).",
    ];
  }

  if (d.includes("representar") || d.includes("grafic") || d.includes("ubicar")) {
    return [
      "Representa información correctamente (tabla, gráfico, recta, diagrama, etc.).",
      "Identifica elementos clave de la representación (puntos, ejes, escala, partes).",
      "Explica qué muestra su representación y cómo la construyó.",
      "Interpreta la representación para responder preguntas del contexto.",
    ];
  }

  if (d.includes("comparar") || d.includes("clasificar") || d.includes("ordenar")) {
    return [
      "Establece criterios claros de comparación/clasificación/orden.",
      "Aplica los criterios correctamente en ejemplos variados.",
      "Justifica por qué clasifica/ordena de esa manera (argumentación).",
      "Detecta y corrige errores (autoevaluación y mejora).",
    ];
  }

  return base;
}

function listaCotejo(indicadores: string[]) {
  return `
INSTRUMENTO: LISTA DE COTEJO (Marque: Sí / En proceso / No)

| # | Indicador | Sí | En proceso | No | Observaciones |
|---|----------|:--:|:----------:|:--:|--------------|
${indicadores
  .map(
    (it, idx) =>
      `| ${idx + 1} | ${it} | ☐ | ☐ | ☐ | __________________________ |`
  )
  .join("\n")}
`.trim();
}

function construirPlanERCA_DUA(inputs: PlanInputs) {
  const asignatura = safe(inputs.asignatura) || "—";
  const grado = safe(inputs.grado) || "—";
  const unidad = safe(inputs.unidad) || "—";
  const tema = safe(inputs.tema) || "—";
  const destreza = safe(inputs.destreza) || "—";

  const objetivo = construirObjetivo(inputs);
  const indicadores = sugerirIndicadores(safe(inputs.destreza));
  const cotejo = listaCotejo(indicadores);

  const total = inputs.duracionTotal;
  const tE = inputs.minE;
  const tR = inputs.minR;
  const tC = inputs.minC;
  const tA = inputs.minA;

  const suma = tE + tR + tC + tA;

  return `
PLANIFICACIÓN MICROCURRICULAR (ERCA + DUA) — BORRADOR INSTITUCIONAL

1) DATOS INFORMATIVOS
- Asignatura: ${asignatura}
- Grado/Curso: ${grado}
- Unidad: ${unidad}
- Tema: ${tema}
- Destreza con criterio de desempeño: ${destreza}

2) TIEMPO
- Duración total: ${total} minutos
- Distribución ERCA: E=${tE} min | R=${tR} min | C=${tC} min | A=${tA} min
${suma !== total ? `⚠ Nota: La suma (E+R+C+A=${suma}) no coincide con la duración total (${total}). Ajusta los minutos.` : ""}

3) OBJETIVO DE APRENDIZAJE
- ${objetivo}

4) ERCA CON APOYOS DUA (METODOLOGÍA)

E — EXPERIENCIA (${tE} min)
- Activación:
  • Situación inicial contextual (imagen / mini-video / material concreto) relacionada con el tema: "${tema}".
  • Preguntas detonantes: ¿Qué observas? ¿Qué sabes del tema? ¿Qué crees que pasará?
- DUA (Representación): consigna en 2 formatos (oral + escrito) + ejemplo breve.
- DUA (Acción/Expresión): responder oral / escrito / esquema / dibujo / manipulación.
- DUA (Compromiso): elección entre 2 ejemplos o trabajo individual/pareja.

R — REFLEXIÓN (${tR} min)
- Metacognición:
  • Registro rápido: “Lo que entendí / lo que me costó / mi estrategia”.
  • Socialización: comparte con compañero/a y mejora una idea.
- DUA (Representación): organizador (tabla / mapa / lista de pasos).
- DUA (Acción/Expresión): explicación corta (texto, audio, viñetas).
- DUA (Compromiso): roles (portavoz, registrador, verificador) para participación equitativa.

C — CONCEPTUALIZACIÓN (${tC} min)
- Construcción:
  • Modelado docente (pienso en voz alta): concepto/procedimiento del tema "${tema}".
  • Ejemplos graduados (simple → medio → reto) con pasos numerados.
  • Práctica guiada con retroalimentación inmediata.
- DUA (Representación): glosario mínimo + ejemplo resuelto + resaltado de partes clave.
- DUA (Acción/Expresión): plantilla de pasos / apoyos visuales / material concreto.
- DUA (Compromiso): “semáforo” (verde-amarillo-rojo) para auto-monitoreo.

A — APLICACIÓN (${tA} min)
- Desempeño:
  • Tarea auténtica:
    - 1 ejercicio básico + 1 medio + 1 reto (relacionados a la destreza).
    - O producto breve: mini-infografía / explicación / ejemplo propio.
- DUA (Representación): criterios claros + ejemplo de producto esperado.
- DUA (Acción/Expresión): opciones de entrega (escrito / oral / video corto / infografía).
- DUA (Compromiso): conexión con contexto local (hogar, comunidad, escuela).

5) RECURSOS
- Pizarra / cuaderno / marcadores
- Hojas de trabajo (impresas o digitales)
- Material concreto (según tema)
- Recurso digital opcional: video corto / simulador simple

6) EVIDENCIAS DE APRENDIZAJE
- Registro en R (metacognición)
- Resolución guiada en C
- Producto o ejercicios de A

7) EVALUACIÓN
7.1 Indicadores (sugeridos)
${indicadores.map((x, i) => `- ${i + 1}. ${x}`).join("\n")}

7.2 ${cotejo}

8) ADECUACIONES Y ATENCIÓN A LA DIVERSIDAD (DUA)
- Apoyos generales:
  • Fragmentar tareas en pasos cortos.
  • Tiempo adicional y pausas activas.
  • Banco de palabras / glosario / ejemplo resuelto.
  • Evaluación flexible: oral/escrita/organizador gráfico.

- Ajustes específicos:
  • TDAH: instrucciones en 1–2 pasos, temporizador visible, pausas activas, ubicación estratégica, refuerzo positivo inmediato.
  • Dislexia: letra clara, menos texto por línea, lectura acompañada, consignas con pictogramas, permitir respuesta oral.
  • TEA: anticipación de rutina, consigna concreta, apoyo visual, opción de trabajo individual, minimizar estímulos.
  • Baja visión: tamaño de fuente mayor, alto contraste, material impreso ampliado, lectura en voz alta.
  • Altas capacidades: reto adicional (problema extendido), rol de tutor par, opción de explicar/crear ejemplo propio.

9) TAREA PARA CASA (opcional)
- 1 ejercicio de refuerzo + 1 ejercicio aplicado a un contexto real (familia/escuela/comunidad).
`.trim();
}

export default function Home() {
  const [asignatura, setAsignatura] = useState("");
  const [grado, setGrado] = useState("");
  const [unidad, setUnidad] = useState("");
  const [tema, setTema] = useState("");
  const [destreza, setDestreza] = useState("");

  const [duracionTotal, setDuracionTotal] = useState<number>(40);
  const [minE, setMinE] = useState<number>(10);
  const [minR, setMinR] = useState<number>(10);
  const [minC, setMinC] = useState<number>(10);
  const [minA, setMinA] = useState<number>(10);

  const inputs: PlanInputs = useMemo(
    () => ({
      asignatura,
      grado,
      unidad,
      tema,
      destreza,
      duracionTotal,
      minE,
      minR,
      minC,
      minA,
    }),
    [asignatura, grado, unidad, tema, destreza, duracionTotal, minE, minR, minC, minA]
  );

  const [planGenerado, setPlanGenerado] = useState<string>("");

  const generar = () => {
    const plan = construirPlanERCA_DUA(inputs);
    setPlanGenerado(plan);
  };

  const copiar = async () => {
    if (!planGenerado) return;
    await navigator.clipboard.writeText(planGenerado);
    alert("✅ Planificación copiada al portapapeles");
  };

  const limpiar = () => {
    setAsignatura("");
    setGrado("");
    setUnidad("");
    setTema("");
    setDestreza("");
    setPlanGenerado("");
  };

  const numInputStyle: React.CSSProperties = { width: 90, padding: 8, marginTop: 6 };

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif", maxWidth: 1100 }}>
      <h1 style={{ marginBottom: 6 }}>📘 Planificador ERCA Ecuador</h1>
      <p style={{ marginTop: 0 }}>
        Genera planificación con estructura <b>ERCA</b> + apoyos <b>DUA</b> + evaluación (indicadores y lista de cotejo).
      </p>

      <hr />

      <h2 style={{ marginBottom: 10 }}>🧑‍🏫 Datos</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, maxWidth: 900 }}>
        <label>
          Asignatura:
          <input value={asignatura} onChange={(e) => setAsignatura(e.target.value)} type="text" style={{ width: "100%", padding: 8, marginTop: 6 }} />
        </label>

        <label>
          Grado / Curso:
          <input value={grado} onChange={(e) => setGrado(e.target.value)} type="text" style={{ width: "100%", padding: 8, marginTop: 6 }} />
        </label>

        <label>
          Unidad:
          <input value={unidad} onChange={(e) => setUnidad(e.target.value)} type="text" style={{ width: "100%", padding: 8, marginTop: 6 }} />
        </label>

        <label>
          Tema:
          <input value={tema} onChange={(e) => setTema(e.target.value)} type="text" style={{ width: "100%", padding: 8, marginTop: 6 }} placeholder="Ej: Fracciones equivalentes" />
        </label>

        <label style={{ gridColumn: "1 / -1" }}>
          Destreza con criterio de desempeño:
          <textarea value={destreza} onChange={(e) => setDestreza(e.target.value)} style={{ width: "100%", padding: 8, marginTop: 6, minHeight: 90 }} />
        </label>
      </div>

      <h2 style={{ marginTop: 18, marginBottom: 10 }}>⏱️ Tiempo</h2>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "end" }}>
        <label>
          Total (min):
          <input
            type="number"
            value={duracionTotal}
            onChange={(e) => setDuracionTotal(Number(e.target.value || 0))}
            style={numInputStyle}
          />
        </label>

        <label>
          E (min):
          <input type="number" value={minE} onChange={(e) => setMinE(Number(e.target.value || 0))} style={numInputStyle} />
        </label>

        <label>
          R (min):
          <input type="number" value={minR} onChange={(e) => setMinR(Number(e.target.value || 0))} style={numInputStyle} />
        </label>

        <label>
          C (min):
          <input type="number" value={minC} onChange={(e) => setMinC(Number(e.target.value || 0))} style={numInputStyle} />
        </label>

        <label>
          A (min):
          <input type="number" value={minA} onChange={(e) => setMinA(Number(e.target.value || 0))} style={numInputStyle} />
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
          Completa los campos y presiona <b>Generar planificación</b>.
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
