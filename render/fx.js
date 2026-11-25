// Post-processing and effects (owner asked for better design/effects, 2026-11-24). Opt-in per episode: "fx": { bloom, vignette, grain, aberration, sat, contrast, tint, sparkles }.
// Uses three's own addons (no extra install): glow (bloom), vignette, film grain, a touch of chromatic aberration and colour grade, plus floating sparkles.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

const GradeShader = {
  uniforms: { tDiffuse: { value: null }, time: { value: 0 }, vig: { value: 0.35 }, grain: { value: 0.05 }, ab: { value: 0.0012 }, sat: { value: 1.08 }, con: { value: 1.06 }, tint: { value: new THREE.Vector3(1, 1, 1) } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float time, vig, grain, ab, sat, con; uniform vec3 tint; varying vec2 vUv;
    float rnd(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + time * 7.13) * 43758.5453); }
    void main(){
      vec2 c = vUv - 0.5; float r = dot(c, c);
      vec3 col = vec3(texture2D(tDiffuse, vUv + c * ab * 8.0 * r).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - c * ab * 8.0 * r).b);
      float l = dot(col, vec3(0.2126, 0.7152, 0.0722)); col = mix(vec3(l), col, sat);
      col = (col - 0.5) * con + 0.5; col *= tint;
      col *= 1.0 - vig * smoothstep(0.12, 0.62, r * 2.0);
      col += (rnd(vUv * 1000.0) - 0.5) * grain;
      gl_FragColor = vec4(col, 1.0);
    }`,
};

export function setupFx(renderer, scene, camera, W, H, o = {}) {
  // 2026-11-24 owner: recent videos looked blurry and dim -> 4x MSAA render target (clean edges); grain, colour fringe, vignette and glow are OFF.
  const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(W, H, { samples: 4, type: THREE.HalfFloatType }));
  composer.setPixelRatio(1); composer.setSize(W, H);
  composer.addPass(new RenderPass(scene, camera));
  if (o.bloom !== 0 && o.allowGlow) composer.addPass(new UnrealBloomPass(new THREE.Vector2(W, H), o.bloom ?? 0.32, 0.55, o.bloomThreshold ?? 0.88));
  composer.addPass(new OutputPass());
  const grade = new ShaderPass(GradeShader);
  const u = grade.uniforms;
  u.vig.value = 0; u.grain.value = 0; u.ab.value = 0; u.sat.value = o.sat ?? 1.08; u.con.value = o.contrast ?? 1.05;   // owner 2026-11-24: no vignette / grain / fringe
  if (o.tint) u.tint.value.set(...o.tint);
  composer.addPass(grade);

  // floating sparkles that live in front of the camera (dust, luck glitter, fireflies); a negative speed makes them fall (snow)
  let pts = null, base = null;
  if (o.sparkles) {
    const n = o.sparkles.count ?? 140; const g = new THREE.BufferGeometry(); base = new Float32Array(n * 3); const pos = new Float32Array(n * 3);
    let s = 9; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < n; i++) { base[i * 3] = (r() - 0.5) * 16; base[i * 3 + 1] = (r() - 0.5) * 22; base[i * 3 + 2] = -(6 + r() * 26); }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const tex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
    pts = new THREE.Points(g, new THREE.PointsMaterial({ color: o.sparkles.color ?? '#fff3b0', size: o.sparkles.size ?? 0.55, map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.85, fog: false }));
    pts.frustumCulled = false; camera.add(pts); scene.add(camera);
  }
  return {
    composer,
    update(t) {
      u.time.value = t;
      if (pts) { const p = pts.geometry.attributes.position.array, n = base.length / 3, sp = o.sparkles.speed ?? 0.5;
        for (let i = 0; i < n; i++) { p[i * 3] = base[i * 3] + Math.sin(t * 0.6 + i) * 0.4; p[i * 3 + 1] = ((((base[i * 3 + 1] + t * sp * (0.4 + (i % 5) * 0.15) + 11) % 22) + 22) % 22) - 11; p[i * 3 + 2] = base[i * 3 + 2]; }
        pts.geometry.attributes.position.needsUpdate = true; pts.material.opacity = 0.55 + 0.3 * Math.sin(t * 2.2); }
    },
  };
}
