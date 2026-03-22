/**
 * 投射物类（子弹）
 */
export class Projectile {
  constructor(position, direction, damage, owner) {
    this.position = position.clone();
    this.direction = direction.clone().normalize();
    this.damage = damage;
    this.owner = owner;
    this.speed = 200;
    this.lifetime = 2;
    this.age = 0;
    this.active = true;
    this.mesh = null;
  }

  init(scene) {
    const geometry = new THREE.SphereGeometry(0.05, 4, 4);
    const material = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(this.position);
    scene.add(this.mesh);
  }

  update(deltaTime) {
    if (!this.active) return;

    this.age += deltaTime;
    if (this.age >= this.lifetime) {
      this.active = false;
      return;
    }

    // 移动
    const movement = this.direction.clone().multiplyScalar(this.speed * deltaTime);
    this.position.add(movement);

    if (this.mesh) {
      this.mesh.position.copy(this.position);
    }
  }

  dispose(scene) {
    if (this.mesh && scene) {
      scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
    }
  }
}