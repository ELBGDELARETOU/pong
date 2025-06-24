const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

let ballVelocity = new BABYLON.Vector3(0.1, 0.2, 0.3); // X, Y, Z
const gravity = -0.003;
const iaSpeed = 0.2; // Vitesse de réaction de l'IA
let targetPaddlePos = new BABYLON.Vector3();

function createBuildingsAroundField(scene, tunnelWidth, tunnelLength) {
    const baseSize = 5;
    const baseSpacing = 7;          // Espacement plus grand pour réduire chevauchement
    const depthRows = 10    ;
    const maxOffset = 1.5;          // Décalage aléatoire plus marqué

    const halfWidth = tunnelWidth / 2;
    const halfLength = tunnelLength / 2;

    function randomHeight(min = 10, max = 30) {
        return Math.random() * (max - min) + min;
    }

    function randomBuildingColor() {
        const base = 0.1 + Math.random() * 0.3;
        return new BABYLON.Color3(base, base + 0.1, base + 0.3);
    }

    function randomEmission() {
        const intensity = 0.1 + Math.random() * 0.3;
        return new BABYLON.Color3(0.05, 0.1, 0.3).scale(intensity);
    }

    function createBuilding(x, y, z, height, sizeX = baseSize, sizeZ = baseSize) {
    const building = BABYLON.MeshBuilder.CreateBox("building", {
        width: sizeX,
        height: height,
        depth: sizeZ
    }, scene);
    building.position.x = x;
    building.position.y = height / 2;
    building.position.z = z;

    building.rotation.y = (Math.random() - 0.5) * 0.3;

    const gridMat = new BABYLON.GridMaterial("gridMat", scene);
    gridMat.majorUnitFrequency = 3; // Nombre de grandes lignes (fenêtres principales)
    gridMat.minorUnitVisibility = 0.5; // Visibilité des petites lignes (détails)
    gridMat.gridRatio = 1; // Taille des carreaux
    gridMat.backFaceCulling = false;
    gridMat.mainColor = new BABYLON.Color3(0.1, 0.1, 0.1); // Couleur foncée du bâtiment
    gridMat.lineColor = new BABYLON.Color3(0.3, 0.8, 1.0); // Couleur bleutée des lignes (fenêtres)
    gridMat.opacity = 0.8;

    building.material = gridMat;

    return building;
}


    for (let row = 0; row < depthRows; row++) {
        const zPos = halfLength + baseSize / 2 + 1 + row * baseSpacing;
        for (let x = -halfWidth + baseSize / 2; x <= halfWidth - baseSize / 2; x += baseSpacing) {
            const offsetX = (Math.random() - 0.5) * maxOffset * 2;  // +/- maxOffset
            const offsetZ = (Math.random() - 0.5) * maxOffset * 0.5; // moins sur profondeur pour éviter trop de chevauchements
            const height = randomHeight();
            const sizeX = baseSize * (0.8 + Math.random() * 0.6); // taille variable entre 0.8x et 1.4x
            const sizeZ = baseSize * (0.8 + Math.random() * 0.6);
            createBuilding(x + offsetX, 0, zPos + offsetZ, height, sizeX, sizeZ);
        }
    }

    for (let row = 0; row < depthRows; row++) {
        const xPos = -halfWidth - baseSize / 2 - 1 - row * baseSpacing;
        for (let z = -halfLength + baseSize / 2; z <= halfLength - baseSize / 2; z += baseSpacing) {
            const offsetZ = (Math.random() - 0.5) * maxOffset * 2;
            const offsetX = (Math.random() - 0.5) * maxOffset * 0.5; // un peu moins de décalage sur X ici
            const height = randomHeight();
            const sizeX = baseSize * (0.8 + Math.random() * 0.6);
            const sizeZ = baseSize * (0.8 + Math.random() * 0.6);
            createBuilding(xPos + offsetX, 0, z + offsetZ, height, sizeX, sizeZ);
        }
    }

    for (let row = 0; row < depthRows; row++) {
        const xPos = halfWidth + baseSize / 2 + 1 + row * baseSpacing;
        for (let z = -halfLength + baseSize / 2; z <= halfLength - baseSize / 2; z += baseSpacing) {
            const offsetZ = (Math.random() - 0.5) * maxOffset * 2;
            const offsetX = (Math.random() - 0.5) * maxOffset * 0.5;
            const height = randomHeight();
            const sizeX = baseSize * (0.8 + Math.random() * 0.6);
            const sizeZ = baseSize * (0.8 + Math.random() * 0.6);
            createBuilding(xPos + offsetX, 0, z + offsetZ, height, sizeX, sizeZ);
        }
    }

    const cornerPositions = [
        { x: -halfWidth - baseSize / 2 - 1, z: halfLength + baseSize / 2 + 1 },
        { x: halfWidth + baseSize / 2 + 1, z: halfLength + baseSize / 2 + 1 },
        { x: -halfWidth - baseSize / 2 - 1 - (depthRows - 1) * baseSpacing, z: -halfLength + baseSize / 2 },
        { x: halfWidth + baseSize / 2 + 1 + (depthRows - 1) * baseSpacing, z: -halfLength + baseSize / 2 }
    ];

    cornerPositions.forEach(pos => {
        const cornerHeight = randomHeight(20, 40);
        const cornerSizeX = baseSize * 1.5 * (0.8 + Math.random() * 0.4);
        const cornerSizeZ = baseSize * 1.5 * (0.8 + Math.random() * 0.4);
        const building = createBuilding(pos.x, 0, pos.z, cornerHeight, cornerSizeX, cornerSizeZ);
        building.rotation.y = (Math.random() - 0.5) * 0.6; // un peu plus de rotation sur les coins
    });
}



function createScene() {

    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0, 0, 0);
    
    const chromeMaterial = new BABYLON.StandardMaterial("chromeMat", scene);
    chromeMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8); // Couleur de base gris clair
    chromeMaterial.specularColor = new BABYLON.Color3(1, 1, 1);      // Reflets intenses
    chromeMaterial.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2); // Légère lueur
    chromeMaterial.alpha = 1; // Opaque

    const hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), scene);
    hemiLight.intensity = 0.6;
    hemiLight.diffuse = new BABYLON.Color3(0.6, 0.6, 0.8); // lumière bleutée
    hemiLight.groundColor = new BABYLON.Color3(0.1, 0.1, 0.15); // couleur du sol (rebond)

    // Lumière ponctuelle bleutée pour effet néon futuriste près des bâtiments
    const pointLight = new BABYLON.PointLight("pointLight", 
        new BABYLON.Vector3(0, 30, 0), scene);
    pointLight.intensity = 1.0;
    pointLight.diffuse = new BABYLON.Color3(0.2, 0.6, 1.0); // bleu néon
    pointLight.specular = new BABYLON.Color3(0.4, 0.9, 1.0);
    pointLight.range = 60; // rayon d’éclairage


    const camera = new BABYLON.UniversalCamera("camera", new BABYLON.Vector3(0, 5, -33), scene);
    camera.setTarget(new BABYLON.Vector3(0, 5, 0));
    camera.attachControl(canvas, true);

    const tunnelWidth = 20;
    const tunnelHeight = 10;
    const tunnelLength = 50;
    const wallThickness = 0.5;

    const field = BABYLON.MeshBuilder.CreateGround("ground", {
    width: 20,
    height: 40
}, scene);
    field.position.y = 0;

    // Création d'un matériau noir
    const fieldMaterial = new BABYLON.StandardMaterial("fieldMat", scene);
    fieldMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0); // Noir

    // Application du matériau au sol
    field.material = fieldMaterial;

    const paddle = BABYLON.MeshBuilder.CreateBox("paddle", {
        width: 2,
        height: 2,
        depth: 0.5
    }, scene);
    paddle.position.x = 0;
    paddle.position.y = tunnelHeight / 2;
    paddle.position.z = 0;

    const paddleMat = new BABYLON.StandardMaterial("paddleMat", scene);
    paddleMat.diffuseColor =new BABYLON.Color3(0.4, 0.5, 0.8);
    paddleMat.emissiveColor = new BABYLON.Color3(0.4, 0.5, 0.8);
    paddleMat.alpha = 0.7;                                  // Un peu transparent pour effet stylé
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
    iaPaddle.emissiveColor = new BABYLON.Color3(1, 0, 0); 
    iaPaddle.wireframe = true;
    iaPaddle.material = paddleMat;

    const ball = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: 1 }, scene);
    ball.position = new BABYLON.Vector3(0, tunnelHeight / 2, 0);

    const ballMat = new BABYLON.StandardMaterial("ballMat", scene);
    ballMat.emissiveColor = new BABYLON.Color3(1, 1, 1);
    ball.material = ballMat;

    // Coordonnées des coins du terrain
    const groundWidth = 20;
    const groundHeight = 40;
    const halfW = groundWidth / 2;
    const halfH = groundHeight / 2;

    const linePoints = [
        new BABYLON.Vector3(-halfW, 0.01, -halfH),
        new BABYLON.Vector3(halfW, 0.01, -halfH),
        new BABYLON.Vector3(halfW, 0.01, halfH),
        new BABYLON.Vector3(-halfW, 0.01, halfH),
        new BABYLON.Vector3(-halfW, 0.01, -halfH), // Reboucle
    ];

    // Création de la ligne
    const groundLines = BABYLON.MeshBuilder.CreateLines("groundLines", {
        points: linePoints,
        updatable: false
    }, scene);

    // Matériau néon rouge
    const neonMaterial = new BABYLON.StandardMaterial("neonMat", scene);
    neonMaterial.emissiveColor = new BABYLON.Color3(0.2, 0.6, 1.0); // Rouge néon
    neonMaterial.disableLighting = true; // Ignore les lumières de la scène
    groundLines.color = neonMaterial.emissiveColor;
    
// Plan invisible pour le pick, positionné à la profondeur du paddle
    const paddlePlane = BABYLON.MeshBuilder.CreatePlane("paddlePlane", { size: 100 }, scene);
    paddlePlane.position.z = -20;
    paddlePlane.isVisible = false;
    paddlePlane.isPickable = true;

    // Écoute le mouvement de la souris
     scene.onPointerMove = function () {
        const pick = scene.pick(scene.pointerX, scene.pointerY, (mesh) => mesh === paddlePlane);
        if (pick && pick.pickedPoint) {
            targetPaddlePos.x = pick.pickedPoint.x;
            targetPaddlePos.y = pick.pickedPoint.y;
        }
    };

    return { scene, paddle, iaPaddle, ball, tunnelWidth, tunnelHeight };
}

const { scene, paddle, iaPaddle, ball, tunnelWidth, tunnelHeight } = createScene();
createBuildingsAroundField(scene, tunnelWidth, 40); // 40 = longueur du terrain


engine.runRenderLoop(() => {

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

// Déplacement fluide du paddle vers la souris (X et Y uniquement)
    paddle.position.x += (targetPaddlePos.x - paddle.position.x) * 0.4;
    paddle.position.y += (targetPaddlePos.y - paddle.position.y) * 0.4;

    // Z fixe (paddle du joueur)
    paddle.position.z = -20;

   // Vérifie si la balle sort du terrain
if (ball.position.z > 30|| ball.position.z < -30) {
    // Remettre la balle au centre
    ball.position = new BABYLON.Vector3(0, tunnelHeight / 2, 0);

    // Réinitialiser la vitesse avec une direction aléatoire
    const randomX = (Math.random() - 0.5) * 0.2;
    const randomY = (Math.random() - 0.5) * 0.2;
    const directionZ = ball.position.z > 20.5 ? -0.3 : 0.3; // Revenir vers le joueur ou IA

    ballVelocity = new BABYLON.Vector3(randomX, randomY, directionZ);
}
        scene.render();
});

window.addEventListener("resize", () => engine.resize());