import {GLTFLoader} from 'https://threejs.org/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import { GlitchPass } from 'https://threejs.org/examples/jsm/postprocessing/GlitchPass.js';
import Level from './level.js';

export default class GameConfig{

    static scoreTotal = 0; 
    static bestScore = 0; 
    static scoreGroup = new THREE.Group(); 
    static partieFinie = false;
    static keyboard = new THREEx.KeyboardState(); 
    static lockCam = true; 
    static pause = false; 
    static scene = new THREE.Scene();
    static composer; 
    static glitchPass; 
    static boolPostPro = false;
 
    static chargerModeleGLTF(url){
        let loader = new GLTFLoader();
        return new Promise((resolve, reject) => {
            loader.load(url, data=> resolve(data), null, reject);
        });
    }

    static isPartieActive = () =>{
        return GameConfig.partieFinie;
    }

    static setPartieActive = (bool) =>{
        GameConfig.partieFinie = bool;
    }

    static isPauseGame = () =>{
        return GameConfig.pause;
    }

    static setPauseGame = (bool) =>{
        GameConfig.pause = bool;
    }

    static isPostProcessing = () => {
        return GameConfig.boolPostPro;
    }

    static setPostProcessing = (bool) => {
        GameConfig.boolPostPro = bool;
    }

    static cameraBind = (camera, controls, spaceship) =>{
        if(GameConfig.keyboard.pressed("0")){
          GameConfig.lockCam = true;
          camera.position.set(0, 8, -10);
          controls.target = new THREE.Vector3(0, 0, 20);
        }
        if(GameConfig.keyboard.pressed("1")){
          GameConfig.lockCam = false;
          camera.position.set(spaceship.position.x, 2.5, -1);
          controls.target = new THREE.Vector3(spaceship.position.x, 0, 20);
        }
        if(GameConfig.keyboard.pressed("2")){
            GameConfig.lockCam = true;
            camera.position.set(30, 20, 10);
        }
    }

    static removeLives = (nbLives) =>{
        nbLives == 2 ? document.getElementById('life3').style.display = 'none' : nbLives == 1 ? document.getElementById('life2').style.display = 'none' : document.getElementById('life1').style.display = 'none';
    }

    static resetLives = () =>{
        document.getElementById('life3').style.display = 'block';
        document.getElementById('life2').style.display = 'block';
        document.getElementById('life1').style.display = 'block';
        document.getElementById('score').innerHTML = "Score: " +  0;
    }

    static interfaceGame = () =>{
        document.getElementById('lives').style.display = "block";
        document.getElementById('game-element').style.visibility = "visible";
        document.getElementById('help-commande').style.visibility = "visible";
        document.getElementById('score-level').style.display = "block";
        document.getElementById('camera').style.visibility = "visible";
        document.getElementById('score').innerHTML = "Score: " + GameConfig.scoreTotal;
        document.getElementById('level').innerHTML = "Level: " + Level.level;
        document.getElementById('best-score').innerHTML = "Meilleur score: " + GameConfig.bestScore;
        document.getElementById('invincible').style.display = "block";
        document.getElementById('invincible').innerHTML = "Invincible: non" ;
        document.getElementById('postpro').style.display = "block";
        document.getElementById('postpro').innerHTML = "Post-processing: oui" ;
    }
    static postProcessing = () =>{
        GameConfig.glitchPass = new GlitchPass();
        GameConfig.composer.addPass( GameConfig.glitchPass );
        setTimeout(() => { 
            GameConfig.composer.removePass(GameConfig.glitchPass);
        }, 500);
    }
}