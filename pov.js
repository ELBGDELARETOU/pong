const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

let ballVelocity = new BABYLON.Vector3(0.1, 0.2, 0.3); // X, Y, Z
const gravity = -0.008;
const iaSpeed = 0.2; // Vitesse de réaction de l'IA


function createScene() {

    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0, 0, 0);
    
    const chromeMaterial = new BABYLON.StandardMaterial("chromeMat", scene);
    chromeMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8); // Couleur de base gris clair
    chromeMaterial.specularColor = new BABYLON.Color3(1, 1, 1);      // Reflets intenses
    chromeMaterial.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2); // Légère lueur
    chromeMaterial.alpha = 1; // Opaque

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.8;

    const camera = new BABYLON.UniversalCamera("camera", new BABYLON.Vector3(0, 5, -40), scene);
    camera.setTarget(new BABYLON.Vector3(0, 5, 0));
    camera.attachControl(canvas, true);

    const tunnelWidth = 20;
    const tunnelHeight = 10;
    const tunnelLength = 50;
    const wallThickness = 0.5;

    // const ground = BABYLON.MeshBuilder.CreateBox("floor", {
    //     width: tunnelWidth,
    //     height: wallThickness,
    //     depth: tunnelLength
    // }, scene);
    // ground.position.y = 0;

    const field = BABYLON.MeshBuilder.CreateGround("ground", {
        width: 20,
        height: 40
    }, scene);
    field.position.y = 0;

    const fieldMat = new BABYLON.StandardMaterial("fieldMat", scene);
    fieldMat.diffuseColor = new BABYLON.Color3(0, 0.05, 0.1);
    fieldMat.specularColor = new BABYLON.Color3(0, 0.8, 1); // reflets
    fieldMat.emissiveColor = new BABYLON.Color3(0, 0.3, 0.6);
    field.material = fieldMat;

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

    const iaPaddle = BABYLON.MeshBuilder.CreateBox("iaPaddle", {
        width: 2,
        height: 2,
        depth: 0.5
    }, scene);
    
    iaPaddle.position.x = 0;
    iaPaddle.position.y = tunnelHeight / 2;
    iaPaddle.position.z = 0;

    iaPaddle.alpha = 0.2;
    iaPaddle.emissiveColor = new BABYLON.Color3(0, 1, 1);
    iaPaddle.wireframe = true;
    iaPaddle.material = paddleMat;

    const ball = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: 1 }, scene);
    ball.position = new BABYLON.Vector3(0, tunnelHeight / 2, 0);

    const ballMat = new BABYLON.StandardMaterial("ballMat", scene);
    ballMat.emissiveColor = new BABYLON.Color3(1, 1, 0);
    ball.material = ballMat;
    const net = BABYLON.MeshBuilder.CreateBox("net", {
        width: tunnelWidth,
        height: 1.5,
        depth: 0.1
    }, scene);

    net.position.y = 0.5;  // Hauteur au-dessus du sol
    net.position.z = 0;    // Milieu du terrain

    net.material = chromeMaterial;


    return { scene, paddle, iaPaddle, ball, tunnelWidth, tunnelHeight };
}

const { scene, paddle, iaPaddle, ball, tunnelWidth, tunnelHeight } = createScene();

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

    paddle.position.z = -20;
    iaPaddle.position.z = 20;

    // Appliquer la gravité
    ballVelocity.y += gravity;

    // Déplacer la balle
    ball.position.addInPlace(ballVelocity);

    // Rebonds contre les murs gauche/droite
    if (ball.position.x <= -tunnelWidth / 2 + 0.5 || ball.position.x >= tunnelWidth / 2 - 0.5) {
        ballVelocity.x *= -1;
    }

    // Rebonds sol/plafond
    if (ball.position.y <= 0.5 || ball.position.y >= tunnelHeight - 0.5) {
        ballVelocity.y *= -1;
    }

    // Collision avec paddle joueur
    if (Math.abs(ball.position.z - paddle.position.z) < 0.5 &&
        Math.abs(ball.position.x - paddle.position.x) < 1.5 &&
        Math.abs(ball.position.y - paddle.position.y) < 1.5) {
        ballVelocity.z *= -1;
        ballVelocity.x += (ball.position.x - paddle.position.x) * 0.05;
        ballVelocity.y += (ball.position.y - paddle.position.y) * 0.05;
    }

    // Collision avec paddle IA
    if (Math.abs(ball.position.z - iaPaddle.position.z) < 0.5 &&
        Math.abs(ball.position.x - iaPaddle.position.x) < 1.5 &&
        Math.abs(ball.position.y - iaPaddle.position.y) < 1.5) {
        ballVelocity.z *= -1;
        ballVelocity.x += (ball.position.x - iaPaddle.position.x) * 0.05;
        ballVelocity.y += (ball.position.y - iaPaddle.position.y) * 0.05;
    }
    // L'IA suit la balle (en X et Y seulement)
    if (iaPaddle.position.x < ball.position.x - 0.1) {
        iaPaddle.position.x += iaSpeed;
    } else if (iaPaddle.position.x > ball.position.x + 0.1) {
        iaPaddle.position.x -= iaSpeed;
    }

    if (iaPaddle.position.y < ball.position.y - 0.1) {
        iaPaddle.position.y += iaSpeed;
    } else if (iaPaddle.position.y > ball.position.y + 0.1) {
        iaPaddle.position.y -= iaSpeed;
    }
    // Limites du terrain pour l'IA
    iaPaddle.position.x = Math.max(-tunnelWidth / 2 + 1, Math.min(tunnelWidth / 2 - 1, iaPaddle.position.x));
    iaPaddle.position.y = Math.max(1, Math.min(tunnelHeight - 1, iaPaddle.position.y));


    scene.render();
});

window.addEventListener("resize", () => engine.resize());