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
/*import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useDroneStore } from "./store";
function DroneCounter() {
  const redCount = useDroneStore((s) => s.redCount());

  return (
    <div className="absolute bottom-6 right-6">
      <div className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full shadow-lg">
        <span className="w-3 h-3 rounded-full bg-red-500"></span>
        <span className="font-medium">{redCount} Drone Flying</span>
      </div>
    </div>
  );
}
export default function MapView() {
  var bgColor = {
    Default: "#81b71a",
    Blue: "#00B1E1",
    Cyan: "#37BC9B",
    Green: "#8CC152",
    Red: "#E9573F",
    Yellow: "#F6BB42",
  };
  const mapContainer = useRef(null);
  const map = useRef(null);

  // ناخذ الـ GeoJSON الجاهز من Zustand
  const pointsFC = useDroneStore((s) => s.pointsFC);
  const linesFC = useDroneStore((s) => s.linesFC);
  const redCount = useDroneStore((s) => s.redCount());
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

      // 1️⃣ أنشئ popup فارغ (و ما يختفي لو ضغطت على الخريطة)
      const popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
      });

      // 2️⃣ عند دخول الماوس فوق الطائرة
      map.current.on("mouseenter", "drones-layer", (e) => {
        map.current.getCanvas().style.cursor = "pointer";

        if (!e.features?.length) return;
        const feature = e.features[0];
        const coords = feature.geometry.coordinates.slice();
        const props = feature.properties;

        // احسب Flight time
        const flightTimeSec = Math.floor((Date.now() - props.firstSeen) / 1000);
        const flightTimeMin = Math.floor(flightTimeSec / 60);
        const seconds = flightTimeSec % 60;

        const flightTime = `${flightTimeMin}m ${seconds}s`;

        // النص داخل الـ popup
        const html = `
    <div style="font-size: 13px">
      <b>Drone:</b> ${props.serial}<br/>
      <b>Flight time:</b> ${flightTime}<br/>
      <b>Altitude:</b> ${props.altitude || "N/A"} m
    </div>
  `;

        popup.setLngLat(coords).setHTML(html).addTo(map.current);
      });

      // 3️⃣ عند خروج الماوس
      map.current.on("mouseleave", "drones-layer", () => {
        map.current.getCanvas().style.cursor = "";
        popup.remove();
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

  //  return <div ref={mapContainer} style={{ width: "100%", height: "100vh" }} />;
  return (
    <div
      ref={mapContainer}
      style={{
        width: "100%",
        height: "100vh",
        position: "relative",
      }}
    >
      <div
        className="absolute bottom-6 right-6"
        style={{
          position: "absolute",
          bottom: "10px",
          right: "10px",
          backgroundColor: "black",
          color: "white",
        }}
      >
        <div className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full shadow-lg">
          <span className="w-3 h-3 rounded-full bg-red-500"></span>
          <span>{redCount} Drone Flying</span>
        </div>
      </div>
    </div>
  );
}*/
/*import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useDroneStore } from "./store";

function DroneCounter() {
  // subscribe to pointsFC and compute red drones count on every change
  const pointsFC = useDroneStore((s) => s.pointsFC);
  const redCount = pointsFC.features.filter(
    (f) => !f.properties.allowed
  ).length;

  return (
    <div className="absolute bottom-6 right-6 z-50">
      <div className="flex items-center gap-2 bg-red-700 text-white px-5 py-2 rounded-full shadow-lg border border-white">
        <span className="w-3 h-3 rounded-full bg-red-500"></span>
        <span>
          {redCount} Drone{redCount !== 1 ? "s" : ""} Flying
        </span>
      </div>
    </div>
  );
}

export default function MapView() {
  const mapContainer = useRef(null);
  const map = useRef(null);

  const pointsFC = useDroneStore((s) => s.pointsFC);
  const linesFC = useDroneStore((s) => s.linesFC);
  const redCount = useDroneStore((s) => s.redCount());

  // إنشاء الخريطة
  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json", // خريطة داكنة
      center: [35.9, 31.95], // وسط عمان مثلاً
      zoom: 6,
    });

    map.current.on("load", () => {
      // 🔴 تحميل أيقونات PNG (بدل SVG)
      map.current.loadImage("/icons/drone-red.png", (err, img) => {
        if (!err && img && !map.current.hasImage("drone-red")) {
          map.current.addImage("drone-red", img);
        }
      });

      map.current.loadImage("/icons/drone-green.png", (err, img) => {
        if (!err && img && !map.current.hasImage("drone-green")) {
          map.current.addImage("drone-green", img);
        }
      });

      // مصدر الطائرات
      map.current.addSource("drones", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      // طبقة الطائرات
      map.current.addLayer({
        id: "drones-layer",
        type: "symbol",
        source: "drones",
        layout: {
          "icon-image": [
            "case",
            ["get", "allowed"],
            "drone-green",
            "drone-red",
          ],
          "icon-size": 0.08,
          "icon-allow-overlap": true,
        },
      });

      // Popup
      const popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
      });

      map.current.on("mouseenter", "drones-layer", (e) => {
        map.current.getCanvas().style.cursor = "pointer";

        if (!e.features?.length) return;
        const feature = e.features[0];
        const coords = feature.geometry.coordinates.slice();
        const props = feature.properties;

        const flightTimeSec = Math.floor((Date.now() - props.firstSeen) / 1000);
        const flightTimeMin = Math.floor(flightTimeSec / 60);
        const seconds = flightTimeSec % 60;
        const flightTime = `${flightTimeMin}m ${seconds}s`;

        const html = `
          <div style="
            background: rgba(0,0,0,0.85);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 13px;
            line-height: 1.5;
          ">
            <b>Drone:</b> ${props.serial}<br/>
            <b>Flight time:</b> ${flightTime}<br/>
            <b>Altitude:</b> ${props.altitude || "N/A"} m
          </div>
        `;

        popup.setLngLat(coords).setHTML(html).addTo(map.current);
      });

      map.current.on("mouseleave", "drones-layer", () => {
        map.current.getCanvas().style.cursor = "";
        popup.remove();
      });

      // مصدر الخطوط (المسارات)
      map.current.addSource("drone-lines", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      // طبقة الخطوط
      map.current.addLayer({
        id: "lines-layer",
        type: "line",
        source: "drone-lines",
        paint: {
          "line-color": [
            "case",
            ["get", "allowed"],
            "#37BC9B", // أخضر
            "#E9573F", // أحمر
          ],
          "line-width": 3,
        },
      });
    });
  }, []);

  // تحديث النقاط
  useEffect(() => {
    if (!map.current) return;
    if (!map.current.getSource("drones")) return;
    map.current.getSource("drones").setData(pointsFC);
  }, [pointsFC]);

  // تحديث الخطوط
  useEffect(() => {
    if (!map.current) return;
    if (!map.current.getSource("drone-lines")) return;
    map.current.getSource("drone-lines").setData(linesFC);
  }, [linesFC]);

  {
  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <div
        ref={mapContainer}
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
        }}
      ></div>

 
      <DroneCounter />
    </div>
  );
}*/

import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useDroneStore } from "./store";
import DroneList from "./components/DroneList";

function DroneCounter({ pointsFC }) {
  const redCount = pointsFC.features.filter(
    (f) => !f.properties.allowed
  ).length;
  return (
    <div className="absolute bottom-6 right-6 z-50">
      <div className="flex items-center gap-2 bg-red-700 text-white px-5 py-2 rounded-full shadow-lg border border-white">
        <span className="w-3 h-3 rounded-full bg-red-500"></span>
        <span>
          {redCount} Drone{redCount !== 1 ? "s" : ""} Flying
        </span>
      </div>
    </div>
  );
}

export default function MapView() {
  const mapContainer = useRef(null);
  const map = useRef(null);

  // Keep drone paths state
  const [dronePaths, setDronePaths] = useState({}); // { serial: [[lng, lat], ...] }

  const pointsFC = useDroneStore((s) => s.pointsFC);

  // Initialize map
  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      center: [35.9, 31.95],
      zoom: 6,
    });

    map.current.on("load", () => {
      // Load drone icons
      ["drone-red", "drone-green"].forEach((icon) => {
        map.current.loadImage(`/icons/${icon}.png`, (err, img) => {
          if (!err && img && !map.current.hasImage(icon))
            map.current.addImage(icon, img);
        });
      });

      // Drones source & layer
      map.current.addSource("drones", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.current.addLayer({
        id: "drones-layer",
        type: "symbol",
        source: "drones",
        layout: {
          "icon-image": [
            "case",
            ["get", "allowed"],
            "drone-green",
            "drone-red",
          ],
          "icon-size": 0.08,
          "icon-allow-overlap": true,
              "icon-rotate": ["get", "yaw"], 

        },
      });

      // Lines source & layer
      map.current.addSource("drone-lines", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.current.addLayer({
        id: "lines-layer",
        type: "line",
        source: "drone-lines",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": ["case", ["get", "allowed"], "#37BC9B", "#E9573F"],
          "line-width": 4,
          "line-opacity": 0.8,
        },
      });
    });
  }, []);

  // Update drones & paths
  useEffect(() => {
    if (!map.current || !map.current.getSource("drones")) return;

    // Update drones positions
    map.current.getSource("drones").setData(pointsFC);

    // Accumulate paths
    const newPaths = { ...dronePaths };
    pointsFC.features.forEach((f) => {
      const serial = f.properties.serial;
      if (!newPaths[serial]) newPaths[serial] = [];
      newPaths[serial].push(f.geometry.coordinates);
      // Optional: limit path length to 20 points
      if (newPaths[serial].length > 20) newPaths[serial].shift();
    });
    setDronePaths(newPaths);

    // Convert paths to LineStrings
    const linesFC = { type: "FeatureCollection", features: [] };
    Object.entries(newPaths).forEach(([serial, coords]) => {
      if (coords.length > 1) {
        const allowed =
          pointsFC.features.find((f) => f.properties.serial === serial)
            ?.properties.allowed || false;
        linesFC.features.push({
          type: "Feature",
          properties: { allowed },
          geometry: { type: "LineString", coordinates: coords },
        });
      }
    });

    if (map.current.getSource("drone-lines"))
      map.current.getSource("drone-lines").setData(linesFC);
  }, [pointsFC]);

return (
  <div style={{ width: "100%", height: "100vh", position: "relative" }}>
    <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />

    {/* Drone Counter (أسفل يمين) */}
    <DroneCounter pointsFC={pointsFC} />

    {/* Drone List (أعلى يمين) */}
    <div style={{ position: "absolute", top: "10px", right: "10px", zIndex: 50 }}>
      <DroneList
        onSelectDrone={(drone) => {
          const [lng, lat] = drone.geometry.coordinates;
          map.current.flyTo({
            center: [lng, lat],
            zoom: 15,
            essential: true,
          });
        }}
      />
    </div>
  </div>
);

}
