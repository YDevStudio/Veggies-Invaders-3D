
import * as THREE from 'three';
import Alien from './alien.js';
import GameConfig from './gameConfig.js';
import Menu from "./menu.js";

export default class Level{
    static level = 1; 
    static levelActive = true; 
    
    static isActive = () => {
        return Level.levelActive;
    }

    static setActive = (bool) => {
        Level.levelActive = bool;
    }

    static changementLevel = (level) =>{
        Level.createTransition("Level " + level, 3000);
        Alien.vitesseAliens = level/30;
        Alien.vitessebulletAlien = level/10; 
    }

    static createTransition = (text, duration) => {
        document.getElementById('title-trans').innerHTML = text;
        document.getElementById('trans').style.display = "block";
        Level.setActive(false);
        setTimeout(() => {
            document.getElementById('trans').style.display = "none";
            Level.setActive(true);
        }, duration);
    }

    static gameOver = (text, camera, controls) =>{
        document.getElementById('title-trans-gameover').innerHTML = text;
        document.getElementById('trans-gameover').style.display = "block";
        document.getElementById('trans-gameover').style.minHeight = "30%";

        var scoreFinal = document.createElement('p');
        scoreFinal.innerHTML = "Score final : " + GameConfig.scoreTotal;
        scoreFinal.id = "score-final";
        document.getElementById('trans-gameover').appendChild(scoreFinal);
        if(GameConfig.bestScore <= GameConfig.scoreTotal){
            GameConfig.bestScore = GameConfig.scoreTotal;
        }
        document.getElementById('best-score').innerHTML = "Meilleur score: " + GameConfig.bestScore;

        var btnMenu = document.createElement('button');
        btnMenu.innerHTML = 'Retour menu';
        btnMenu.id = "return-menu";
        btnMenu.onclick = () =>{
            let menu = new Menu();
            menu.loadMenu();
            document.getElementById('trans-gameover').style.display = "none";
            document.getElementById('score-final').style.display = "none";
            document.getElementById('score-level').style.display = "none";
            document.getElementById('game-element').style.visibility = "hidden";
            document.getElementById('help-commande').style.visibility = "hidden";
            document.getElementById('camera').style.visibility = "hidden";
            scoreFinal.innerHTML = "";
            Alien.vitesseAliens = Level.level/30;
            Alien.vitessebulletAlien = Level.level/10;
            GameConfig.scoreTotal = 0;
            GameConfig.setPostProcessing(false);
            camera.position.set(0, 8, -10);
            controls.target = new THREE.Vector3(0, 0, 20);
        }
        document.getElementById('trans-gameover').appendChild(btnMenu);
    }




}
