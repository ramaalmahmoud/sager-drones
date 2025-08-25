import React, { useState } from "react";

import MapView from "./MapView";
import DroneList from "./components/DroneList";
import "./socket"; // يعمل connection عند التشغيل

function App() {
  const [selectedDrone, setSelectedDrone] = useState(null);

  return (
    /*<div className="flex">
      <MapView />
    </div>*/
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <MapView selectedDrone={selectedDrone} />
      <DroneList onSelectDrone={setSelectedDrone} />
    </div>
  );
}

export default App;
