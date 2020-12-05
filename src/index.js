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
    BaseObj
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

const baseImg = "assets/materials/base.jpg";
const baseMap = new THREE.TextureLoader().load(baseImg);
const groundImg = "assets/materials/ground.jpg";

var guiParams = {
    distanceToObj: 0,
    PolarAngle: 0,
    AzimuthalAngle: 0,
    position: 0,
    enableRotate: true,
    autoRotateSpeed: 2,
};

const raycaster = new THREE.Raycaster();
// raycaster.params.Points.threshold = 0.25;
var mouse = new THREE.Vector2();
var intersects = null;
var isDragging = false;
var currentIndex = null;
var planePoint = new THREE.Vector3();
var planeNormal = new THREE.Vector3();
var testObj = null;
var points = null;

createScene();
animate();

var plane = new THREE.Plane();

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
    camera.position.set(0, 247, 500);

    // SCENE

    scene = new THREE.Scene();

    // LIGHTS

    var light = new THREE.DirectionalLight(0xaabbff, 1);
    light.position.set(-10, 20, 20);
    scene.add(light);

   // SKYBOX;
   let materialArray = [];
   let texture_ft = new THREE.TextureLoader().load(
      "./assets/skybox/space/ft.jpg"
   );
   let texture_bk = new THREE.TextureLoader().load(
      "./assets/skybox/space/bk.jpg"
   );
   let texture_up = new THREE.TextureLoader().load(
      "./assets/skybox/space/up.jpg"
   );
   let texture_dn = new THREE.TextureLoader().load(
      "./assets/skybox/space/dn.jpg"
   );
   let texture_rt = new THREE.TextureLoader().load(
      "./assets/skybox/space/rt.jpg"
   );
   let texture_lf = new THREE.TextureLoader().load(
      "./assets/skybox/space/lf.jpg"
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
    // controls.minPolarAngle = Math.PI / 2;
    // controls.maxPolarAngle = Math.PI / 2;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 2;

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

    document.addEventListener("pointerdown", onPointerDown, false);
    document.addEventListener("pointermove", onPointerMove, false);
    document.addEventListener("pointerup", onPointerUp, false);

    initGUI();

    // //init object
    // for (let i = 0; i < testCount; i++) {
    //    createTrueViewObj(i);
    // }
    createWarpObj();
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

function onPointerDown(event) {
    setRaycaster(event);
    getIndex();
    isDragging = true;
}

function onPointerMove(event) {
    if (isDragging && currentIndex !== null) {
       console.log("move")
        setRaycaster(event);
        raycaster.ray.intersectPlane(plane, planePoint);
        console.log(planePoint);
        testObj.geometry.attributes.position.setXY(
            currentIndex,
            planePoint.x,
            planePoint.y,
        );
        testObj.geometry.attributes.position.needsUpdate = true;
    }
}

function onPointerUp(event) {
    isDragging = false;
    currentIndex = null;
    controls.enabled = true;
}

function getIndex() {
    intersects = raycaster.intersectObject(points);
    console.log(intersects);
    if (intersects.length > 0) {
        controls.enabled = false;
    } else {
        currentIndex = null;
        return;
    }
    currentIndex = intersects[0].index;
    setPlane(intersects[0].point);
}

function setPlane(point) {
    planeNormal.subVectors(camera.position, point).normalize();
    plane.setFromNormalAndCoplanarPoint(planeNormal, point);
}

function setRaycaster(event) {
    getMouse(event);
    raycaster.setFromCamera(mouse, camera);
}

function getMouse(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

// test warping
function createWarpObj() {
    const testImgPath = "assets/TrueViewObj/dragon_noLight02.png";
    const testGeo = new THREE.PlaneBufferGeometry(200, 150, 10, 10);
    const testTex = new THREE.TextureLoader().load(testImgPath);
    const testMat = new THREE.MeshBasicMaterial({
        map: testTex,
        transparent: true,
        //   wireframe: true,
    });
    testObj = new THREE.Mesh(testGeo, testMat);
    testObj.position.y = 200;
    scene.add(testObj);
    testObj.renderOrder = 2;
    //   testObj.geometry.vertices[120].x += 30

    console.log(testObj.geometry);

    // add mesh edge line
    let wireframe = new THREE.WireframeGeometry(testObj.geometry);
    let line = new THREE.LineSegments(wireframe);
    line.material.color.setHex(0xff0000);
    testObj.add(line);

    // add point
    points = new THREE.Points(
        testObj.geometry,
        new THREE.PointsMaterial({
            size: 3,
            color: "yellow",
        })
    );
    testObj.add(points);
}

function createTrueViewObj(objIndex) {
   const IMG_PATH = "assets/TrueViewObj/" + IMG_NAMES[objIndex] + ".png";
   const tex = new THREE.TextureLoader().load(IMG_PATH, function (tex) {
      imgWidth = tex.image.width;
      imgHeight = tex.image.height;
      console.log("imgWidth = ", imgWidth, " imgHeight = ", imgHeight);
   });

    // targetObj
    const TrueViewGeometry = new THREE.PlaneBufferGeometry(200, 150, 4, 4);
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
        baseObj
    );
    TrueViewObjAry.push(obj);
}

function rotateObj(objIndex) {
    const offsetX = TrueViewObjAry[objIndex].ImgIndex % NUMBER_OF_ROW;
    const offsetY =
        NUMBER_OF_COLUMN -
        1 -
        Math.floor(TrueViewObjAry[objIndex].ImgIndex / NUMBER_OF_ROW);

    TrueViewObjAry[
        objIndex
    ].Shader.uniforms.mapOffset.value = new THREE.Vector2(
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
    if (TrueViewObjAry.length != 0) {
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
        let azimuthaAngleDeg = THREE.Math.radToDeg(
            controls.getAzimuthalAngle()
        );
        if (azimuthaAngleDeg < 0) azimuthaAngleDeg += 360;
        guiParams.AzimuthalAngle = azimuthaAngleDeg;
    }
}
