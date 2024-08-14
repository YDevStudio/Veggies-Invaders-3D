import GameConfig from "./gameConfig.js";
import Level from "./level.js";
import Player from "./player.js";

export default class Menu{
    constructor(){
        this.buttonEvent();
    }
    static actif = true;
    static isActive = () => {
        return Menu.actif;
    }

    static setActive = (bool) => {
        Menu.actif = bool;
    }

    buttonEvent = () => {
        let btn = document.getElementById("button-play")
        btn.onclick = () => {
             this.discardMenu();
            this.menuPerso();
            GameConfig.interfaceGame();
            GameConfig.resetLives();
        }
    }

    menuPerso(){
       
            this.createTransition("Level "+ Level.level, 3000);
            Player.createSpaceship().then((value) =>{
                GameConfig.spaceshipObject = value;
                GameConfig.scene.add(value);
            })
        
    }

    loadMenu = () => {
        Menu.setActive(true);
        document.getElementById("menu").style.display = "block";
    }

    discardMenu = () => {
        document.getElementById("menu").style.display = "none";
    }

    createTransition = (text, duration) => {
        document.getElementById('title-trans').innerHTML = text;
        document.getElementById('trans').id = "trans";
        document.getElementById('trans').style.display = "block";
        Menu.setActive(true);
        if(duration > 0){
            setTimeout(() => {
                document.getElementById('trans').style.display = "none";
                Menu.setActive(false);
                GameConfig.setPartieActive(false);
            }, duration);
        }
    }

    optionMenu = () =>{
        document.getElementById('option').onclick = () =>{
            document.getElementById('menu-option').style.display = "block"
            document.getElementById('menu').style.background = "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('../src/medias/images/menu/page1.jpg') no-repeat center center fixed";
            document.getElementById('menu').style.backgroundSize = "100%"
        }

        document.getElementById('close-option').onclick = () =>{
            document.getElementById('menu-option').style.display = "none"
            document.getElementById('menu').style.background = "linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url('../src/medias/images/menu/page1.jpg') no-repeat center center fixed";
            document.getElementById('menu').style.backgroundSize = "100%"
        }
    }
}
