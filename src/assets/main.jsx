import * as THREE from "./libs/three/v112/three.js";
import { JeelizThreeHelper } from "./helpers/JeelizThreeHelper.js";
import { JeelizResizer } from "./helpers/JeelizResizer.js";
import { JeelizThreeGlassesCreator } from "./JeelizThreeGlassesCreator.js";
import { JEELIZFACEFILTER } from "./module/jeelizFaceFilter.js";
import envMap from "./envMap.jpg?url";
import glassesFramesBranchesBent from "./models3D/glassesFramesBranchesBent.json?url";
import glassesLenses from "./models3D/glassesLenses.json?url";
import face from "./models3D/face.json?url";

let THREECAMERA = null;

// callback: launched if a face is detected or lost.
function detect_callback(faceIndex, isDetected) {
  if (isDetected) {
    console.log("INFO in detect_callback(): DETECTED");
  } else {
    console.log("INFO in detect_callback(): LOST");
  }
}

// build the 3D scene
function init_threeScene(spec) {
  const threeStuffs = JeelizThreeHelper.init(spec, detect_callback);

  // improve WebGLRenderer settings:
  threeStuffs.renderer.toneMapping = THREE.ACESFilmicToneMapping;
  threeStuffs.renderer.outputEncoding = THREE.sRGBEncoding;

  // CREATE THE GLASSES AND ADD THEM
  const r = JeelizThreeGlassesCreator({
    envMapURL: envMap,
    frameMeshURL: glassesFramesBranchesBent,
    lensesMeshURL: glassesLenses,
    occluderURL: face,
  });

  // vertical offset:
  const dy = 0.07;

  // create and add the occluder:
  r.occluder.rotation.set(0.3, 0, 0);
  r.occluder.position.set(0, 0.03 + dy, -0.04);
  r.occluder.scale.multiplyScalar(0.0084);
  threeStuffs.faceObject.add(r.occluder);

  // create and add the glasses mesh:
  const threeGlasses = r.glasses;
  threeGlasses.position.set(0, dy, 0.4);
  threeGlasses.scale.multiplyScalar(0.006);
  threeStuffs.faceObject.add(threeGlasses);

  // CREATE THE CAMERA:
  THREECAMERA = JeelizThreeHelper.create_camera();
}

// Init FaceFilter
function init_faceFilter(videoSettings, canvasId) {
  JEELIZFACEFILTER.init({
    followZRot: true,
    canvasId: canvasId,
    NNCPath: "./neuralNets/NN_DEFAULT.json",
    maxFacesDetected: 1,
    callbackReady: function (errCode, spec) {
      if (errCode) {
        console.log("AN ERROR HAPPENS. ERR =", errCode);
        return;
      }
      console.log("INFO: JEELIZFACEFILTER IS READY");
      init_threeScene(spec);
    },

    // called at each render iteration (drawing loop):
    callbackTrack: function (detectState) {
      JeelizThreeHelper.render(detectState, THREECAMERA);
    },
  });
}

// Entry function
export function startJeeliz(canvasId) {
  JeelizResizer.size_canvas({
    canvasId,
    callback: function (isError, bestVideoSettings) {
      if (isError) {
        console.error("Resizer error:", isError);
        return;
      }
      init_faceFilter(bestVideoSettings, canvasId);
    },
  });
}
