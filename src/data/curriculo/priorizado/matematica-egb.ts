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
      objetivos?: any[];
      destrezas?: any[];
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
  const area = (s(json?.meta?.area, "Matemática") as "Matemática") || "Matemática";
  const fuente = s(json?.meta?.fuente, "MINEDUC Ecuador — Currículo Priorizado por Competencias");

  const subniveles: Record<string, Subnivel> = {};
  const rawSubs = json?.subniveles ?? {};

  for (const [nombre, sub] of Object.entries(rawSubs)) {
    const objetivos: Objetivo[] = arr<any>(sub?.objetivos).map((o) => ({
      codigo: s(o?.codigo),
      descripcion: s(o?.descripcion),
    }));

    const destrezas: Destreza[] = arr<any>(sub?.destrezas).map((d) => ({
      codigo: s(d?.codigo),
      descripcion: s(d?.descripcion),
      indicadores: arr<any>(d?.indicadores).map((i) => ({
        codigo: s(i?.codigo),
        descripcion: s(i?.descripcion),
      })),
    }));

    subniveles[nombre] = { nombre, objetivos, destrezas };
  }

  return { area, fuente, subniveles };
}

export const matematicaPriorizado = normalize(raw as any);

/**
 * Filtro ESTRICTO por prefijo de código según subnivel:
 * - Preparatoria: M.1.*
 * - Elemental: M.2.*
 * - Media: M.3.*
 * - Superior: M.4.* o M.5.*
 */
export function filtroDestrezasPorSubnivel(nombreSubnivel: string, destrezas: Destreza[]): Destreza[] {
  const rules: Record<string, RegExp> = {
    "EGB Preparatoria": /^M\.1\./,
    "EGB Elemental": /^M\.2\./,
    "EGB Media": /^M\.3\./,
    "EGB Superior": /^M\.(4|5)\./,
  };

  const re = rules[nombreSubnivel];
  if (!re) return destrezas; // si no hay regla (p.ej. BGU), no filtramos por ahora

  return destrezas.filter((d) => re.test(d.codigo));
}
