import * as THREE from "three";

function MeshEditor(_camera, _controls) {
    let meshObj = null;
    let camera = _camera;
    let controls = _controls;
    const raycaster = new THREE.Raycaster();
    // raycaster.params.Points.threshold = 0.25;

    let verticesPoints = null;
    let wireframe = null;

    let mouse = new THREE.Vector2();
    let intersects = null;
    let isDragging = false;
    let currentIndex = null;
    let planePoint = new THREE.Vector3();
    let planeNormal = new THREE.Vector3();
    let plane = new THREE.Plane();

    
    function setTargetObj(Obj) {
        meshObj = Obj;
        createVerticesPoints();
        createWireframe();
        //when target object is set
        attachPointerEvent();
    }

    function updateGeometry() {
        meshObj.remove(verticesPoints);
        if (verticesPoints.geometry !== null) verticesPoints.geometry.dispose();
        if (verticesPoints.material !== null) verticesPoints.material.dispose();

        meshObj.remove(wireframe);
        if (wireframe.geometry !== null) wireframe.geometry.dispose();
        if (wireframe.material !== null) wireframe.material.dispose();

        createVerticesPoints();
        createWireframe();
    }

    function createVerticesPoints() {
        const verticesMat = new THREE.PointsMaterial({
            size: 10,
            color: "yellow",
        });
        verticesPoints = new THREE.Points(meshObj.geometry, verticesMat);
        verticesPoints.renderOrder = 4;

        meshObj.add(verticesPoints);
    }

    function createWireframe() {
        const wireframeMat = new THREE.MeshBasicMaterial({
            // transparent: true,
            wireframe: true,
            color: 0xff0000,
        });
        wireframe = new THREE.Mesh(meshObj.geometry, wireframeMat);
        wireframe.renderOrder = 3;

        meshObj.add(wireframe);
    }

    function onPointerDown(event) {
        setRaycaster(event);
        getIndex();
        isDragging = true;
    }

    function onPointerMove(event) {
        if (isDragging && currentIndex !== null) {
            setRaycaster(event);
            raycaster.ray.intersectPlane(plane, planePoint);
            meshObj.geometry.attributes.position.setXY(
                currentIndex,
                planePoint.x,
                planePoint.y
            );
            meshObj.geometry.attributes.position.needsUpdate = true;
        }
    }

    function onPointerUp(event) {
        isDragging = false;
        currentIndex = null;
        if (controls !== null) controls.enabled = true;
    }

    function getIndex() {
        intersects = raycaster.intersectObject(verticesPoints);
        if (intersects.length > 0) {
            if (controls !== null) controls.enabled = false;
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

    function attachPointerEvent() {
        document.addEventListener("pointerdown", onPointerDown, false);
        document.addEventListener("pointermove", onPointerMove, false);
        document.addEventListener("pointerup", onPointerUp, false);
    }

    function detachPointerEvent() {
        document.removeEventListener("pointerdown", onPointerDown, false);
        document.removeEventListener("pointermove", onPointerMove, false);
        document.removeEventListener("pointerup", onPointerUp, false);
    }

    this.detachPointerEvent = detachPointerEvent;
    this.updateGeometry = updateGeometry;
    this.setTargetObj = setTargetObj;
}

export default MeshEditor;
