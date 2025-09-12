import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import JeelizThreeHelper from "./assets/helpers/JeelizThreeHelper.js";
import JeelizResizer from "./assets/helpers/JeelizResizer.js";
import JeelizThreeGlassesCreator from "./assets/JeelizThreeGlassesCreator.js";

let THREECAMERA = null;
let currentGlasses = null;

export default function FaceFilter() {
  const canvasRef = useRef(null);

  // Load GLB glasses
  const loadGLBGlasses = (glbPath, threeStuffs) => {
    const loader = new GLTFLoader();
    loader.load(
      glbPath,
      (gltf) => {
        const model = gltf.scene;
        model.scale.multiplyScalar(0.006);
        model.position.set(0, 0.07, 0.4);

        if (currentGlasses) threeStuffs.faceObject.remove(currentGlasses);
        threeStuffs.faceObject.add(model);
        currentGlasses = model;
      },
      undefined,
      (err) => console.error("GLB Load Error:", err)
    );
  };

  const detect_callback = (faceIndex, isDetected) => {
    console.log(isDetected ? "DETECTED" : "LOST");
  };

  // Initialize Three.js scene
  const init_threeScene = (spec) => {
    const threeStuffs = JeelizThreeHelper.init(spec, detect_callback);
    threeStuffs.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    threeStuffs.renderer.outputEncoding = THREE.sRGBEncoding;

    // Load default glasses
    loadGLBGlasses("./assets/models3D/aviator.glb", threeStuffs);

    // Occluder
    const r = JeelizThreeGlassesCreator({
      envMapURL: "./assets/envMap.jpg",
      frameMeshURL: "./assets/models3D/glassesFramesBranchesBent.json",
      lensesMeshURL: "./assets/models3D/glassesLenses.json",
      occluderURL: "./assets/models3D/face.json",
    });
    const dy = 0.07;
    r.occluder.rotation.set(0.3, 0, 0);
    r.occluder.position.set(0, 0.03 + dy, -0.04);
    r.occluder.scale.multiplyScalar(0.0084);
    threeStuffs.faceObject.add(r.occluder);

    THREECAMERA = JeelizThreeHelper.create_camera();

    // Expose switch function globally
    window.loadGlasses = (glbPath) => loadGLBGlasses(glbPath, threeStuffs);
  };

  // Initialize Jeeliz Face Filter
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

  // Main init
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
