"use client";

import { useMemo, useState } from "react";
import { matematicaEGB2016 } from "@/data/curriculo/ecuador2016/matematica-egb";

type ERCAmins = { E: number; R: number; C: number; A: number };

function inferSubnivel(grado: string) {
  const g = parseInt(grado.replace(/\D/g, ""), 10);
  if (!Number.isFinite(g)) return "EGB Superior";
  if (g <= 4) return "EGB Media";
  if (g <= 7) return "EGB Superior";
  return "Bachillerato";
}

function normalize(s: string) {
  return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function pickBestMatch(items: any[], tema: string, fallbackIndex = 0) {
  const t = normalize(tema);
  if (!t) return items?.[fallbackIndex] ?? null;

  // Muy simple: si el tema contiene “fraccion”, “equivalente”, etc.
  const prefer = [
    { key: "fraccion", w: 3 },
    { key: "equivalente", w: 3 },
    { key: "numerador", w: 1 },
    { key: "denominador", w: 1 },
  ];

  let best = null;
  let bestScore = -1;

  for (const it of items || []) {
    const text = normalize(`${it.codigo ?? ""} ${it.descripcion ?? ""}`);
    let score = 0;
    for (const p of prefer) {
      if (t.includes(p.key) && text.includes(p.key)) score += p.w;
      if (t.includes(p.key) && text.includes(p.key.slice(0, 4))) score += 1;
    }
    // pequeño bonus si comparte palabras
    const words = t.split(/\s+/).filter(Boolean);
    for (const w of words) if (w.length >= 4 && text.includes(w)) score += 1;

    if (score > bestScore) {
      bestScore = score;
      best = it;
    }
  }

  return best ?? items?.[fallbackIndex] ?? null;
}

function buildERCA(tema: string, mins: ERCAmins) {
  const t = tema?.trim() || "el tema seleccionado";

  return {
    E: {
      titulo: `E — EXPERIENCIA (${mins.E} min)`,
      actividad: `Situación inicial breve y contextualizada sobre ${t}. (Ej.: reto rápido con material o imagen).`,
      dua: {
        rep: "Presentar un ejemplo visual + material concreto (tiras, fichas, recta numérica) y una consigna clara (oral + escrita).",
        act: "Permitir responder con dibujo, oral, escrito o manipulativo. Plantilla de apoyo para quien lo necesite.",
        comp: "Dar elección entre 2 opciones de reto (fácil/medio) o ejemplo contextual (comida/medidas/juego).",
      },
    },
    R: {
      titulo: `R — REFLEXIÓN (${mins.R} min)`,
      actividad: `Preguntas guía: ¿qué observaste?, ¿qué te resultó difícil?, ¿qué estrategia usaste?, ¿qué patrones viste en ${t}?`,
      dua: {
        rep: "Organizador gráfico simple (tabla/diagrama/mapa) para registrar ideas y ejemplos.",
        act: "Responder con audio corto, lista de ideas, esquema o explicación en pareja.",
        comp: "Retroalimentación inmediata y normas de participación (turnos, roles) para seguridad emocional.",
      },
    },
    C: {
      titulo: `C — CONCEPTUALIZACIÓN (${mins.C} min)`,
      actividad: `Formalización del concepto central de ${t}: definición, ejemplos/no-ejemplos y procedimiento paso a paso.`,
      dua: {
        rep: "Mini-explicación con 2 representaciones (gráfica + simbólica). Glosario (numerador/denominador/equivalencia).",
        act: "Ejercicios guiados por niveles (A/B/C) y apoyo con pistas (scaffold) progresivas.",
        comp: "Metas claras + checklist de avance (“ya puedo construir fracciones equivalentes”).",
      },
    },
    A: {
      titulo: `A — APLICACIÓN (${mins.A} min)`,
      actividad: `Aplicación en contexto: resolver 3–5 situaciones sobre ${t} y justificar el procedimiento.`,
      dua: {
        rep: "Problemas con contexto + una versión simplificada del enunciado (lectura fácil).",
        act: "Producto a elegir: resolver en cuaderno, en cartel, o en explicación breve tipo “mini tutorial”.",
        comp: "Reto opcional para quienes avanzan más rápido y apoyo adicional para quienes lo requieren.",
      },
    },
  };
}

export default function Home() {
  const [asignatura, setAsignatura] = useState("Matemática");
  const [grado, setGrado] = useState("7 EGB");
  const [unidad, setUnidad] = useState("2");
  const [tema, setTema] = useState("fracciones equivalentes");

  const [duracionTotal, setDuracionTotal] = useState(40);
  const [minE, setMinE] = useState(10);
  const [minR, setMinR] = useState(10);
  const [minC, setMinC] = useState(10);
  const [minA, setMinA] = useState(10);

  const [output, setOutput] = useState("");

  const subnivel = useMemo(() => inferSubnivel(grado), [grado]);

  const curr = useMemo(() => {
    const sn = matematicaEGB2016.subniveles?.[subnivel] ?? matematicaEGB2016.subniveles?.["EGB Superior"];
    const objetivo = sn?.objetivos?.[0] ?? null;
    const destreza = pickBestMatch(sn?.destrezas ?? [], tema, 0);
    const indicador = destreza?.indicadores?.[0] ?? null;
    return { sn, objetivo, destreza, indicador };
  }, [subnivel, tema]);

  function generar() {
    const mins: ERCAmins = { E: minE, R: minR, C: minC, A: minA };
    const erca = buildERCA(tema, mins);

    const objTxt = curr.objetivo
      ? `- ${curr.objetivo.codigo}: ${curr.objetivo.descripcion}`
      : `- (No encontrado)`;

    const desTxt = curr.destreza
      ? `- ${curr.destreza.codigo}: ${curr.destreza.descripcion}`
      : `- (No encontrada)`;

    const indTxt = curr.indicador
      ? `- ${curr.indicador.codigo}: ${curr.indicador.descripcion}`
      : `- (No encontrado)`;

    const total = Number(duracionTotal) || 40;

    const text = `PLANIFICACIÓN MICROCURRICULAR (ERCA + DUA) — Currículo Ecuador 2016
Área: ${matematicaEGB2016.area} | Año: ${matematicaEGB2016.anio}
Subnivel: ${subnivel}

1) DATOS INFORMATIVOS
- Asignatura: ${asignatura}
- Grado/Curso: ${grado}
- Unidad: ${unidad}
- Tema: ${tema}

2) TIEMPO
- Duración total: ${total} minutos
- Distribución ERCA: E=${mins.E} min | R=${mins.R} min | C=${mins.C} min | A=${mins.A} min

3) OBJETIVO (Currículo 2016)
${objTxt}

4) DESTREZA CON CRITERIO DE DESEMPEÑO (Currículo 2016)
${desTxt}

5) INDICADORES DE EVALUACIÓN (Currículo 2016)
${indTxt}

6) ERCA (con apoyos DUA)

${erca.E.titulo}
- Actividad: ${erca.E.actividad}
- DUA (Representación): ${erca.E.dua.rep}
- DUA (Acción/Expresión): ${erca.E.dua.act}
- DUA (Compromiso): ${erca.E.dua.comp}

${erca.R.titulo}
- Actividad: ${erca.R.actividad}
- DUA (Representación): ${erca.R.dua.rep}
- DUA (Acción/Expresión): ${erca.R.dua.act}
- DUA (Compromiso): ${erca.R.dua.comp}

${erca.C.titulo}
- Actividad: ${erca.C.actividad}
- DUA (Representación): ${erca.C.dua.rep}
- DUA (Acción/Expresión): ${erca.C.dua.act}
- DUA (Compromiso): ${erca.C.dua.comp}

${erca.A.titulo}
- Actividad: ${erca.A.actividad}
- DUA (Representación): ${erca.A.dua.rep}
- DUA (Acción/Expresión): ${erca.A.dua.act}
- DUA (Compromiso): ${erca.A.dua.comp}
`;

    setOutput(text);
  }

  const sumaERCA = (Number(minE) || 0) + (Number(minR) || 0) + (Number(minC) || 0) + (Number(minA) || 0);

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>📘 Planificador ERCA Ecuador</h1>
      <p>Genera una planificación base con estructura ERCA y apoyos DUA, vinculada al Currículo Ecuador 2016.</p>

      <hr />

      <h2>👩‍🏫 Datos del docente</h2>

      <div style={{ maxWidth: 720 }}>
        <label>
          Asignatura:
          <input value={asignatura} onChange={(e) => setAsignatura(e.target.value)} style={{ width: "100%", marginBottom: 10 }} />
        </label>

        <label>
          Grado / Curso:
          <input value={grado} onChange={(e) => setGrado(e.target.value)} style={{ width: "100%", marginBottom: 10 }} />
        </label>

        <label>
          Unidad:
          <input value={unidad} onChange={(e) => setUnidad(e.target.value)} style={{ width: "100%", marginBottom: 10 }} />
        </label>

        <label>
          Tema:
          <input value={tema} onChange={(e) => setTema(e.target.value)} style={{ width: "100%", marginBottom: 10 }} />
        </label>

        <h3>⏱️ Tiempo</h3>
        <label>
          Duración total (min):
          <input
            type="number"
            value={duracionTotal}
            onChange={(e) => setDuracionTotal(parseInt(e.target.value || "0", 10))}
            style={{ width: "100%", marginBottom: 10 }}
          />
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          <label>
            E (min):
            <input type="number" value={minE} onChange={(e) => setMinE(parseInt(e.target.value || "0", 10))} style={{ width: "100%" }} />
          </label>
          <label>
            R (min):
            <input type="number" value={minR} onChange={(e) => setMinR(parseInt(e.target.value || "0", 10))} style={{ width: "100%" }} />
          </label>
          <label>
            C (min):
            <input type="number" value={minC} onChange={(e) => setMinC(parseInt(e.target.value || "0", 10))} style={{ width: "100%" }} />
          </label>
          <label>
            A (min):
            <input type="number" value={minA} onChange={(e) => setMinA(parseInt(e.target.value || "0", 10))} style={{ width: "100%" }} />
          </label>
        </div>

        <p style={{ marginTop: 10 }}>
          ✅ Subnivel detectado: <b>{subnivel}</b> <br />
          ⏱️ Suma ERCA: <b>{sumaERCA}</b> min (recomendado = duración total)
        </p>

        <button
          type="button"
          onClick={generar}
          style={{ marginTop: 10, padding: "10px 14px", fontWeight: "bold" }}
        >
          Generar planificación (ERCA)
        </button>
      </div>

      <hr />

      <h2>📄 Planificación generada</h2>
      <pre style={{ whiteSpace: "pre-wrap", background: "#f6f6f6", padding: 14, borderRadius: 8 }}>
        {output || "Aún no generas la planificación. Completa los campos y pulsa el botón."}
      </pre>
    </main>
  );
}
