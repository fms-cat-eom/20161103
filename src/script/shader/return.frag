precision highp float;

uniform vec2 resolution;
uniform sampler2D texture;
uniform bool hoge;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  gl_FragColor = texture2D( texture, uv );
}
