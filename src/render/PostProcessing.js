/**
 * 后处理效果系统
 * 实现动态模糊、Bloom泛光、色差、暗角、颜色分级
 */
export class PostProcessing {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;

    // 后处理参数
    this.enabled = true;
    this.bloomStrength = 0.3;
    this.bloomRadius = 0.5;
    this.vignetteStrength = 0.4;
    this.chromaticAberration = 0.002;
    this.saturation = 0.85;
    this.contrast = 1.1;

    // 渲染目标
    this.renderTargets = [];
    this.composer = null;

    // 着色器材质
    this.quad = null;
    this.orthoCamera = null;
    this.orthoScene = null;
  }

  /**
   * 初始化后处理
   */
  init() {
    // 创建正交相机用于全屏四边形
    this.orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.orthoScene = new THREE.Scene();

    // 创建全屏四边形
    const geometry = new THREE.PlaneGeometry(2, 2);
    this.quad = new THREE.Mesh(geometry, this.createCompositeMaterial());
    this.orthoScene.add(this.quad);

    // 创建渲染目标
    const size = this.renderer.getSize(new THREE.Vector2());
    this.renderTarget = new THREE.WebGLRenderTarget(size.x, size.y, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType
    });

    this.bloomTarget = new THREE.WebGLRenderTarget(size.x / 2, size.y / 2, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType
    });

    // Bloom提取材质
    this.bloomMaterial = this.createBloomMaterial();
    this.bloomQuad = new THREE.Mesh(geometry.clone(), this.bloomMaterial);
    this.bloomScene = new THREE.Scene();
    this.bloomScene.add(this.bloomQuad);

    console.log('PostProcessing initialized');
  }

  /**
   * 创建合成材质
   */
  createCompositeMaterial() {
    return new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        tBloom: { value: null },
        uVignette: { value: this.vignetteStrength },
        uChromatic: { value: this.chromaticAberration },
        uSaturation: { value: this.saturation },
        uContrast: { value: this.contrast },
        uTime: { value: 0 },
        uMotionBlur: { value: 0.0 },
        uPrevModelViewProjection: { value: new THREE.Matrix4() }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform sampler2D tBloom;
        uniform float uVignette;
        uniform float uChromatic;
        uniform float uSaturation;
        uniform float uContrast;
        uniform float uTime;

        varying vec2 vUv;

        // 随机函数
        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }

        void main() {
          vec2 uv = vUv;

          // 色差效果 (Chromatic Aberration)
          float aberration = uChromatic;
          vec2 dir = uv - vec2(0.5);
          float dist = length(dir);

          float r = texture2D(tDiffuse, uv + dir * aberration * dist).r;
          float g = texture2D(tDiffuse, uv).g;
          float b = texture2D(tDiffuse, uv - dir * aberration * dist).b;

          vec4 color = vec4(r, g, b, 1.0);

          // 添加Bloom
          vec4 bloom = texture2D(tBloom, uv);
          color.rgb += bloom.rgb * 0.5;

          // 颜色分级 - 对比度
          color.rgb = (color.rgb - 0.5) * uContrast + 0.5;

          // 颜色分级 - 饱和度
          float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
          color.rgb = mix(vec3(gray), color.rgb, uSaturation);

          // 暗角效果 (Vignette)
          float vignette = 1.0 - smoothstep(0.4, 1.0, dist) * uVignette;
          color.rgb *= vignette;

          // 轻微的胶片颗粒
          float grain = (random(uv + uTime) - 0.5) * 0.02;
          color.rgb += grain;

          gl_FragColor = color;
        }
      `
    });
  }

  /**
   * 创建Bloom材质
   */
  createBloomMaterial() {
    return new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        uThreshold: { value: 0.8 },
        uBloomStrength: { value: this.bloomStrength }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float uThreshold;
        uniform float uBloomStrength;

        varying vec2 vUv;

        void main() {
          vec4 color = texture2D(tDiffuse, vUv);

          // 提取亮部
          float brightness = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));

          if (brightness > uThreshold) {
            gl_FragColor = color * (brightness - uThreshold) * uBloomStrength;
          } else {
            gl_FragColor = vec4(0.0);
          }
        }
      `
    });
  }

  /**
   * 渲染后处理
   */
  render() {
    if (!this.enabled) {
      this.renderer.render(this.scene, this.camera);
      return;
    }

    const time = performance.now() * 0.001;

    // 1. 渲染场景到主目标
    this.renderer.setRenderTarget(this.renderTarget);
    this.renderer.render(this.scene, this.camera);

    // 2. 提取Bloom (简化版 - 只进行阈值提取)
    this.bloomMaterial.uniforms.tDiffuse.value = this.renderTarget.texture;
    this.renderer.setRenderTarget(this.bloomTarget);
    this.renderer.render(this.bloomScene, this.orthoCamera);

    // 3. 合成最终图像
    this.quad.material.uniforms.tDiffuse.value = this.renderTarget.texture;
    this.quad.material.uniforms.tBloom.value = this.bloomTarget.texture;
    this.quad.material.uniforms.uTime.value = time;

    this.renderer.setRenderTarget(null);
    this.renderer.render(this.orthoScene, this.orthoCamera);
  }

  /**
   * 更新参数
   */
  setBloomStrength(strength) {
    this.bloomStrength = strength;
    if (this.bloomMaterial) {
      this.bloomMaterial.uniforms.uBloomStrength.value = strength;
    }
  }

  setVignette(strength) {
    this.vignetteStrength = strength;
    if (this.quad && this.quad.material) {
      this.quad.material.uniforms.uVignette.value = strength;
    }
  }

  setSaturation(saturation) {
    this.saturation = saturation;
    if (this.quad && this.quad.material) {
      this.quad.material.uniforms.uSaturation.value = saturation;
    }
  }

  setContrast(contrast) {
    this.contrast = contrast;
    if (this.quad && this.quad.material) {
      this.quad.material.uniforms.uContrast.value = contrast;
    }
  }

  setChromaticAberration(amount) {
    this.chromaticAberration = amount;
    if (this.quad && this.quad.material) {
      this.quad.material.uniforms.uChromatic.value = amount;
    }
  }

  /**
   * 窗口大小调整
   */
  onResize(width, height) {
    if (this.renderTarget) {
      this.renderTarget.setSize(width, height);
    }
    if (this.bloomTarget) {
      this.bloomTarget.setSize(width / 2, height / 2);
    }
  }

  /**
   * 清理资源
   */
  dispose() {
    if (this.renderTarget) this.renderTarget.dispose();
    if (this.bloomTarget) this.bloomTarget.dispose();
    if (this.quad && this.quad.material) this.quad.material.dispose();
    if (this.bloomQuad && this.bloomQuad.material) this.bloomQuad.material.dispose();
  }
}