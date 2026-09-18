/*
 * Display a current zoom level in MapLibre Control.
 */
class ZoomLevelControl {
  onAdd(map) {
    this._map = map;

    this._container =
      document.createElement("div");

    this._container.className =
      "maplibregl-ctrl zoom-level-control";

    this._updateZoom =
      this._updateZoom.bind(this);

    /*
     * The display will be updated while zooming is in progress.
     */
    this._map.on(
      "zoom",
      this._updateZoom
    );

    this._updateZoom();

    return this._container;
  }

  _updateZoom() {
    if (
      !this._map ||
      !this._container
    ) {
      return;
    }

    const zoom =
      this._map.getZoom();

    this._container.textContent =
      "Zoom: " + zoom.toFixed(1);

    this._container.title =
      "Current zoom level: " +
      zoom.toFixed(2);
  }

  onRemove() {
    if (this._map) {
      this._map.off(
        "zoom",
        this._updateZoom
      );
    }

    if (this._container) {
      this._container.remove();
    }

    this._map = undefined;
    this._container = undefined;
  }
}

/* 3D mapping*/
function addGesat3DData(map) {
  const config =
    GESAT_CONFIG.threeD;

  /*
   * DEM地形
   */
  if (
    config.terrain.enabled &&
    !map.getSource(
      config.terrain.sourceId
    )
  ) {
    map.addSource(
      config.terrain.sourceId,
      {
        type: "raster-dem",

        tiles: [
          config.terrain.tileUrl
        ],

        encoding:
          config.terrain.encoding,

        tileSize:
          config.terrain.tileSize,

        maxzoom:
          config.terrain.maxZoom
      }
    );
  }

  /*
   * 3D建物用ベクトルタイル
   */
  if (
    config.buildings.enabled &&
    !map.getSource(
      config.buildings.sourceId
    )
  ) {
    map.addSource(
      config.buildings.sourceId,
      {
        type: "vector",

        url:
          config.buildings.sourceUrl
      }
    );
  }

  if (
    config.buildings.enabled &&
    !map.getLayer(
      config.buildings.layerId
    )
  ) {
    /*
     * ラベルより下へ建物を追加するため、
     * 最初のsymbolレイヤを探します。
     */
    const styleLayers =
      map.getStyle().layers;

    const firstSymbolLayer =
      styleLayers.find(
        function (layer) {
          return (
            layer.type === "symbol" &&
            layer.layout &&
            layer.layout["text-field"]
          );
        }
      );

    const beforeLayerId =
      firstSymbolLayer
        ? firstSymbolLayer.id
        : undefined;

    map.addLayer(
      {
        id:
          config.buildings.layerId,

        type:
          "fill-extrusion",

        source:
          config.buildings.sourceId,

        "source-layer":
          config.buildings.sourceLayer,

        minzoom:
          config.buildings.minZoom,

        filter: [
          "!=",
          ["get", "hide_3d"],
          true
        ],

        layout: {
          visibility:
            config.enabled
              ? "visible"
              : "none"
        },

        paint: {
          /*
           * 建物の高さに応じて
           * 色を少し変えます。
           */
          "fill-extrusion-color": [
            "interpolate",
            ["linear"],
            [
              "coalesce",
              ["to-number",
                ["get", "render_height"]
              ],
              config.buildings
                .defaultHeight
            ],

            0,
            "#d8d2c8",

            30,
            "#c4bab0",

            100,
            "#a99d94"
          ],

          /*
           * ズーム14.5で高さ0、
           * ズーム15.5で実際の高さにします。
           */
          "fill-extrusion-height": [
            "interpolate",
            ["linear"],
            ["zoom"],

            config.buildings.minZoom,
            0,

            config.buildings.minZoom + 1,
            [
              "coalesce",

              /*
               * ベクトルタイル側の
               * 計算済み高さ
               */
              [
                "to-number",
                ["get", "render_height"]
              ],

              /*
               * height属性
               */
              [
                "to-number",
                ["get", "height"]
              ],

              /*
               * 階数×3m
               */
              [
                "*",
                [
                  "to-number",
                  [
                    "get",
                    "building:levels"
                  ]
                ],
                config.buildings
                  .metersPerLevel
              ],

              /*
               * 高さ不明の既定値
               */
              config.buildings
                .defaultHeight
            ]
          ],

          "fill-extrusion-base": [
            "coalesce",

            [
              "to-number",
              ["get", "render_min_height"]
            ],

            [
              "to-number",
              ["get", "min_height"]
            ],

            0
          ],

          "fill-extrusion-opacity":
            0.82
        }
      },

      beforeLayerId
    );
  }

  setGesat3DMode(
    map,
    config.enabled
  );
}


function setGesat3DMode(
  map,
  enabled
) {
  const config =
    GESAT_CONFIG.threeD;

  config.enabled =
    enabled;

  /*
   * 建物表示
   */
  if (
    map.getLayer(
      config.buildings.layerId
    )
  ) {
    map.setLayoutProperty(
      config.buildings.layerId,
      "visibility",
      enabled
        ? "visible"
        : "none"
    );
  }

  /*
   * 地形表示
   */
  if (
    enabled &&
    config.terrain.enabled
  ) {
    map.setTerrain({
      source:
        config.terrain.sourceId,

      exaggeration:
        config.terrain.exaggeration
    });
  } else {
    map.setTerrain(null);
  }

  /*
   * 視点を傾けます。
   */
  map.easeTo({
    pitch:
      enabled ? 60 : 0,

    bearing:
      enabled ? -15 : 0,

    duration:
      1000
  });
}


/*
 * Initialize GESAT MapLibre
 */
(function initializeGesatMapLibre() {
  const status =
    document.getElementById("status");

  function showStatus(message) {
    if (status) {
      status.textContent =
        message;
    }

    console.log(message);
  }

  try {
    if (
      typeof maplibregl ===
      "undefined"
    ) {
      throw new Error(
        "MapLibre GL JS was not loaded."
      );
    }

    if (
      typeof pmtiles ===
      "undefined"
    ) {
      throw new Error(
        "PMTiles JavaScript library was not loaded."
      );
    }

    if (
      typeof GESAT_CONFIG ===
      "undefined"
    ) {
      throw new Error(
        "GESAT_CONFIG was not loaded."
      );
    }

    if (
      typeof createGesatStyle !==
      "function"
    ) {
      throw new Error(
        "createGesatStyle() was not loaded."
      );
    }

    if (
      typeof createGesatLayerControl !==
      "function"
    ) {
      throw new Error(
        "createGesatLayerControl() was not loaded."
      );
    }

    /*
     * PMTiles protocol
     */
    const protocol =
      new pmtiles.Protocol({
        metadata: true
      });

    maplibregl.addProtocol(
      "pmtiles",
      protocol.tile
    );

    // ==================================================
    // 【追加①】COG (Cloud Optimized GeoTIFF) プロトコルの登録
    // ==================================================
    if (typeof MaplibreCOGProtocol !== "undefined") {
      maplibregl.addProtocol(
        "cog",
        MaplibreCOGProtocol.cogProtocol
      );
      console.log("COG protocol successfully registerd with MapLibre");
    } else {
      console.error("maplibreCogProtocol library is not loaded properly,");
      
    }
    
    /*
     * MapLibre map
     */
    const map =
      new maplibregl.Map({
        container:
          "map",

        style:
          createGesatStyle(),

        center:
          GESAT_CONFIG.map.center,

        zoom:
          GESAT_CONFIG.map.zoom,

        minZoom:
          GESAT_CONFIG.map.minZoom,

        maxZoom:
          GESAT_CONFIG.map.maxZoom,

        attributionControl:
          true
      });

    /*
     * ＋, －, Compas
     */
    map.addControl(
      new maplibregl
        .NavigationControl(),
      "top-left"
    );

    /*
     * Current zoom level
     *
     * By adding it after the NavigationControl, 
     * it will be positioned below the same top-left area.
     */
    map.addControl(
      new ZoomLevelControl(),
      "top-left"
    );

    /*
     * Scale
     */
    map.addControl(
      new maplibregl
        .ScaleControl({
          unit: "metric"
        }),
      "bottom-left"
    );

    /*
     * After loading Style and PMTiles
     */
    map.on(
      "load",
      function () {
        // ==================================================
        // 【追加②】Sentinel-2 COG レイヤの追加
        // ==================================================
        
        // --- 2025年版 ---
        map.addSource("sentinel-2025-source", {
          type: "raster",
          tiles: [`cog://${GESAT_CONFIG.data.sentinel2025}/{z}/{x}/{y}`],
          tileSize: 256
        });
        map.addLayer({
          id: "sentinel-2025-layer",
          type: "raster",
          source: "sentinel-2025-source",
          layout: {
            visibility: GESAT_CONFIG.visibility.sentinel2025 ? "visible" : "none"
          },
          paint: {
            "raster-opacity": 1.0
                        
            // ==================================================
            // 【追記】淡い画像をクッキリ・鮮やかにする補正
            // ==================================================
            "raster-contrast": 0.30,        // コントラストを上げる（-1.0 〜 1.0, 既定値0）
            "raster-brightness-max": 0.80,  // 明るさの上限を絞って白飛びを抑える（0 〜 1, 既定値1）
            "raster-saturation": 0.20       // 彩度を少し上げて緑や土の色を鮮やかに（-1.0 〜 1.0, 既定値0）

          }
        });

        // --- 2026年版 ---
        map.addSource("sentinel-2026-source", {
          type: "raster",
          tiles: [`cog://${GESAT_CONFIG.data.sentinel2026}/{z}/{x}/{y}`],
          tileSize: 256
        });
        map.addLayer({
          id: "sentinel-2026-layer",
          type: "raster",
          source: "sentinel-2026-source",
          layout: {
            visibility: GESAT_CONFIG.visibility.sentinel2026 ? "visible" : "none"
          },
          paint: {
            "raster-opacity": 1.0
          }
        });
        
        /* 3D builings and DEM*/
        addGesat3DData(map);
        
        map.addControl(
          createGesatLayerControl(),
          "top-right"
        );

        /*
         * Console checks
         */
        window.gesatDebug = {
          map: map,
          protocol: protocol,
          config: GESAT_CONFIG,
          layerIds:
            typeof GESAT_LAYER_IDS !==
            "undefined"
              ? GESAT_LAYER_IDS
              : null
        };

        showStatus(
          "GESAT MapLibre map loaded successfully."
        );

        setTimeout(
          function () {
            if (status) {
              status.style.display =
                "none";
            }
          },
          2500
        );
      }
    );

    /*
     * Error processing in uMapLibre
     */
    map.on(
      "error",
      function (event) {
        const error =
          event.error || event;

        console.error(
          "MapLibre error:",
          error
        );

        /*
         * To prevent the system from remaining stuck in a loading state, 
         * errors will also be displayed on the screen.
         */
        if (
          status &&
          status.style.display !==
            "none"
        ) {
          showStatus(
            "MapLibre error: " +
            (
              error.message ||
              "See the browser console."
            )
          );
        }
      }
    );
  } catch (error) {
    console.error(
      "Startup error:",
      error
    );

    showStatus(
      "Startup error: " +
      error.message
    );
  }
})();
