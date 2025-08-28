/*import { create } from "zustand";

export const useDroneStore = create((set) => ({
  drones: [],
  addDrone: (drone) =>
    set((state) => ({
      drones: [...state.drones, drone],
    })),
}));*/
/*import { create } from "zustand";

const MAX_POINTS_PER_PATH = 500; // سقف نقاط المسار لكل طائرة للحفاظ على الأداء

export const useDroneStore = create((set, get) => ({
  // serial -> entry { props, last, history, firstSeen, lastSeen }
  dronesById: new Map(),

  // جاهز للتغذية في MapLibre مباشرة
  pointsFC: { type: "FeatureCollection", features: [] }, // مواقع الطائرات الحالية
  linesFC: { type: "FeatureCollection", features: [] }, // مسارات الطائرات

  // إدخال/تحديث ميزات جديدة قادمة من السيرفر
  upsertFeatures: (features) => {
    const map = new Map(get().dronesById);
    let changed = false;

    features.forEach((f) => {
      if (!f?.properties?.serial || !Array.isArray(f?.geometry?.coordinates))
        return;

      const id = f.properties.serial;
      const coord = f.geometry.coordinates;

      let entry = map.get(id);
      if (!entry) {
        entry = {
          props: { ...f.properties },
          history: [coord],
          last: coord,
          firstSeen: Date.now(),
          lastSeen: Date.now(),
        };
      } else {
        const last = entry.last;
        // إضافة النقطة إذا تغيّرت الإحداثيات
        if (!last || last[0] !== coord[0] || last[1] !== coord[1]) {
          const newHistory = entry.history.concat([coord]);
          if (newHistory.length > MAX_POINTS_PER_PATH) {
            newHistory.splice(0, newHistory.length - MAX_POINTS_PER_PATH);
          }
          entry = {
            ...entry,
            history: newHistory,
            last: coord,
            props: { ...entry.props, ...f.properties },
            lastSeen: Date.now(),
          };
        } else {
          // نفس الإحداثي: حدّث الخصائص والزمن فقط
          entry = {
            ...entry,
            props: { ...entry.props, ...f.properties },
            lastSeen: Date.now(),
          };
        }
      }
      map.set(id, entry);
      changed = true;
    });

    if (!changed) return;

    // بناء الـ GeoJSON للعرض
    const pointFeatures = [];
    const lineFeatures = [];
    map.forEach((entry, id) => {
      pointFeatures.push({
        type: "Feature",
        properties: { ...entry.props, serial: id },
        geometry: { type: "Point", coordinates: entry.last },
      });

      if (entry.history.length > 1) {
        lineFeatures.push({
          type: "Feature",
          properties: { serial: id },
          geometry: { type: "LineString", coordinates: entry.history },
        });
      }
    });

    set({
      dronesById: map,
      pointsFC: { type: "FeatureCollection", features: pointFeatures },
      linesFC: { type: "FeatureCollection", features: lineFeatures },
    });
  },
}));*/
import { create } from "zustand";

const MAX_POINTS_PER_PATH = 500; // سقف نقاط المسار لكل طائرة للحفاظ على الأداء

export const useDroneStore = create((set, get) => ({
  // serial -> entry { props, last, history, firstSeen, lastSeen }
  dronesById: new Map(),

  // جاهز للتغذية في MapLibre مباشرة
  pointsFC: { type: "FeatureCollection", features: [] }, // مواقع الطائرات الحالية
  linesFC: { type: "FeatureCollection", features: [] }, // مسارات الطائرات

  // ✅ عداد الطائرات الحمراء (غير المسموح إلها)
  redCount: () => {
    return get().pointsFC.features.filter((f) => f.properties.allowed === false)
      .length;
  },

  // إدخال/تحديث ميزات جديدة قادمة من السيرفر
  upsertFeatures: (features) => {
    const map = new Map(get().dronesById);
    let changed = false;

    features.forEach((f) => {
      if (!f?.properties?.serial || !Array.isArray(f?.geometry?.coordinates))
        return;

      const id = f.properties.serial;
      const coord = f.geometry.coordinates;

      let entry = map.get(id);
      if (!entry) {
        entry = {
          props: { ...f.properties },
          history: [coord],
          last: coord,
          firstSeen: Date.now(),
          lastSeen: Date.now(),
        };
      } else {
        const last = entry.last;
        // إضافة النقطة إذا تغيّرت الإحداثيات
        if (!last || last[0] !== coord[0] || last[1] !== coord[1]) {
          const newHistory = entry.history.concat([coord]);
          if (newHistory.length > MAX_POINTS_PER_PATH) {
            newHistory.splice(0, newHistory.length - MAX_POINTS_PER_PATH);
          }
          entry = {
            ...entry,
            history: newHistory,
            last: coord,
            props: { ...entry.props, ...f.properties },
            lastSeen: Date.now(),
          };
        } else {
          // نفس الإحداثي: حدّث الخصائص والزمن فقط
          entry = {
            ...entry,
            props: { ...entry.props, ...f.properties },
            lastSeen: Date.now(),
          };
        }
      }
      map.set(id, entry);
      changed = true;
    });

    if (!changed) return;

    // بناء الـ GeoJSON للعرض مع allowed property
    const pointFeatures = [];
    const lineFeatures = [];
    map.forEach((entry, id) => {
      const allowed =
        entry.props.registration &&
        entry.props.registration.split("-")[1]?.startsWith("B");

      pointFeatures.push({
        type: "Feature",
        properties: { ...entry.props, serial: id, allowed }, // ✅ أضفنا allowed
        geometry: { type: "Point", coordinates: entry.last },
      });

      if (entry.history.length > 1) {
        lineFeatures.push({
          type: "Feature",
          properties: { serial: id },
          geometry: { type: "LineString", coordinates: entry.history },
        });
      }
    });

    set({
      dronesById: map,
      pointsFC: { type: "FeatureCollection", features: pointFeatures },
      linesFC: { type: "FeatureCollection", features: lineFeatures },
    });
  },
}));
