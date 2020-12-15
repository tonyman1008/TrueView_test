import * as THREE from "three";

function Warp(srcObj, tgtObj) {
    const srcVertices = srcObj.geometry.getAttribute("position").array;
    const tgtVertices = tgtObj.geometry.getAttribute("position").array;

    for (let i = 12; i < srcVertices.length; i += 3) {
        const newVertexPos = new THREE.Vector3();
        newVertexPos.set(
            (srcVertices[i] + tgtVertices[i]) / 2,
            (srcVertices[i + 1] + tgtVertices[i + 1]) / 2,
            (srcVertices[i + 2] + tgtVertices[i + 2]) / 2
        );
        
        srcObj.geometry.attributes.position.setXY(i,newVertexPos.x,newVertexPos.y)
    }
}

export { Warp };
