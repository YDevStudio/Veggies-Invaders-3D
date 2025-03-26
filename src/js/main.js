
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

import { OrbitControls } from './OrbitControls.js';
import Stats from 'https://threejs.org/examples/jsm/libs/stats.module.js';
import { EffectComposer } from 'https://threejs.org/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://threejs.org/examples/jsm/postprocessing/RenderPass.js';

import Menu from './menu.js';
import Player from './player.js';
import Alien from './alien.js';
import Level from './level.js';
import Sound from './sound.js';
import Decor from './decor.js';
import GameConfig from './gameConfig.js';
/*----------------------------Fichier principal du jeu----------------------------*/

let container, w, h, camera, controls, renderer, stats, light;
let loop = {};

let aliens;
let aliensBonus;

let bulletJoueur;

let glasss;

let joueur = new Player();

let menu = new Menu();

window.addEventListener('load', go);
window.addEventListener('resize', resize);

function go() {
  menu.loadMenu();
  Sound.volumeMusic();
  Sound.volumeSound();
  init();
  gameLoop();
}
function enableShadowsForModel(model) {
  model.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
}
async function init() {
  container = document.querySelector('#MainApp');
  w = container.clientWidth;
  h = container.clientHeight;

  camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 100);
  camera.position.set(0, 8, -10);
  camera.add(Sound.listener);
  GameConfig.camera = camera;

  controls = new OrbitControls(camera, container);
  controls.target = new THREE.Vector3(0, 0, 20);
  controls.panSpeed = 0.3;
  controls.enabled = false;

  const renderConfig = { antialias: true, alpha: true };
  renderer = new THREE.WebGLRenderer(renderConfig);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(w, h);
  container.appendChild(renderer.domElement);

  stats = new Stats();
  stats.domElement.style.removeProperty('top');
  stats.domElement.style.bottom = '0px';
  document.body.appendChild(stats.domElement);

  // light = new THREE.AmbientLight(0xFFFFFF);
  // GameConfig.scene.add(light);

  // const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  // GameConfig.scene.add(ambientLight);

  // // Simulated sunlight
  // const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
  // directionalLight.position.set(10, 20, 10);
  // directionalLight.castShadow = true;

  // directionalLight.shadow.mapSize.width = 1024;
  // directionalLight.shadow.mapSize.height = 1024;
  // directionalLight.shadow.camera.near = 0.5;
  // directionalLight.shadow.camera.far = 50;

  // GameConfig.scene.add(directionalLight);

  // 🌤 Ambient light - warm but less intense
  const ambientLight = new THREE.AmbientLight(0xfff2dc, 0.7);
  GameConfig.scene.add(ambientLight);

  // 🌞 Directional light - like sunlight from window
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(30, 80, 40);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  GameConfig.scene.add(directionalLight);

  // 💡 Fill light - very soft, just to break shadows a bit
  const fillLight = new THREE.PointLight(0xffe0bd, 0.2, 30);
  fillLight.position.set(0, 5, -5);
  GameConfig.scene.add(fillLight);

  // renderer.shadowMap.enabled = true;
  // renderer.shadowMap.type = THREE.PCFSoftShadowMap;


  // light = new THREE.SpotLight(0xffa95c, 2);
  // light.position.set(-50, 50, 50);
  // light.castShadow = true;
  
  // GameConfig.scene.add(light);

  await Player.createGlass().then((value) => {
    glasss = value;
    // enableShadowsForModel(glasss);
    GameConfig.scene.add(value);
  })

  await Player.createbulletPlayer().then((value) => {
    bulletJoueur = value;
    bulletJoueur.traverse((child) => {
      if (child.isMesh) {
        // Create a new material or modify existing one
        child.material = new THREE.MeshStandardMaterial({
          color: 0xff0000, // 🔴 Change to any color you like
        });
  
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    // enableShadowsForModel(bulletJoueur);
    GameConfig.scene.add(value);
  });

  await Alien.createAlien(6, 30).then((value) => {
    aliens = value;
    enableShadowsForModel(aliens);
    GameConfig.scene.add(value);
  });

  await Alien.createAlienBonus().then((value) => {
    aliensBonus = value;
    enableShadowsForModel(aliensBonus);
    GameConfig.scene.add(value);
  });

  await Alien.createbulletAliens().then((value) => {
    GameConfig.scene.add(value);
  });

  let background = Decor.createBackground('../src/medias/images/skybox/ile/');
  GameConfig.scene.background = background;

  (async () => {
    const gltfGround = await GameConfig.chargerModeleGLTF('../src/medias/models/ground.gltf');
    const ground = gltfGround.scene;
    // enableShadowsForModel(ground);
    ground.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({ 
          map: child.material.map, 
          color: child.material.color 
        });
        child.castShadow = true;
        child.receiveShadow = true;
      }

    });
    
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.ShadowMaterial({ opacity: 0.2 })
    );
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    plane.position.y = -10;
    GameConfig.scene.add(plane);


    ground.rotation.y = 3 * Math.PI / 2;
    ground.scale.set(10, 10, 10);
    ground.position.z = 10;
    ground.position.y = -9;
    ground.position.x = -5;
    const actions = {
      "Object_80": (child) => { child.visible = false; },
      "Object_128": (child) => { child.visible = false; },
      "Object_83": (child) => { child.visible = false; },
      "Object_152": (child) => { child.visible = false; },
      "Object_150": (child) => { child.position.z = -1; },
      "Object_148": (child) => { child.position.z = -1; },
      "Object_136": (child) => { child.position.z = -0.7; },
      "Object_146": (child) => { child.position.z = -0.7; },
      "Object_44": (child) => {
        child.scale.x = 1.3;
        child.scale.z = 2.1;
        child.position.x = 0.3;
        child.position.z = 0.15;
      }
    };

    ground.traverse((child) => {
      if (actions[child.name]) {
        actions[child.name](child);
      }

    });

    GameConfig.scene.add(ground);
  })();

  Decor.chooseBackground();
  menu.optionMenu();
  triche();
  pauseMenu();
  helpKey();
  postproKey();

  Sound.audioLoader();
  Sound.sliderVolumeAlien();
  Sound.sliderVolumeLives();

  GameConfig.composer = new EffectComposer(renderer);
  GameConfig.composer.addPass(new RenderPass(GameConfig.scene, camera));

  GameConfig.scene.add(GameConfig.scoreGroup);

  const fps = 30;
  const slow = 1;
  loop.dt = 0,
    loop.now = timestamp();
  loop.last = loop.now;
  loop.fps = fps;
  loop.step = 1 / loop.fps;
  loop.slow = slow;
  loop.slowStep = loop.slow * loop.step;
}
function gameLoop() {
  loop.now = timestamp();
  loop.dt = loop.dt + Math.min(1, (loop.now - loop.last) / 1000);
  while (loop.dt > loop.slowStep) {
    loop.dt = loop.dt - loop.slowStep;
    update(loop.step);
    GameConfig.composer.render();
  }
  loop.last = loop.now;
  requestAnimationFrame(gameLoop);

  controls.update();
  stats.update();
}
function update(step) {
  if (!Menu.isActive()) {
    GameConfig.cameraBind(camera, controls, GameConfig.spaceshipObject);
    if (!GameConfig.isPartieActive() && !GameConfig.isPauseGame()) {
      joueur.moveSpaceShip(step, camera, controls, aliens);
      Alien.moveAlien(aliens);
      if (Alien.isPositionAliensBonus() && aliensBonus != undefined) {
        Alien.moveAlienBonus(aliensBonus, GameConfig.scene);
      }
      if (joueur.isbulletActive()) {
        playerShoot();
      }
      if (Alien.isbulletAliensTire()) {
        aliensShoot();
      } else {
        Alien.aliensAttack(aliens);
      }
    }
  }
}
function resize() {
  w = container.clientWidth;
  h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}

function timestamp() {
  return window.performance.now();
}

function removeScene() {
  GameConfig.scene.remove(aliens);
  Alien.alienTab.length = 0;
  GameConfig.scene.remove(aliensBonus);
  Alien.alienBonusTab.length = 0;
  Alien.setPositionAliensBonus(false);
  Alien.setbulletAliensTire(false);
  Alien._bulletAliens.visible = false;
  Player.glassTab.length = 0;
  GameConfig.scene.remove(bulletJoueur);
  joueur.setbulletActive(false);
  GameConfig.scene.remove(glasss);
  GameConfig.scene.remove(GameConfig.spaceshipObject);
  GameConfig.composer.removePass(GameConfig.glitchPass);
  GameConfig.setPartieActive(true);
  clearTimeout(Alien.timeoutpos);
  clearTimeout(Alien.timeouttouch);
}

function playerShoot() {
  joueur.movebulletPlayer();
  joueur.playerTouchBunk();
  joueur.touchAliens(aliens);
  joueur.touchAlienBonus();
  if (Alien.alienTab.length == 0) {
    removeScene();
    Level.level++;
    document.getElementById('level').innerHTML = "Level: " + Level.level;
    Level.changementLevel(Level.level);
    newGameAlien();
  }
}

function aliensShoot() {
  Alien.movebulletAliens();
  Alien.aliensTouchBunk();
  Player.nbLives = Alien.aliensTouchSpaceship(GameConfig.spaceshipObject, Player.nbLives);
  if (Player.nbLives == 0) {
    removeScene();
    Level.gameOver("Game Over !", camera, controls);
    Player.nbLives = 3;
    newGameLoose();
    Level.level = 1;
  }
  else if (aliens.position.z == GameConfig.spaceshipObject.position.z) {
    removeScene();
    GameConfig.setPartieActive(true);
    Level.gameOver("Game Over !");
  }
}

function triche() {
  document.addEventListener('keydown', (e) => {
    if (e.key == "k" || e.key == 'K') {
      if (Level.isActive()) {
        removeScene();
        Level.level++;
        document.getElementById('level').innerHTML = "Level: " + Level.level;
        Level.changementLevel(Level.level);
        newGameAlien();
      }
    }
    if (e.key == "i" || e.key == 'I') {
      Player.setInvincible(!Player.invincible);
      if (Player.invincible) {
        document.getElementById('invincible').innerHTML = "Invincible: oui";
        let alert = document.getElementsByClassName('alert');
        alert[0].classList.remove('hide');
        alert[0].classList.add('show');
        alert[0].style.opacity = 1;
        document.getElementsByClassName('msg')[0].innerHTML = "Mode invincible";
        setTimeout(() => {
          alert[0].classList.remove('show');
          alert[0].classList.add('hide');
        }, 5000);
        Sound.audioLives.pause();
      } else {
        document.getElementById('invincible').innerHTML = "Invincible: non";
        let alert = document.getElementsByClassName('alert');
        alert[0].classList.remove('hide');
        alert[0].classList.add('show');
        alert[0].style.opacity = 1;
        document.getElementsByClassName('msg')[0].innerHTML = "Mode normal";
        setTimeout(() => {
          alert[0].classList.remove('show');
          alert[0].classList.add('hide');
        }, 5000);
      }
    }
  });
}

async function newGameAlien() {
  GameConfig.spaceshipObject.position.x = 0;
  await Player.createGlass().then((value) => {
    glasss = value;
    GameConfig.scene.add(value);
  })
  await Alien.createAlien(6, 30).then((value) => {
    aliens = value;
    GameConfig.scene.add(value);
  });
  await Player.createbulletPlayer().then((value) => {
    bulletJoueur = value;
    GameConfig.scene.add(value);
  });
  await Alien.createAlienBonus().then((value) => {
    aliensBonus = value;
    GameConfig.scene.add(value);
  });
  await Player.createSpaceship().then((value) => {
    GameConfig.spaceshipObject = value;
    GameConfig.scene.add(value);
  });
  Alien.setPositionAliensBonus(true);
  clearTimeout(Alien.timeoutpos);
  clearTimeout(Alien.timeouttouch);
  GameConfig.setPartieActive(false);
  Player.setInvincible(false);
  document.getElementById('invincible').innerHTML = "Invincible: " + Player.invincible;
  Menu.setActive(true);
  setTimeout(() => {
    Menu.setActive(false);
  }, 3000);
}

async function newGameLoose() {
  GameConfig.spaceshipObject.position.x = 0;
  await Player.createGlass().then((value) => {
    glasss = value;
    GameConfig.scene.add(value);
  })
  await Alien.createAlien(6, 30).then((value) => {
    aliens = value;
    GameConfig.scene.add(value);
  });
  await Player.createbulletPlayer().then((value) => {
    bulletJoueur = value;
    GameConfig.scene.add(value);
  });
  await Alien.createAlienBonus().then((value) => {
    aliensBonus = value;
    GameConfig.scene.add(value);
  });
  Player.setInvincible(false);
  Alien.setPositionAliensBonus(true);
}

function pauseMenu() {
  document.addEventListener('keydown', (e) => {
    if (e.key == "Escape") {
      if (Level.isActive() && !Menu.isActive()) {
        GameConfig.setPauseGame(!GameConfig.pause);

        if (GameConfig.pause) {
          document.getElementById('pause').style.display = 'block';
          //Bouton pour continuer la partie
          document.getElementById('continuer').onclick = () => {
            document.getElementById('pause').style.display = 'none';
            GameConfig.setPauseGame(false);

          };
          //Bouton pour recommencer la partie
          document.getElementById('recom').onclick = () => {
            document.getElementById('recom-alert').style.display = "block";
            document.getElementById('recom-non').onclick = () => {
              document.getElementById('recom-alert').style.display = "none";
            }
            document.getElementById('recom-oui').onclick = () => {
              document.getElementById('recom-alert').style.display = "none";
              document.getElementById('pause').style.display = 'none';
              removeScene();
              Player.nbLives = 3;
              GameConfig.resetLives();
              Level.level = 1;
              document.getElementById('level').innerHTML = "Level: " + Level.level;
              menu.createTransition("Level " + Level.level, 3000);
              Alien.vitesseAliens = 0.05;
              Alien.vitesseBulletAlien = 0.1;
              GameConfig.scoreTotal = 0;
              newGameAlien();
              GameConfig.setPauseGame(false);
              camera.position.set(0, 8, -10);
              controls.target = new THREE.Vector3(0, 0, 20);
            }
          };
          document.getElementById('quit').onclick = () => {
            document.getElementById('pause').style.display = 'none';
            document.getElementById('score-level').style.display = "none";
            document.getElementById('game-element').style.visibility = "hidden";
            document.getElementById('lives').style.display = "none";
            document.getElementById('help-commande').style.visibility = "hidden";
            document.getElementById('camera').style.visibility = "hidden";
            let menu = new Menu();
            menu.loadMenu();
            removeScene();
            Player.nbLives = 3;
            newGameLoose();
            Level.level = 1;
            Alien.vitesseAliens = Level.level / 30;
            Alien.vitesseBulletAlien = Level.level / 10;
            GameConfig.scoreTotal = 0;
            GameConfig.setPauseGame(false);
            camera.position.set(0, 8, -10);
            controls.target = new THREE.Vector3(0, 0, 20);
          };
        } else {
          document.getElementById('pause').style.display = 'none';
        }
      }
    }
  });
}

function helpKey() {
  let help = false;
  document.addEventListener('keydown', (e) => {
    if (e.key == "h" || e.key == "H") {
      help = !help;
      if (help) {
        document.getElementById('help-commande').style.visibility = "hidden";
        document.getElementById('camera').style.visibility = "hidden";
      } else {
        document.getElementById('help-commande').style.visibility = "visible";
        document.getElementById('camera').style.visibility = "visible";
      }
    }
  })
}

function postproKey() {
  document.addEventListener('keydown', (e) => {
    if (e.key == "p" || e.key == "P") {
      GameConfig.setPostProcessing(!GameConfig.boolPostPro);
      if (GameConfig.isPostProcessing()) {
        document.getElementById('postpro').innerHTML = "Post-processing: non";
        let alert = document.getElementsByClassName('alert');
        alert[0].classList.remove('hide');
        alert[0].classList.add('show');
        alert[0].style.opacity = 1;
        document.getElementsByClassName('msg')[0].innerHTML = "Post-processing désactivé";
        document.getElementsByClassName('msg')[0].style.fontSize = "16px";
        setTimeout(() => {
          alert[0].classList.remove('show');
          alert[0].classList.add('hide');
        }, 5000);
      } else {
        document.getElementById('postpro').innerHTML = "Post-processing: oui";
        let alert = document.getElementsByClassName('alert');
        alert[0].classList.remove('hide');
        alert[0].classList.add('show');
        alert[0].style.opacity = 1;
        document.getElementsByClassName('msg')[0].innerHTML = "Post-processing activé";
        document.getElementsByClassName('msg')[0].style.fontSize = "16px";
        setTimeout(() => {
          alert[0].classList.remove('show');
          alert[0].classList.add('hide');
        }, 5000);
      }

    }
  })
}


