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
/*import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useDroneStore } from "./store";
export default function MapView() {
  const mapContainer = useRef(null);
  const map = useRef(null);

  const { drones } = useDroneStore();

  // 1. إنشاء الخريطة مرة وحدة
  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [35.9, 31.95], // وسط عمان مثلاً
      zoom: 6,
    });

    // أضف مصدر + طبقة أول مرة فقط
    map.current.on("load", () => {
      map.current.addSource("drones", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      map.current.addLayer({
        id: "drones-layer",
        type: "circle",
        source: "drones",
        paint: {
          "circle-radius": 6,
          "circle-color": [
            "case",
            ["==", ["slice", ["get", "registration"], 3, 4], "B"], // بعد الـ "-"
            "#00ff00", // أخضر = مسموح
            "#ff0000", // أحمر = غير مسموح
          ],
        },
      });
    });
  }, []);

  // 2. كل ما يتغير drones → حدّث المصدر
  useEffect(() => {
    if (!map.current) return;
    if (!map.current.getSource("drones")) return;

    const featureCollection = {
      type: "FeatureCollection",
      features: drones,
    };

    map.current.getSource("drones").setData(featureCollection);
    console.log("✅ Updated drones on map:", featureCollection);
  }, [drones]);

  return <div ref={mapContainer} style={{ width: "100%", height: "100vh" }} />;
}*/
import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useDroneStore } from "./store";

export default function MapView() {
  const mapContainer = useRef(null);
  const map = useRef(null);

  // ناخذ الـ GeoJSON الجاهز من Zustand
  const pointsFC = useDroneStore((s) => s.pointsFC);
  const linesFC = useDroneStore((s) => s.linesFC);

  // 1. إنشاء الخريطة مرة وحدة
  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [35.9, 31.95], // وسط عمان مثلاً
      zoom: 6,
    });

    map.current.on("load", () => {
      // نقاط الطائرات
      map.current.addSource("drones", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.current.addLayer({
        id: "drones-layer",
        type: "circle",
        source: "drones",
        paint: {
          "circle-radius": 6,
          "circle-color": [
            "case",
            ["get", "allowed"], // مباشرة استخدم الخاصية التي حسبناها مسبقاً
            "#00ff00", // أخضر = مسموح
            "#ff0000", // أحمر = غير مسموح
          ],
        },
      });

      // خطوط (المسارات)
      map.current.addSource("drone-lines", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.current.addLayer({
        id: "lines-layer",
        type: "line",
        source: "drone-lines",
        paint: {
          "line-color": "#0000ff",
          "line-width": 2,
        },
      });
    });
  }, []);

  // 2. تحديث النقاط عند تغير pointsFC
  useEffect(() => {
    if (!map.current) return;
    if (!map.current.getSource("drones")) return;
    map.current.getSource("drones").setData(pointsFC);
    console.log("✅ Updated drones on map:", pointsFC);
  }, [pointsFC]);

  // 3. تحديث الخطوط عند تغير linesFC
  useEffect(() => {
    if (!map.current) return;
    if (!map.current.getSource("drone-lines")) return;
    map.current.getSource("drone-lines").setData(linesFC);
    console.log("✅ Updated lines on map:", linesFC);
  }, [linesFC]);

  return <div ref={mapContainer} style={{ width: "100%", height: "100vh" }} />;
}
