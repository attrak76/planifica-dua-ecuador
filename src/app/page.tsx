"use client";

import { useMemo, useState } from "react";
import { matematicaPriorizado } from "@/data/curriculo/priorizado/matematica-egb";

type Nivel = "EGB" | "BGU";

function detectSubnivel(nivel: Nivel, gradoStr: string): string {
  const g = parseInt(gradoStr, 10);
  if (nivel === "BGU") return "BGU";
  if (!Number.isFinite(g)) return "EGB Preparatoria";
  if (g <= 1) return "EGB Preparatoria";
  if (g <= 4) return "EGB Elemental";
  if (g <= 7) return "EGB Media";
  return "EGB Superior";
}

function clampInt(x: any, fb: number, min = 0, max = 1000): number {
  const n = parseInt(String(x), 10);
  if (!Number.isFinite(n)) return fb;
  return Math.max(min, Math.min(max, n));
}

export default function Home() {
  const [asignatura] = useState("Matemática");
  const [nivel, setNivel] = useState<Nivel>("EGB");
  const [grado, setGrado] = useState("1");
  const [unidad, setUnidad] = useState("1");
  const [tema, setTema] = useState("");

  const [duracionTotal, setDuracionTotal] = useState(40);
  const [minE, setMinE] = useState(10);
  const [minR, setMinR] = useState(10);
  const [minC, setMinC] = useState(10);
  const [minA, setMinA] = useState(10);

  const curr = matematicaPriorizado;

  // subnivel sugerido por grado/nivel
  const subnivelSugerido = useMemo(() => detectSubnivel(nivel, grado), [nivel, grado]);

  // lista de subniveles disponibles en JSON
  const subnivelesDisponibles = useMemo(() => Object.keys(curr.subniveles), [curr.subniveles]);

  const [subnivel, setSubnivel] = useState<string>("EGB Preparatoria");
  // sincroniza subnivel con sugerido si existe
  useMemo(() => {
    if (subnivelesDisponibles.includes(subnivelSugerido)) {
      setSubnivel(subnivelSugerido);
    } else if (subnivelesDisponibles.length) {
      setSubnivel(subnivelesDisponibles[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subnivelSugerido, subnivelesDisponibles.join("|")]);

  const sub = curr.subniveles[subnivel];

  const destrezas = useMemo(() => sub?.destrezas ?? [], [sub]);
  const [destrezaCodigo, setDestrezaCodigo] = useState<string>("");

  // set destreza inicial si vacía
  useMemo(() => {
    if (!destrezas.length) {
      setDestrezaCodigo("");
      return;
    }
    const exists = destrezas.some((d) => d.codigo === destrezaCodigo);
    if (!destrezaCodigo || !exists) setDestrezaCodigo(destrezas[0].codigo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destrezas.map((d) => d.codigo).join("|")]);

  const destrezaSel = useMemo(
    () => destrezas.find((d) => d.codigo === destrezaCodigo),
    [destrezas, destrezaCodigo]
  );

  const objetivos = useMemo(() => sub?.objetivos ?? [], [sub]);
  const indicadores = useMemo(() => destrezaSel?.indicadores ?? [], [destrezaSel]);

  const [salida, setSalida] = useState<string>("");

  function generar() {
    const total = clampInt(duracionTotal, 40, 10, 240);
    const e = clampInt(minE, 10, 0, 240);
    const r = clampInt(minR, 10, 0, 240);
    const c = clampInt(minC, 10, 0, 240);
    const a = clampInt(minA, 10, 0, 240);

    const objetivoTxt =
      objetivos.length > 0
        ? objetivos.map((o) => `- ${o.codigo}: ${o.descripcion}`).join("\n")
        : "- (Sin objetivos cargados aún para este subnivel)";

    const destrezaTxt = destrezaSel
      ? `- ${destrezaSel.codigo}: ${destrezaSel.descripcion}`
      : "- (Selecciona una destreza)";

    const indicadoresTxt =
      indicadores.length > 0
        ? indicadores.map((i) => `- ${i.codigo}: ${i.descripcion}`).join("\n")
        : "- (Sin indicadores cargados para esta destreza)";

    const out = `PLANIFICACIÓN MICROCURRICULAR (ERCA + DUA) — Currículo Priorizado

Área: ${curr.area}
Fuente: ${curr.fuente}
Nivel: ${nivel}
Subnivel: ${subnivel}

1) DATOS INFORMATIVOS
- Asignatura: ${asignatura}
- Grado/Curso: ${grado}
- Unidad: ${unidad}
- Tema: ${tema || "(sin tema)"}

2) OBJETIVOS (Currículo)
${objetivoTxt}

3) DESTREZA CON CRITERIO DE DESEMPEÑO (Currículo)
${destrezaTxt}

4) INDICADORES DE EVALUACIÓN (Currículo)
${indicadoresTxt}

5) TIEMPO (ERCA)
- Duración total: ${total} min
- Distribución ERCA: E=${e} min | R=${r} min | C=${c} min | A=${a} min

6) ERCA + DUA (borrador base)
E — EXPERIENCIA
- Actividad: Situación inicial breve relacionada con el tema "${tema || "la destreza seleccionada"}".
- DUA (Representación): material concreto / pictogramas / ejemplo visual.
- DUA (Acción-Expresión): respuesta oral, dibujo o manipulación.
- DUA (Compromiso): elección entre 2 opciones de actividad.

R — REFLEXIÓN
- Preguntas guía: ¿Qué observaste? ¿Qué te resultó difícil? ¿Qué estrategia usaste?
- DUA (Representación): organizador gráfico simple (tabla / mapa).
- DUA (Acción-Expresión): explicar con audio/texto corto/lista.

C — CONCEPTUALIZACIÓN
- Construcción: definición + procedimiento + ejemplo guiado.
- DUA (Representación): pasos numerados + ejemplo resuelto + apoyos visuales.
- DUA (Acción-Expresión): completar pasos / resolver con andamiaje.
- DUA (Compromiso): retos por niveles (básico/medio/avanzado).

A — APLICACIÓN
- Tarea: problema contextualizado según la destreza.
- Evidencia: producto (hoja/mini-actividad).
- Evaluación: checklist/rúbrica breve basada en indicadores.
`;

    setSalida(out);
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif", maxWidth: 980, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 6 }}>📘 Planificador ERCA Ecuador</h1>
      <div style={{ marginBottom: 16 }}>
        Genera una planificación base con estructura <b>ERCA</b> y apoyos <b>DUA</b>, vinculada al{" "}
        <b>Currículo Priorizado por Competencias</b> (Matemática).
      </div>

      <hr />

      <h2 style={{ marginTop: 18, marginBottom: 10 }}>🧑‍🏫 Datos del docente</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label>Asignatura:</label>
          <input style={{ width: "100%" }} value={asignatura} readOnly />
        </div>

        <div>
          <label>Nivel:</label>
          <select style={{ width: "100%" }} value={nivel} onChange={(e) => setNivel(e.target.value as Nivel)}>
            <option value="EGB">EGB</option>
            <option value="BGU">BGU</option>
          </select>
        </div>

        <div>
          <label>Grado / Curso:</label>
          <input style={{ width: "100%" }} value={grado} onChange={(e) => setGrado(e.target.value)} />
          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>
            Subnivel sugerido: <b>{subnivelSugerido}</b>
          </div>
        </div>

        <div>
          <label>Unidad:</label>
          <input style={{ width: "100%" }} value={unidad} onChange={(e) => setUnidad(e.target.value)} />
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <label>Tema:</label>
        <input style={{ width: "100%" }} value={tema} onChange={(e) => setTema(e.target.value)} />
      </div>

      <hr style={{ marginTop: 18 }} />

      <h2 style={{ marginTop: 18, marginBottom: 10 }}>📌 Currículo (Matemática)</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label>Subnivel:</label>
          <select style={{ width: "100%" }} value={subnivel} onChange={(e) => setSubnivel(e.target.value)}>
            {subnivelesDisponibles.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>
            (Se llena desde <code>matematica.json</code>)
          </div>
        </div>

        <div>
          <label>Destreza (Currículo) — {subnivel}:</label>
          <select
            style={{ width: "100%" }}
            value={destrezaCodigo}
            onChange={(e) => setDestrezaCodigo(e.target.value)}
            disabled={!destrezas.length}
          >
            {destrezas.length ? (
              destrezas.map((d) => (
                <option key={d.codigo} value={d.codigo}>
                  {d.codigo} — {d.descripcion.slice(0, 90)}
                  {d.descripcion.length > 90 ? "..." : ""}
                </option>
              ))
            ) : (
              <option value="">(No hay destrezas cargadas en este subnivel)</option>
            )}
          </select>

          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>
            Seleccionada:{" "}
            <b>{destrezaSel ? `${destrezaSel.codigo} — ${destrezaSel.descripcion}` : "(ninguna)"}</b>
          </div>
        </div>
      </div>

      <hr style={{ marginTop: 18 }} />

      <h2 style={{ marginTop: 18, marginBottom: 10 }}>⏱️ Tiempo (ERCA)</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 12 }}>
        <div>
          <label>Duración total (min):</label>
          <input
            style={{ width: "100%" }}
            value={duracionTotal}
            onChange={(e) => setDuracionTotal(clampInt(e.target.value, 40, 10, 240))}
          />
        </div>
        <div>
          <label>E (min):</label>
          <input style={{ width: "100%" }} value={minE} onChange={(e) => setMinE(clampInt(e.target.value, 10))} />
        </div>
        <div>
          <label>R (min):</label>
          <input style={{ width: "100%" }} value={minR} onChange={(e) => setMinR(clampInt(e.target.value, 10))} />
        </div>
        <div>
          <label>C (min):</label>
          <input style={{ width: "100%" }} value={minC} onChange={(e) => setMinC(clampInt(e.target.value, 10))} />
        </div>
        <div>
          <label>A (min):</label>
          <input style={{ width: "100%" }} value={minA} onChange={(e) => setMinA(clampInt(e.target.value, 10))} />
        </div>
      </div>

      <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
        Sugerencia: E=10 | R=10 | C=10 | A=10 (ajusta según tu clase)
      </div>

      <div style={{ marginTop: 16 }}>
        <button
          type="button"
          onClick={generar}
          style={{
            padding: "10px 14px",
            border: "2px solid #000",
            background: "#fff",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          Generar planificación (ERCA + Currículo)
        </button>
      </div>

      <hr style={{ marginTop: 18 }} />

      <h2 style={{ marginTop: 18, marginBottom: 10 }}>📄 Planificación generada</h2>

      <pre
        style={{
          whiteSpace: "pre-wrap",
          background: "#f4f4f4",
          padding: 14,
          borderRadius: 8,
          border: "1px solid #ddd",
          minHeight: 160,
        }}
      >
        {salida || "Presiona “Generar planificación (ERCA + Currículo)” para ver el resultado aquí."}
      </pre>
    </main>
  );
}
