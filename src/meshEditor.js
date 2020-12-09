import * as THREE from "three";

function MeshEditor(_verticesPoints,_meshObj,camera,controls) {

    const verticesPoints = _verticesPoints;
    const meshObj = _meshObj;
    const raycaster = new THREE.Raycaster();
    // raycaster.params.Points.threshold = 0.25;

    let mouse = new THREE.Vector2();
    let intersects = null;
    let isDragging = false;
    let currentIndex = null;
    let planePoint = new THREE.Vector3();
    let planeNormal = new THREE.Vector3();
    let plane = new THREE.Plane();

    init();

    function init(){
        attach();
    };

    function onPointerDown(event) {
        setRaycaster(event);
        getIndex();
        isDragging = true;
    }

    function onPointerMove(event) {
        if (isDragging && currentIndex !== null) {
            setRaycaster(event);
            raycaster.ray.intersectPlane(plane, planePoint);
            _meshObj.geometry.attributes.position.setXY(
                currentIndex,
                planePoint.x,
                planePoint.y
            );
            _meshObj.geometry.attributes.position.needsUpdate = true;
        }
    }

    function onPointerUp(event) {
        isDragging = false;
        currentIndex = null;
        controls.enabled = true;
    }

    function getIndex() {
        intersects = raycaster.intersectObject(verticesPoints);
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

    function attach(){
        document.addEventListener("pointerdown", onPointerDown, false);
        document.addEventListener("pointermove", onPointerMove, false);
        document.addEventListener("pointerup", onPointerUp, false);
    }
    
    function detach(){
        document.removeEventListener("pointerdown", onPointerDown, false);
        document.removeEventListener("pointermove", onPointerMove, false);
        document.removeEventListener("pointerup", onPointerUp, false);
    }

    this.detach = detach;
}

export default MeshEditor;