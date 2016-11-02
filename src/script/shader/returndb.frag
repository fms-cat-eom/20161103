#extension GL_EXT_draw_buffers : require
precision highp float;

uniform vec2 resolution;
uniform sampler2D texture0;
uniform sampler2D texture1;
uniform sampler2D texture2;
uniform sampler2D texture3;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  gl_FragData[ 0 ] = texture2D( texture0, uv );
  gl_FragData[ 1 ] = texture2D( texture1, uv );
  gl_FragData[ 2 ] = texture2D( texture2, uv );
  gl_FragData[ 3 ] = texture2D( texture3, uv );
}
