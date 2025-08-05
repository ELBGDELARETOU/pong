const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

let boxes = [];
const playWidth = 10; // Ajuste selon tes besoins

function createLight(position, rotation, color, name, scene) {
    color = new BABYLON.Color3(1.0, 0.1, 0.5);
    const box = BABYLON.MeshBuilder.CreateBox("box" + name, {
        width: 4,
        height: 10,
        depth: 0.01
    }, scene);

    const lightMaterial = new BABYLON.StandardMaterial("mat" + name, scene);
    lightMaterial.disableLighting = true;
    lightMaterial.emissiveColor = color;
    box.material = lightMaterial;

    box.position = position;
    box.rotation = rotation;

    const light = new BABYLON.DirectionalLight("light" + name, new BABYLON.Vector3(0, -1, 0), scene);
    light.diffuse = color;
    light.specular = color;
    light.intensity = 2;

    boxes.push({ box, light, material: lightMaterial });
}

function createScene() {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);

    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 20, height: 10}, scene);

    const mirrorMat = new BABYLON.PBRMaterial("mirror", scene);
    mirrorMat.metallic = 1.0;
    mirrorMat.roughness = 0.1;
    mirrorMat.environmentTexture = null;
    mirrorMat.albedoColor = new BABYLON.Color3(0, 0, 0);
    ground.material = mirrorMat;
    scene.ground = ground;

    // Caméra corrigée - vue du clavier
    const camera = new BABYLON.ArcRotateCamera("arcCam", 
    Math.PI / 2 + Math.PI,
    Math.PI / 3,
    20,
    new BABYLON.Vector3(0, 0, 0),
    scene
);

    camera.attachControl(canvas, true);
    scene.camera = camera;

    // Lumière basique pour voir quelque chose
    const ambientLight = new BABYLON.HemisphericLight("ambient", new BABYLON.Vector3(0, 1, 0), scene);
    ambientLight.intensity = 0.5;

    createLight(new BABYLON.Vector3(-8, 5.2, 5), new BABYLON.Vector3(0, 0, 0), BABYLON.Color3.White(), "light1", scene);
    createLight(new BABYLON.Vector3(-2.7, 5.2, 5), new BABYLON.Vector3(0, 0, 0), BABYLON.Color3.White(), "light4", scene);
    createLight(new BABYLON.Vector3(2.7, 5.2, 5), new BABYLON.Vector3(0, 0, 0), BABYLON.Color3.White(), "light3", scene);
    createLight(new BABYLON.Vector3(8, 5.2, 5), new BABYLON.Vector3(0, 0, 0), BABYLON.Color3.White(), "light2", scene);

    // Chargement du clavier
    BABYLON.SceneLoader.ImportMesh("", "assets/", "razer_huntsman_mini_keyboard.glb", scene, function (meshes) {
        const parent = new BABYLON.TransformNode("keyboardParent", scene);
        meshes.forEach(mesh => mesh.parent = parent);
        
        
        parent.position = new BABYLON.Vector3(-1.1, 0.3, 15);
        parent.rotation = new BABYLON.Vector3(0, Math.PI, 0);
        parent.scaling = new BABYLON.Vector3(-0.35, 0.35, 0.35);
        
        // Créer des cubes lumineux au-dessus des touches WSIK
        const keyPositions = {
            W: new BABYLON.Vector3(-4.4, 1, ),  // Positions relatives au clavier
            S: new BABYLON.Vector3(-4, 1, 2.6),
            I: new BABYLON.Vector3(6.8, 1, 0.8),
            K: new BABYLON.Vector3(7.2, 1, 2.6)
        };
        
        Object.keys(keyPositions).forEach(keyName => {
            const highlight = BABYLON.MeshBuilder.CreateBox(`highlight_${keyName}`, {
                width: 0.8, height: 0.1, depth: 0.8
            }, scene);
            
            highlight.position = keyPositions[keyName];
            highlight.parent = parent;
            
            // Matériau lumineux transparent
            const material = new BABYLON.StandardMaterial(`mat_${keyName}`, scene);
            material.emissiveColor = new BABYLON.Color3(0, 1, 0);
            material.alpha = 0.7;
            highlight.material = material;
        });

        // Ajuster la caméra pour voir le clavier une fois chargé
        // camera.position = new BABYLON.Vector3(0, 8, 35);
        // camera.setTarget(parent.position);
    });

    return scene;
}

// Créer la scène
const scene = createScene();

// Rendu
engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());s