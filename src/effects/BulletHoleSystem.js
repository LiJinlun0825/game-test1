/**
 * 弹孔效果系统
 * 在被击中的表面上创建弹孔效果
 */
export class BulletHoleSystem {
  constructor(scene) {
    this.scene = scene;
    this.bulletHoles = [];
    this.maxHoles = 100;
    this.decayTime = 30; // 弹孔消失时间（秒）

    // 弹孔材质
    this.holeMaterial = new THREE.MeshBasicMaterial({
      color: 0x111111,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });

    // 弹孔几何体（复用）
    this.holeGeometry = new THREE.CircleGeometry(0.05, 8);
  }

  /**
   * 初始化
   */
  init() {
    console.log('Bullet Hole System initialized');
    return this;
  }

  /**
   * 创建弹孔
   */
  createBulletHole(position, normal, surfaceType = 'default') {
    // 创建弹孔网格
    const hole = new THREE.Mesh(this.holeGeometry, this.holeMaterial.clone());

    // 设置位置
    hole.position.copy(position);

    // 根据法线方向旋转
    hole.lookAt(position.clone().add(normal));

    // 稍微偏移避免z-fighting
    hole.position.add(normal.clone().multiplyScalar(0.01));

    // 添加随机变化
    hole.rotation.z = Math.random() * Math.PI * 2;
    const scale = 0.8 + Math.random() * 0.4;
    hole.scale.set(scale, scale, 1);

    // 根据表面类型调整颜色
    this.adjustForSurface(hole, surfaceType);

    // 存储创建时间
    hole.userData.createdAt = performance.now() / 1000;

    // 添加到场景
    this.scene.add(hole);
    this.bulletHoles.push(hole);

    // 限制弹孔数量
    while (this.bulletHoles.length > this.maxHoles) {
      this.removeOldestHole();
    }

    return hole;
  }

  /**
   * 根据表面类型调整弹孔
   */
  adjustForSurface(hole, surfaceType) {
    switch (surfaceType) {
      case 'metal':
        hole.material.color.setHex(0x444444);
        // 添加火花效果
        this.createSparkEffect(hole.position);
        break;
      case 'wood':
        hole.material.color.setHex(0x2a1a0a);
        break;
      case 'concrete':
        hole.material.color.setHex(0x333333);
        break;
      case 'glass':
        // 玻璃破碎效果
        hole.material.color.setHex(0x88ccff);
        hole.material.opacity = 0.5;
        break;
      case 'ground':
        hole.material.color.setHex(0x3a2a1a);
        // 添加尘土效果
        this.createDustEffect(hole.position);
        break;
      default:
        hole.material.color.setHex(0x111111);
    }
  }

  /**
   * 创建火花效果
   */
  createSparkEffect(position) {
    const sparkCount = 5;
    const sparks = [];

    for (let i = 0; i < sparkCount; i++) {
      const sparkGeometry = new THREE.SphereGeometry(0.01, 4, 4);
      const sparkMaterial = new THREE.MeshBasicMaterial({
        color: 0xffaa00
      });
      const spark = new THREE.Mesh(sparkGeometry, sparkMaterial);
      spark.position.copy(position);

      // 随机速度
      spark.userData.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        Math.random() * 2,
        (Math.random() - 0.5) * 2
      );
      spark.userData.life = 0.5;

      this.scene.add(spark);
      sparks.push(spark);
    }

    // 动画火花
    const startTime = performance.now();
    const animate = () => {
      const elapsed = (performance.now() - startTime) / 1000;

      sparks.forEach((spark, index) => {
        if (spark.userData.life > elapsed) {
          spark.position.add(spark.userData.velocity.clone().multiplyScalar(0.016));
          spark.userData.velocity.y -= 0.1; // 重力
          spark.material.opacity = 1 - elapsed / spark.userData.life;
        } else {
          this.scene.remove(spark);
          spark.geometry.dispose();
          spark.material.dispose();
          sparks.splice(index, 1);
        }
      });

      if (sparks.length > 0) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  /**
   * 创建尘土效果
   */
  createDustEffect(position) {
    const dustCount = 10;
    const particles = [];

    for (let i = 0; i < dustCount; i++) {
      const dustGeometry = new THREE.SphereGeometry(0.02, 4, 4);
      const dustMaterial = new THREE.MeshBasicMaterial({
        color: 0x8b7355,
        transparent: true,
        opacity: 0.5
      });
      const dust = new THREE.Mesh(dustGeometry, dustMaterial);
      dust.position.copy(position);

      dust.userData.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        Math.random() * 0.3,
        (Math.random() - 0.5) * 0.5
      );
      dust.userData.life = 1;

      this.scene.add(dust);
      particles.push(dust);
    }

    // 动画尘土
    const startTime = performance.now();
    const animate = () => {
      const elapsed = (performance.now() - startTime) / 1000;

      particles.forEach((particle, index) => {
        if (particle.userData.life > elapsed) {
          particle.position.add(particle.userData.velocity.clone().multiplyScalar(0.016));
          particle.material.opacity = 0.5 * (1 - elapsed / particle.userData.life);
        } else {
          this.scene.remove(particle);
          particle.geometry.dispose();
          particle.material.dispose();
          particles.splice(index, 1);
        }
      });

      if (particles.length > 0) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  /**
   * 更新弹孔（淡出效果）
   */
  update(deltaTime) {
    const now = performance.now() / 1000;

    this.bulletHoles.forEach((hole, index) => {
      const age = now - hole.userData.createdAt;

      if (age > this.decayTime) {
        this.scene.remove(hole);
        hole.geometry.dispose();
        hole.material.dispose();
        this.bulletHoles.splice(index, 1);
      } else if (age > this.decayTime * 0.7) {
        // 开始淡出
        const fadeProgress = (age - this.decayTime * 0.7) / (this.decayTime * 0.3);
        hole.material.opacity = 0.8 * (1 - fadeProgress);
      }
    });
  }

  /**
   * 移除最旧的弹孔
   */
  removeOldestHole() {
    if (this.bulletHoles.length > 0) {
      const oldest = this.bulletHoles.shift();
      this.scene.remove(oldest);
      oldest.geometry.dispose();
      oldest.material.dispose();
    }
  }

  /**
   * 清除所有弹孔
   */
  clearAll() {
    this.bulletHoles.forEach(hole => {
      this.scene.remove(hole);
      hole.geometry.dispose();
      hole.material.dispose();
    });
    this.bulletHoles = [];
  }

  /**
   * 销毁
   */
  destroy() {
    this.clearAll();
    this.holeGeometry.dispose();
    this.holeMaterial.dispose();
  }
}