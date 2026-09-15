const GESAT_CONFIG = {
  map: {
    center: [-64.7, -16.7],
    zoom: 6,
    minZoom: 3,
    maxZoom: 19
  },

  data: {
    boliviaBasemap: "https://pub-d44086fa57624870a3a45a6fd01ea211.r2.dev/bolivia_basemap.pmtiles",
    protectedAreas: "https://pub-d44086fa57624870a3a45a6fd01ea211.r2.dev/protected_areas.pmtiles",
    administrativeBoundaryLines: "https://pub-d44086fa57624870a3a45a6fd01ea211.r2.dev/administrative_boundaries_pl.pmtiles",
    administrativeNames: "https://pub-d44086fa57624870a3a45a6fd01ea211.r2.dev/administrative_boundaries.pmtiles"
  },

  sourceLayers: {
    bolivia: {
      water: "water",
      waterway: "waterway",
      transportation: "transportation"
    },
    protectedAreas: "protected_areas",

    /* Layer neme of administrative_boundaries_pl.pmtiles */
    administrativeBoundaryLines: "administrative_boundaries_pl",

    administrativeNames: {
      departamento: "departamento",
      provincia: "provincia",
      distrito: "distrito"
    }
  },

  administrativeBoundaryField: "Border_Typ",

  /* Match the actual value of Border_Typ */
  administrativeBoundaryValues: {
    international: [
      "international_boundary",
      "International boundary",
      "international",
      "International"
    ],
    departamento: ["departamento", "Departamento"],
    provincia: ["provincia", "Provincia"],
    distrito: ["distrito", "Distrito"]
  },

  administrativeNameFields: {
    departamento: "NAME_1",
    provincia: "NAME_2",
    distrito: "NAME_3"
  },

  labelZooms: {
    departamento: 4,
    provincia: 7,
    distrito: 9
  },

  /* Please set a valid API key. */
  googleSatelliteUrl: "https://tile.googleapis.com/v1/2dtiles/{z}/{x}/{y}?session=AJVsH2z8ozcnNBa_jqjtqaIr95p8ZpgVSDw67aJGRORtsHlElRRynOFhuJJv7HGZUuGoUS-i1UtN-Z7n-5FBd0jnmg&key=AIzaSyDqgh_3PJSTI2dNUwhFRuzj0Zk-T6ds1XQ",

  initialBaseMap: "esriImagery",

  visibility: {
    boliviaBasemap: true,
    
    boliviaRoads: true,
    boliviaRivers: true,
    boliviaWaterAreas: true,

    protectedAreas: true,
    
    international: true,
    departamento: true,
    provincia: true,
    distrito: true,
    departamentoName: true,
    provinciaName: true,
    distritoName: true
  },

  /* 3D modelling */
  threeD: {
    enabled: false,

    buildings: {
      enabled: true,

      sourceId:
        "openfreemap-buildings",

      layerId:
        "osm-3d-buildings",

      sourceUrl:
        "https://tiles.openfreemap.org/planet",

      sourceLayer:
        "building",

      minZoom:
        14.5,

      defaultHeight:
        6,

      metersPerLevel:
        3
    },

    terrain: {
      enabled: true,

      sourceId:
        "terrain-dem",

      tileUrl:
        "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png",

      encoding:
        "terrarium",

      tileSize:
        256,

      maxZoom:
        15,

      exaggeration:
        1.3
    }
  }
};
