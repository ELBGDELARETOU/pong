const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

function createScene() {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0, 0.5, 0);

    // Lumière
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.9;

    // Table
    const table = BABYLON.MeshBuilder.CreateBox("table", { width: 8, height: 0.3, depth: 12 }, scene);
    table.position.y = -0.15;
    table.material = new BABYLON.StandardMaterial("tableMat", scene);
    table.material.diffuseColor = new BABYLON.Color3(0, 0.4, 0);

    // Filet
    const net = BABYLON.MeshBuilder.CreateBox("net", { width: 8, height: 0.9, depth: 0.05 }, scene);
    net.position.y = 0.25;
    net.position.z = 0;

    const netMat = new BABYLON.StandardMaterial("netMat", scene);
    netMat.diffuseColor = new BABYLON.Color3(1, 1, 1);
    netMat.alpha = 0.3;
    netMat.backFaceCulling = false;
    net.material = netMat;

    const topline = BABYLON.MeshBuilder.CreateBox("net", { width: 9.2, height: 0.01, depth: 0.05 }, scene);
    topline.position.y = 0.25;
    topline.position.z = 2;

    // Ligne blanche fine (utilitaire)
    function createLine(name, width, depth, posX, posZ) {
        const line = BABYLON.MeshBuilder.CreateBox(name, { width: width, height: 0.01, depth: depth }, scene);
        line.position.x = posX;
        line.position.y = 0.01; // légèrement au-dessus de la table
        line.position.z = posZ;

        const mat = new BABYLON.StandardMaterial(name + "Mat", scene);
        mat.diffuseColor = new BABYLON.Color3(1, 1, 1);
        line.material = mat;

        return line;
    }

    createLine("serviceLine1", 8, 0.3, 0, 5.85);
    createLine("serviceLine2", 8, 0.3, 0, -5.85);

    createLine("leftBorder", 0.3, 12, -3.85, 0);
    createLine("rightBorder", 0.3, 12, 3.85, 0);
    createLine("middleLine", 0.2, 12, 0, 0);

    // Raquettes
    const player = BABYLON.MeshBuilder.CreateBox("player", { width: 1, height: 0.3, depth: 0.6 }, scene);
    player.position.z = -4;
    player.position.y = 0.2;

    const ia = BABYLON.MeshBuilder.CreateBox("ia", { width: 1, height: 0.3, depth: 0.6 }, scene);
    ia.position.z = 4;
    ia.position.y = 0.2;

    // Caméra
    const camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 3.5, -13), scene);
    camera.setTarget(new BABYLON.Vector3(0, 0.1, 5));
    camera.attachControl(canvas, true);

    return { scene, table };
}

const { scene, table } = createScene();
engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());

// Convertit hex en BABYLON.Color3
function hexToColor3(hex) {
    const r = parseInt(hex.substr(1, 2), 16) / 255;
    const g = parseInt(hex.substr(3, 2), 16) / 255;
    const b = parseInt(hex.substr(5, 2), 16) / 255;
    return new BABYLON.Color3(r, g, b);
}

// Sélecteurs couleurs
const tableColorInput = document.getElementById("tableColor");
const bgColorInput = document.getElementById("backgroundColor");

tableColorInput.addEventListener("input", () => {
    table.material.diffuseColor = hexToColor3(tableColorInput.value);
});

bgColorInput.addEventListener("input", () => {
    scene.clearColor = hexToColor3(bgColorInput.value);
});
