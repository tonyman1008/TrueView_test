export default `
varying mediump vec2 modeluv;
uniform sampler2D map;
uniform sampler2D map50;
uniform sampler2D map60;
uniform sampler2D map70;
uniform sampler2D map35;
uniform int deg;
uniform mediump vec2 mapRepeat;
uniform mediump vec2 mapOffset;

void main() {

     gl_FragColor =  texture2D(map, modeluv*mapRepeat+mapOffset);
}
`;
