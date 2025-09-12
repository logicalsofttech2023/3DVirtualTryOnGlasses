import React, { useEffect, useRef } from "react";
import { startJeeliz } from "./assets/main.js";

function App() {
  const canvasRef = useRef(null);

  useEffect(() => {
    startJeeliz("jeeFaceFilterCanvas");
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <h2>React + Jeeliz VTO</h2>
      <canvas
        ref={canvasRef}
        id="jeeFaceFilterCanvas"
        width="600"
        height="600"
        style={{ border: "1px solid #ccc" }}
      ></canvas>
    </div>
  );
}

export default App;
