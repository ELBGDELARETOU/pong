const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = () => {
  const scene = new BABYLON.Scene(engine);

  const hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("studio.env", scene);
  scene.environmentTexture = hdrTexture;
  scene.createDefaultSkybox(hdrTexture, true, 1000);
  // Caméra ArcRotate pour rotation et zoom
const camera = new BABYLON.ArcRotateCamera("arcCam", 
    Math.PI / 2,  // alpha (rotation horizontale)
    Math.PI / 3,  // beta (rotation verticale)
    10,           // radius (distance caméra-centre)
    new BABYLON.Vector3(0, 0, 0), // cible (centre de la scène)
    scene
);

// Attacher la caméra au canvas pour interaction souris/clavier/tactile
camera.attachControl(canvas, true);

// Optionnel: limiter l’angle de la caméra
camera.lowerBetaLimit = 0.1; // pas trop vers le bas (évite inversion)
camera.upperBetaLimit = Math.PI / 2.5; // limite de montée
camera.lowerRadiusLimit = 2;  // limite zoom proche
camera.upperRadiusLimit = 20; // limite zoom éloigné


  // Lumière douce
  const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0.3, 1, 0.3), scene);
  light.intensity = 0.7;

  // Dimensions plus petites
  const playWidth = 6;
  const playHeight = 3;

  const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: playWidth, height: playHeight }, scene);
  const groundMaterial = new BABYLON.PBRMaterial("groundMat", scene);

// Albedo (couleur de base)
groundMaterial.albedoTexture = new BABYLON.Texture("Metal049A_2K-JPG(1)/Metal049A_2K-JPG_Color.jpg", scene);

// Normal map (relief)
groundMaterial.bumpTexture = new BABYLON.Texture("Metal049A_2K-JPG(1)/Metal049A_2K-JPG_NormalGL.jpg", scene);

// Roughness (rugosité)
groundMaterial.metallicTexture = new BABYLON.Texture("Metal049A_2K-JPG(1)/Metal049A_2K-JPG_Roughness.jpg", scene);

// Metalness (métallique)
groundMaterial.metallicTexture = new BABYLON.Texture("Metal049A_2K-JPG(1)/Metal049A_2K-JPG_Metalness.jpg", scene);

// Indiquer à Babylon qu'on utilise Roughness+Metalness dans la même texture
groundMaterial.useMetalnessFromMetallicTextureBlue = false; // <- on ignore le canal B
groundMaterial.useRoughnessFromMetallicTextureGreen = false;
groundMaterial.useRoughnessFromMetallicTextureAlpha = false;

// Répétition des textures
groundMaterial.albedoTexture.uScale = 4;
groundMaterial.albedoTexture.vScale = 4;
groundMaterial.bumpTexture.uScale = 4;
groundMaterial.bumpTexture.vScale = 4;
groundMaterial.metallicTexture.uScale = 4;
groundMaterial.metallicTexture.vScale = 4;
groundMaterial.metallic = 1.0; // 1 = métal, 0 = plastique
groundMaterial.roughness = 0.15; // plus bas = plus brillant



// Améliorer l'éclairage (optionnel)
groundMaterial.environmentIntensity = 2;

// Appliquer le matériau au sol
ground.material = groundMaterial;

 
//   const groundMaterial = new BABYLON.StandardMaterial("groundMat", scene);

// // Diffuse map (couleur principale)
// groundMaterial.diffuseTexture = new BABYLON.Texture("textures/metal_diff.jpg", scene);

// // Normal map (relief)
// groundMaterial.bumpTexture = new BABYLON.Texture("textures/metal_nor.jpg", scene);

// // Specular map (brillance)
// groundMaterial.specularTexture = new BABYLON.Texture("textures/metal_spec.jpg", scene);

// // Ambient Occlusion (ombre fine, optionnelle)
// groundMaterial.ambientTexture = new BABYLON.Texture("textures/metal_ao.jpg", scene);

// // Optionnel : répétition des textures
// groundMaterial.diffuseTexture.uScale = 4;
// groundMaterial.diffuseTexture.vScale = 4;
// groundMaterial.bumpTexture.uScale = 4;
// groundMaterial.bumpTexture.vScale = 4;
// groundMaterial.specularTexture.uScale = 4;
// groundMaterial.specularTexture.vScale = 4;
// groundMaterial.ambientTexture.uScale = 4;
// groundMaterial.ambientTexture.vScale = 4;

// // Appliquer le matériau au sol
// ground.material = groundMaterial;

  const topWall = BABYLON.MeshBuilder.CreateBox("topWall", {
    width: playWidth + 0.2,
    height: 0.1,
    depth: 0.1
  }, scene);
  topWall.position.z = -playHeight / 2 - 0.05;

  const botWall = BABYLON.MeshBuilder.CreateBox("botWall", {
    width: playWidth + 0.2,
    height: 0.1,
    depth: 0.1
  }, scene);
  botWall.position.z = playHeight / 2 + 0.05;

  const rightWall = BABYLON.MeshBuilder.CreateBox("rightWall", {
    width: 0.1,
    height: 0.1,
    depth: playHeight + 0.2
  }, scene);
  rightWall.position.x = -playWidth / 2 - 0.05;

  const leftWall = BABYLON.MeshBuilder.CreateBox("leftWall", {
    width: 0.1,
    height: 0.1,
    depth: playHeight + 0.2
  }, scene);
  leftWall.position.x = playWidth / 2 + 0.05;

  // Raquettes
  const paddleOptions = { width: 0.1, height: 0.1, depth: 0.5 };

  const rightPaddle = BABYLON.MeshBuilder.CreateBox("rightPaddle", paddleOptions, scene);
  rightPaddle.position.x = -playWidth / 2 + 0.2;
  rightPaddle.position.y = 0.05;

  const leftPaddle = BABYLON.MeshBuilder.CreateBox("leftPaddle", paddleOptions, scene);
  leftPaddle.position.x = playWidth / 2 - 0.2;
  leftPaddle.position.y = 0.05;

  // Stocker dans la scène
  scene.rightPaddle = rightPaddle;
  scene.leftPaddle = leftPaddle;

  // Balle
  const ball = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: 0.1 }, scene);
  ball.position = new BABYLON.Vector3(0, 0.05, 0);
  scene.ball = ball;
  scene.ballVelocity = new BABYLON.Vector3(0.02, 0, 0.02);

  return scene;
};

const moveSpeed = 0.05;
const keys = {};

window.addEventListener("keydown", (event) => keys[event.key.toLowerCase()] = true);
window.addEventListener("keyup", (event) => keys[event.key.toLowerCase()] = false);

const scene = createScene();
engine.runRenderLoop(() => {
  const { rightPaddle, leftPaddle, ball, ballVelocity } = scene;

  if (rightPaddle && leftPaddle) {
    if (keys["i"]) rightPaddle.position.z -= moveSpeed;
    if (keys["k"]) rightPaddle.position.z += moveSpeed;
    if (keys["w"]) leftPaddle.position.z -= moveSpeed;
    if (keys["s"]) leftPaddle.position.z += moveSpeed;
  }

  if (ball && ballVelocity) {
    ball.position.addInPlace(ballVelocity);

    if (ball.position.z > 1.4 || ball.position.z < -1.4) {
      ballVelocity.z *= -1;
    }

    if (checkPaddleCollision(ball, rightPaddle)) {
      ballVelocity.x *= -1;
      ball.position.x = rightPaddle.position.x + 0.1;
      const diff = ball.position.z - rightPaddle.position.z;
      ballVelocity.z = diff * 0.05;
    }

    if (checkPaddleCollision(ball, leftPaddle)) {
      ballVelocity.x *= -1;
      ball.position.x = leftPaddle.position.x - 0.1;
      const diff = ball.position.z - leftPaddle.position.z;
      ballVelocity.z = diff * 0.05;
    }

    if (ball.position.x < -3.1 || ball.position.x > 3.1) {
      ball.position = new BABYLON.Vector3(0, 0.05, 0);
      ballVelocity.x = 0.02 * (Math.random() > 0.5 ? 1 : -1);
      ballVelocity.z = 0.02 * (Math.random() > 0.5 ? 1 : -1);
    }
  }

  scene.render();
});

function checkPaddleCollision(ball, paddle) {
  const dx = Math.abs(ball.position.x - paddle.position.x);
  const dz = Math.abs(ball.position.z - paddle.position.z);
  return dx <= 0.1 && dz <= 0.3;
}

window.addEventListener("resize", () => engine.resize());
