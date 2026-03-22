/**
 * 真实武器模型系统
 * 创建详细的低多边形武器模型
 */
export class RealisticWeaponModel {
  constructor() {
    this.models = new Map();
    this.currentModel = null;
  }

  /**
   * 初始化
   */
  init() {
    this.createWeaponModels();
    console.log('Realistic Weapon Model System initialized');
    return this;
  }

  /**
   * 创建所有武器模型
   */
  createWeaponModels() {
    // 手枪
    this.models.set('glock17', this.createPistolModel('Glock 17'));
    this.models.set('pistol', this.models.get('glock17'));

    // 突击步枪
    this.models.set('m4a1', this.createRifleModel('M4A1'));
    this.models.set('ak47', this.createAKModel('AK-47'));

    // 狙击枪
    this.models.set('awp', this.createSniperModel('AWP'));

    // 冲锋枪
    this.models.set('mp5', this.createSMGModel('MP5'));

    // 霰弹枪
    this.models.set('m870', this.createShotgunModel('M870'));
  }

  /**
   * 获取武器模型
   */
  getModel(weaponId) {
    const model = this.models.get(weaponId);
    if (model) {
      return model.clone();
    }
    return this.createDefaultModel();
  }

  /**
   * 创建手枪模型
   */
  createPistolModel(name) {
    const group = new THREE.Group();
    group.name = name;

    // 枪身
    const bodyGeometry = new THREE.BoxGeometry(0.04, 0.12, 0.18);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.6, metalness: 0.3 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    group.add(body);

    // 握把
    const gripGeometry = new THREE.BoxGeometry(0.035, 0.1, 0.06);
    const grip = new THREE.Mesh(gripGeometry, bodyMaterial);
    grip.position.set(0, -0.1, 0.02);
    grip.rotation.x = -0.2;
    group.add(grip);

    // 枪管
    const barrelGeometry = new THREE.CylinderGeometry(0.012, 0.012, 0.08, 8);
    barrelGeometry.rotateX(Math.PI / 2);
    const barrelMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5, metalness: 0.5 });
    const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
    barrel.position.set(0, 0.02, -0.12);
    group.add(barrel);

    // 准星
    const sightGeometry = new THREE.BoxGeometry(0.01, 0.02, 0.01);
    const sightMaterial = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.7 });
    const frontSight = new THREE.Mesh(sightGeometry, sightMaterial);
    frontSight.position.set(0, 0.07, -0.06);
    group.add(frontSight);

    return group;
  }

  /**
   * 创建步枪模型 (M4A1风格)
   */
  createRifleModel(name) {
    const group = new THREE.Group();
    group.name = name;

    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.7, metalness: 0.2 });
    const metalMaterial = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.5, metalness: 0.5 });

    // 枪身
    const bodyGeometry = new THREE.BoxGeometry(0.05, 0.08, 0.4);
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    group.add(body);

    // 枪管
    const barrelGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.25, 8);
    barrelGeometry.rotateX(Math.PI / 2);
    const barrel = new THREE.Mesh(barrelGeometry, metalMaterial);
    barrel.position.set(0, 0, -0.32);
    group.add(barrel);

    // 护木
    const handguardGeometry = new THREE.BoxGeometry(0.04, 0.06, 0.15);
    const handguard = new THREE.Mesh(handguardGeometry, bodyMaterial);
    handguard.position.set(0, -0.01, -0.18);
    group.add(handguard);

    // 弹匣
    const magGeometry = new THREE.BoxGeometry(0.025, 0.12, 0.05);
    const mag = new THREE.Mesh(magGeometry, metalMaterial);
    mag.position.set(0, -0.1, 0.05);
    group.add(mag);

    // 枪托
    const stockGeometry = new THREE.BoxGeometry(0.04, 0.06, 0.12);
    const stock = new THREE.Mesh(stockGeometry, bodyMaterial);
    stock.position.set(0, 0, 0.25);
    group.add(stock);

    // 提把/瞄准镜座
    const handleGeometry = new THREE.BoxGeometry(0.03, 0.04, 0.08);
    const handle = new THREE.Mesh(handleGeometry, bodyMaterial);
    handle.position.set(0, 0.06, 0);
    group.add(handle);

    return group;
  }

  /**
   * 创建AK-47模型
   */
  createAKModel(name) {
    const group = new THREE.Group();
    group.name = name;

    const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.8, metalness: 0.0 });
    const metalMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5, metalness: 0.5 });

    // 枪身
    const bodyGeometry = new THREE.BoxGeometry(0.045, 0.07, 0.35);
    const body = new THREE.Mesh(bodyGeometry, metalMaterial);
    group.add(body);

    // 枪管
    const barrelGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.28, 8);
    barrelGeometry.rotateX(Math.PI / 2);
    const barrel = new THREE.Mesh(barrelGeometry, metalMaterial);
    barrel.position.set(0, 0, -0.3);
    group.add(barrel);

    // 木质护木
    const handguardGeometry = new THREE.BoxGeometry(0.04, 0.05, 0.12);
    const handguard = new THREE.Mesh(handguardGeometry, woodMaterial);
    handguard.position.set(0, -0.01, -0.15);
    group.add(handguard);

    // 弹匣 (AK标志性弧形弹匣)
    const magGeometry = new THREE.BoxGeometry(0.03, 0.15, 0.04);
    const mag = new THREE.Mesh(magGeometry, metalMaterial);
    mag.position.set(0, -0.11, 0.03);
    mag.rotation.z = 0.1;
    group.add(mag);

    // 木质枪托
    const stockGeometry = new THREE.BoxGeometry(0.035, 0.05, 0.15);
    const stock = new THREE.Mesh(stockGeometry, woodMaterial);
    stock.position.set(0, -0.01, 0.24);
    group.add(stock);

    return group;
  }

  /**
   * 创建狙击枪模型
   */
  createSniperModel(name) {
    const group = new THREE.Group();
    group.name = name;

    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x1a3a1a, roughness: 0.7, metalness: 0.1 });
    const metalMaterial = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5, metalness: 0.5 });

    // 枪身
    const bodyGeometry = new THREE.BoxGeometry(0.04, 0.08, 0.5);
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    group.add(body);

    // 长枪管
    const barrelGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8);
    barrelGeometry.rotateX(Math.PI / 2);
    const barrel = new THREE.Mesh(barrelGeometry, metalMaterial);
    barrel.position.set(0, 0, -0.45);
    group.add(barrel);

    // 瞄准镜
    const scopeGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.15, 8);
    const scopeMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4, metalness: 0.6 });
    const scope = new THREE.Mesh(scopeGeometry, scopeMaterial);
    scope.rotation.x = Math.PI / 2;
    scope.position.set(0, 0.06, -0.05);
    group.add(scope);

    // 弹匣
    const magGeometry = new THREE.BoxGeometry(0.02, 0.06, 0.04);
    const mag = new THREE.Mesh(magGeometry, metalMaterial);
    mag.position.set(0, -0.07, 0.1);
    group.add(mag);

    // 枪托
    const stockGeometry = new THREE.BoxGeometry(0.035, 0.06, 0.18);
    const stock = new THREE.Mesh(stockGeometry, bodyMaterial);
    stock.position.set(0, -0.01, 0.32);
    group.add(stock);

    // 两脚架
    const bipodGeometry = new THREE.CylinderGeometry(0.003, 0.003, 0.1, 4);
    const bipodMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.6 });
    const bipodL = new THREE.Mesh(bipodGeometry, bipodMaterial);
    bipodL.position.set(-0.02, -0.08, -0.2);
    bipodL.rotation.z = 0.3;
    group.add(bipodL);
    const bipodR = bipodL.clone();
    bipodR.position.x = 0.02;
    bipodR.rotation.z = -0.3;
    group.add(bipodR);

    return group;
  }

  /**
   * 创建冲锋枪模型
   */
  createSMGModel(name) {
    const group = new THREE.Group();
    group.name = name;

    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.6, metalness: 0.3 });
    const metalMaterial = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.5, metalness: 0.5 });

    // 紧凑枪身
    const bodyGeometry = new THREE.BoxGeometry(0.04, 0.06, 0.2);
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    group.add(body);

    // 短枪管
    const barrelGeometry = new THREE.CylinderGeometry(0.012, 0.012, 0.12, 8);
    barrelGeometry.rotateX(Math.PI / 2);
    const barrel = new THREE.Mesh(barrelGeometry, metalMaterial);
    barrel.position.set(0, 0, -0.16);
    group.add(barrel);

    // 弹匣
    const magGeometry = new THREE.BoxGeometry(0.02, 0.1, 0.03);
    const mag = new THREE.Mesh(magGeometry, metalMaterial);
    mag.position.set(0, -0.08, 0.02);
    group.add(mag);

    // 折叠枪托
    const stockGeometry = new THREE.BoxGeometry(0.01, 0.02, 0.1);
    const stock = new THREE.Mesh(stockGeometry, metalMaterial);
    stock.position.set(0, 0, 0.15);
    group.add(stock);

    return group;
  }

  /**
   * 创建霰弹枪模型
   */
  createShotgunModel(name) {
    const group = new THREE.Group();
    group.name = name;

    const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x5c3317, roughness: 0.8, metalness: 0.0 });
    const metalMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5, metalness: 0.5 });

    // 机匣
    const bodyGeometry = new THREE.BoxGeometry(0.045, 0.06, 0.15);
    const body = new THREE.Mesh(bodyGeometry, metalMaterial);
    group.add(body);

    // 双管
    const barrelGeometry = new THREE.CylinderGeometry(0.012, 0.012, 0.4, 8);
    barrelGeometry.rotateX(Math.PI / 2);
    const barrelL = new THREE.Mesh(barrelGeometry, metalMaterial);
    barrelL.position.set(-0.015, 0, -0.27);
    group.add(barrelL);
    const barrelR = barrelL.clone();
    barrelR.position.x = 0.015;
    group.add(barrelR);

    // 木质护木
    const handguardGeometry = new THREE.BoxGeometry(0.04, 0.04, 0.2);
    const handguard = new THREE.Mesh(handguardGeometry, woodMaterial);
    handguard.position.set(0, -0.01, -0.18);
    group.add(handguard);

    // 木质枪托
    const stockGeometry = new THREE.BoxGeometry(0.04, 0.05, 0.2);
    const stock = new THREE.Mesh(stockGeometry, woodMaterial);
    stock.position.set(0, -0.005, 0.17);
    group.add(stock);

    return group;
  }

  /**
   * 创建默认模型
   */
  createDefaultModel() {
    const geometry = new THREE.BoxGeometry(0.05, 0.05, 0.2);
    const material = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.6 });
    return new THREE.Mesh(geometry, material);
  }

  /**
   * 销毁
   */
  destroy() {
    this.models.forEach(model => {
      model.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
    });
    this.models.clear();
  }
}