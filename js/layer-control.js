function setLayerVisibility(
  map,
  layerIds,
  isVisible
) {
  const value =
    isVisible ? "visible" : "none";

  if (!Array.isArray(layerIds)) {
    console.warn(
      "Layer IDs must be an array:",
      layerIds
    );

    return;
  }

  layerIds.forEach(function (layerId) {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(
        layerId,
        "visibility",
        value
      );
    }
  });
}


function createGesatLayerControl() {
  return {
    onAdd: function (map) {
      this._map = map;

      const container =
        document.createElement("div");

      container.className =
        "maplibregl-ctrl gesat-control";

      container.innerHTML = `
        <div class="gesat-title">
          Map layers
        </div>

        <div class="gesat-section">
          Base maps
        </div>

        <div
          class="gesat-children"
          id="base-map-options"
        ></div>

        <div class="gesat-section">
          Map view
        </div>

        <label>
          <input
            type="checkbox"
            id="gesat-3d-mode"
          >

         <span class="swatch three-d"></span>
          3D buildings and terrain
        </label>
        
        <div class="gesat-section">
          Reference overlays
        </div>

        <div class="gesat-section">
          <label>
            <input
              type="checkbox"
              id="bolivia-basemap-all"
            >
            Bolivia basemap (test version)
          </label>
        </div>

        <div class="gesat-children">
          <label>
            <input
              type="checkbox"
              data-bolivia-layer="boliviaRoads"
            >
            <span class="swatch road"></span>
            Roads
          </label>

          <label>
            <input
              type="checkbox"
              data-bolivia-layer="boliviaRivers"
            >
            <span class="swatch river"></span>
            Rivers
          </label>

          <label>
            <input
              type="checkbox"
              data-bolivia-layer="boliviaWaterAreas"
            >
            <span class="water-swatch"></span>
            Water areas
          </label>
        </div>

        <label>
          <input
            type="checkbox"
            data-overlay="protectedAreas"
          >
          <span class="swatch pa"></span>
          Protected areas
        </label>

        <div class="gesat-section">
          <label>
            <input
              type="checkbox"
              id="admin-boundaries-all"
            >
            Administrative boundaries
          </label>
        </div>

        <div class="gesat-children">
          <label>
            <input
              type="checkbox"
              data-admin-boundary="international"
            >
            <span class="swatch intl"></span>
            International boundary
          </label>

          <label>
            <input
              type="checkbox"
              data-admin-boundary="departamento"
            >
            <span class="swatch dept"></span>
            Departamento boundary
          </label>

          <label>
            <input
              type="checkbox"
              data-admin-boundary="provincia"
            >
            <span class="swatch prov"></span>
            Provincia boundary
          </label>

          <label>
            <input
              type="checkbox"
              data-admin-boundary="distrito"
            >
            <span class="swatch dist"></span>
            Distrito boundary
          </label>
        </div>

        <div class="gesat-section">
          <label>
            <input
              type="checkbox"
              id="admin-names-all"
            >
            Administrative names
          </label>
        </div>

        <div class="gesat-children">
          <label>
            <input
              type="checkbox"
              data-admin-name="departamentoName"
            >
            <span class="name-swatch">Aa</span>
            Departamento name
          </label>

          <label>
            <input
              type="checkbox"
              data-admin-name="provinciaName"
            >
            <span class="name-swatch">Aa</span>
            Provincia name
          </label>

          <label>
            <input
              type="checkbox"
              data-admin-name="distritoName"
            >
            <span class="name-swatch">Aa</span>
            Distrito name
          </label>
        </div>
      `;


      /*
       * Base maps
       */
      const baseContainer =
        container.querySelector(
          "#base-map-options"
        );

      const baseOptions = [
        [
          "esriImagery",
          "Esri World Imagery"
        ],
        [
          "esriTopo",
          "Esri World Topographic Map"
        ],
        [
          "esriHillshade",
          "Esri World Hillshade"
        ],
        [
          "onlineOsm",
          "Online OpenStreetMap"
        ]
      ];

      if (GESAT_CONFIG.googleSatelliteUrl) {
        baseOptions.push([
          "googleSatellite",
          "Google Satellite"
        ]);
      }

      baseOptions.forEach(
        function ([id, title]) {
          const label =
            document.createElement("label");

          label.innerHTML = `
            <input
              type="radio"
              name="base-map"
              value="${id}"
            >
            ${title}
          `;

          const input =
            label.querySelector("input");

          input.checked =
            GESAT_CONFIG.initialBaseMap ===
            id;

          input.addEventListener(
            "change",
            function () {
              Object.entries(
                GESAT_LAYER_IDS.baseMaps
              ).forEach(
                function ([key, layerId]) {
                  if (map.getLayer(layerId)) {
                    map.setLayoutProperty(
                      layerId,
                      "visibility",
                      key === id
                        ? "visible"
                        : "none"
                    );
                  }
                }
              );
            }
          );

          baseContainer.appendChild(label);
        }
      );

      /*
       * 3D buildings and terrain
      */
      const threeDInput =
        container.querySelector(
          "#gesat-3d-mode"
        );

        if (
          threeDInput &&
          GESAT_CONFIG.threeD
        ) {
      /*
        * 初期チェック状態を設定します。
      */
      threeDInput.checked =
        Boolean(
          GESAT_CONFIG.threeD.enabled
        );

      /*
        * チェック状態が変更されたときに、
        * 3D表示を切り替えます。
      */
      threeDInput.addEventListener(
        "change",
        function () {
          setGesat3DMode(
            map,
            threeDInput.checked
          );
        }
      );
    }


      /*
       * Protected Areas
       */
      const overlays = {
        protectedAreas:
          GESAT_LAYER_IDS.protectedAreas
      };

      container
        .querySelectorAll("[data-overlay]")
        .forEach(function (input) {
          const key =
            input.dataset.overlay;

          input.checked =
            Boolean(
              GESAT_CONFIG.visibility[key]
            );

          input.addEventListener(
            "change",
            function () {
              GESAT_CONFIG.visibility[key] =
                input.checked;

              setLayerVisibility(
                map,
                overlays[key],
                input.checked
              );
            }
          );
        });


      /*
       * Sub layer of Bolivia basemap
       */
      const boliviaLayerIds = {
        boliviaRoads:
          GESAT_LAYER_IDS
            .boliviaBasemap
            .roads,

        boliviaRivers:
          GESAT_LAYER_IDS
            .boliviaBasemap
            .rivers,

        boliviaWaterAreas:
          GESAT_LAYER_IDS
            .boliviaBasemap
            .waterAreas
      };

      const boliviaInputs =
        Array.from(
          container.querySelectorAll(
            "[data-bolivia-layer]"
          )
        );

      const boliviaGroupInput =
        container.querySelector(
          "#bolivia-basemap-all"
        );

      function updateBoliviaGroupState() {
        const checkedCount =
          boliviaInputs.filter(
            function (input) {
              return input.checked;
            }
          ).length;

        boliviaGroupInput.checked =
          checkedCount ===
          boliviaInputs.length;

        boliviaGroupInput.indeterminate =
          checkedCount > 0 &&
          checkedCount <
            boliviaInputs.length;

        GESAT_CONFIG
          .visibility
          .boliviaBasemap =
            checkedCount > 0;
      }

      boliviaInputs.forEach(
        function (input) {
          const key =
            input.dataset.boliviaLayer;

          input.checked =
            Boolean(
              GESAT_CONFIG.visibility[key]
            );

          input.addEventListener(
            "change",
            function () {
              GESAT_CONFIG.visibility[key] =
                input.checked;

              setLayerVisibility(
                map,
                boliviaLayerIds[key],
                input.checked
              );

              updateBoliviaGroupState();
            }
          );
        }
      );

      boliviaGroupInput.addEventListener(
        "change",
        function () {
          const isVisible =
            boliviaGroupInput.checked;

          boliviaInputs.forEach(
            function (input) {
              const key =
                input.dataset.boliviaLayer;

              input.checked =
                isVisible;

              GESAT_CONFIG.visibility[key] =
                isVisible;

              setLayerVisibility(
                map,
                boliviaLayerIds[key],
                isVisible
              );
            }
          );

          GESAT_CONFIG
            .visibility
            .boliviaBasemap =
              isVisible;

          updateBoliviaGroupState();
        }
      );

      updateBoliviaGroupState();


      /*
       * Group control of Administrative boundaries and
       * Administrative names
       */
      function configureGroup(
        selector,
        groupSelector,
        idMap
      ) {
        const inputs =
          Array.from(
            container.querySelectorAll(
              selector
            )
          );

        const group =
          container.querySelector(
            groupSelector
          );

        function updateGroup() {
          const count =
            inputs.filter(
              function (input) {
                return input.checked;
              }
            ).length;

          group.checked =
            count === inputs.length;

          group.indeterminate =
            count > 0 &&
            count < inputs.length;
        }

        inputs.forEach(function (input) {
          const key =
            input.dataset.adminBoundary ||
            input.dataset.adminName;

          input.checked =
            Boolean(
              GESAT_CONFIG.visibility[key]
            );

          input.addEventListener(
            "change",
            function () {
              GESAT_CONFIG.visibility[key] =
                input.checked;

              setLayerVisibility(
                map,
                idMap[key],
                input.checked
              );

              updateGroup();
            }
          );
        });

        group.addEventListener(
          "change",
          function () {
            const isVisible =
              group.checked;

            inputs.forEach(
              function (input) {
                const key =
                  input.dataset
                    .adminBoundary ||
                  input.dataset.adminName;

                input.checked =
                  isVisible;

                GESAT_CONFIG.visibility[key] =
                  isVisible;

                setLayerVisibility(
                  map,
                  idMap[key],
                  isVisible
                );
              }
            );

            updateGroup();
          }
        );

        updateGroup();
      }


      configureGroup(
        "[data-admin-boundary]",
        "#admin-boundaries-all",
        GESAT_LAYER_IDS.boundaries
      );

      configureGroup(
        "[data-admin-name]",
        "#admin-names-all",
        GESAT_LAYER_IDS.names
      );

      return container;
    },


    onRemove: function () {
      if (
        this._container &&
        this._container.parentNode
      ) {
        this._container.parentNode.removeChild(
          this._container
        );
      }

      this._map = undefined;
      this._container = undefined;
    }
  };
}