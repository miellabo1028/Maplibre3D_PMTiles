GESAT MapLibre PMTiles version

Folder layout:
  index.html
  css/map.css
  css/layer-control.css
  js/map-config.js
  js/map-style.js
  js/layer-control.js
  js/map-init.js
  data/bolivia_basemap.pmtiles
  data/protected_areas.pmtiles
  data/administrative_boundaries_pl.pmtiles
  data/administrative_boundaries.pmtiles

Important checks:
1. In js/map-config.js, confirm sourceLayers.administrativeBoundaryLines matches the internal source-layer name of administrative_boundaries_pl.pmtiles.
2. Confirm the exact Border_Typ values and edit administrativeBoundaryValues if necessary.
3. Confirm the administrative name source layers are departamento, provincia, distrito.
4. Confirm NAME_1, NAME_2, NAME_3 exist in administrative_boundaries.pmtiles.
5. Serve through HTTP. Do not open index.html directly with file://.

Example local server:
  npx http-server . --cors -c-1 -p 8080

Open:
  http://localhost:8080/index.html
