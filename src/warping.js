import * as THREE from "three";

function Warp(srcObj,srcVertices,tgtVertices,ratio) {
    // const srcVertices = srcObj.geometry.getAttribute("position").array;
    // const tgtVertices = tgtObj.geometry.getAttribute("position").array;
    // const srcPos = new THREE.Vector3();
    // const tgtPos = new THREE.Vector3();
    // srcObj.getWorldPosition(srcPos);
    // tgtObj.getWorldPosition(tgtPos);
    console.log("warping")
    for (let i = 12; i < srcVertices.length; i += 3) {
        // console.log(srcVertices[i] * 4 + 400);
        // console.log(300 - srcVertices[i + 1] * 4);
        // console.log("tgt= ", tgtVertices[i] * 4 + 400);
        // console.log("tgt= ", 300 - tgtVertices[i + 1] * 4);
        
        let newVertexPos = new THREE.Vector3();
        newVertexPos.set(
            srcVertices[i]+ ratio*(tgtVertices[i]-srcVertices[i]),
            srcVertices[i+1]+ ratio*(tgtVertices[i+1]-srcVertices[i+1]),
            srcVertices[i+2]+ ratio*(tgtVertices[i+2]-srcVertices[i+2])
        );
        srcObj.geometry.attributes.position.array[i] = newVertexPos.x
        srcObj.geometry.attributes.position.array[i+1] = newVertexPos.y
        srcObj.geometry.attributes.position.array[i+2] = newVertexPos.z

        srcObj.geometry.attributes.position.needsUpdate = true;
    }
}

export { Warp };
