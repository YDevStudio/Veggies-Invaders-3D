import * as THREE from 'three';
import GameConfig from './gameConfig.js';
import PlayerClass from './player.js';
import Player from './player.js';
import Sound from './sound.js';

export default class Alien {
    static positionAlien = true; 
    static bulletAliens; 
    static bulletAliensTire = false; 
    static vitesseAliens = 0.05; 
    static vitesseBulletAlien = 0.1; 
    static alienTab = [];
    static alienBonusTab = []; 
    static positionAlienBonus = true; 
    static timeouttouch; 
    static timeoutpos; 
    static smokeParticles = new THREE.Group(); 
    static particle; 


    static isPositionAliens = () => {
        return Alien.positionAlien;
    }

    static setPositionAliens = (bool) => {
        Alien.positionAlien = bool;
    }

    static isPositionAliensBonus = () => {
        return Alien.positionAlienBonus;
    }

    static setPositionAliensBonus = (bool) => {
        Alien.positionAlienBonus = bool;
    }

    static isbulletAliensTire = () => {
        return Alien.bulletAliensTire;
    }

    static setbulletAliensTire = (bool) => {
        Alien.bulletAliensTire = bool;
    }

    static async createAlien(nbAliensRow, nbAliensTotal) {
        let posX, posZ;
        let aliens = new THREE.Group();
        let geometry = new THREE.BoxGeometry(1.0, 1.75, 0.25);
        let material = new THREE.MeshLambertMaterial({ color: 0x00ff00, transparent: true, opacity: 0.0 });
        const L10Points = await GameConfig.chargerModeleGLTF('../src/medias/models/Aliens/10points.gltf');
        L10Points.scene.scale.set(0.4, 0.4, 0.4);
        L10Points.scene.rotation.y = 3 * Math.PI / 2;
        L10Points.scene.position.x = 0.3;
        const L20Points = await GameConfig.chargerModeleGLTF('../src/medias/models/Aliens/20points.gltf');
        L20Points.scene.scale.set(0.4, 0.4, 0.4);
        L20Points.scene.rotation.y = 3 * Math.PI / 2;
        L20Points.scene.position.x =1 ;
        const L30Points = await GameConfig.chargerModeleGLTF('../src/medias/models/Aliens/30points.gltf');
        L30Points.scene.scale.set(0.4, 0.4, 0.4);
        L30Points.scene.rotation.y = 3 * Math.PI / 2;
        L30Points.scene.position.x = 2;
        const L40Points = await GameConfig.chargerModeleGLTF('../src/medias/models/Aliens/40points.gltf');
        L40Points.scene.scale.set(0.25, 0.25, 0.25);
        L40Points.scene.rotation.y = 3 * Math.PI / 2;
        L40Points.scene.position.x = -4.2 ;
        const L50Points = await GameConfig.chargerModeleGLTF('../src/medias/models/Aliens/50points.gltf');
        L50Points.scene.scale.set(0.25, 0.25, 0.25);
        L50Points.scene.rotation.y = 3 * Math.PI / 2;
        L50Points.scene.position.x = -9 ;
        for (let i = 0; i < nbAliensTotal; i++) {
            let nb = parseInt(i / nbAliensRow);
            posZ = nb;
            posX = i % nbAliensRow - ((nbAliensRow - 1) / 2);
            const cube = new THREE.Mesh(geometry, material);
            cube.position.set(posX * 2, 0, posZ * 2);
        
            let alienRow = nb == 1 ? L40Points.scene.clone()
                : nb == 2 ? L20Points.scene.clone() : nb == 3 ? L50Points.scene.clone() : nb == 4 ? L30Points.scene.clone() : L10Points.scene.clone();
            aliens.add(cube);
            const boxHelper = new THREE.Box3Helper(new THREE.Box3().setFromObject(alienRow), 0xff0000);
            boxHelper.visible = false; 
            boxHelper.name = "AlienBoxHelper";
            cube.add(boxHelper);
            cube.add(alienRow);  
        }
        aliens.position.z = 10;
        Alien.alienTab = aliens.children;
        return aliens;
    }
    static async createAlienBonus() {
        let geometry = new THREE.BoxGeometry(1.5, 2, 0.5);
        let material = new THREE.MeshLambertMaterial({ color: 0x00ff00, transparent: true, opacity: 0.0 });
        const mysteryPoints = await GameConfig.chargerModeleGLTF('../src/medias/models/Aliens/mysterypoints.gltf');
        mysteryPoints.scene.scale.set(0.45, 0.45, 0.45);
        mysteryPoints.scene.rotation.y = 3;
        mysteryPoints.scene.position.y = -1.5;
        mysteryPoints.scene.rotation.x = 0.05;
        mysteryPoints.scene.rotation.z = 0.05;
        const cubeAlienB = new THREE.Mesh(geometry, material);
        cubeAlienB.add(mysteryPoints.scene);
        cubeAlienB.position.y = 2;
        cubeAlienB.position.z = 15;
        cubeAlienB.position.x = -15;
        cubeAlienB.visible = false;
        Alien.alienBonusTab.push(cubeAlienB);
        return cubeAlienB;
    }
    static moveAlien(aliens) {
        let box = new THREE.Box3().setFromObject(aliens);
        if (box.max.x >= 15 || box.min.x <= -15) {
            Alien._positionAlien = !Alien._positionAlien;
            if (!Player.isInvincible()) {
                aliens.position.z -= 0.1 + Alien.vitesseBulletAlien;
            }
        }
        if (Alien._positionAlien) {
            aliens.position.x += Alien.vitesseAliens;
        } else {
            aliens.position.x -= Alien.vitesseAliens;
        }
    }
    static moveAlienBonus(alienBonus, scene) {
        alienBonus.visible = true;
        alienBonus.position.x += 0.11;
        Alien.setPositionAliensBonus(true);
        if (Alien.isPositionAliensBonus()) {
            if (Player.touchAlienBonus) { 
                alienBonus.visible = false;
                scene.remove(alienBonus);
                alienBonus.position.x = -15;
                Player.touchAlienBonus = false;
                Alien.setPositionAliensBonus(false);
                document.getElementById('invincible').innerHTML = "Invincible: oui";
                Alien.timeouttouch = setTimeout(() => { 
                    if (!GameConfig.isPartieActive() && !GameConfig.isPauseGame()) {
                        scene.add(alienBonus);
                        alienBonus.visible = true;
                        Alien.setPositionAliensBonus(true);
                        document.getElementById('invincible').innerHTML = "Invincible: non";
                    }

                }, 10000);
            }
            if (alienBonus.position.x >= 15) { 
                scene.remove(alienBonus);
                alienBonus.visible = true;
                alienBonus.position.x = -15;
                Player.touchAlienBonus = false;
                Alien.setPositionAliensBonus(false);
                Alien.timeoutpos = setTimeout(() => { 
                    if (!GameConfig.isPartieActive() && !GameConfig.isPauseGame()) {
                        scene.add(alienBonus);
                        alienBonus.visible = true;
                        Alien.setPositionAliensBonus(true);
                    }
                }, 10000);
            }
        }
    }
    static async createbulletAliens() {
        const enemyBullet = await GameConfig.chargerModeleGLTF('../src/medias/models/Aliens/enemyBullet.gltf');
        Alien._bulletAliens = enemyBullet.scene;
        Alien._bulletAliens.scale.set(0.2, 0.2, 0.2);
        Alien._bulletAliens.rotation.z = 15.7;
        Alien._bulletAliens.visible = false;
        return Alien._bulletAliens;
    }

    static movebulletAliens = () => {
        Alien._bulletAliens.position.z -= Alien.vitesseBulletAlien;
        if (Alien._bulletAliens.position.z <= -3) {
            Alien._bulletAliens.visible = false;
            Alien.setbulletAliensTire(false);
        }
    }
    static aliensAttack = (aliens) => {
        var generAliens = Math.floor(Math.random() * Alien.alienTab.length);
        var random = Math.random();
        if (Alien.alienTab[generAliens] != undefined) {
            if (random > 0.8) {
                Alien._bulletAliens.visible = true;
                Alien.setbulletAliensTire(true);
                Alien._bulletAliens.position.z = aliens.position.z + Alien.alienTab[generAliens].position.z;
                Alien._bulletAliens.position.x = aliens.position.x + Alien.alienTab[generAliens].position.x;
            }
        }
    }
    static aliensTouchSpaceship = (spaceship, nbLives) => {
        var ray = new THREE.Raycaster();
        var vect = new THREE.Vector3(0, 0, 1);
        ray.set(Alien._bulletAliens.position, vect);
        var intersect = ray.intersectObject(spaceship);
        if (intersect.length > 0) {
            Alien.setbulletAliensTire(false);
            Alien._bulletAliens.visible = false;
            if (!Player.isInvincible()) { 
                nbLives--;
                GameConfig.removeLives(nbLives);
                if (!Sound.boolSound) { 
                    Sound.livesSound(spaceship);
                }
                if (!GameConfig.isPostProcessing()) { 
                    GameConfig.postProcessing();
                } else {
                    GameConfig.composer.removePass(GameConfig.glitchPass);
                }
            }
        }
        return nbLives;
    }
    static aliensTouchBunk = () => {
        var ray = new THREE.Raycaster();
        var vect = new THREE.Vector3(0, 3, 1);
        vect.normalize();
        ray.set(Alien._bulletAliens.position, vect);
        var intersect = ray.intersectObjects(PlayerClass.glassTab, true);
        if (intersect.length > 0) {
            if (intersect[0].object.material.opacity != 0) {
                intersect[0].object.material.opacity -= 0.5; 
                Alien.setbulletAliensTire(false);
                Alien._bulletAliens.visible = false;
                if (intersect[0].object.material.opacity <= 0) { 
                    intersect[0].object.visible = false;
                }
            }
        }
    }

    static loadSmokeEffect(){
        let smokeTexture = new THREE.TextureLoader();
        smokeTexture.load("./src/medias/images/smoke.png", function(texture){
            let smokeGeo = new THREE.PlaneGeometry(3, 3);
            let smokeMaterial = new THREE.MeshLambertMaterial({
                map: texture,
                transparent: true,
                opacity: 0.0
            });
            Alien.particle = new THREE.Mesh(smokeGeo, smokeMaterial);
            Alien.particle.name = "particle";
            Alien.particle.position.x = Player.bullet.position.x - 2;
            Alien.particle.position.z = Player.bullet.position.z;
            Alien.particle.position.y = 3;
            Alien.particle.rotation.y = 9.5;
            Alien.particle.material.opacity = 1;
            Alien.smokeParticles.add(Alien.particle);
            let interval = setInterval(() => {
                GameConfig.scene.add(Alien.smokeParticles);
                Alien.particle.position.y += 0.1;
                if(Alien.particle.position.y > 6){
                    GameConfig.scene.remove(Alien.particle);
                    clearInterval(interval);
                }
            }, 1000/60);
            setTimeout(() => {
                Alien.smokeParticles.remove(Alien.particle)
                GameConfig.scene.remove(Alien.smokeParticles);
            }, 500);
        });

    }

}
