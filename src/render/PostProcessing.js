/**
 * 后处理效果系统
 * 包括Bloom、颜色校正、抗锯齿等效果
 */
export class PostProcessing {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.enabled = true;

    // 效果参数
    this.params = {
      bloom: {
        enabled: true,
        strength: 0.5,
        radius: 0.4,
        threshold: 0.8
      },
      colorCorrection: {
        enabled: true,
        contrast: 1.1,
        saturation: 1.2,
        brightness: 0
      },
      vignette: {
        enabled: true,
        intensity: 0.3,
        smoothness: 0.5
      }
    };

    this.composer = null;
    this.effects = {};
  }

  /**
   * 初始化后处理
   * 注: 由于使用CDN版本的Three.js，无法使用EffectComposer
   * 这里提供一个简化的替代实现
   */
  init() {
    console.log('PostProcessing: Using simplified mode (CDN Three.js limitation)');
    this.enabled = false;

    // 应用CSS滤镜作为替代
    this.applyCSSFilters();

    return this;
  }

  /**
   * 应用CSS滤镜
   */
  applyCSSFilters() {
    const canvas = document.querySelector('#game-canvas canvas');
    if (canvas) {
      canvas.style.filter = `
        contrast(${this.params.colorCorrection.contrast})
        saturate(${this.params.colorCorrection.saturation})
        brightness(${1 + this.params.colorCorrection.brightness})
      `;
    }
  }

  /**
   * 创建暗角效果遮罩
   */
  createVignetteOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'vignette-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      background: radial-gradient(
        ellipse at center,
        transparent 0%,
        transparent ${100 - this.params.vignette.smoothness * 100}%,
        rgba(0, 0, 0, ${this.params.vignette.intensity}) 100%
      );
      z-index: 100;
    `;
    document.body.appendChild(overlay);
    return overlay;
  }

  /**
   * 更新参数
   */
  setBloomParams(strength, radius, threshold) {
    this.params.bloom.strength = strength;
    this.params.bloom.radius = radius;
    this.params.bloom.threshold = threshold;
  }

  /**
   * 设置颜色校正
   */
  setColorCorrection(contrast, saturation, brightness) {
    this.params.colorCorrection.contrast = contrast;
    this.params.colorCorrection.saturation = saturation;
    this.params.colorCorrection.brightness = brightness;
    this.applyCSSFilters();
  }

  /**
   * 设置暗角效果
   */
  setVignette(intensity, smoothness) {
    this.params.vignette.intensity = intensity;
    this.params.vignette.smoothness = smoothness;

    const overlay = document.getElementById('vignette-overlay');
    if (overlay) {
      overlay.style.background = `radial-gradient(
        ellipse at center,
        transparent 0%,
        transparent ${100 - smoothness * 100}%,
        rgba(0, 0, 0, ${intensity}) 100%
      )`;
    }
  }

  /**
   * 渲染
   */
  render() {
    if (!this.enabled) {
      this.renderer.render(this.scene, this.camera);
      return;
    }

    // 简化版本直接渲染
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * 闪烁效果（受伤时使用）
   */
  flashDamage(intensity = 0.5) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 0, 0, ${intensity});
      pointer-events: none;
      z-index: 200;
      animation: damageFlash 0.2s ease-out forwards;
    `;

    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
      @keyframes damageFlash {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.remove();
      style.remove();
    }, 200);
  }

  /**
   * 死亡效果
   */
  deathEffect() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(100, 0, 0, 0.8);
      pointer-events: none;
      z-index: 200;
      animation: deathFade 1s ease-out forwards;
    `;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes deathFade {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(overlay);

    return () => {
      overlay.remove();
      style.remove();
    };
  }

  /**
   * 销毁
   */
  destroy() {
    const overlay = document.getElementById('vignette-overlay');
    if (overlay) overlay.remove();

    const canvas = document.querySelector('#game-canvas canvas');
    if (canvas) canvas.style.filter = '';
  }
}