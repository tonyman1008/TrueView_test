import * as THREE from "../node_modules/three/build/three.module.js";
import Stats from "../node_modules/three/examples/jsm/libs/stats.module.js";
import { OrbitControls } from "../node_modules/three/examples/jsm/controls/OrbitControls.js";

var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;

var container, stats;
var camera, scene, renderer;

const IMG_COUNT = 30;
const NUMBER_OF_ROW = 5;
const NUMBER_OF_COLUMN = 6;
const SINGLE_IMG_WIDTH = 800;
const SINGLE_IMG_HEIGHT = 600;
const IMG_NAME = "butterfly30";
const IMG_PATH = "img/" + IMG_NAME + ".png";
var targetObj;
var tex;

var imgIndex = 0;
var imgHeight = 0;
var imgWidth = 0;

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
  camera.position.set(700, 200, -500);

  // SCENE

  scene = new THREE.Scene();

  // LIGHTS

  var light = new THREE.DirectionalLight(0xaabbff, 1);
  light.position.set(-10, 20, 20);
  scene.add(light);

  // SKYBOX;
  let materialArray = [];
  let texture_ft = new THREE.TextureLoader().load("./img/skybox/space/ft.jpg");
  let texture_bk = new THREE.TextureLoader().load("./img/skybox/space/bk.jpg");
  let texture_up = new THREE.TextureLoader().load("./img/skybox/space/up.jpg");
  let texture_dn = new THREE.TextureLoader().load("./img/skybox/space/dn.jpg");
  let texture_rt = new THREE.TextureLoader().load("./img/skybox/space/rt.jpg");
  let texture_lf = new THREE.TextureLoader().load("./img/skybox/space/lf.jpg");

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

  var controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.target.set(0, 275, 0);
  //lock y asix
  controls.minPolarAngle = Math.PI / 2;
  controls.maxPolarAngle = Math.PI / 2;
  controls.update();

  // STATS

  stats = new Stats();
  container.appendChild(stats.dom);

  // MODEL

  var loader = new THREE.ObjectLoader();
  loader.load(
    "./models/json/lightmap/lightmap.json",
    function (object) {
      scene.add(object);
    }
  );

  //init object
  initObj();

  window.addEventListener("resize", onWindowResize, false);
}

function initObj() {

  tex = new THREE.TextureLoader().load(IMG_PATH, function (tex) {
    imgWidth = tex.image.width;
    imgHeight = tex.image.height;
    tex.repeat.x = SINGLE_IMG_WIDTH / imgWidth;
    tex.repeat.y = SINGLE_IMG_HEIGHT / imgHeight;
    console.log("imgWidth = ", imgWidth, " imgHeight = ", tex.image.height);
  });

  // targetObj
  var geometry = new THREE.PlaneGeometry(200, 150, 4, 4);
  const offsetY = NUMBER_OF_ROW - Math.floor(imgIndex / NUMBER_OF_ROW);
  tex.offset.x = 0;
  tex.offset.y = offsetY / NUMBER_OF_ROW;

  var material = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
  });
  targetObj = new THREE.Mesh(geometry, material);
  targetObj.position.y = 275;
  scene.add(targetObj);
}

function rotateObj() {

  const offsetX = imgIndex % NUMBER_OF_ROW;
  const offsetY = NUMBER_OF_COLUMN - 1 - Math.floor(imgIndex / NUMBER_OF_ROW);

  tex.offset.x = offsetX / NUMBER_OF_ROW;
  tex.offset.y = offsetY / NUMBER_OF_COLUMN;
  console.log("imgIndex =", imgIndex);
  console.log("offsetX =", tex.offset.x, "offsetY =", tex.offset.y)

  targetObj.material.map = tex;
  targetObj.material.needsUpdate = true;
}

function isAngleChange() {

  let angle = THREE.Math.radToDeg(targetObj.rotation.y) % 360;
  if (angle < 0) angle += 360;
  let tmpImgIndex = Math.floor(angle / Math.ceil(360 / IMG_COUNT));
  if (tmpImgIndex == imgIndex) {
    return;
  } else {
    imgIndex = tmpImgIndex;
    rotateObj();
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

  //always face to camera
  // mesh.lookAt(camera.position);
  targetObj.rotation.y = Math.atan2(
    camera.position.x - targetObj.position.x,
    camera.position.z - targetObj.position.z
  );

  isAngleChange();
}
