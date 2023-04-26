const fragmentShader = /* glsl */ `
    varying vec2 vUv;

    uniform float uTime;
    uniform float uHealth;
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform float uColorStart;
    uniform float uColorEnd;
    uniform sampler2D uTexture;
    uniform float uBorderSize;

    float InverseLerp( float a, float b, float v) {
        return (v-a)/(b-a);
    }

    void main() {
        // 1a)
        // How i did it
        // float healthbar = clamp(0., 1., vUv.x);
        // healthbar = 1. - step(uHealth, t);

        // Better way
        float healthbarMask = float(uHealth > vUv.x);

        vec3 color = mix( uColorA, uColorB, uHealth);

        // vec3 bgColor = vec3(0.);

        // 1b)
        // t = threshold
        float tHealthColor = clamp(InverseLerp(uColorStart, uColorEnd, uHealth), 0., 1.);

        color = mix( uColorA, uColorB, tHealthColor);
       
        // 1c) Blending

        // 1d)
        vec4 tex = texture2D(uTexture, vec2(uHealth, vUv.y));
        vec3 texColor = tex.xyz;

        // 1e)

        if (uHealth <= uColorStart) {
            float flash = cos(uTime * 1.7) * 0.4 + 1.;

            color *= flash;
            texColor *= flash;
        }

        // Rounded corners
        vec2 coords = vUv;
        coords.x *= 8.;

        vec2 pointOnLineSeg = vec2(clamp(coords.x, 0.5, 7.5), 0.5);

        float sdf = distance(coords, pointOnLineSeg) * 2. - 1.;

        if ( -sdf < 0.001) discard;

        // Border
        float borderSdf = sdf + uBorderSize;

        float pd = fwidth(borderSdf); // screen space partial derivative

        float borderMask = 1. - clamp(borderSdf / pd, 0., 1.);

        // Output
        vec4 finalOut = vec4(texColor * healthbarMask * borderMask, 1.);
        gl_FragColor = finalOut;
        // vec3 finalOut = mix(bgColor, color, healthbarMask);
        // gl_FragColor = vec4( finalOut, opacity);
        // gl_FragColor = vec4( vec3(t), 1.);
        // gl_FragColor = vec4( vec3(test), 1.);
        // gl_FragColor = tex;
        // gl_FragColor = vec4(vec3(borderMask), 1.);

    }
`;

export default fragmentShader;

// test = clamp(uHealth, 0., 1.);

// test = fract(test);

// float t = InverseLerp(uColorStart, uColorEnd, vUv.x);

// t = clamp(t, 0., uHealth);

// t = fract(t);
