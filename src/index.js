import * as THREE from "../node_modules/three/build/three.module.js";
import Stats from "../node_modules/three/examples/jsm/libs/stats.module.js";
import { OrbitControls } from "../node_modules/three/examples/jsm/controls/OrbitControls.js";
import { GUI } from "../node_modules/three/examples/jsm/libs/dat.gui.module.js";
import BasicNoLight from "./shader/BasicNoLight/index.js";

var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;

var container, stats;
var camera, scene, renderer, controls;

const testCount = 1;
const IMG_COUNT = 30; // need user input
const NUMBER_OF_ROW = 5; // constraint
const NUMBER_OF_COLUMN = Math.ceil(IMG_COUNT / NUMBER_OF_ROW);

const TrueViewObj = function (
   ImgName,
   TargetObj,
   Shader,
   ImgIndex = 0,
   BaseObj,
) {
   this.ImgName = ImgName;
   this.TargetObj = TargetObj;
   this.Shader = Shader;
   this.ImgIndex = ImgIndex;
   this.BaseObj = BaseObj;
};
const TrueViewObjAry = [];
const IMG_NAMES = ["dragon90"]; // need user input
const BASE_POS = [new THREE.Vector3(0, 150, 0)];

var imgHeight = 0;
var imgWidth = 0;

const baseImg = "asset/materials/base.jpg";
const baseMap = new THREE.TextureLoader().load(baseImg);
const groundImg = "asset/materials/ground.jpg";

var guiParams = {
   distanceToObj: 0,
   PolarAngle: 0,
   AzimuthalAngle: 0,
   position: 0,
   enableRotate: true,
   autoRotateSpeed: 2,
};

createScene();
animate();

function getUrlImageCount() {
   var getUrlStr = location.href;
   var url = new URL(getUrlStr);
   IMG_COUNT = url.searchParams.get("count");
}

function createScene() {
   container = document.createElement("div");
   document.body.appendChild(container);

   // CAMERA

   camera = new THREE.PerspectiveCamera(
      40,
      SCREEN_WIDTH / SCREEN_HEIGHT,
      1,
      10000
   );
   camera.position.set(0, 247, 1200);

   // SCENE

   scene = new THREE.Scene();

   // LIGHTS

   var light = new THREE.DirectionalLight(0xaabbff, 1);
   light.position.set(-10, 20, 20);
   scene.add(light);

   // SKYBOX;
   let materialArray = [];
   let texture_ft = new THREE.TextureLoader().load(
      "./asset/skybox/space/ft.jpg"
   );
   let texture_bk = new THREE.TextureLoader().load(
      "./asset/skybox/space/bk.jpg"
   );
   let texture_up = new THREE.TextureLoader().load(
      "./asset/skybox/space/up.jpg"
   );
   let texture_dn = new THREE.TextureLoader().load(
      "./asset/skybox/space/dn.jpg"
   );
   let texture_rt = new THREE.TextureLoader().load(
      "./asset/skybox/space/rt.jpg"
   );
   let texture_lf = new THREE.TextureLoader().load(
      "./asset/skybox/space/lf.jpg"
   );

   materialArray.push(new THREE.MeshBasicMaterial({ map: texture_ft }));
   materialArray.push(new THREE.MeshBasicMaterial({ map: texture_bk }));
   materialArray.push(new THREE.MeshBasicMaterial({ map: texture_up }));
   materialArray.push(new THREE.MeshBasicMaterial({ map: texture_dn }));
   materialArray.push(new THREE.MeshBasicMaterial({ map: texture_rt }));
   materialArray.push(new THREE.MeshBasicMaterial({ map: texture_lf }));

   for (let i = 0; i < 6; i++) materialArray[i].side = THREE.BackSide;

   let skyboxGeo = new THREE.BoxGeometry(10000, 10000, 10000);
   let skybox = new THREE.Mesh(skyboxGeo, materialArray);
   scene.add(skybox);

   // RENDERER

   renderer = new THREE.WebGLRenderer({ antialias: true });
   renderer.setPixelRatio(window.devicePixelRatio);
   renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
   container.appendChild(renderer.domElement);

   // CONTROLS

   controls = new OrbitControls(camera, renderer.domElement);
   controls.enableZoom = false;
   controls.target.set(0, 247, 0);
   //lock y asix
   controls.minPolarAngle = Math.PI / 2;
   controls.maxPolarAngle = Math.PI / 2;
   controls.autoRotate = false;
   controls.autoRotateSpeed = 2;
   controls.update();

   // STATS

   stats = new Stats();
   container.appendChild(stats.dom);

   // Ground
   const groundGeo = new THREE.PlaneGeometry(1000, 1000);
   const groundMap = new THREE.TextureLoader().load(groundImg);
   const groundMat = new THREE.MeshBasicMaterial({
      map: groundMap,
      transparent: true,
   });
   const ground = new THREE.Mesh(groundGeo, groundMat);
   ground.rotation.x = -Math.PI / 2;
   ground.position.y = 100;
   ground.renderOrder = 0;
   scene.add(ground);

   window.addEventListener("resize", onWindowResize, false);
   document.addEventListener("keydown", onDocumentKeyDown, false);

   initGUI();

   //init object
   for (let i = 0; i < testCount; i++) {
      createTrueViewObj(i);
   }
}

function onDocumentKeyDown(event) {
   var delta = 10;
   var code = event.code;
   if (code == "KeyW") {
      camera.translateZ(-delta);
   } else if (code == "KeyS") {
      camera.translateZ(delta);
   } else if (code == "KeyA") {
      camera.translateX(-delta);
   } else if (code == "KeyD") {
      camera.translateX(delta);
   }
}

function initGUI() {
   //gui
   var gui = new GUI();
   gui.width = 300;

   gui.add(guiParams, "distanceToObj").name("Distance").listen();
   gui.add(guiParams, "PolarAngle").name("Polar Angle(deg)").listen();
   gui.add(guiParams, "AzimuthalAngle").name("Azimuthal Angle(deg)").listen();
   gui.add(guiParams, "enableRotate").onChange(() => {
      controls.autoRotate = guiParams.enableRotate;
   });
   gui.add(guiParams, "autoRotateSpeed", -30, 30).onChange(() => {
      controls.autoRotateSpeed = guiParams.autoRotateSpeed;
   });
   gui.add(camera.position, "y").name("Camera Pos Y").listen();
}

function createTrueViewObj(objIndex) {
   const IMG_PATH = "asset/TrueViewObj/" + IMG_NAMES[objIndex] + ".png";
   const tex = new THREE.TextureLoader().load(IMG_PATH, function (tex) {
      imgWidth = tex.image.width;
      imgHeight = tex.image.height;
      console.log("imgWidth = ", imgWidth, " imgHeight = ", imgHeight);
   });


   // targetObj
   const TrueViewGeometry = new THREE.PlaneGeometry(200, 150, 4, 4);
   const shader = new BasicNoLight();
   shader.uniforms.map.value = tex;

   shader.uniforms.mapRepeat.value = new THREE.Vector2(
      1 / NUMBER_OF_ROW,
      1 / NUMBER_OF_COLUMN
   );
   shader.uniforms.mapOffset.value = new THREE.Vector2(0, 0);

   const TrueViewMaterial = new THREE.ShaderMaterial({
      fragmentShader: shader.fragmentShader,
      vertexShader: shader.vertexShader,
      uniforms: shader.uniforms,
      transparent: true,
   });

   const targetObj = new THREE.Mesh(TrueViewGeometry, TrueViewMaterial);
   targetObj.position.y = 97;
   targetObj.renderOrder = 2;

   // base
   const baseGeometry = new THREE.CubeGeometry(70, 100, 70);
   const baseMaterial = new THREE.MeshBasicMaterial({
      map: baseMap,
      transparent: true,
   });
   const baseObj = new THREE.Mesh(baseGeometry, baseMaterial);
   baseObj.position.copy(BASE_POS[objIndex]);
   // baseObj.translateX((objIndex % 10) * -100);
   // baseObj.translateZ(Math.floor(objIndex / 10) * 150);
   baseObj.add(targetObj);
   baseObj.renderOrder = 1;

   scene.add(baseObj);

   const obj = new TrueViewObj(
      IMG_NAMES[objIndex],
      targetObj,
      shader,
      0,
      baseObj,
   );
   TrueViewObjAry.push(obj);
}

function rotateObj(objIndex) {
   const offsetX = TrueViewObjAry[objIndex].ImgIndex % NUMBER_OF_ROW;
   const offsetY =
      NUMBER_OF_COLUMN -
      1 -
      Math.floor(TrueViewObjAry[objIndex].ImgIndex / NUMBER_OF_ROW);

   TrueViewObjAry[objIndex].Shader.uniforms.mapOffset.value = new THREE.Vector2(
      offsetX / NUMBER_OF_ROW,
      offsetY / NUMBER_OF_COLUMN
   );
}

function isAngleChange(objIndex) {
   let AzimuthalAngle = guiParams.AzimuthalAngle;
   let tmpImgIndex = Math.floor(AzimuthalAngle / Math.ceil(360 / IMG_COUNT));

   if (tmpImgIndex == TrueViewObjAry[objIndex].ImgIndex) {
      return;
   } else {
      TrueViewObjAry[objIndex].ImgIndex = tmpImgIndex;
      rotateObj(objIndex);
   }
}

function onWindowResize() {
   camera.aspect = window.innerWidth / window.innerHeight;
   camera.updateProjectionMatrix();

   renderer.setSize(window.innerWidth, window.innerHeight);
}

//

function animate() {
   requestAnimationFrame(animate);

   renderer.render(scene, camera);
   stats.update();

   controls.update();

   //always face to camera
   for (let i = 0; i < testCount; i++) {
      // TrueViewObjAry[i].TargetObj.lookAt(camera.position);
      TrueViewObjAry[i].TargetObj.rotation.y = Math.atan2(
         camera.position.x - TrueViewObjAry[i].TargetObj.position.x,
         camera.position.z - TrueViewObjAry[i].TargetObj.position.z
         );
      isAngleChange(i);
   }

   //camera control gui
   guiParams.distanceToObj = camera.position.distanceTo(
      TrueViewObjAry[0].TargetObj.position
   );
   guiParams.PolarAngle = THREE.Math.radToDeg(controls.getPolarAngle());
   let azimuthaAngleDeg = THREE.Math.radToDeg(controls.getAzimuthalAngle());
   if (azimuthaAngleDeg < 0) azimuthaAngleDeg += 360;
   guiParams.AzimuthalAngle = azimuthaAngleDeg;
}
