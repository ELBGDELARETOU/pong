const canvas = document.getElementById("renderCanvas");
        const engine = new BABYLON.Engine(canvas, true);

        let ballVelocity = new BABYLON.Vector3(0.1, 0.2, 0.3);
        const gravity = -0.003;
        const iaSpeed = 0.15;
        let targetPaddlePos = new BABYLON.Vector3();

        let scoreLeft = 0;
        let scoreRight = 0;
        const SCORE_LIMIT = 2;
        let gameEnded = false;
        let fontDataGlobal = null;
        let myText = null;
        let myText2 = null;
        let scene = null;
        let gameOverText = null;

        // Éléments DOM pour l'écran de fin
        const gameOverScreen = document.getElementById('gameOverScreen');
        const winnerText = document.getElementById('winnerText');

        async function loadFont() {
            try {
                const response = await fetch("https://assets.babylonjs.com/fonts/Droid Sans_Regular.json");
                fontDataGlobal = await response.json();
                createInitialScoreText();
            } catch (error) {
                console.warn("Erreur de chargement de police:", error);
                createFallbackScoreDisplay();
            }
        }

        function createFallbackScoreDisplay() {
            if (myText) myText.dispose();
            if (myText2) myText2.dispose();
            
            myText = BABYLON.MeshBuilder.CreateBox("scoreLeft", {width: 2, height: 2, depth: 0.2}, scene);
            myText2 = BABYLON.MeshBuilder.CreateBox("scoreRight", {width: 2, height: 2, depth: 0.2}, scene);
            
            const scoreMaterial = new BABYLON.StandardMaterial("scoreMat", scene);
            scoreMaterial.emissiveColor = new BABYLON.Color3(0, 1, 1);
            
            myText.material = scoreMaterial;
            myText2.material = scoreMaterial;
            myText.position.set(-8, 12, 0);
            myText2.position.set(8, 12, 0);
        }

        function showGameOver(winner) {

            if (gameOverText) {
                gameOverText.dispose();
            }
            if (!fontDataGlobal || !scene) return;
            try {
                gameOverText = BABYLON.MeshBuilder.CreateText("gameOverText", winner, fontDataGlobal, {
                    size: 2.5,
                    resolution: 32,
                    depth: 0.5
                }, scene);
            
            const material = new BABYLON.StandardMaterial("gameOverMat", scene);
            material.emissiveColor = new BABYLON.Color3(0.2, 0.6, 1); // Bleu lumineux
            material.diffuseColor = new BABYLON.Color3(0.05, 0.1, 0.2); // Bleu foncé
            gameOverText.material = material;

            
                gameOverText.position = new BABYLON.Vector3(0, 5, -10);

                // gameOverText.rotation.x = -Math.PI / 6;
            
            } catch (error) {
                console.warn("Erreur création texte de fin:", error);
            }
        }

        function createInitialScoreText() {
            if (!fontDataGlobal || !scene) return;
            try {
                myText = BABYLON.MeshBuilder.CreateText("myText", scoreLeft.toString(), fontDataGlobal, {
                    size: 3,
                    resolution: 32,
                    depth: 0.5
                }, scene);
                myText2 = BABYLON.MeshBuilder.CreateText("myText2", scoreRight.toString(), fontDataGlobal, {
                    size: 3,
                    resolution: 32,
                    depth: 0.5
                }, scene);

                const scoreMaterial = new BABYLON.StandardMaterial("scoreMat", scene);
                scoreMaterial.emissiveColor = new BABYLON.Color3(0, 1, 1);
                scoreMaterial.diffuseColor = new BABYLON.Color3(0, 0.5, 0.5);
                scoreMaterial.disableLighting = false;

                myText.material = scoreMaterial;
                myText2.material = scoreMaterial;
                
                myText.position.set(-8, 12, 0);
                myText2.position.set(8, 12, 0);
                
                myText.rotation.x = -Math.PI / 6;
                myText2.rotation.x = -Math.PI / 6;
            } catch (error) {
                console.warn("Erreur création texte:", error);
                createFallbackScoreDisplay();
            }
        }

        function updateScoreTextMeshes() {
            if (!fontDataGlobal || !myText || !myText2) return;
            try {
                myText.dispose();
                myText2.dispose();
                
                myText = BABYLON.MeshBuilder.CreateText("myText", scoreLeft.toString(), fontDataGlobal, {
                    size: 3,
                    resolution: 32,
                    depth: 0.5
                }, scene);
                myText2 = BABYLON.MeshBuilder.CreateText("myText2", scoreRight.toString(), fontDataGlobal, {
                    size: 3,
                    resolution: 32,
                    depth: 0.5
                }, scene);

                const scoreMaterial = new BABYLON.StandardMaterial("scoreMat", scene);
                scoreMaterial.emissiveColor = new BABYLON.Color3(0, 1, 1);
                scoreMaterial.diffuseColor = new BABYLON.Color3(0, 0.5, 0.5);
                
                myText.material = scoreMaterial;
                myText2.material = scoreMaterial;
                myText.position.set(-8, 12, 0);
                myText2.position.set(8, 12, 0);
                myText.rotation.x = -Math.PI / 6;
                myText2.rotation.x = -Math.PI / 6;
            } catch (error) {
                console.warn("Erreur mise à jour score:", error);
            }
        }



        function checkGameEnd() {
            let winner;
            if (scoreLeft >= SCORE_LIMIT) {
                gameEnded = true;
                showGameOver("Vous avez gagné!");
                return true;
            } else if (scoreRight >= SCORE_LIMIT) {
                gameEnded = true;
                showGameOver("L'IA a gagné!");
                return true;
            }
            return false;
        }

        // function showGameOver(winner) {
        //     // winnerText.textContent = winner;
        //     // gameOverScreen.style.display = 'flex';
        // }

        function restartGame() {
            // Reset des scores
            scoreLeft = 0;
            scoreRight = 0;
            gameEnded = false;
            
            if (gameOverText) {
                gameOverText.dispose();
                gameOverText = null;
            }
            // Mise à jour de l'affichage
            updateScoreTextMeshes();
            
            // Reset de la balle
            ball.position = new BABYLON.Vector3(0, tunnelHeight / 2, 0);
            ballVelocity = new BABYLON.Vector3(0.1, 0.2, 0.3);
            
            // Cacher l'écran de fin
            // gameOverScreen.style.display = 'none';
        }

        function createBuildingsAroundField(scene, tunnelWidth, tunnelLength) {
            const baseSize = 5;
            const baseSpacing = 7;
            const depthRows = 10;
            const maxOffset = 1.5;

            const halfWidth = tunnelWidth / 2;
            const halfLength = tunnelLength / 2;

            function randomHeight(min = 10, max = 30) {
                return Math.random() * (max - min) + min;
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
                gridMat.majorUnitFrequency = 3;
                gridMat.minorUnitVisibility = 0.5;
                gridMat.gridRatio = 1;
                gridMat.backFaceCulling = false;
                gridMat.mainColor = new BABYLON.Color3(0.1, 0.1, 0.1);
                gridMat.lineColor = new BABYLON.Color3(0.3, 0.8, 1.0);
                gridMat.opacity = 0.8;

                building.material = gridMat;
                return building;
            }

            // Créer les bâtiments autour du terrain
            for (let row = 0; row < depthRows; row++) {
                const zPos = halfLength + baseSize / 2 + 1 + row * baseSpacing;
                for (let x = -halfWidth + baseSize / 2; x <= halfWidth - baseSize / 2; x += baseSpacing) {
                    const offsetX = (Math.random() - 0.5) * maxOffset * 2;
                    const offsetZ = (Math.random() - 0.5) * maxOffset * 0.5;
                    const height = randomHeight();
                    const sizeX = baseSize * (0.8 + Math.random() * 0.6);
                    const sizeZ = baseSize * (0.8 + Math.random() * 0.6);
                    createBuilding(x + offsetX, 0, zPos + offsetZ, height, sizeX, sizeZ);
                }
            }

            for (let row = 0; row < depthRows; row++) {
                const xPos = -halfWidth - baseSize / 2 - 1 - row * baseSpacing;
                for (let z = -halfLength + baseSize / 2; z <= halfLength - baseSize / 2; z += baseSpacing) {
                    const offsetZ = (Math.random() - 0.5) * maxOffset * 2;
                    const offsetX = (Math.random() - 0.5) * maxOffset * 0.5;
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
        }

        function createScene() {
            scene = new BABYLON.Scene(engine);
            scene.clearColor = new BABYLON.Color3(0, 0, 0);

            // Éclairage
            const hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), scene);
            hemiLight.intensity = 0.6;
            hemiLight.diffuse = new BABYLON.Color3(0.6, 0.6, 0.8);
            hemiLight.groundColor = new BABYLON.Color3(0.1, 0.1, 0.15);

            const pointLight = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(0, 30, 0), scene);
            pointLight.intensity = 1.0;
            pointLight.diffuse = new BABYLON.Color3(0.2, 0.6, 1.0);
            pointLight.specular = new BABYLON.Color3(0.4, 0.9, 1.0);
            pointLight.range = 60;

            // Caméra
            const camera = new BABYLON.UniversalCamera("camera", new BABYLON.Vector3(0, 5, -33), scene);
            camera.setTarget(new BABYLON.Vector3(0, 5, 0));

            const tunnelWidth = 20;
            const tunnelHeight = 10;

            // Terrain
            const field = BABYLON.MeshBuilder.CreateGround("ground", {
                width: 20,
                height: 40
            }, scene);
            field.position.y = 0;

            const fieldMaterial = new BABYLON.StandardMaterial("fieldMat", scene);
            fieldMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
            field.material = fieldMaterial;

            // Paddle joueur
            const paddle = BABYLON.MeshBuilder.CreateBox("paddle", {
                width: 2,
                height: 2,
                depth: 0.5
            }, scene);
            paddle.position.x = 0;
            paddle.position.y = tunnelHeight / 2;
            paddle.position.z = -20;

            const paddleMat = new BABYLON.StandardMaterial("paddleMat", scene);
            paddleMat.diffuseColor = new BABYLON.Color3(0.4, 0.5, 0.8);
            paddleMat.emissiveColor = new BABYLON.Color3(0.4, 0.5, 0.8);
            paddleMat.alpha = 0.7;
            paddle.material = paddleMat;

            // Paddle IA
            const iaPaddle = BABYLON.MeshBuilder.CreateBox("iaPaddle", {
                width: 2,
                height: 2,
                depth: 0.5
            }, scene);
            iaPaddle.position.x = 0;
            iaPaddle.position.y = tunnelHeight / 2;
            iaPaddle.position.z = 20;
            iaPaddle.material = paddleMat;

            // Balle
            const ball = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: 1 }, scene);
            ball.position = new BABYLON.Vector3(0, tunnelHeight / 2, 0);

            const ballMat = new BABYLON.StandardMaterial("ballMat", scene);
            ballMat.emissiveColor = new BABYLON.Color3(1, 1, 1);
            ball.material = ballMat;

            // Lignes du terrain
            const groundWidth = 20;
            const groundHeight = 40;
            const halfW = groundWidth / 2;
            const halfH = groundHeight / 2;

            const linePoints = [
                new BABYLON.Vector3(-halfW, 0.01, -halfH),
                new BABYLON.Vector3(halfW, 0.01, -halfH),
                new BABYLON.Vector3(halfW, 0.01, halfH),
                new BABYLON.Vector3(-halfW, 0.01, halfH),
                new BABYLON.Vector3(-halfW, 0.01, -halfH),
            ];

            const groundLines = BABYLON.MeshBuilder.CreateLines("groundLines", {
                points: linePoints,
                updatable: false
            }, scene);
            groundLines.color = new BABYLON.Color3(0.2, 0.6, 1.0);

            // Plan invisible pour le contrôle souris
            const paddlePlane = BABYLON.MeshBuilder.CreatePlane("paddlePlane", { size: 100 }, scene);
            paddlePlane.position.z = -20;
            paddlePlane.isVisible = false;
            paddlePlane.isPickable = true;

            scene.onPointerMove = function () {
                const pick = scene.pick(scene.pointerX, scene.pointerY, (mesh) => mesh === paddlePlane);
                if (pick && pick.pickedPoint) {
                    targetPaddlePos.x = pick.pickedPoint.x;
                    targetPaddlePos.y = pick.pickedPoint.y;
                }
            };

            return { scene, paddle, iaPaddle, ball, tunnelWidth, tunnelHeight };
        }

        // Initialisation
        const { scene: gameScene, paddle, iaPaddle, ball, tunnelWidth, tunnelHeight } = createScene();
        createBuildingsAroundField(scene, tunnelWidth, 40);

        // Charger la police après la création de la scène
        loadFont();

        // Gestion des touches
        window.addEventListener('keydown', (event) => {
            if (event.key.toLowerCase() === 'r' && gameEnded) {
                restartGame();
            }
        });

        // Boucle de rendu
        engine.runRenderLoop(() => {
            // Si le jeu est terminé, ne pas continuer la physique
            if (gameEnded) {
                scene.render();
                return;
            }

            // Mouvement de la balle
            ball.position.addInPlace(ballVelocity);

            // Rebonds murs
            if (ball.position.x <= -tunnelWidth / 2 + 0.5 || ball.position.x >= tunnelWidth / 2 - 0.5) {
                ballVelocity.x *= -1;
            }

            // Rebonds sol/plafond
            if (ball.position.y <= 0.5) {
                ball.position.y = 0.5;
                ballVelocity.y = Math.abs(ballVelocity.y);
            } else if (ball.position.y >= tunnelHeight - 0.5) {
                ball.position.y = tunnelHeight - 0.5;
                ballVelocity.y = -Math.abs(ballVelocity.y);
            }

            // Collision paddle joueur
            if (Math.abs(ball.position.z - paddle.position.z) < 0.5 &&
                Math.abs(ball.position.x - paddle.position.x) < 1.5 &&
                Math.abs(ball.position.y - paddle.position.y) < 1.5) {

                ballVelocity.z *= -1;
                const impactX = ball.position.x - paddle.position.x;
                const impactY = ball.position.y - paddle.position.y;
                ballVelocity.x += impactX * 0.1;
                ballVelocity.y += impactY * 0.1;
                ballVelocity.scaleInPlace(1.01);
            }

            // Collision paddle IA
            if (Math.abs(ball.position.z - iaPaddle.position.z) < 0.5 &&
                Math.abs(ball.position.x - iaPaddle.position.x) < 1.5 &&
                Math.abs(ball.position.y - iaPaddle.position.y) < 1.5) {

                ballVelocity.z *= -1;
                const impactX = ball.position.x - iaPaddle.position.x;
                const impactY = ball.position.y - iaPaddle.position.y;
                ballVelocity.x += impactX * 0.1;
                ballVelocity.y += impactY * 0.1;
                ballVelocity.scaleInPlace(1.01);
            }

            // IA suit la balle
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

            // Limites IA
            iaPaddle.position.x = Math.max(-tunnelWidth / 2 + 1, Math.min(tunnelWidth / 2 - 1, iaPaddle.position.x));
            iaPaddle.position.y = Math.max(1, Math.min(tunnelHeight - 1, iaPaddle.position.y));

            // Mouvement paddle joueur
            paddle.position.x += (targetPaddlePos.x - paddle.position.x) * 0.4;
            paddle.position.y += (targetPaddlePos.y - paddle.position.y) * 0.4;
            paddle.position.z = -20;

            // Mode turbo aléatoire
            if (Math.random() < 0.002) {
                ballVelocity = ballVelocity.scale(1.5);
                ball.material.emissiveColor = new BABYLON.Color3(1, 0.2, 0.2);
            } else {
                ball.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
            }

            // Gestion des points
            if (ball.position.z > 25) {
                scoreLeft++;
                updateScoreTextMeshes();
                
                // Vérifier si le jeu est terminé
                if (!checkGameEnd()) {
                    ball.position = new BABYLON.Vector3(0, tunnelHeight / 2, 0);
                    const randomX = (Math.random() - 0.5) * 0.2;
                    const randomY = (Math.random() - 0.5) * 0.2;
                    ballVelocity = new BABYLON.Vector3(randomX, randomY, -0.3);
                }
            } else if (ball.position.z < -25) {
                scoreRight++;
                updateScoreTextMeshes();
                
                // Vérifier si le jeu est terminé
                if (!checkGameEnd()) {
                    ball.position = new BABYLON.Vector3(0, tunnelHeight / 2, 0);
                    const randomX = (Math.random() - 0.5) * 0.2;
                    const randomY = (Math.random() - 0.5) * 0.2;
                    ballVelocity = new BABYLON.Vector3(randomX, randomY, 0.3);
                }
            }

            scene.render();
        });

        window.addEventListener("resize", () => engine.resize());