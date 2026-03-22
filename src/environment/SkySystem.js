/**
 * 天空系统
 * 处理天空盒、昼夜循环、云层等
 */
export class SkySystem {
  constructor(scene) {
    this.scene = scene;
    this.skyMesh = null;
    this.sunLight = null;
    this.ambientLight = null;
    this.clouds = [];

    // 时间设置
    this.timeOfDay = 0.5; // 0-1, 0.5 = 正午
    this.dayDuration = 600; // 10分钟一个完整的昼夜循环

    // 天空颜色
    this.skyColors = {
      dawn: { top: 0xff7f50, bottom: 0xffd700 },
      day: { top: 0x87ceeb, bottom: 0xe0f0ff },
      dusk: { top: 0xff6347, bottom: 0xffa500 },
      night: { top: 0x0a0a2e, bottom: 0x1a1a3e }
    };
  }

  /**
   * 初始化天空系统
   */
  init() {
    this.createSkyDome();
    this.createSun();
    this.createAmbientLight();
    this.createClouds();

    console.log('Sky System initialized');
    return this;
  }

  /**
   * 创建天空穹顶
   */
  createSkyDome() {
    const skyGeometry = new THREE.SphereGeometry(1000, 32, 32);
    const skyMaterial = new THREE.MeshBasicMaterial({
      color: this.skyColors.day.top,
      side: THREE.BackSide
    });

    this.skyMesh = new THREE.Mesh(skyGeometry, skyMaterial);
    this.scene.add(this.skyMesh);
  }

  /**
   * 创建太阳
   */
  createSun() {
    // 太阳光源
    this.sunLight = new THREE.DirectionalLight(0xffffff, 1);
    this.sunLight.position.set(100, 100, 50);
    this.sunLight.castShadow = true;
    this.scene.add(this.sunLight);

    // 太阳球体
    const sunGeometry = new THREE.SphereGeometry(20, 16, 16);
    const sunMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00
    });
    this.sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
    this.scene.add(this.sunMesh);
  }

  /**
   * 创建环境光
   */
  createAmbientLight() {
    this.ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(this.ambientLight);
  }

  /**
   * 创建云层
   */
  createClouds() {
    const cloudCount = 15;

    for (let i = 0; i < cloudCount; i++) {
      const cloud = this.createCloud();

      // 随机位置
      cloud.position.set(
        (Math.random() - 0.5) * 800,
        150 + Math.random() * 100,
        (Math.random() - 0.5) * 800
      );

      // 随机缩放
      const scale = 1 + Math.random() * 2;
      cloud.scale.set(scale, scale * 0.5, scale);

      // 随机速度
      cloud.userData.speed = 0.05 + Math.random() * 0.1;

      this.scene.add(cloud);
      this.clouds.push(cloud);
    }
  }

  /**
   * 创建单个云朵
   */
  createCloud() {
    const cloudGroup = new THREE.Group();
    const cloudMaterial = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9
    });

    // 云朵由多个球体组成
    const sphereCount = 3 + Math.floor(Math.random() * 4);
    const baseSize = 15 + Math.random() * 10;

    for (let i = 0; i < sphereCount; i++) {
      const sphereGeometry = new THREE.SphereGeometry(
        baseSize * (0.6 + Math.random() * 0.4),
        8,
        8
      );
      const sphere = new THREE.Mesh(sphereGeometry, cloudMaterial);

      sphere.position.set(
        (Math.random() - 0.5) * baseSize * 2,
        (Math.random() - 0.5) * baseSize * 0.5,
        (Math.random() - 0.5) * baseSize * 2
      );

      cloudGroup.add(sphere);
    }

    return cloudGroup;
  }

  /**
   * 更新天空系统
   */
  update(deltaTime) {
    // 更新时间
    this.timeOfDay += deltaTime / this.dayDuration;
    if (this.timeOfDay > 1) this.timeOfDay = 0;

    // 更新天空颜色
    this.updateSkyColor();

    // 更新太阳位置
    this.updateSunPosition();

    // 更新云层
    this.updateClouds(deltaTime);
  }

  /**
   * 更新天空颜色
   */
  updateSkyColor() {
    let colors;
    const t = this.timeOfDay;

    if (t < 0.25) {
      // 夜晚到黎明
      colors = this.lerpColors(
        this.skyColors.night,
        this.skyColors.dawn,
        t * 4
      );
    } else if (t < 0.5) {
      // 黎明到正午
      colors = this.lerpColors(
        this.skyColors.dawn,
        this.skyColors.day,
        (t - 0.25) * 4
      );
    } else if (t < 0.75) {
      // 正午到黄昏
      colors = this.lerpColors(
        this.skyColors.day,
        this.skyColors.dusk,
        (t - 0.5) * 4
      );
    } else {
      // 黄昏到夜晚
      colors = this.lerpColors(
        this.skyColors.dusk,
        this.skyColors.night,
        (t - 0.75) * 4
      );
    }

    this.skyMesh.material.color.set(colors.top);
  }

  /**
   * 更新太阳位置
   */
  updateSunPosition() {
    const angle = this.timeOfDay * Math.PI * 2 - Math.PI / 2;
    const radius = 400;

    this.sunLight.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      50
    );

    this.sunMesh.position.copy(this.sunLight.position);

    // 根据时间调整光照强度
    const intensity = Math.max(0, Math.sin(angle));
    this.sunLight.intensity = intensity;
    this.ambientLight.intensity = 0.2 + intensity * 0.3;

    // 夜间隐藏太阳
    this.sunMesh.visible = this.timeOfDay > 0.1 && this.timeOfDay < 0.9;
  }

  /**
   * 更新云层
   */
  updateClouds(deltaTime) {
    this.clouds.forEach(cloud => {
      cloud.position.x += cloud.userData.speed;

      // 循环移动
      if (cloud.position.x > 400) {
        cloud.position.x = -400;
      }
    });
  }

  /**
   * 颜色插值
   */
  lerpColors(colors1, colors2, t) {
    const topColor = new THREE.Color(colors1.top).lerp(
      new THREE.Color(colors2.top),
      t
    );
    return { top: topColor, bottom: colors1.bottom };
  }

  /**
   * 设置时间
   */
  setTimeOfDay(time) {
    this.timeOfDay = Math.max(0, Math.min(1, time));
  }

  /**
   * 获取当前时间
   */
  getTimeOfDay() {
    return this.timeOfDay;
  }

  /**
   * 销毁
   */
  destroy() {
    if (this.skyMesh) {
      this.scene.remove(this.skyMesh);
      this.skyMesh.geometry.dispose();
      this.skyMesh.material.dispose();
    }

    if (this.sunLight) {
      this.scene.remove(this.sunLight);
    }

    if (this.sunMesh) {
      this.scene.remove(this.sunMesh);
      this.sunMesh.geometry.dispose();
      this.sunMesh.material.dispose();
    }

    if (this.ambientLight) {
      this.scene.remove(this.ambientLight);
    }

    this.clouds.forEach(cloud => {
      this.scene.remove(cloud);
      cloud.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
    });
    this.clouds = [];
  }
}