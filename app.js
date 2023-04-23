import './main.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import fragment from './shaders/fragment.glsl.js';
import vertex from './shaders/vertex.glsl.js';
import GUI from 'lil-gui';
import texture from './images/healthbar.png';

export default class Sketch {
  constructor() {
    this.scene = new THREE.Scene();
    this.container = document.getElementById('container');
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x111111, 1);
    this.renderer.useLegacyLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );

    // const frustrumSize = 0.75;
    // const aspect = this.width / this.height;
    // this.camera = new THREE.OrthographicCamera(
    //   (frustrumSize * aspect) / -2,
    //   (frustrumSize * aspect) / 2,
    //   frustrumSize / 2,
    //   frustrumSize / -2,
    //   -1000,
    //   1000
    // );

    this.camera.position.set(0, 0, 2);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.time = 0;

    this.addMesh();
    this.setupResize();
    this.resize();
    this.settings();
    this.render();
  }

  setupResize() {
    window.addEventListener('resize', this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;

    // image cover
    this.imageAspect = 853 / 1280;
    let a1;
    let a2;
    if (this.height / this.width > this.imageAspect) {
      a1 = (this.width / this.height) * this.imageAspect;
      a2 = 1;
    } else {
      a1 = 1;
      a2 = this.height / this.width / this.imageAspect;
    }

    this.material.uniforms.uResolution.value.x = this.width;
    this.material.uniforms.uResolution.value.y = this.height;
    this.material.uniforms.uResolution.value.z = a1;
    this.material.uniforms.uResolution.value.w = a2;

    // optional - cover with quad
    const distance = this.camera.position.z;
    const height = 1;
    this.camera.fov = 2 * (180 / Math.PI) * Math.atan(height / (2 * distance));

    // if (w/h > 1)
    // if (this.width / this.height > 1) {
    //   this.plane.scale.x = this.camera.aspect;
    // } else {
    //   this.plane.scale.y = 1 / this.camera.aspect;
    // }

    this.camera.updateProjectionMatrix();
  }

  addMesh() {
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: '#extension GL_OES_standard_derivatives : enable',
      },
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector4() },
        uHealth: { value: 0 },
        uColorA: { value: new THREE.Vector3(1, 0, 0) },
        uColorB: { value: new THREE.Vector3(0, 1, 0) },
        uColorStart: { value: 0 },
        uColorEnd: { value: 0 },
        uTexture: { value: new THREE.TextureLoader().load(texture) },
      },
      fragmentShader: fragment,
      vertexShader: vertex,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
      depthTest: true,
    });
    this.geometry = new THREE.PlaneGeometry(1, 0.125, 10, 10);

    this.plane = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.plane);

    // Bk object
    this.material1 = new THREE.MeshStandardMaterial();
    this.geometry1 = new THREE.PlaneGeometry(1, 1, 10, 10);

    this.test = new THREE.Mesh(this.geometry1, this.material1);
    this.test.position.z = -0.1;
    this.scene.add(this.test);
  }

  settings() {
    this.settings = {
      health: 1,
      start: 0.2,
      end: 0.8,
    };
    this.gui = new GUI();
    this.gui.add(this.settings, 'health', 0, 1, 0.01);
    this.gui.add(this.settings, 'start', 0, 1, 0.1);
    this.gui.add(this.settings, 'end', 0, 1, 0.1);
  }

  render() {
    this.time += 0.05;
    this.material.uniforms.uTime.value = this.time;
    this.material.uniforms.uHealth.value = this.settings.health;
    this.material.uniforms.uColorStart.value = this.settings.start;
    this.material.uniforms.uColorEnd.value = this.settings.end;

    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.render.bind(this));
  }
}

new Sketch();
