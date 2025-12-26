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
  area: "Matemática";
  fuente: string;
  subniveles: Record<string, Subnivel>;
};

type RawJson = {
  meta?: { area?: string; fuente?: string };
  subniveles?: Record<
    string,
    {
      objetivos?: Array<{ codigo?: string; descripcion?: string }>;
      destrezas?: Array<{
        codigo?: string;
        descripcion?: string;
        indicadores?: Array<{ codigo?: string; descripcion?: string }>;
      }>;
    }
  >;
};

function s(x: any, fb = ""): string {
  return typeof x === "string" ? x : fb;
}

function arr<T>(x: any): T[] {
  return Array.isArray(x) ? (x as T[]) : [];
}

function normalize(json: RawJson): CurriculoMatematica {
  const area = "Matemática" as const;
  const fuente = s(json?.meta?.fuente, "MINEDUC Ecuador — Currículo Priorizado");

  const out: Record<string, Subnivel> = {};
  const subs = json?.subniveles ?? {};

  for (const [nombre, sub] of Object.entries(subs)) {
    const objetivos = arr<any>(sub?.objetivos).map((o) => ({
      codigo: s(o?.codigo, ""),
      descripcion: s(o?.descripcion, ""),
    })).filter(o => o.codigo || o.descripcion);

    const destrezas = arr<any>(sub?.destrezas).map((d) => ({
      codigo: s(d?.codigo, ""),
      descripcion: s(d?.descripcion, ""),
      indicadores: arr<any>(d?.indicadores).map((i) => ({
        codigo: s(i?.codigo, ""),
        descripcion: s(i?.descripcion, ""),
      })).filter(i => i.codigo || i.descripcion),
    })).filter(d => d.codigo || d.descripcion);

    out[nombre] = {
      nombre,
      objetivos,
      destrezas,
    };
  }

  return { area, fuente, subniveles: out };
}

export const matematicaPriorizado: CurriculoMatematica = normalize(raw as RawJson);
