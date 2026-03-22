/**
 * 弹道轨迹和枪口火焰效果系统
 */
export class TracerSystem {
  constructor(scene) {
    this.scene = scene;
    this.tracers = [];
    this.muzzleFlashes = [];
    this.maxTracers = 50;
    this.maxMuzzleFlashes = 10;

    // 材质池
    this.tracerMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.8
    });

    this.muzzleMaterial = new THREE.MeshBasicMaterial({
      color: 0xff6600,
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide
    });
  }

  /**
   * 创建弹道轨迹
   */
  createTracer(startPos, direction, speed = 200) {
    const geometry = new THREE.CylinderGeometry(0.01, 0.01, 0.5, 4);
    geometry.rotateX(Math.PI / 2);

    const tracer = new THREE.Mesh(geometry, this.tracerMaterial.clone());
    tracer.position.copy(startPos);
    tracer.lookAt(startPos.clone().add(direction));

    // 弹道数据
    tracer.userData = {
      velocity: direction.clone().multiplyScalar(speed),
      life: 2,
      age: 0
    };

    this.scene.add(tracer);
    this.tracers.push(tracer);

    // 限制数量
    while (this.tracers.length > this.maxTracers) {
      const old = this.tracers.shift();
      this.scene.remove(old);
      old.geometry.dispose();
      old.material.dispose();
    }

    return tracer;
  }

  /**
   * 创建枪口火焰
   */
  createMuzzleFlash(position, direction) {
    // 创建火焰精灵
    const spriteMaterial = new THREE.SpriteMaterial({
      map: this.createMuzzleTexture(),
      color: 0xffaa00,
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    const flash = new THREE.Sprite(spriteMaterial);
    flash.position.copy(position);
    flash.position.add(direction.clone().multiplyScalar(0.5));

    // 随机大小
    const scale = 0.3 + Math.random() * 0.2;
    flash.scale.set(scale, scale, 1);

    flash.userData = {
      life: 0.05,
      age: 0
    };

    this.scene.add(flash);
    this.muzzleFlashes.push(flash);

    // 限制数量
    while (this.muzzleFlashes.length > this.maxMuzzleFlashes) {
      const old = this.muzzleFlashes.shift();
      this.scene.remove(old);
      old.material.dispose();
    }

    // 添加点光源
    const light = new THREE.PointLight(0xff6600, 2, 5);
    light.position.copy(position);
    this.scene.add(light);

    // 延迟移除光源
    setTimeout(() => {
      this.scene.remove(light);
    }, 50);

    return flash;
  }

  /**
   * 创建枪口火焰纹理
   */
  createMuzzleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // 绘制火焰
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 200, 1)');
    gradient.addColorStop(0.3, 'rgba(255, 150, 50, 0.8)');
    gradient.addColorStop(0.6, 'rgba(255, 100, 0, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  /**
   * 更新所有弹道和火焰
   */
  update(deltaTime) {
    // 更新弹道
    for (let i = this.tracers.length - 1; i >= 0; i--) {
      const tracer = this.tracers[i];
      tracer.userData.age += deltaTime;

      // 移动弹道
      tracer.position.add(
        tracer.userData.velocity.clone().multiplyScalar(deltaTime)
      );

      // 淡出效果
      const fadeStart = tracer.userData.life * 0.7;
      if (tracer.userData.age > fadeStart) {
        const fadeProgress = (tracer.userData.age - fadeStart) / (tracer.userData.life - fadeStart);
        tracer.material.opacity = 0.8 * (1 - fadeProgress);
      }

      // 移除过期弹道
      if (tracer.userData.age >= tracer.userData.life) {
        this.scene.remove(tracer);
        tracer.geometry.dispose();
        tracer.material.dispose();
        this.tracers.splice(i, 1);
      }
    }

    // 更新枪口火焰
    for (let i = this.muzzleFlashes.length - 1; i >= 0; i--) {
      const flash = this.muzzleFlashes[i];
      flash.userData.age += deltaTime;

      // 淡出
      const progress = flash.userData.age / flash.userData.life;
      flash.material.opacity = 1 - progress;

      // 移除过期火焰
      if (flash.userData.age >= flash.userData.life) {
        this.scene.remove(flash);
        flash.material.dispose();
        this.muzzleFlashes.splice(i, 1);
      }
    }
  }

  /**
   * 清除所有效果
   */
  clear() {
    // 清除弹道
    this.tracers.forEach(tracer => {
      this.scene.remove(tracer);
      tracer.geometry.dispose();
      tracer.material.dispose();
    });
    this.tracers = [];

    // 清除火焰
    this.muzzleFlashes.forEach(flash => {
      this.scene.remove(flash);
      flash.material.dispose();
    });
    this.muzzleFlashes = [];
  }

  /**
   * 销毁
   */
  destroy() {
    this.clear();
    this.tracerMaterial.dispose();
    this.muzzleMaterial.dispose();
  }
}