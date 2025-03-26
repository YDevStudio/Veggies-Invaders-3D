
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import GameConfig from './gameConfig.js';
import Alien from './alien.js';
import Sound from './sound.js';

export default class Player{
    constructor(){
        this.moveSpaceShip(); 
    }

    static glassTab = []; 
    static spaceship; 
    static bulletPlayerActive = false; 
    static bullet; 
    static touchAlienBonus = false; 
    static nbLives = 3; 
    static invincible = false; 

    isbulletActive = () => {
        return Player.bulletPlayerActive;
    }

    setbulletActive = (bool) => {
        Player.bulletPlayerActive = bool;
    }

    static isInvincible = () =>{
      return Player.invincible;
    }

    static setInvincible = (bool) =>{
      Player.invincible = bool;
    }

    static async createSpaceship(){
      let geometry = new THREE.BoxGeometry( 2, 0.8, 0.4 );
      let material = new THREE.MeshLambertMaterial( {color: 0x660000, transparent : true, opacity: 0.0} );
      Player.spaceship = new THREE.Mesh( geometry, material );
      let potato;

        potato = await GameConfig.chargerModeleGLTF('../src/medias/models/potato.gltf');
        potato.scene.scale.set(0.3,0.3,0.3);
        potato.scene.position.y = 0.5;

        potato.scene.position.z = -1;
        potato.scene.rotation.y = Math.PI / 2 ;
      
      const potatoSpace = potato.scene;
      Player.spaceship.add(potatoSpace);
      return Player.spaceship;
  }


    static async createGlass(){
        let glass = new THREE.Group();
        for(let i = 0 ; i < 4; i++){
            const stone = await GameConfig.chargerModeleGLTF('../src/medias/models/glass.gltf');
            const stoneBunk = stone.scene;
            stoneBunk.position.x = (i%4 - ((4-3)/2)) * 5;
            stoneBunk.scale.set(0.7,0.7,0.7);
            glass.add(stoneBunk);
            glass.position.x = -6;
            glass.position.z = 2;
            glass.position.y = -1;
            Player.glassTab.push(glass.children[i]);
        }
        return glass;
    }

    static async createbulletPlayer() {
      const gltf = await GameConfig.chargerModeleGLTF('../src/medias/models/bullet.gltf');
      const bullet = gltf.scene;
      bullet.rotation.x = Math.PI / 2;
      bullet.scale.set(0.4, 0.4, 0.4);
      bullet.visible = false;
      Player.bullet = bullet;
      return bullet;
    }

    movebulletPlayer = () =>{
        Player.bullet.position.z += 0.5;
        if(Player.bullet.position.z >= 28){
            Player.bullet.position.z = 0;
            Player.bullet.visible = false;
            this.setbulletActive(false);
        }
    }

    moveSpaceShip = (step, camera, controls, aliens) =>{
        if(GameConfig.keyboard.pressed("right")){
            if(Player.spaceship.position.x - 1.5 > -14){
                Player.spaceship.position.x -= 4 * step;
            }
            if(!GameConfig.lockCam){
              camera.position.set(Player.spaceship.position.x, 2.5, -1);
              controls.target = new THREE.Vector3(Player.spaceship.position.x, 0, 20);
            }
        }
        if(GameConfig.keyboard.pressed("left")){
            if(Player.spaceship.position.x + 1.5 < 14){
                Player.spaceship.position.x += 4 * step;
            }
          if(!GameConfig.lockCam){
            camera.position.set(Player.spaceship.position.x, 2.5, -1);
            controls.target = new THREE.Vector3(Player.spaceship.position.x, 0, 20);
          }
        }
        if(GameConfig.keyboard.pressed("space")){
          if(!Player.bulletPlayerActive){
            this.setbulletActive(true);
            Player.bullet.position.z = 0;
            Player.bullet.position.x = Player.spaceship.position.x + 1.65;
            Player.bullet.position.y = Player.spaceship.position.y + 0.5;
            Player.bullet.visible = true;
          }
        }
    }   
    touchAliens = (aliens) => {
      
      const bulletBox = new THREE.Box3().setFromObject(Player.bullet);
      for (let i = 0; i < Alien.alienTab.length; i++) {
        const alien = Alien.alienTab[i];
        let boxHelper = alien.getObjectByName("AlienBoxHelper");
       
        if (boxHelper === undefined) {
          const alienModel = alien.getObjectByName("alienModel");
          if (alienModel) {
            alienModel.traverse(function (child) {
              if (child.isMesh) {
                boxHelper = new THREE.Box3Helper(new THREE.Box3(), 0xff0000);
                boxHelper.name = "AlienBoxHelper";
                boxHelper.visible = false;
                boxHelper.geometry.computeBoundingBox();
                alien.add(boxHelper);
              }
            });
          }
        }
        
        if (boxHelper) { 
          const alienBox = new THREE.Box3().setFromObject(boxHelper);
          if (bulletBox.intersectsBox(alienBox)) {
            Alien.loadSmokeEffect();
            alien.visible = false;
            Alien.alienTab.splice(i, 1);
            aliens.remove(alien);
            Player.bullet.visible = false;
            if (!Sound.boolSound) {
              Sound.alienSound(aliens);
            }            
            if (alien.getObjectByName("10points")) {
              GameConfig.scoreTotal += 10;
            } else if (alien.getObjectByName("20points")) {
              GameConfig.scoreTotal += 20;
            } else if (alien.getObjectByName("30points")) {
              GameConfig.scoreTotal += 30;
            } else if (alien.getObjectByName("40points")) {
              GameConfig.scoreTotal += 40;
            } else if (alien.getObjectByName("50points")) {
              GameConfig.scoreTotal += 50;
            } else {
              GameConfig.scoreTotal += 100;
            }
            document.getElementById('score').innerHTML = "Score: " + GameConfig.scoreTotal;
            this.setbulletActive(false);
            break;
          }
        }
      }
    }
    
    playerTouchBunk = () =>{
        var ray = new THREE.Raycaster();
        var vect = new THREE.Vector3(0, 2, 1);
        vect.normalize();
        ray.set(Player.bullet.position, vect);
        var intersect = ray.intersectObjects(Player.glassTab, true);
        if(intersect.length > 0){
          if(intersect[0].object.material.opacity != 0){
            intersect[0].object.material.opacity -= 0.5; 
            if(intersect[0].object.material.opacity <= 0){ 
              intersect[0].object.visible = false;
            }
          }
        }
    }

    touchAlienBonus = () =>{
      var ray = new THREE.Raycaster();
      var vect = new THREE.Vector3(0, 0.4, 1);
      ray.set(Player.bullet.position, vect);
      var intersect = ray.intersectObjects(Alien.alienBonusTab, true);
      if(intersect.length > 0){
        intersect[0].object.visible = false;
        Player.touchAlienBonus = true;
        Player.bullet.visible = false;
        this.setbulletActive(false);
        Player.setInvincible(true);
        let alert = document.getElementsByClassName('alert');
        alert[0].classList.remove('hide');
        alert[0].classList.add('show');
        alert[0].style.opacity = 1;
        document.getElementsByClassName('msg')[0].innerHTML = "Mode invincible";
        setTimeout(() => {
          alert[0].classList.remove('show');
          alert[0].classList.add('hide');
        }, 5000);
        setTimeout(() => {
          Player.setInvincible(false);
          let alert = document.getElementsByClassName('alert');
          alert[0].classList.remove('hide');
          alert[0].classList.add('show');
          alert[0].style.opacity = 1;
          document.getElementsByClassName('msg')[0].innerHTML = "Mode normal";
          setTimeout(() => {
            alert[0].classList.remove('show');
            alert[0].classList.add('hide');
          }, 5000);
        }, 10000);
      }
    }
    
}