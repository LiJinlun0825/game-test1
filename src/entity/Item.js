/**
 * 物品实体
 */
import { Entity } from './Entity.js';

export class Item extends Entity {
  constructor(type, subType, amount = 1) {
    super();
    this.itemType = type;  // weapon, ammo, health
    this.subType = subType;
    this.amount = amount;
    this.floatOffset = Math.random() * Math.PI * 2;
  }

  init() {
    let geometry, material, color;

    switch (this.itemType) {
      case 'weapon':
        geometry = new THREE.BoxGeometry(0.8, 0.3, 0.15);
        color = 0x4A7A4A;
        break;
      case 'ammo':
        geometry = new THREE.BoxGeometry(0.3, 0.2, 0.2);
        color = 0xD4AF37;
        break;
      case 'health':
        geometry = new THREE.BoxGeometry(0.4, 0.3, 0.3);
        color = 0xFF4444;
        break;
      default:
        geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        color = 0xFFFFFF;
    }

    material = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.5,
      metalness: 0.3
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    this.object3D.add(mesh);

    // 发光效果
    const glowGeometry = new THREE.SphereGeometry(0.5, 8, 8);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.2
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.y = 0.1;
    this.object3D.add(glow);
  }

  update(deltaTime) {
    // 悬浮动画
    this.floatOffset += deltaTime * 2;
    this.object3D.position.y = this.position.y + 0.3 + Math.sin(this.floatOffset) * 0.1;
    this.object3D.rotation.y += deltaTime;
  }
}