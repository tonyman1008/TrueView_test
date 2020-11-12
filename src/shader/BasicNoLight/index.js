import fragmentShader from "./fragmentShader.js";
import vertexShader from "./vertexShader.js";
import * as THREE from "../../../node_modules/three/build/three.module.js";

function BasicNoLight() {
   this.fragmentShader = fragmentShader;
   this.vertexShader = vertexShader;
   this.uniforms = {
      map: { value: null },
      mapRepeat: { value: new THREE.Vector2(1, 1) },
      mapOffset: { value: new THREE.Vector2(0, 0) },
   };
}

export default BasicNoLight;
