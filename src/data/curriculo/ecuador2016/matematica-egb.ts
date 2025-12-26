// Currículo de Educación General Básica — Ecuador 2016
// Matemática — EGB (estructura para el planificador)

export const matematicaEGB2016 = {
  area: "Matemática",
  anio: 2016,

  subniveles: {
    "EGB Preparatoria": {
      objetivos: [
        // EJEMPLO (reemplaza con el objetivo real)
        { codigo: "O.M.1.1", descripcion: "Objetivo real de Preparatoria (pegar del currículo 2016)." },
      ],
      destrezas: [
        // EJEMPLO (reemplaza con destrezas reales)
        {
          codigo: "M.1.1.1",
          descripcion: "Destreza real de Preparatoria (pegar del currículo 2016).",
          indicadores: [
            { codigo: "I.M.1.1.1", descripcion: "Indicador real (pegar del currículo 2016)." },
          ],
        },
      ],
    },

    "EGB Elemental": {
      objetivos: [
        { codigo: "O.M.2.1", descripcion: "Objetivo real de Elemental (pegar del currículo 2016)." },
      ],
      destrezas: [
        {
          codigo: "M.2.1.1",
          descripcion: "Destreza real de Elemental (pegar del currículo 2016).",
          indicadores: [
            { codigo: "I.M.2.1.1", descripcion: "Indicador real (pegar del currículo 2016)." },
          ],
        },
      ],
    },

    "EGB Media": {
      objetivos: [
        { codigo: "O.M.3.1", descripcion: "Objetivo real de Media (pegar del currículo 2016)." },
      ],
      destrezas: [
        {
          codigo: "M.3.1.1",
          descripcion: "Destreza real de Media (pegar del currículo 2016).",
          indicadores: [
            { codigo: "I.M.3.1.1", descripcion: "Indicador real (pegar del currículo 2016)." },
          ],
        },
      ],
    },

    "EGB Superior": {
      objetivos: [
        // ✅ ESTE YA lo tienes en tu captura (O.M.5.1)
        { codigo: "O.M.5.1", descripcion: "Desarrollar el pensamiento lógico y crítico para resolver problemas de la vida cotidiana mediante el uso de conceptos y procedimientos matemáticos." },
      ],
      destrezas: [
        // ✅ ESTE ya lo tienes como ejemplo (M.5.1.12)
        {
          codigo: "M.5.1.12",
          descripcion: "Reconocer y construir fracciones equivalentes utilizando material concreto, representaciones gráficas y simbólicas.",
          indicadores: [
            { codigo: "I.M.5.4.1", descripcion: "Identifica y representa fracciones equivalentes en contextos gráficos y numéricos." },
          ],
        },
      ],
    },

    // (Opcional) Si luego agregas BGU en otra fuente/archivo, también lo puedes meter aquí:
    // "BGU": { objetivos: [...], destrezas: [...] },
  },
} as const;
