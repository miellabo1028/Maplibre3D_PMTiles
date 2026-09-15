const GESAT_LAYER_IDS = {
  baseMaps: {
    esriImagery: "base-esri-imagery",
    esriTopo: "base-esri-topo",
    esriHillshade: "base-esri-hillshade",
    onlineOsm: "base-online-osm",
    googleSatellite: "base-google-satellite"
  },
  boliviaBasemap: {
    roads: [
      "bolivia-road-casing",
      "bolivia-road-line"
    ],

    rivers: [
      "bolivia-waterway-line"
    ],

    waterAreas: [
      "bolivia-water-fill"
    ]
  },
  protectedAreas: [
    "protected-areas-fill",
    "protected-areas-outline"
  ],
  boundaries: {
    distrito: ["admin-boundary-distrito"],
    provincia: ["admin-boundary-provincia"],
    departamento: ["admin-boundary-departamento"],
    international: ["admin-boundary-international"]
  },
  names: {
    departamentoName: ["admin-name-departamento"],
    provinciaName: ["admin-name-provincia"],
    distritoName: ["admin-name-distrito"]
  }
};

function pmtilesUrl(relativeUrl) {
  return "pmtiles://" + new URL(relativeUrl, window.location.href).href;
}

function baseRasterSource(url, attribution) {
  return {
    type: "raster",
    tiles: [url],
    tileSize: 256,
    maxzoom: 19,
    attribution: attribution
  };
}

function borderFilter(category) {
  const field = GESAT_CONFIG.administrativeBoundaryField;
  const values = GESAT_CONFIG.administrativeBoundaryValues[category];
  return ["in", ["get", field], ["literal", values]];
}

function visibility(value) {
  return value ? "visible" : "none";
}

function createGesatStyle() {
  const c = GESAT_CONFIG;
  const sources = {
    esriImagery: baseRasterSource(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      "Tiles © Esri and imagery providers"
    ),
    esriTopo: baseRasterSource(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
      "Tiles © Esri and data providers"
    ),
    esriHillshade: baseRasterSource(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}",
      "Hillshade © Esri and elevation data providers"
    ),
    onlineOsm: baseRasterSource(
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      "© OpenStreetMap contributors"
    ),
    boliviaBasemap: {
      type: "vector",
      url: pmtilesUrl(c.data.boliviaBasemap),
      attribution: "© OpenStreetMap contributors"
    },
    protectedAreas: {
      type: "vector",
      url: pmtilesUrl(c.data.protectedAreas),
      attribution: "Protected areas data provider"
    },
    administrativeBoundaryLines: {
      type: "vector",
      url: pmtilesUrl(c.data.administrativeBoundaryLines),
      attribution: "Administrative boundaries: GADM"
    },
    administrativeNames: {
      type: "vector",
      url: pmtilesUrl(c.data.administrativeNames),
      attribution: "Administrative names: GADM"
    }
  };

  if (c.googleSatelliteUrl) {
    sources.googleSatellite = baseRasterSource(
      c.googleSatelliteUrl,
      "Imagery © Google"
    );
  }

  const baseVisibility = function (id) {
    return visibility(c.initialBaseMap === id);
  };

  const layers = [
    {
      id: GESAT_LAYER_IDS.baseMaps.esriImagery,
      type: "raster",
      source: "esriImagery",
      layout: { visibility: baseVisibility("esriImagery") }
    },
    {
      id: GESAT_LAYER_IDS.baseMaps.esriTopo,
      type: "raster",
      source: "esriTopo",
      layout: { visibility: baseVisibility("esriTopo") }
    },
    {
      id: GESAT_LAYER_IDS.baseMaps.esriHillshade,
      type: "raster",
      source: "esriHillshade",
      layout: { visibility: baseVisibility("esriHillshade") }
    },
    {
      id: GESAT_LAYER_IDS.baseMaps.onlineOsm,
      type: "raster",
      source: "onlineOsm",
      layout: { visibility: baseVisibility("onlineOsm") }
    }
  ];

  if (c.googleSatelliteUrl) {
    layers.push({
      id: GESAT_LAYER_IDS.baseMaps.googleSatellite,
      type: "raster",
      source: "googleSatellite",
      layout: { visibility: baseVisibility("googleSatellite") }
    });
  }

  layers.push(
    {
      id: "bolivia-water-fill",
      type: "fill",
      source: "boliviaBasemap",
      "source-layer": c.sourceLayers.bolivia.water,
      filter:["!=",["coalesce",["get","class"],""],"ocean"],
      layout: { visibility: visibility(c.visibility.boliviaWaterAreas) },
      paint: { "fill-color": "#b9dff5", "fill-opacity": 0.75 }
    },
    {
      id: "bolivia-waterway-line",
      type: "line",
      source: "boliviaBasemap",
      "source-layer": c.sourceLayers.bolivia.waterway,
      layout: { visibility: visibility(c.visibility.boliviaRivers), "line-join": "round", "line-cap": "round" },
      paint: { "line-color": "#45a7df", "line-width": 1.2, "line-opacity": 0.95 }
    },
    {
      id: "bolivia-road-casing",
      type: "line",
      source: "boliviaBasemap",
      "source-layer": c.sourceLayers.bolivia.transportation,
      layout: { visibility: visibility(c.visibility.boliviaRoads), "line-join": "round", "line-cap": "round" },
      paint: { "line-color": "#ffffff", "line-width": 3, "line-opacity": 0.85 }
    },
    {
      id: "bolivia-road-line",
      type: "line",
      source: "boliviaBasemap",
      "source-layer": c.sourceLayers.bolivia.transportation,
      layout: { visibility: visibility(c.visibility.boliviaRoads), "line-join": "round", "line-cap": "round" },
      paint: { "line-color": "#444444", "line-width": 1.3, "line-opacity": 0.95 }
    },
    {
      id: "protected-areas-fill",
      type: "fill",
      source: "protectedAreas",
      "source-layer": c.sourceLayers.protectedAreas,
      layout: { visibility: visibility(c.visibility.protectedAreas) },
      paint: { "fill-color": "#31a354", "fill-opacity": 0.22 }
    },
    {
      id: "protected-areas-outline",
      type: "line",
      source: "protectedAreas",
      "source-layer": c.sourceLayers.protectedAreas,
      layout: { visibility: visibility(c.visibility.protectedAreas) },
      paint: { "line-color": "#008f3d", "line-width": 1.8, "line-opacity": 0.95 }
    },
    {
      id: "admin-boundary-distrito",
      type: "line",
      source: "administrativeBoundaryLines",
      "source-layer": c.sourceLayers.administrativeBoundaryLines,
      filter: borderFilter("distrito"),
      minzoom: 9,
      layout: { visibility: visibility(c.visibility.distrito), "line-join": "round", "line-cap": "round" },
      paint: { "line-color": "#ffffff", "line-width": 1.2, "line-opacity": 0.9, "line-dasharray": [2,3] }
    },
    {
      id: "admin-boundary-provincia",
      type: "line",
      source: "administrativeBoundaryLines",
      "source-layer": c.sourceLayers.administrativeBoundaryLines,
      filter: borderFilter("provincia"),
      minzoom: 7,
      layout: { visibility: visibility(c.visibility.provincia), "line-join": "round", "line-cap": "round" },
      paint: { "line-color": "#00b7ff", "line-width": 1.8, "line-opacity": 0.95, "line-dasharray": [7,4] }
    },
    {
      id: "admin-boundary-departamento",
      type: "line",
      source: "administrativeBoundaryLines",
      "source-layer": c.sourceLayers.administrativeBoundaryLines,
      filter: borderFilter("departamento"),
      layout: { visibility: visibility(c.visibility.departamento), "line-join": "round", "line-cap": "round" },
      paint: { "line-color": "#ff3b30", "line-width": 2.7, "line-opacity": 0.98 }
    },
    {
      id: "admin-boundary-international",
      type: "line",
      source: "administrativeBoundaryLines",
      "source-layer": c.sourceLayers.administrativeBoundaryLines,
      filter: borderFilter("international"),
      layout: { visibility: visibility(c.visibility.international), "line-join": "round", "line-cap": "round" },
      paint: { "line-color": "#ffd400", "line-width": 4, "line-opacity": 1 }
    },
    {
      id: "admin-name-distrito",
      type: "symbol",
      source: "administrativeNames",
      "source-layer": c.sourceLayers.administrativeNames.distrito,
      minzoom: c.labelZooms.distrito,
      layout: {
        visibility: visibility(c.visibility.distritoName),
        "text-field": ["coalesce", ["get", c.administrativeNameFields.distrito], ""],
        "text-size": 11,
        "text-font": ["Noto Sans Regular"],
        "text-max-width": 10,
        "text-allow-overlap": false
      },
      paint: { "text-color": "#ffffff", "text-halo-color": "#333333", "text-halo-width": 1.5 }
    },
    {
      id: "admin-name-provincia",
      type: "symbol",
      source: "administrativeNames",
      "source-layer": c.sourceLayers.administrativeNames.provincia,
      minzoom: c.labelZooms.provincia,
      layout: {
        visibility: visibility(c.visibility.provinciaName),
        "text-field": ["coalesce", ["get", c.administrativeNameFields.provincia], ""],
        "text-size": 12,
        "text-font": ["Noto Sans Regular"],
        "text-max-width": 12,
        "text-allow-overlap": false
      },
      paint: { "text-color": "#b9edff", "text-halo-color": "#222222", "text-halo-width": 1.5 }
    },
    {
      id: "admin-name-departamento",
      type: "symbol",
      source: "administrativeNames",
      "source-layer": c.sourceLayers.administrativeNames.departamento,
      minzoom: c.labelZooms.departamento,
      layout: {
        visibility: visibility(c.visibility.departamentoName),
        "text-field": ["coalesce", ["get", c.administrativeNameFields.departamento], ""],
        "text-size": 14,
        "text-font": ["Noto Sans Regular"],
        "text-max-width": 14,
        "text-allow-overlap": false
      },
      paint: { "text-color": "#fff2a8", "text-halo-color": "#222222", "text-halo-width": 2 }
    }
  );

  return {
    version: 8,
    glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
    sources: sources,
    layers: layers
  };
}
