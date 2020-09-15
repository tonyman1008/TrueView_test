import * as THREE from "../node_modules/three/build/three.module.js";
import Stats from "../node_modules/three/examples/jsm/libs/stats.module.js";

import { OrbitControls } from "../node_modules/three/examples/jsm/controls/OrbitControls.js";

var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;

var container, stats;
var camera, scene, renderer;

var targetObj;
var imgCount = 30;
var imgOffset = 0;
var imgHeight = 3612;
var tex = new THREE.TextureLoader().load("img/texture.png");

init();
animate();

function init() {
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
  // renderer.outputEncoding = THREE.sRGBEncoding;

  // CONTROLS

  var controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.target.set(0, 275, 0);
  //lock y asix
  controls.minPolarAngle = Math.PI / 2;
  controls.maxPolarAngle = Math.PI / 2;
  controls.update();
  //keyboard control
  // controls.enableKeys = true;

  // STATS

  stats = new Stats();
  container.appendChild(stats.dom);

  // MODEL

  var loader = new THREE.ObjectLoader();
  loader.load(
    "./node_modules/three/examples/models/json/lightmap/lightmap.json",
    function (object) {
      scene.add(object);
    }
  );

  // targetObj
  var geometry = new THREE.PlaneGeometry(200, 150, 4, 4);
  tex.repeat.x = 800 / 4010;
  tex.repeat.y = 600 / imgHeight;
  // tex.offset.x = (0 / 4010) * tex.repeat.x;
  // tex.offset.y = ((imgOffset * 600) / 3612) * tex.repeat.y;

  var material = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
  });
  console.log(material);
  targetObj = new THREE.Mesh(geometry, material);
  targetObj.position.y = 275;
  scene.add(targetObj);

  window.addEventListener("resize", onWindowResize, false);
}

function rotateObj(img_w, img_h, single_img_w, single_img_h) {
  if (imgOffset >= imgCount) {
    imgOffset = 0;
  }

  tex.repeat.x = single_img_w / img_w;
  tex.repeat.y = single_img_h / img_h;
  const offsetX = imgOffset % 5;
  const offsetY = 5 - Math.floor(imgOffset / 5);
  tex.offset.x = offsetX / 5;
  tex.offset.y = offsetY / 6;

  targetObj.material.map = tex;
  targetObj.material.needsUpdate = true;
}

function isAngleChange() {
  let angle = THREE.MathUtils.radToDeg(targetObj.rotation.y) % 360;
  if (angle < 0) angle += 360;
  let tmpImgOffset = Math.floor(angle / Math.ceil(360 / imgCount));

  // console.log(tmpImgOffset);
  // console.log("mod", tmpImgOffset % 3);
  if (tmpImgOffset == imgOffset) {
    return;
  } else {
    imgOffset = tmpImgOffset;
    rotateObj(4010, 3612, 800, 600);
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
