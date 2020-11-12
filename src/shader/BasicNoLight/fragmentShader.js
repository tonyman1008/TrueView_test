export default `
varying mediump vec2 modeluv;
uniform sampler2D map;
uniform mediump vec2 mapRepeat;
uniform mediump vec2 mapOffset;
uniform mediump vec2 mapOffset2;
uniform float interpVal;

void main() {
     vec4 color1 = texture2D(map, modeluv*mapRepeat+mapOffset);
     vec4 color2 = texture2D(map, modeluv*mapRepeat+mapOffset2);
     gl_FragColor =  color1*(1.0-interpVal) + color2*interpVal;
}
`;
