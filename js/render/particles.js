// js/render/particles.js - 粒子特效系统
export class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.particles = [];
    this.container = document.createElement('div');
    this.container.className = 'particle-container';
    document.getElementById('game-container').appendChild(this.container);
  }

  spawn(x, y, color) {
    const count = 8 + Math.random() * 4; // 8-12 个粒子
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 2 + Math.random() * 3;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed + 1, // 轻微重力
        life: 1,
        decay: 0.02 + Math.random() * 0.02,
        color,
      });
    }
  }

  update() {
    this.container.innerHTML = '';

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1; // 重力
      p.life -= p.decay;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      const elem = document.createElement('div');
      elem.className = 'particle';
      elem.style.left = p.x + 'px';
      elem.style.top = p.y + 'px';
      elem.style.backgroundColor = p.color;
      elem.style.opacity = p.life;
      this.container.appendChild(elem);
    }
  }

  clear() {
    this.particles = [];
    this.container.innerHTML = '';
  }
}