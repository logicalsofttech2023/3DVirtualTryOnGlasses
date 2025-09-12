import React, { useEffect, useRef } from "react";
import jeelizFaceFilter from "./assets/models3D/jeelizFaceFilter.js";
import three from "./assets/libs/three/v112/three.js"
import JeelizThreeHelper from "./assets/helpers/JeelizThreeHelper.js";
import JeelizResizer from "./assets/helpers/JeelizResizer.js";
import JeelizThreeGlassesCreator from "./assets/JeelizThreeGlassesCreator.js";
import main from "./assets/main.js";
import "./App.css";


function App() {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Dynamically load Jeeliz scripts
    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });

    async function initJeeliz() {
      try {
        // load all dependencies in sequence
        await loadScript(jeelizFaceFilter);
        await loadScript(three);
        await loadScript(JeelizThreeHelper);
        await loadScript(JeelizResizer);
        await loadScript(JeelizThreeGlassesCreator);
        await loadScript(main);

        console.log("✅ Jeeliz scripts loaded");

        // Call init function from main.js if available
        if (window.main) {
          window.main(canvasRef.current);
        }
      } catch (err) {
        console.error("❌ Error loading Jeeliz scripts:", err);
      }
    }

    initJeeliz();
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
