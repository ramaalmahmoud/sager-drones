/*import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useDroneStore } from "./store";

export default function MapView() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const drones = useDroneStore((state) => state.drones);
  const pathsRef = useRef({}); // لتخزين مسارات الطائرات

  // Init map
  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = new maplibregl.Map({
        container: mapContainer.current,
        style: "https://demotiles.maplibre.org/style.json", // خريطة جاهزة
        center: [35.9, 31.9], // الإحداثيات الأساسية
        zoom: 9,
      });
    }
  }, []);

  // Add/update drone markers
  useEffect(() => {
    if (!mapRef.current) return;

    // مسح الماركرز القديمة
    mapRef.current.eachLayer &&
      mapRef.current.eachLayer((layer) => mapRef.current.removeLayer(layer));

    drones.forEach((drone) => {
      const el = document.createElement("div");
      el.className = "marker";
      el.style.width = "20px";
      el.style.height = "20px";
      el.style.backgroundColor = "red";
      el.style.borderRadius = "50%";

      new maplibregl.Marker(el)
        .setLngLat(drone.geometry.coordinates.reverse()) // [lng, lat]
        .addTo(mapRef.current);
    });
  }, [drones]);

  return <div ref={mapContainer} style={{ width: "100%", height: "500px" }} />;
}*/
import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useDroneStore } from "./store";

export default function MapView({ selectedDrone }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const drones = useDroneStore((state) => state.drones);
  const pathsRef = useRef({}); // لتخزين مسارات الطائرات

  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [31.9487, 35.9313],
      zoom: 8,
    });
  }, []);

  // رسم الطائرات والمسارات
  useEffect(() => {
    if (!map.current) return;

    drones.forEach((drone) => {
      const id = drone.properties.serial;
      const coord = drone.geometry.coordinates;

      // حفظ المسار
      if (!pathsRef.current[id]) pathsRef.current[id] = [];
      pathsRef.current[id].push(coord);

      // إزالة مصدر إذا موجود
      if (map.current.getSource(`drone-${id}`)) {
        map.current.getSource(`drone-${id}`).setData({
          type: "Feature",
          geometry: { type: "Point", coordinates: coord },
        });
      } else {
        map.current.addSource(`drone-${id}`, {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: { type: "Point", coordinates: coord },
          },
        });
        map.current.addLayer({
          id: `drone-${id}-layer`,
          type: "symbol",
          source: `drone-${id}`,
          layout: {
            "icon-image": "rocket-15", // أي أيقونة صغيرة
            "icon-rotate": drone.properties.yaw, // اتجاه الطائرة
            "icon-size": 1.5,
          },
        });
      }

      // رسم المسار
      const pathSourceId = `path-${id}`;
      if (map.current.getSource(pathSourceId)) {
        map.current.getSource(pathSourceId).setData({
          type: "Feature",
          geometry: { type: "LineString", coordinates: pathsRef.current[id] },
        });
      } else {
        map.current.addSource(pathSourceId, {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: { type: "LineString", coordinates: pathsRef.current[id] },
          },
        });
        map.current.addLayer({
          id: `${pathSourceId}-layer`,
          type: "line",
          source: pathSourceId,
          paint: { "line-color": "#ff0000", "line-width": 2 },
        });
      }
    });
  }, [drones]);

  // التكبير/تحريك للخريطة عند اختيار طائرة من القائمة
  useEffect(() => {
    if (selectedDrone && map.current) {
      map.current.flyTo({
        center: selectedDrone.geometry.coordinates,
        zoom: 15,
      });
    }
  }, [selectedDrone]);

  return <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />;
}
