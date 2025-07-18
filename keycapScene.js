const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);

// Caméra simple
const camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 5, -30), scene);
camera.setTarget(BABYLON.Vector3.Zero());
camera.attachControl(canvas, true);

// Lumière basique
const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
light.intensity = 1;

// Charger le clavier
BABYLON.SceneLoader.ImportMesh("", "assets/", "razer_huntsman_mini_keyboard.glb", scene, function (meshes) {
    const parent = new BABYLON.TransformNode("keyboardParent", scene);
    meshes.forEach(mesh => mesh.parent = parent);

    // Réorienter correctement le clavier
    parent.rotation = new BABYLON.Vector3(0, Math.PI, 0); // ← CORRECTION ICI
});

// Rendu
engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());
