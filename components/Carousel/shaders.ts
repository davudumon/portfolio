export const vertexShader = `
uniform float uW;
uniform float uR;
uniform float uK;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec3 p = position;
  float x = p.x * uW;
  float a = x / uR;
  p.x = mix(x, uR * sin(a), uK) / uW;
  p.z = uR * (cos(a) - 1.0) * uK;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;

export const fragmentShader = `
uniform sampler2D uMap;
uniform sampler2D uMap2;
uniform float uDim;
uniform float uAlpha;
uniform float uGx;
uniform float uGl;
uniform float uMix;
varying vec2 vUv;
void main() {
  vec4 c = mix(texture2D(uMap, vUv), texture2D(uMap2, vUv), uMix);
  float s = exp(-pow((vUv.x + vUv.y * 0.35 - uGx) / 0.13, 2.0)) * uGl;
  c.rgb = c.rgb * (1.0 - uDim) + vec3(s) + vec3(0.07) * (1.0 - vUv.y);
  gl_FragColor = vec4(c.rgb, uAlpha);
}`;
