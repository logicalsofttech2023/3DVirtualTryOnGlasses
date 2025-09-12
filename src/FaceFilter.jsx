import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { ObjectLoader } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"; // keep if you want GLB too
import JeelizThreeHelper from "./helpers/JeelizThreeHelper.js";
import JeelizResizer from "./helpers/JeelizResizer.js";

let THREECAMERA = null;
let currentGlasses = null;

export default function FaceFilter() {
  const canvasRef = useRef(null);

  const loadJSONGlasses = (jsonPath, threeStuffs) => {
    const loader = new ObjectLoader();
    loader.load(
      jsonPath,
      (obj) => {
        obj.scale.multiplyScalar(0.006);
        obj.position.set(0, 0.07, 0.4);

        if (currentGlasses) threeStuffs.faceObject.remove(currentGlasses);
        threeStuffs.faceObject.add(obj);
        currentGlasses = obj;
      },
      undefined,
      (err) => console.error("JSON Load Error:", err)
    );
  };

  const detect_callback = (faceIndex, isDetected) => {
    console.log(isDetected ? "DETECTED" : "LOST");
  };

  const init_threeScene = (spec) => {
    const threeStuffs = JeelizThreeHelper.init(spec, detect_callback);
    threeStuffs.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    threeStuffs.renderer.outputEncoding = THREE.sRGBEncoding;

    // ✅ Load aviator.json instead of aviator.glb
    loadJSONGlasses("/models3D/aviator.json", threeStuffs);

    THREECAMERA = JeelizThreeHelper.create_camera();

    window.loadGlasses = (jsonPath) => loadJSONGlasses(jsonPath, threeStuffs);
  };

  const init_faceFilter = (videoSettings) => {
    if (!window.JEELIZFACEFILTER) return console.error("JEELIZFACEFILTER missing");

    window.JEELIZFACEFILTER.init({
      followZRot: true,
      canvasId: "jeeFaceFilterCanvas",
      NNCPath: "/neuralNets/NN_DEFAULT.json",
      maxFacesDetected: 1,
      callbackReady: (errCode, spec) => {
        if (errCode) return console.error("FaceFilter ERR =", errCode);
        console.log("JEELIZ FACE FILTER READY");
        init_threeScene(spec);
      },
      callbackTrack: (detectState) => {
        JeelizThreeHelper.render(detectState, THREECAMERA);
      },
    });
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    JeelizResizer.size_canvas({
      canvasId: "jeeFaceFilterCanvas",
      callback: (isError, bestVideoSettings) => {
        if (!isError) init_faceFilter(bestVideoSettings);
      },
    });
  }, []);

  return <canvas ref={canvasRef} id="jeeFaceFilterCanvas" style={{ width: "100%", height: "100%" }} />;
}
