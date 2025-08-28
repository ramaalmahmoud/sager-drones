/*import React from "react";
import { useDroneStore } from "../store"; 
import "../DroneList.css"; 

export default function DroneList({ onSelectDrone }) {

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
}*/
import React from "react";
import { useDroneStore } from "../store";
import "../DroneList.css";

export default function DroneList({ onSelectDrone }) {
  const drones = useDroneStore((s) => s.pointsFC.features);

  return (
    <div className="drone-list">
      <div className="drone-list-header">
        <span>Drones</span>
        <span className="close-btn">×</span>
      </div>
      <div className="drone-list-tabs">
        <span className="active-tab">Drones</span>
        <span>Flights History</span>
      </div>
      <ul>
        {drones.map((drone) => {
          const isFlying = drone.properties.registration
            .split("-")[1]
            ?.startsWith("B");
          return (
            <li
              key={drone.properties.serial}
              className={isFlying ? "green" : "red"}
              onClick={() => onSelectDrone(drone)}
            >
              <div className="drone-info">
                <span className="drone-name">{drone.properties.Name}</span>
                <span className="drone-reg">
                  Serial: {drone.properties.serial}
                </span>
                <span className="drone-reg">
                  Registration: {drone.properties.registration}
                </span>
                <span className="drone-reg">
                  Pilot: {drone.properties.pilot || "Unknown"}
                </span>
                <span className="drone-reg">
                  Organization: {drone.properties.organization || "-"}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
