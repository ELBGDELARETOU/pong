const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

function createScene() {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0, 0, 0);

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.8;

    const camera = new BABYLON.UniversalCamera("camera", new BABYLON.Vector3(0, 5, -25), scene);
    camera.setTarget(new BABYLON.Vector3(0, 5, 0));
    camera.attachControl(canvas, true);

    const wallMaterial = new BABYLON.StandardMaterial("wallMat", scene);
    wallMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.3);

    const tunnelWidth = 20;
    const tunnelHeight = 10;
    const tunnelLength = 50;
    const wallThickness = 0.5;

    const ground = BABYLON.MeshBuilder.CreateBox("floor", {
        width: tunnelWidth,
        height: wallThickness,
        depth: tunnelLength
    }, scene);
    ground.position.y = 0;

    const ceiling = ground.clone("ceiling");
    ceiling.position.y = tunnelHeight;

    const leftWall = BABYLON.MeshBuilder.CreateBox("leftWall", {
        width: wallThickness,
        height: tunnelHeight,
        depth: tunnelLength
    }, scene);
    leftWall.position.x = -tunnelWidth / 2;

    const rightWall = leftWall.clone("rightWall");
    rightWall.position.x = tunnelWidth / 2;

    ground.material = ceiling.material = leftWall.material = rightWall.material = wallMaterial;

    const paddle = BABYLON.MeshBuilder.CreateBox("paddle", {
        width: 2,
        height: 2,
        depth: 0.5
    }, scene);
    paddle.position.x = 0;
    paddle.position.y = tunnelHeight / 2;
    paddle.position.z = 0;

    const paddleMat = new BABYLON.StandardMaterial("paddleMat", scene);
    paddleMat.alpha = 0.2;
    paddleMat.emissiveColor = new BABYLON.Color3(0, 1, 1);
    paddleMat.wireframe = true;
    paddle.material = paddleMat;

    return { scene, paddle, tunnelWidth, tunnelHeight };
}

const { scene, paddle, tunnelWidth, tunnelHeight } = createScene();

const keys = {};
const speed = 0.3;

window.addEventListener("keydown", (e) => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", (e) => keys[e.key.toLowerCase()] = false);

engine.runRenderLoop(() => {
    if (keys["a"] && paddle.position.x > -tunnelWidth / 2 + 1) {
        paddle.position.x -= speed;
    }
    if (keys["d"] && paddle.position.x < tunnelWidth / 2 - 1) {
        paddle.position.x += speed;
    }

    if (keys["w"] && paddle.position.y < tunnelHeight - 1) {
        paddle.position.y += speed;
    }
    if (keys["s"] && paddle.position.y > 1) {
        paddle.position.y -= speed;
    }

    paddle.position.z = 0;

    scene.render();
});

window.addEventListener("resize", () => engine.resize());