const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const boxes = [];
const playWidth = 19;
const playHeight = 3;
const ballSpeed = 0.2;

function playLightWave(startIndex, direction = 1) {
    const delay = 100;
    const color = new BABYLON.Color3(0.7, 0.2, 0.4);

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

function createLight(position, rotation, color, name, scene) {
    color = new BABYLON.Color3(0.7, 0.2, 0.4);
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

    boxes.push({ box, light, material: lightMaterial }); // on garde une référence pour plus tard

    // vague continue de lumiere

    // let current = 0;
    // let growing = true;

    // setInterval(() => {
    // const { box, light, material } = boxes[current];

    // if (growing) {
    //     box.scaling.set(1.1, 1.1, 1.1);
    //     light.width = 4;
    //     light.height = 8;
    //     material.emissiveColor = new BABYLON.Color3(0.8, 0.1, 0.4); // par ex : bleu
    //     light.diffuse = material.emissiveColor;
    // } else {
    //     box.scaling.set(1, 1, 1);
    //     light.width = 4;
    //     light.height = 9;
    //     material.emissiveColor = new BABYLON.Color3(0.7, 0.2, 0.4); // retour à rose
    //     light.diffuse = material.emissiveColor;
    // }

    // current = (current + 1) % boxes.length;
    // if (current === 0) growing = !growing; 
    // }, 200);
}



const createScene = () => {
    const scene = new BABYLON.Scene(engine);
    scene.environmentTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("https://assets.babylonjs.com/environments/studio.env", scene);
    scene.environmentIntensity = 0.8; // Intensité du reflet
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 1); // Fond noir

    // BABYLON.SceneLoader.ImportMesh(
    //     null,
    //     "numbers/",      // dossier contenant "0.glb"
    //     "0.glb",         // nom du fichier
    //     scene,
    //     function (meshes) {
    //         const zeroMesh = meshes[0]; // souvent le premier mesh
    //         zeroMesh.position = new BABYLON.Vector3(0, 1, 0);
    //         zeroMesh.scaling = new BABYLON.Vector3(20, 20, 20);

    //         // 🔵 Créer un nouveau matériau coloré
    //         const zeroMaterial = new BABYLON.StandardMaterial("zeroMat", scene);
    //         zeroMaterial.diffuseColor = new BABYLON.Color3(1, 0.1, 0.1); // couleur cyan
    //         zeroMaterial.emissiveColor = new BABYLON.Color3(0, 1, 1); // pour un effet glow

    //         // 🟢 Appliquer ce matériau au mesh
    //         zeroMesh.material = zeroMaterial;
    //     }
    // );



    // texture du paddle de gauche 
    const rightPaddleMaterial = new BABYLON.PBRMaterial("rightPaddleMat", scene);
    rightPaddleMaterial.metallic = 1.0;
    rightPaddleMaterial.roughness = 0.2;
    rightPaddleMaterial.albedoColor = new BABYLON.Color3(0.1, 0.6, 1); // Bleu néon
    rightPaddleMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.6, 1); // même couleur pour le glow
    // texture du paddle de gauche 
    const leftPaddleMaterial = new BABYLON.PBRMaterial("leftPaddleMat", scene);
    leftPaddleMaterial.metallic = 1.0;
    leftPaddleMaterial.roughness = 0.2;
    leftPaddleMaterial.albedoColor = new BABYLON.Color3(1, 0.1, 0.1); // Rouge néon
    leftPaddleMaterial.emissiveColor = new BABYLON.Color3(1, 0.1, 0.1); // Rouge néon
    
    const paddleOptions = { width: 0.2, height: 0.3, depth: 1 };

    // Paddle de droite
    const rightPaddle = BABYLON.MeshBuilder.CreateBox("rightPaddle", paddleOptions, scene);
    rightPaddle.position.x = -playWidth / 2 + 0.2;
    rightPaddle.position.y = 0.5;
    rightPaddle.material = rightPaddleMaterial;

    // Paddle de gauche
    const leftPaddle = BABYLON.MeshBuilder.CreateBox("leftPaddle", paddleOptions, scene);
    leftPaddle.position.x = playWidth / 2 + 0.2;
    leftPaddle.position.y = 0.5;
    leftPaddle.material = leftPaddleMaterial;

    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 20,height: 10}, scene);

    const mirrorMat = new BABYLON.PBRMaterial("mirror", scene);
    mirrorMat.metallic = 1.0;
    mirrorMat.roughness = 0.1;
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
    createLight(new BABYLON.Vector3(-2.7, 5.2, 5), new BABYLON.Vector3(0, 0, 0), BABYLON.Color3.Green(), "light4",scene);
    createLight(new BABYLON.Vector3(2.7, 5.2, 5), new BABYLON.Vector3(0, 0, 0), BABYLON.Color3.Green(), "light3",scene);
    createLight(new BABYLON.Vector3(8, 5.2, 5), new BABYLON.Vector3(0, 0, 0), BABYLON.Color3.Red(), "light2",scene);
    
    const ball = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: 0.3 }, scene);
    ball.position = new BABYLON.Vector3(0, 0.5, 0);
    scene.ball = ball;
    scene.ballVelocity = new BABYLON.Vector3(0.1, 0, 0.02);

    const glowMaterial = new BABYLON.StandardMaterial("glowMaterial", scene);
    glowMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1); // blanc lumineux
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

    let Writer = MeshWriter(this.scene, { scale: 1, defaultFont: "Arial" });
let textMesh = new Writer("Hello World", {
  "font-family": "Arial",
  "letter-height": 30,
  "letter-thickness": 120,
  color: "#1C3870",
  anchor: "center",
  colors: {
    diffuse: "#F0F0F0",
    specular: "#000000",
    ambient: "#F0F0F0",
    emissive: "#ff00f0",
  },
  position: {
    x: 0,
    y: 10,
    z: 0,
  },
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


engine.runRenderLoop(() => {
    const minZ = -4.5;
    const maxZ = 4.5;
    const accelerationFactor = 1.05;

    const ball = scene.ball;
    const velocity = scene.ballVelocity;

    // === Contrôles des paddles ===
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

    // === Mouvement de la balle ===
    ball.position.addInPlace(velocity);

    // Rebond haut/bas
    if (ball.position.z <= minZ || ball.position.z >= maxZ) {
        velocity.z *= -1;
    }

    // Collision paddle gauche
    if (ball.intersectsMesh(leftPaddle, false) && velocity.x > 0) {
        velocity.x *= -accelerationFactor;
        const offset = ball.position.z - leftPaddle.position.z;
        velocity.z = offset * 0.1 * accelerationFactor;
        playLightWave(3, -1);
    }

    // Collision paddle droit
    if (ball.intersectsMesh(rightPaddle, false) && velocity.x < 0) {
        velocity.x *= -accelerationFactor;
        const offset = ball.position.z - rightPaddle.position.z;
        velocity.z = offset * 0.1 * accelerationFactor;
        playLightWave(0, 1);
    }

    // === Sortie de balle (but) ===
  if (Math.abs(scene.ball.position.x) > playWidth / 2 + 1) {
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

    // Reset de la balle
    scene.ball.position = new BABYLON.Vector3(0, 0.5, 0);
    scene.ballVelocity = new BABYLON.Vector3(
        (Math.random() > 0.5 ? 1 : -1) * 0.1,
        0,
        (Math.random() - 0.5) * 0.04
    );
}

    scene.render();
});



window.addEventListener("resize", () => engine.resize());
