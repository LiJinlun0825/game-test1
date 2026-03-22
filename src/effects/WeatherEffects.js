/**
 * 天气效果系统
 * 管理雨、雪、雾等天气效果
 */
export class WeatherEffects {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;

    this.currentWeather = 'clear';
    this.intensity = 0;
    this.targetIntensity = 0;

    // 效果对象
    this.rainSystem = null;
    this.snowSystem = null;
    this.fogEffect = null;
    this.lightningEffect = null;

    // 配置
    this.config = {
      rain: {
        particleCount: 5000,
        speed: 20,
        size: 0.1
      },
      snow: {
        particleCount: 2000,
        speed: 2,
        size: 0.2
      },
      fog: {
        density: 0.002,
        color: 0x888888
      }
    };
  }

  /**
   * 初始化
   */
  init() {
    console.log('Weather Effects initialized');
    return this;
  }

  /**
   * 设置天气
   */
  setWeather(type, intensity = 1, transition = true) {
    this.currentWeather = type;

    if (transition) {
      this.targetIntensity = intensity;
    } else {
      this.intensity = intensity;
      this.applyWeather();
    }
  }

  /**
   * 应用天气效果
   */
  applyWeather() {
    // 清除现有效果
    this.clearEffects();

    switch (this.currentWeather) {
      case 'rain':
        this.createRain();
        break;
      case 'snow':
        this.createSnow();
        break;
      case 'fog':
        this.createFog();
        break;
      case 'storm':
        this.createRain();
        this.createFog();
        this.setupLightning();
        break;
      default:
        // 晴天
        break;
    }
  }

  /**
   * 创建雨效果
   */
  createRain() {
    const config = this.config.rain;
    const count = Math.floor(config.particleCount * this.intensity);

    // 创建雨滴粒子
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = Math.random() * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
      velocities[i] = 0.5 + Math.random() * 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.userData.velocities = velocities;

    const material = new THREE.PointsMaterial({
      color: 0xaaaacc,
      size: config.size,
      transparent: true,
      opacity: 0.6 * this.intensity
    });

    this.rainSystem = new THREE.Points(geometry, material);
    this.rainSystem.userData.type = 'rain';
    this.scene.add(this.rainSystem);
  }

  /**
   * 创建雪效果
   */
  createSnow() {
    const config = this.config.snow;
    const count = Math.floor(config.particleCount * this.intensity);

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = Math.random() * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;

      velocities[i * 3] = (Math.random() - 0.5) * 0.1;
      velocities[i * 3 + 1] = 0.3 + Math.random() * 0.2;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.userData.velocities = velocities;

    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: config.size,
      transparent: true,
      opacity: 0.8 * this.intensity
    });

    this.snowSystem = new THREE.Points(geometry, material);
    this.snowSystem.userData.type = 'snow';
    this.scene.add(this.snowSystem);
  }

  /**
   * 创建雾效果
   */
  createFog() {
    const config = this.config.fog;
    this.scene.fog = new THREE.FogExp2(
      config.color,
      config.density * this.intensity
    );
    this.fogEffect = this.scene.fog;
  }

  /**
   * 设置闪电
   */
  setupLightning() {
    this.lightningInterval = setInterval(() => {
      if (Math.random() < 0.3) {
        this.triggerLightning();
      }
    }, 3000);
  }

  /**
   * 触发闪电
   */
  triggerLightning() {
    // 闪光效果
    const flash = new THREE.PointLight(0xffffff, 5, 500);
    flash.position.set(
      (Math.random() - 0.5) * 200,
      100,
      (Math.random() - 0.5) * 200
    );
    this.scene.add(flash);

    // 快速消失
    setTimeout(() => {
      this.scene.remove(flash);
    }, 100);

    // 可选：添加雷声
    // this.playThunder();
  }

  /**
   * 更新天气效果
   */
  update(deltaTime) {
    // 平滑过渡
    if (this.intensity !== this.targetIntensity) {
      const diff = this.targetIntensity - this.intensity;
      this.intensity += Math.sign(diff) * Math.min(Math.abs(diff), deltaTime * 0.5);

      if (Math.abs(this.intensity - this.targetIntensity) < 0.01) {
        this.intensity = this.targetIntensity;
      }

      this.applyWeather();
    }

    // 更新雨
    if (this.rainSystem) {
      this.updateRain(deltaTime);
    }

    // 更新雪
    if (this.snowSystem) {
      this.updateSnow(deltaTime);
    }
  }

  /**
   * 更新雨粒子
   */
  updateRain(deltaTime) {
    const positions = this.rainSystem.geometry.attributes.position.array;
    const velocities = this.rainSystem.geometry.userData.velocities;
    const speed = this.config.rain.speed;

    for (let i = 0; i < positions.length / 3; i++) {
      positions[i * 3 + 1] -= speed * velocities[i] * deltaTime;

      // 重置位置
      if (positions[i * 3 + 1] < 0) {
        positions[i * 3 + 1] = 100;
        positions[i * 3] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
      }
    }

    this.rainSystem.geometry.attributes.position.needsUpdate = true;
  }

  /**
   * 更新雪粒子
   */
  updateSnow(deltaTime) {
    const positions = this.snowSystem.geometry.attributes.position.array;
    const velocities = this.snowSystem.geometry.userData.velocities;

    for (let i = 0; i < positions.length / 3; i++) {
      positions[i * 3] += velocities[i * 3];
      positions[i * 3 + 1] -= velocities[i * 3 + 1];
      positions[i * 3 + 2] += velocities[i * 3 + 2];

      // 重置位置
      if (positions[i * 3 + 1] < 0) {
        positions[i * 3 + 1] = 100;
        positions[i * 3] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
      }
    }

    this.snowSystem.geometry.attributes.position.needsUpdate = true;
  }

  /**
   * 清除所有效果
   */
  clearEffects() {
    if (this.rainSystem) {
      this.scene.remove(this.rainSystem);
      this.rainSystem.geometry.dispose();
      this.rainSystem.material.dispose();
      this.rainSystem = null;
    }

    if (this.snowSystem) {
      this.scene.remove(this.snowSystem);
      this.snowSystem.geometry.dispose();
      this.snowSystem.material.dispose();
      this.snowSystem = null;
    }

    if (this.fogEffect) {
      this.scene.fog = null;
      this.fogEffect = null;
    }

    if (this.lightningInterval) {
      clearInterval(this.lightningInterval);
      this.lightningInterval = null;
    }
  }

  /**
   * 销毁
   */
  destroy() {
    this.clearEffects();
  }
}