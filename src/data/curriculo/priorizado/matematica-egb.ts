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
function arrT<T>(x: any): T[] {
  return Array.isArray(x) ? (x as T[]) : [];
}

function normalize(json: RawJson): CurriculoMatematica {
  const area = (s(json?.meta?.area, "Matemática") as "Matemática");
  const fuente = s(json?.meta?.fuente, "MINEDUC Ecuador — Currículo Priorizado por Competencias");

  const out: Record<string, Subnivel> = {};
  const subs = json?.subniveles ?? {};

  for (const [nombre, sub] of Object.entries(subs)) {
    const objetivos = arrT<any>(sub?.objetivos).map((o) => ({
      codigo: s(o?.codigo),
      descripcion: s(o?.descripcion),
    })).filter((o) => o.codigo || o.descripcion);

    const destrezas = arrT<any>(sub?.destrezas)
      .map((d) => ({
        codigo: s(d?.codigo),
        descripcion: s(d?.descripcion),
        indicadores: arrT<any>(d?.indicadores)
          .map((i) => ({ codigo: s(i?.codigo), descripcion: s(i?.descripcion) }))
          .filter((i) => i.codigo || i.descripcion),
      }))
      .filter((d) => d.codigo || d.descripcion);

    out[nombre] = { nombre, objetivos, destrezas };
  }

  // Asegura llaves base aunque estén vacías (para que el UI no reviente)
  const base = ["EGB Preparatoria", "EGB Elemental", "EGB Media", "EGB Superior", "BGU"];
  for (const k of base) {
    if (!out[k]) out[k] = { nombre: k, objetivos: [], destrezas: [] };
  }

  return { area, fuente, subniveles: out };
}

export const matematicaPriorizado = normalize(raw as unknown as RawJson);
