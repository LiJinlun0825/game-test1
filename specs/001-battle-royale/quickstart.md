# Quickstart: 大逃杀游戏 (Battle Royale Game)

**Feature**: 001-battle-royale
**Date**: 2026-03-22

## 快速开始

### 环境要求

- 现代浏览器 (Chrome 90+, Firefox 88+, Edge 90+, Safari 14+)
- 支持WebGL
- 支持ES6模块

### 运行游戏

1. 克隆或下载项目

```bash
cd GameProject1
```

2. 启动本地服务器

```bash
# 使用Python
python -m http.server 8080

# 或使用Node.js
npx serve .

# 或使用VS Code Live Server扩展
```

3. 打开浏览器访问

```
http://localhost:8080/index.html
```

### 游戏控制

| 按键 | 功能 |
|------|------|
| W/A/S/D | 移动 |
| 鼠标移动 | 控制视角 |
| 左键 | 射击 |
| 右键 | 瞄准 |
| R | 换弹 |
| 1/2/3 | 切换武器槽位 |
| E | 拾取物品 |
| Space | 跳跃 |
| Shift | 冲刺 |
| C | 蹲伏 |
| ESC | 暂停 |

### 游戏流程

1. **开始**: 点击"开始游戏"按钮
2. **搜集**: 在地图上寻找武器和弹药
3. **生存**: 避免安全区外伤害
4. **战斗**: 消灭AI敌人
5. **胜利**: 成为最后存活者

## 开发指南

### 项目结构

```
src/
├── core/           # 核心系统
├── entity/         # 实体类
├── component/      # 组件
├── weapon/         # 武器系统
├── ai/             # AI系统
├── camera/         # 相机
├── world/          # 世界/地图
├── effects/        # 特效
├── audio/          # 音频
├── render/         # 渲染
└── main.js         # 入口
```

### 添加新武器

1. 在 `WeaponSystem.js` 中定义武器数据:

```javascript
const WEAPON_DATA = {
  myWeapon: {
    name: '我的武器',
    type: 'rifle',
    damage: 40,
    fireRate: 8,
    magazineSize: 25,
    reloadTime: 2.0
  }
};
```

2. 添加武器模型 (可选)

3. 在UI中添加武器选择

### 添加新敌人类型

1. 扩展 `Enemy.js`:

```javascript
class SpecialEnemy extends Enemy {
  constructor() {
    super();
    this.health = new Health(200); // 更高生命值
    this.detectionRange = 80;      // 更远检测
  }
}
```

2. 在 `createEnemies()` 中实例化

### 调试技巧

```javascript
// 在浏览器控制台
game.player.health.current = 100;  // 恢复生命值
game.enemies.forEach(e => e.kill()); // 清除所有敌人
game.killCount = 19;                 // 设置击杀数
```

## 性能检查清单

- [ ] 游戏帧率 ≥ 30fps
- [ ] 首次加载 < 5秒
- [ ] 无控制台错误
- [ ] 内存无持续增长
- [ ] 敌人数量不影响帧率

## 常见问题

### Q: 游戏加载慢怎么办?

A: 检查网络连接，确保Three.js CDN可访问。也可下载Three.js到本地。

### Q: 帧率低怎么办?

A:
- 关闭其他浏览器标签
- 降低浏览器缩放比例
- 检查GPU驱动是否最新

### Q: 点击开始无反应?

A: 打开浏览器控制台查看错误信息，通常是模块加载问题。