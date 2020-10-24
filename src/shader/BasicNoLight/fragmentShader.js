export default `
varying mediump vec2 modeluv;
uniform sampler2D map;
uniform sampler2D map50;
uniform int deg;
uniform mediump vec2 mapRepeat;
uniform mediump vec2 mapOffset;

void main() {
  if(deg == 50){

    gl_FragColor =  texture2D(map50, modeluv*mapRepeat+mapOffset);
  }else{

    gl_FragColor =  texture2D(map, modeluv*mapRepeat+mapOffset);
  }
}
`;
