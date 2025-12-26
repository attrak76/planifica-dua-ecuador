import raw from "./matematica.json";

export type Indicador = { codigo: string; descripcion: string };
export type Objetivo = { codigo: string; descripcion: string };
export type Destreza = { codigo: string; descripcion: string; indicadores: Indicador[] };

export type Subnivel = {
  nombre: string;
  objetivos: Objetivo[];
  destrezas: Destreza[];
};

export type CurriculoMatematica = {
  area: string;
  fuente: string;
  subniveles: Record<string, Subnivel>;
};

type RawJson = {
  meta?: { area?: string; fuente?: string };
  subniveles?: Record<
    string,
    {
      objetivos?: Array<{ codigo?: any; descripcion?: any }>;
      destrezas?: Array<{
        codigo?: any;
        descripcion?: any;
        indicadores?: Array<{ codigo?: any; descripcion?: any }>;
      }>;
    }
  >;
};

function s(x: any, fb = ""): string {
  return typeof x === "string" ? x.trim() : fb;
}
function arr<T>(x: any): T[] {
  return Array.isArray(x) ? (x as T[]) : [];
}

export function prefijoPorSubnivel(nombre: string): RegExp | null {
  // Ajusta si tu currículo usa otros prefijos por subnivel
  const n = nombre.toLowerCase();
  if (n.includes("preparatoria")) return /^M\.1\./i;
  if (n.includes("elemental")) return /^M\.2\./i;
  if (n.includes("media")) return /^M\.3\./i;
  if (n.includes("superior")) return /^M\.4\./i;
  if (n === "bgu" || n.includes("bgu")) return /^M\.5\./i; // por defecto
  return null;
}

function normalize(json: RawJson): CurriculoMatematica {
  const area = s(json?.meta?.area, "Matemática");
  const fuente = s(json?.meta?.fuente, "Currículo Priorizado por Competencias (Ecuador)");

  const out: CurriculoMatematica = {
    area,
    fuente,
    subniveles: {},
  };

  const subs = json?.subniveles ?? {};
  for (const [subNombre, subData] of Object.entries(subs)) {
    // ✅ IMPORTANTÍSIMO: crear NUEVOS arreglos por subnivel (no reutilizar referencias)
    const objetivos: Objetivo[] = arr(subData?.objetivos).map((o: any) => ({
      codigo: s(o?.codigo),
      descripcion: s(o?.descripcion),
    })).filter(o => o.codigo || o.descripcion);

    const destrezasCrudas: Destreza[] = arr(subData?.destrezas).map((d: any) => ({
      codigo: s(d?.codigo),
      descripcion: s(d?.descripcion),
      indicadores: arr(d?.indicadores).map((i: any) => ({
        codigo: s(i?.codigo),
        descripcion: s(i?.descripcion),
      })).filter(i => i.codigo || i.descripcion),
    })).filter(d => d.codigo || d.descripcion);

    // ✅ Filtro de seguridad por prefijo para que NO se mezclen M.1 en Elemental, etc.
    const rx = prefijoPorSubnivel(subNombre);
    const destrezas = rx ? destrezasCrudas.filter(d => rx.test(d.codigo)) : destrezasCrudas;

    out.subniveles[subNombre] = {
      nombre: subNombre,
      objetivos,
      destrezas,
    };
  }

  return out;
}

export const matematicaPriorizado: CurriculoMatematica = normalize(raw as any);
