export default `
varying mediump vec2 modeluv;
uniform sampler2D map;
uniform mediump vec2 mapRepeat;
uniform mediump vec2 mapOffset;

void main() {

     gl_FragColor =  texture2D(map, modeluv*mapRepeat+mapOffset);
}
`;
