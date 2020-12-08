import Delaunator from "delaunator";
import * as THREE from "three";

// function getMeshCoords(planePoints, faceLandMarksPoints) {
//   const points = [];

//   for (let i = 0; i < faceLandMarksPoints.length; i += 3) {
//     points.push([faceLandMarksPoints[i], faceLandMarksPoints[i + 1]]);
//   }
//   const result = Delaunator.from(points);
//   console.log(result);

//   const coords3d = coords2d3d(result.coords);
//   return coords3d;
// }

function coords2d3d(coords) {
  const coords3d = [];
  for (let i = 0; i < coords.length; i += 2) {
    coords3d.push(coords[i], coords[i + 1], 0);
  }
  return coords3d;
}

function getGeometry(faceLandMarksPoints, width, height) {
  const points3d = [];
  points3d.push(new THREE.Vector3(-width / 2, height / 2, 0));
  points3d.push(new THREE.Vector3(width / 2, height / 2, 0));
  points3d.push(new THREE.Vector3(width / 2, -height / 2, 0));
  points3d.push(new THREE.Vector3(-width / 2, -height / 2, 0));

  for (let i = 0; i < faceLandMarksPoints.length; i += 3) {
    points3d.push(
      new THREE.Vector3(faceLandMarksPoints[i], faceLandMarksPoints[i + 1], 0)
    );
  }
  const result = Delaunator.from(
    points3d.map((v) => {
      return [v.x, v.y];
    })
  );
  const meshIndex = [];
  const triangles = result.triangles;
  for (let i = 0; i < triangles.length; i++) {
    meshIndex.push(triangles[i]);
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points3d);

  geometry.setIndex(meshIndex);
  geometry.computeVertexNormals();
  getUV(geometry);
  return geometry;
}

function getUV(geometry) {
  geometry.computeBoundingBox();
  const { min, max } = geometry.boundingBox;
  const position = geometry.attributes["position"].array;
  const uv = [];
  for (let i = 0; i < position.length; i += 3) {
    const u = (position[i] + max.x) / (max.x - min.x);
    const v = (position[i + 1] + max.y) / (max.y - min.y);
    uv.push(u, v);
  }
  geometry.setAttribute(
    "uv",
    new THREE.BufferAttribute(Float32Array.from(uv), 2)
  );
}
export { getGeometry };