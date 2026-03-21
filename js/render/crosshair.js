// js/render/crosshair.js - 准星管理器
export class CrosshairManager {
  constructor() {
    this.cursor = document.getElementById('custom-cursor');
    this.x = 0;
    this.y = 0;
    this.wobble = 0;
    this.wobbleSpeed = 0.05;

    if (this.cursor) {
      document.addEventListener('mousemove', (e) => {
        this.x = e.clientX;
        this.y = e.clientY;
        this.cursor.style.left = this.x + 'px';
        this.cursor.style.top = this.y + 'px';
      });
    }
  }

  update(deltaTime) {
    // 轻微晃动效果
    this.wobble += this.wobbleSpeed * deltaTime;
    const offset = Math.sin(this.wobble) * 2;

    if (this.cursor) {
      this.cursor.style.transform = `translate(-50%, -50%) translate(${offset}px, ${offset}px)`;
    }
  }

  hide() {
    if (this.cursor) this.cursor.style.display = 'none';
  }

  show() {
    if (this.cursor) this.cursor.style.display = 'block';
  }
}