export default `
varying mediump vec2 modeluv;

void main() {
  modeluv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
