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
  if(deg == 50){

    gl_FragColor =  texture2D(map50, modeluv*mapRepeat+mapOffset);
  } else if(deg == 60){
    gl_FragColor =  texture2D(map60, modeluv*mapRepeat+mapOffset);
  
  }else if(deg == 70){
    gl_FragColor =  texture2D(map70, modeluv*mapRepeat+mapOffset);
  
  }else if(deg == 35){
    gl_FragColor =  texture2D(map35, modeluv*mapRepeat+mapOffset);
  
  }
  else{ 
     gl_FragColor =  texture2D(map, modeluv*mapRepeat+mapOffset);
  }
}
`;
