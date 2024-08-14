import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

import GameConfig from './gameConfig.js';

export default class Decor {
    constructor() {
        this.geometry;
        this.material;
        this.loader;
    }

    static createBackground = (path) => {
        const format = '.png';
        const urls = [
            path + 'px' + format, path + 'nx' + format,
            path + 'py' + format, path + 'ny' + format,
            path + 'pz' + format, path + 'nz' + format,
        ];
        const reflectionCube = new THREE.CubeTextureLoader().load(urls);
        const refractionCube = new THREE.CubeTextureLoader().load(urls);
        refractionCube.mapping = THREE.CubeRefractionMapping;
        return reflectionCube;
    }

    static async chooseBackground() {
        let background = Decor.createBackground('../src/medias/images/skybox/ile/');
        GameConfig.scene.background = background;
    };


}
