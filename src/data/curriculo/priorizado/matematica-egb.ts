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
  subniveles?: Record<string, { objetivos?: any[]; destrezas?: any[] }>;
};

function s(x: any, fb = ""): string {
  return typeof x === "string" ? x : fb;
}
function arr<T>(x: any): T[] {
  return Array.isArray(x) ? (x as T[]) : [];
}

function cleanKey(name: string) {
  return name
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim();
}

function normalize(json: RawJson): CurriculoMatematica {
  const area = (s(json?.meta?.area, "Matemática") as "Matemática") || "Matemática";
  const fuente = s(json?.meta?.fuente, "MINEDUC Ecuador — Currículo Priorizado por Competencias");

  const subniveles: Record<string, Subnivel> = {};
  const rawSubs = json?.subniveles ?? {};

  for (const [nombreRaw, sub] of Object.entries(rawSubs)) {
    const nombre = cleanKey(nombreRaw);

    const objetivos: Objetivo[] = arr<any>(sub?.objetivos).map((o) => ({
      codigo: s(o?.codigo).trim(),
      descripcion: s(o?.descripcion).trim(),
    }));

    const destrezas: Destreza[] = arr<any>(sub?.destrezas).map((d) => ({
      codigo: s(d?.codigo).trim(),
      descripcion: s(d?.descripcion).trim(),
      indicadores: arr<any>(d?.indicadores).map((i) => ({
        codigo: s(i?.codigo).trim(),
        descripcion: s(i?.descripcion).trim(),
      })),
    }));

    subniveles[nombre] = { nombre, objetivos, destrezas };
  }

  return { area, fuente, subniveles };
}

export const matematicaPriorizado = normalize(raw as any);

/**
 * ✅ FILTRO ROBUSTO:
 * - Normaliza nombre del subnivel (trim/espacios)
 * - Determina regla por "contiene" (no por igualdad exacta)
 */
export function filtroDestrezasPorSubnivel(nombreSubnivel: string, destrezas: Destreza[]): Destreza[] {
  const sn = cleanKey(nombreSubnivel);

  let re: RegExp | null = null;

  if (sn.includes("Preparatoria")) re = /^M\.1\./;
  else if (sn.includes("Elemental")) re = /^M\.2\./;
  else if (sn.includes("Media")) re = /^M\.3\./;
  else if (sn.includes("Superior")) re = /^M\.(4|5)\./;
  else if (sn === "BGU" || sn.includes("BGU")) re = null; // cuando pegues BGU real, aquí ajustas

  if (!re) return destrezas;

  return destrezas.filter((d) => re!.test((d.codigo || "").trim()));
}
