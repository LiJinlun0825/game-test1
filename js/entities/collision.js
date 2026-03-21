// js/entities/collision.js - 碰撞检测系统
export class CollisionDetector {
  detect(targets, x, y) {
    // 从后往前检测（后绘制的在上层）
    for (let i = targets.length - 1; i >= 0; i--) {
      const target = targets[i];
      const result = target.hit(x, y);

      if (result) {
        if (target.shouldRemove) {
          target.onRemove(null);
        }
        return { target, result };
      }
    }
    return null;
  }
}