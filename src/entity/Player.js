/**
 * 玩家实体
 */
import { Entity } from './Entity.js';
import { Health } from '../component/Health.js';
import { CharacterController } from '../component/CharacterController.js';
import { WeaponController } from '../component/WeaponController.js';

export class Player extends Entity {
  constructor() {
    super();
    this.id = 'player';
    this.health = new Health(100);
    this.characterController = new CharacterController();
    this.weaponController = new WeaponController();
    this.cameraController = null;

    this.characterController.setEntity(this);
    this.weaponController.setEntity(this);
  }

  init() {
    // 创建玩家模型（使用圆柱体+球体组合）
    const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.2, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x4A7A4A,
      roughness: 0.7
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.9;
    body.castShadow = true;
    this.object3D.add(body);

    // 头部
    const headGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: 0xE8C8A8,
      roughness: 0.5
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.6;
    head.castShadow = true;
    this.object3D.add(head);

    console.log('Player initialized');
  }

  update(deltaTime) {
    this.characterController.update(deltaTime);
    this.weaponController.update(deltaTime, 0);
    super.update(deltaTime);
  }

  isDead() {
    return this.health.isDead();
  }
}