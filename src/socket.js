/*import { io } from "socket.io-client";
import { useDroneStore } from "./store";

const socket = io("http://localhost:9013");

socket.on("connect", () => {
  console.log("Connected:", socket.id);
});

socket.on("message", (data) => {
  useDroneStore.setState((state) => {
    const dronesMap = {};
    [...state.drones, ...data.features].forEach((d) => {
      dronesMap[d.properties.serial] = d;
    });
    return { drones: Object.values(dronesMap) };
  });
});

socket.on("disconnect", () => {
  console.log("Disconnected");
});*/
import { io } from "socket.io-client";
import { useDroneStore } from "./store";

const socket = io("http://localhost:9013");

socket.on("connect", () => {
  console.log("Connected:", socket.id);
});

socket.on("message", (data) => {
  const features = Array.isArray(data?.features) ? data.features : [];
  // بدلاً من استبدال المصفوفة، نحدّث تاريخ كل طائرة
  useDroneStore.getState().upsertFeatures(features);
});

socket.on("disconnect", () => {
  console.log("Disconnected");
});

export default socket;
