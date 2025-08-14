// locationiq.key = mapToken;
// //Define the map and configure the map's theme
// var map = new maplibregl.Map({
//   container: "map",
//   style: locationiq.getLayer("Streets"),
//   zoom: 12,
//   center: coordinates,
// });

// const marker = new maplibregl.Marker().setLngLat(coordinates).addTo(map);
locationiq.key = mapToken;

var map = new maplibregl.Map({
  container: "map",
  style: locationiq.getLayer("Streets"),
  zoom: 12,
  center: coordinates, // [lng, lat]
});

new maplibregl.Marker().setLngLat(coordinates).addTo(map);
