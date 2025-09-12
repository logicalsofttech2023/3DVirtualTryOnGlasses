import React, { useEffect, useRef } from "react";

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
        await loadScript("/module/jeelizFaceFilter.js");
        await loadScript("/libs/three/v112/three.js");
        await loadScript("/helpers/JeelizThreeHelper.js");
        await loadScript("/helpers/JeelizResizer.js");
        await loadScript("/JeelizThreeGlassesCreator.js");
        await loadScript("/main.js");

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
