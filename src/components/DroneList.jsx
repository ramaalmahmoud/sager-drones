import React from "react";
import { useDroneStore } from "../store"; // استدعاء Zustand store
import "../DroneList.css"; // لو حاب تضيف ستايل

export default function DroneList({ onSelectDrone }) {
  //const drones = useDroneStore((state) => state.drones); // نحصل على البيانات
  const drones = useDroneStore((s) => s.pointsFC.features);
  return (
    <div className="drone-list">
      <h3>Drone List</h3>
      <ul>
        {drones.map((drone) => {
          const canFly = drone.properties.registration
            .split("-")[1]
            ?.startsWith("B");
          return (
            <li
              key={drone.properties.serial}
              className={canFly ? "green" : "red"}
              onClick={() => onSelectDrone(drone)}
            >
              <span className="drone-name">{drone.properties.Name}</span>{" "}
              <span className="drone-reg">
                ({drone.properties.registration})
              </span>{" "}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
