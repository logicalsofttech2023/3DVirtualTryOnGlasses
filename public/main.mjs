let THREECAMERA = null;
let currentGlasses = null;

// Face detect callback
function detect_callback(faceIndex, isDetected) {
  console.log(isDetected ? "DETECTED" : "LOST");
}

// Load GLB glasses at runtime
function loadGLBGlasses(glbPath, threeStuffs) {
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
}

// init 3D scene
function init_threeScene(spec) {
  const threeStuffs = JeelizThreeHelper.init(spec, detect_callback);
  threeStuffs.renderer.toneMapping = THREE.ACESFilmicToneMapping;
  threeStuffs.renderer.outputEncoding = THREE.sRGBEncoding;

  // Load default GLB glasses
  loadGLBGlasses("./models3D/aviator.glb", threeStuffs);

  // Occluder
  const r = JeelizThreeGlassesCreator({
    envMapURL: "./envMap.jpg",
    frameMeshURL: "./models3D/glassesFramesBranchesBent.json",
    lensesMeshURL: "./models3D/glassesLenses.json",
    occluderURL: "./models3D/face.json"
  });
  const dy = 0.07;
  r.occluder.rotation.set(0.3, 0, 0);
  r.occluder.position.set(0, 0.03 + dy, -0.04);
  r.occluder.scale.multiplyScalar(0.0084);
  threeStuffs.faceObject.add(r.occluder);

  THREECAMERA = JeelizThreeHelper.create_camera();

  // Allow switching glasses at runtime
  window.loadGlasses = (glbPath) => loadGLBGlasses(glbPath, threeStuffs);
}

// init Face Filter
function init_faceFilter(videoSettings) {
  JEELIZFACEFILTER.init({
    followZRot: true,
    canvasId: "jeeFaceFilterCanvas",
    NNCPath: "./neuralNets/NN_DEFAULT.json",
    maxFacesDetected: 1,
    callbackReady: function (errCode, spec) {
      if (errCode) return console.error("FaceFilter ERR =", errCode);
      console.log("JEELIZ FACE FILTER READY");
      init_threeScene(spec);
    },
    callbackTrack: function (detectState) {
      JeelizThreeHelper.render(detectState, THREECAMERA);
    },
  });
}

// main entry
function main() {
  JeelizResizer.size_canvas({
    canvasId: "jeeFaceFilterCanvas",
    callback: function (isError, bestVideoSettings) {
      init_faceFilter(bestVideoSettings);
    },
  });
}

window.addEventListener("load", main);
