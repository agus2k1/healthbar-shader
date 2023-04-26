const fragmentShader = /* glsl */ `
    varying vec2 vUv;

    uniform float uTime;

    void main() {
        // centered
        vec2 cvUv = vUv * 2. - 1.;

        float dist = length(cvUv) - 0.3;
        
        gl_FragColor = vec4(vec3(dist), 1.);
        // gl_FragColor = vec4(vec3(step(0., dist)), 1.);
    }
`;

export default fragmentShader;
