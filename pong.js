const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const boxes = [];
const playWidth = 19;
const playHeight = 3;
const ballSpeed = 0.2;
let isWaitingAfterGoal = false;
let gameStarted = false;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function playLightWave(startIndex, direction = 1) {
    const delay = 100;
    const color = new BABYLON.Color3(1.0, 0.1, 0.5);

    for (let i = 0; i < boxes.length; i++) {
        const index = startIndex + i * direction;
        if (index < 0 || index >= boxes.length) break;

        setTimeout(() => {
            const { box, light, material } = boxes[index];
            box.scaling.set(1.2, 1.2, 1.2);
            light.intensity = 3;

            material.emissiveColor = color;
            light.diffuse = color;

            setTimeout(() => {
                box.scaling.set(1, 1, 1);
                light.intensity = 2;
            }, delay);
        }, delay * i);
    }
}

async function countdown() {
    const delay = 500;
    const green = new BABYLON.Color3(0.2, 1.0, 0.2);
    const pink =  new BABYLON.Color3(1.0, 0.1, 0.5);

    for (let i = 0; i < boxes.length; i++) {
        const { box, light, material } = boxes[i];

        material.emissiveColor = green;
        light.diffuse = green;
        light.intensity = 3;

        await sleep(delay);

        material.emissiveColor = pink;
        light.diffuse = pink;
        light.intensity = 2;
    }

    for (let i = 0; i < boxes.length; i++) {
        const { material, light } = boxes[i];
        material.emissiveColor = green;
        light.diffuse = green;
    }

    await sleep(delay);

    for (let i = 0; i < boxes.length; i++) {
        const { material, light } = boxes[i];
        material.emissiveColor = pink;
        light.diffuse = pink;
    }
}



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

    const light = new BABYLON.RectAreaLight("light" + name, new BABYLON.Vector3(0, 0, 0), 4, 10, scene);
    light.parent = box;
    light.diffuse = color;
    light.specular = color;
    light.intensity = 2;

    boxes.push({ box, light, material: lightMaterial });
}



function createScene() {
    const scene = new BABYLON.Scene(engine);
    // scene.environmentTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("https://assets.babylonjs.com/environments/studio.env", scene);
    // scene.environmentIntensity = 0
    // scene.environmentTexture = null;
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);
    
    const rightPaddleMaterial = new BABYLON.PBRMaterial("rightPaddleMat", scene);
    rightPaddleMaterial.metallic = 1.0;
    rightPaddleMaterial.roughness = 0.2;
    rightPaddleMaterial.albedoColor = new BABYLON.Color3(0.1, 0.6, 1); // Bleu néon
    rightPaddleMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.6, 1); // même couleur pour le glow
   
    const leftPaddleMaterial = new BABYLON.PBRMaterial("leftPaddleMat", scene);
    leftPaddleMaterial.metallic = 1.0;
    leftPaddleMaterial.roughness = 0.2;
    leftPaddleMaterial.albedoColor = new BABYLON.Color3(1, 0.1, 0.1); // Rouge néon
    leftPaddleMaterial.emissiveColor = new BABYLON.Color3(1, 0.1, 0.1); // Rouge néon
    
    const paddleOptions = { width: 0.2, height: 0.3, depth: 1 };

    const rightPaddle = BABYLON.MeshBuilder.CreateBox("rightPaddle", paddleOptions, scene);
    rightPaddle.position.x = -playWidth / 2 + 0.2;
    rightPaddle.position.y = 0.5;
    rightPaddle.material = rightPaddleMaterial;

    const leftPaddle = BABYLON.MeshBuilder.CreateBox("leftPaddle", paddleOptions, scene);
    leftPaddle.position.x = playWidth / 2 + 0.2;
    leftPaddle.position.y = 0.5;
    leftPaddle.material = leftPaddleMaterial;

    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 20,height: 10}, scene);

    const mirrorMat = new BABYLON.PBRMaterial("mirror", scene);
    mirrorMat.metallic = 1.0;
    mirrorMat.roughness = 0.1;
    mirrorMat.environmentTexture = null;
    mirrorMat.albedoColor = new BABYLON.Color3(0, 0, 0);
    ground.material = mirrorMat;
    scene.ground = ground;



    const camera = new BABYLON.ArcRotateCamera("arcCam", 
    Math.PI / 2 + Math.PI,
    Math.PI / 3,
    20,
    new BABYLON.Vector3(0, 0, 0),
    scene
);
    camera.attachControl(canvas, true);
    scene.camera = camera;
    createLight(new BABYLON.Vector3(-8, 5.2, 5), new BABYLON.Vector3(0, 0, 0), BABYLON.Color3.White(), "light1" ,scene);
    createLight(new BABYLON.Vector3(-2.7, 5.2, 5), new BABYLON.Vector3(0, 0, 0), BABYLON.Color3.White(), "light4",scene);
    createLight(new BABYLON.Vector3(2.7, 5.2, 5), new BABYLON.Vector3(0, 0, 0), BABYLON.Color3.White(), "light3",scene);
    createLight(new BABYLON.Vector3(8, 5.2, 5), new BABYLON.Vector3(0, 0, 0), BABYLON.Color3.White(), "light2",scene);
    
    let ctd = 0;
    if (ctd++ == 0)
        countdown();

    const ball = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: 0.3 }, scene);
    
    setTimeout(() => {
    scene.ballVelocity = new BABYLON.Vector3(
        (Math.random() > 0.5 ? 1 : -1) * 0.2,
        0,
        (Math.random() - 0.5) * 0.04
    );
    gameStarted = true;
    }, 2500);
    
    ball.position = new BABYLON.Vector3(0, 0.5, 0);
    scene.ball = ball;
    scene.ballVelocity = new BABYLON.Vector3(0, 0, 0);

    const glowMaterial = new BABYLON.StandardMaterial("glowMaterial", scene);
    glowMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
    ball.material = glowMaterial;

    scene.explosionSpheres = [];

    const numberOfSpheres = 500;
    for (let i = 0; i < numberOfSpheres; ++i) {
    const sphere = BABYLON.MeshBuilder.CreateSphere("particle", {
        diameter: 0.2 + Math.random() * 0.4,
        segments: 6
    }, scene);

    const mat = new BABYLON.StandardMaterial("mat" + i, scene);
    // mat.emissiveColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
    sphere.material = mat;

    sphere.isVisible = false;
    scene.explosionSpheres.push(sphere);

}
    fetch("https://assets.babylonjs.com/fonts/Droid Sans_Regular.json")
    .then(response => response.json())
    .then(fontData => {
    const writer = new MeshWriter(scene, {
      scale: 0.01,
      font: fontData
    });
    const myText = writer.addText("HELLO WORLD", {
      anchor: MeshWriter.Anchor.Center,
      position: new BABYLON.Vector3(0, 2, 0),
      depth: 0.2,
      color: "#ff66cc"
    });
    scene.addMesh(myText);
  });

    return scene;
};

const scene = createScene();

const keys = {};

window.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});

const leftPaddle = scene.getMeshByName("leftPaddle");
const rightPaddle = scene.getMeshByName("rightPaddle");


async function resetBallWithDelay() {
    scene.ball.position = new BABYLON.Vector3(0, 0.5, 0);
    scene.ballVelocity.set(0, 0, 0);
    await countdown();
    await sleep(200);

    scene.ballVelocity = new BABYLON.Vector3(
        (Math.random() > 0.5 ? 1 : -1) * 0.2,
        0,
        (Math.random() - 0.5) * 0.04
    );
    isWaitingAfterGoal = false;
}


engine.runRenderLoop(() => {
    const minZ = -4.5;
    const maxZ = 4.5;
    const accelerationFactor = 1.05;
    const ball = scene.ball;
    const velocity = scene.ballVelocity;

    if (keys["s"] && rightPaddle.position.z - ballSpeed >= minZ) {
        rightPaddle.position.z -= ballSpeed;
    }
    if (keys["w"] && rightPaddle.position.z + ballSpeed <= maxZ) {
        rightPaddle.position.z += ballSpeed;
    }
    if (keys["k"] && leftPaddle.position.z - ballSpeed >= minZ) {
        leftPaddle.position.z -= ballSpeed;
    }
    if (keys["i"] && leftPaddle.position.z + ballSpeed <= maxZ) {
        leftPaddle.position.z += ballSpeed;
    }
    
    if (gameStarted) {
    ball.position.addInPlace(velocity);
    }

    if (ball.position.z <= minZ || ball.position.z >= maxZ) {
        velocity.z *= -1;
    }

    if (ball.intersectsMesh(leftPaddle, false) && velocity.x > 0) {
        velocity.x *= -accelerationFactor;
        const offset = ball.position.z - leftPaddle.position.z;
        velocity.z = offset * 0.1 * accelerationFactor;
        playLightWave(3, -1);
    }

    if (ball.intersectsMesh(rightPaddle, false) && velocity.x < 0) {
        velocity.x *= -accelerationFactor;
        const offset = ball.position.z - rightPaddle.position.z;
        velocity.z = offset * 0.1 * accelerationFactor;
        playLightWave(0, 1);
    }

    if (!isWaitingAfterGoal && Math.abs(scene.ball.position.x) > playWidth / 2 + 1) {
        isWaitingAfterGoal = true;

        const explosionDuration = 1000;
        const startTime = Date.now();
        const activeSpheres = [];

        scene.explosionSpheres.forEach(sphere => {
            sphere.position = scene.ball.position.clone();
            sphere.isVisible = true;

            const dir = new BABYLON.Vector3(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
            ).normalize().scale(0.5 + Math.random() * 1.5);

            activeSpheres.push({ sphere, dir });
    });

    const explosionCallback = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed > explosionDuration) {
            activeSpheres.forEach(obj => {
                obj.sphere.isVisible = false;
            });
            scene.onBeforeRenderObservable.removeCallback(explosionCallback);
        } else {
            activeSpheres.forEach(obj => {
                obj.sphere.position.addInPlace(obj.dir);
            });
        }
    };

    scene.onBeforeRenderObservable.add(explosionCallback);

    resetBallWithDelay();
}
    scene.render();
});



window.addEventListener("resize", () => engine.resize());
