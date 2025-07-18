 const canvas = document.getElementById("renderCanvas");
        const engine = new BABYLON.Engine(canvas, true);
        const scene = new BABYLON.Scene(engine);
        
        // Caméra POV (Free Camera pour un contrôle plus naturel)
        const camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 3, -5), scene);
        camera.attachControl(canvas, true);
        
        // Configuration POV réaliste
        camera.setTarget(new BABYLON.Vector3(0, 0, 0)); // Regarde vers le centre du clavier
        camera.speed = 0.5;
        camera.angularSensibility = 2000;
        
        // Contrôles WASD
        camera.keysUp = [87]; // W
        camera.keysDown = [83]; // S
        camera.keysLeft = [65]; // A
        camera.keysRight = [68]; // D
        
        // Lumière principale (simule éclairage de bureau)
        const mainLight = new BABYLON.DirectionalLight("MainLight", new BABYLON.Vector3(-1, -1, 1), scene);
        mainLight.intensity = 1.5;
        mainLight.diffuse = new BABYLON.Color3(1, 1, 0.9);
        
        // Lumière d'appoint pour les reflets
        const fillLight = new BABYLON.HemisphericLight("FillLight", new BABYLON.Vector3(0, 1, 0), scene);
        fillLight.intensity = 0.3;
        fillLight.diffuse = new BABYLON.Color3(0.5, 0.7, 1);
        
        // Lumière d'ambiance pour le RGB
        const ambientLight = new BABYLON.HemisphericLight("AmbientLight", new BABYLON.Vector3(0, -1, 0), scene);
        ambientLight.intensity = 0.2;
        ambientLight.diffuse = new BABYLON.Color3(0, 1, 0.5);
        
        // Création d'un environnement de bureau simple
        const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 20, height: 20}, scene);
        const groundMaterial = new BABYLON.StandardMaterial("groundMat", scene);
        groundMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.15);
        groundMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        ground.material = groundMaterial;
        ground.position.y = -0.5;
        
        // Import du modèle GLB clavier
        BABYLON.SceneLoader.ImportMesh(
            "",
            "assets/",
            "razer_huntsman_mini_keyboard.glb",
            scene,
            function (meshes) {
                console.log("Modèle chargé avec", meshes.length, "meshes");
                
                // Cacher l'indicateur de chargement
                document.getElementById('loading').style.display = 'none';
                
                // Parent pour déplacer/modifier le clavier facilement
                const parent = new BABYLON.TransformNode("keyboardParent", scene);
                meshes.forEach(mesh => {
                    mesh.parent = parent;
                    if (mesh.material) {
                        mesh.material.backFaceCulling = false;
                        
                        // Améliorer les matériaux pour un rendu plus réaliste
                        if (mesh.material.emissiveColor) {
                            mesh.material.emissiveColor = mesh.material.emissiveColor.scale(0.3);
                        }
                    }
                });
                
                // Position et orientation POV du clavier
                parent.position = new BABYLON.Vector3(0, 0, 0);
                parent.scaling = new BABYLON.Vector3(0.8, 0.8, 0.8);
                
                // Légère rotation pour une vue plus naturelle
                parent.rotation = new BABYLON.Vector3(0, 0, 0);
                
                // Ajuster la position de la caméra pour une vue POV optimale
                camera.position = new BABYLON.Vector3(0, 1.5, -2.5);
                camera.setTarget(new BABYLON.Vector3(0, 0, 0.5));
                
                // Animation subtile de "respiration" pour les LEDs
                const animationGroup = new BABYLON.AnimationGroup("keyboardAnimation", scene);
                
                meshes.forEach(mesh => {
                    if (mesh.material && mesh.material.emissiveColor) {
                        const breatheAnim = new BABYLON.Animation(
                            "breathe",
                            "material.emissiveColor",
                            30,
                            BABYLON.Animation.ANIMATIONTYPE_COLOR3,
                            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
                        );
                        
                        const keys = [];
                        keys.push({
                            frame: 0,
                            value: mesh.material.emissiveColor.clone()
                        });
                        keys.push({
                            frame: 60,
                            value: mesh.material.emissiveColor.clone().scale(1.5)
                        });
                        keys.push({
                            frame: 120,
                            value: mesh.material.emissiveColor.clone()
                        });
                        
                        breatheAnim.setKeys(keys);
                        animationGroup.addTargetedAnimation(breatheAnim, mesh);
                    }
                });
                
                animationGroup.play(true);
            },
            null,
            function (scene, message, exception) {
                console.error("Erreur de chargement du modèle:", message, exception);
                document.getElementById('loading').innerHTML = "❌ Erreur de chargement du modèle";
            }
        );
        
        // Effet de post-processing pour améliorer le rendu
        const defaultPipeline = new BABYLON.DefaultRenderingPipeline("defaultPipeline", true, scene, [camera]);
        if (defaultPipeline) {
            defaultPipeline.fxaaEnabled = true;
            defaultPipeline.bloomEnabled = true;
            defaultPipeline.bloomThreshold = 0.8;
            defaultPipeline.bloomWeight = 0.3;
            defaultPipeline.bloomKernel = 64;
        }
        
        // Contrôles personnalisés pour une meilleure expérience POV
        let isPointerLocked = false;
        
        canvas.addEventListener("click", () => {
            if (!isPointerLocked) {
                canvas.requestPointerLock();
            }
        });
        
        document.addEventListener("pointerlockchange", () => {
            isPointerLocked = document.pointerLockElement === canvas;
        });
        
        // Boucle de rendu
        engine.runRenderLoop(() => {
            scene.render();
        });
        
        // Redimensionnement dynamique
        window.addEventListener("resize", () => {
            engine.resize();
        });
        
        // Gestion des erreurs
        window.addEventListener("error", (e) => {
            console.error("Erreur:", e);
        });
