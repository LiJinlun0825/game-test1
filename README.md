# 大逃杀游戏 (Battle Royale Game)

一款基于 Three.js 的第一人称大逃杀网页游戏。

## 游戏简介

在 500x500 的地图上与 20 个 AI 敌人展开生存竞技。搜集武器装备，在不断缩小的安全区内战斗，成为最后存活者！

## 功能特性

- **第一人称射击** - 沉浸式 FPS 体验
- **AI 敌人** - 智能敌人具备巡逻、追踪、攻击、逃跑行为
- **武器系统** - 5 种武器类型（手枪、步枪、SMG、狙击枪、霰弹枪）
- **安全区机制** - 经典大逃杀收缩圈玩法
- **物品拾取** - 地图上随机刷新武器和装备
- **小地图** - 实时显示安全区、敌人和玩家位置

## 技术栈

- **前端**: JavaScript ES6+
- **3D 引擎**: Three.js r128 (CDN)
- **视觉风格**: 低多边形 (Low Poly)
- **目标平台**: 现代浏览器 (Chrome 90+, Firefox 88+, Edge 90+, Safari 14+)

## 快速开始

### 环境要求

- 现代浏览器，支持 WebGL
- 本地 HTTP 服务器

### 运行游戏

```bash
# 克隆项目
git clone https://github.com/LiJinlun0825/game-test1.git
cd game-test1

# 启动本地服务器
python -m http.server 8080

# 或使用 Node.js
npx serve .
```

打开浏览器访问: http://localhost:8080

## 操作说明

### 移动控制

| 按键 | 功能 |
|------|------|
| W | 向前移动 |
| S | 向后移动 |
| A | 向左移动 |
| D | 向右移动 |
| Shift | 冲刺加速 |
| Space | 跳跃 |
| C | 蹲伏 |

### 战斗控制

| 按键 | 功能 |
|------|------|
| 鼠标移动 | 控制视角 |
| 左键 | 射击 |
| R | 换弹 |
| 1 | 主武器 1 |
| 2 | 主武器 2 |
| 3 | 副武器 |

### 其他操作

| 按键 | 功能 |
|------|------|
| E | 拾取物品 |
| ESC | 暂停游戏 |
| M | 切换小地图 |

## 游戏流程

1. **开始** - 点击"开始游戏"按钮
2. **搜集** - 在地图上寻找武器和弹药
3. **生存** - 避免安全区外伤害
4. **战斗** - 消灭 AI 敌人
5. **胜利** - 成为最后存活者

## 项目结构

```
src/
├── core/               # 核心系统
│   ├── Engine.js       # 游戏引擎
│   └── InputManager.js # 输入管理
├── entity/             # 实体类
│   ├── Entity.js       # 实体基类
│   ├── Player.js       # 玩家实体
│   ├── Enemy.js        # AI 敌人实体
│   └── Item.js         # 物品实体
├── component/          # 组件
│   ├── CharacterController.js  # 角色控制
│   ├── WeaponController.js     # 武器控制
│   ├── Health.js              # 生命值组件
│   └── Inventory.js           # 物品栏组件
├── weapon/             # 武器系统
│   ├── WeaponSystem.js # 武器配置
│   └── Projectile.js   # 投射物
├── ai/                 # AI 系统
│   └── AIController.js # AI 行为控制
├── camera/             # 相机
│   └── FirstPersonCamera.js # 第一人称相机
├── world/              # 世界
│   └── World.js        # 游戏世界、安全区
├── environment/        # 环境
│   ├── SkySystem.js    # 天空系统
│   └── EnhancedTerrainSystem.js # 地形系统
├── effects/            # 特效
│   ├── TracerSystem.js # 弹道轨迹
│   ├── BulletHoleSystem.js # 弹孔效果
│   └── WeatherEffects.js # 天气效果
├── audio/              # 音频
│   ├── AmbientAudioSystem.js # 环境音效
│   └── FootstepSystem.js # 脚步声
├── render/             # 渲染
│   ├── PostProcessing.js # 后处理效果
│   └── EnhancedMaterialSystem.js # 材质系统
├── model/              # 模型
│   ├── FPSHandsModel.js # FPS 手部模型
│   └── RealisticWeaponModel.js # 武器模型
└── main.js             # 游戏入口

css/
└── style.css           # 样式

specs/
└── 001-battle-royale/  # 设计文档
    ├── spec.md         # 需求规格
    ├── plan.md         # 实现计划
    ├── data-model.md   # 数据模型
    ├── research.md     # 技术研究
    ├── quickstart.md   # 快速开始
    └── tasks.md        # 任务清单
```

## 武器数据

| 武器 | 类型 | 伤害 | 射速 | 弹夹 | 适用距离 |
|------|------|------|------|------|----------|
| Glock 17 | 手枪 | 25 | 2发/秒 | 17 | 近-中 |
| M4A1 | 步枪 | 35 | 10发/秒 | 30 | 中-远 |
| AK-47 | 步枪 | 40 | 8发/秒 | 30 | 中-远 |
| AWP | 狙击枪 | 100 | 0.5发/秒 | 5 | 远 |
| SPAS-12 | 霰弹枪 | 80 | 1发/秒 | 8 | 近 |

## 性能目标

- 帧率: 最低 30fps，目标 60fps
- 加载时间: < 5 秒
- 内存: 无持续增长

## 开发

### 添加新武器

在 `src/weapon/WeaponSystem.js` 中添加武器配置：

```javascript
export const WEAPONS = {
  myWeapon: {
    name: '我的武器',
    type: 'rifle',
    damage: 40,
    fireRate: 8,
    magazineSize: 25,
    reloadTime: 2.0,
    ammoType: 'custom',
    range: 100
  }
};
```

### 添加新敌人类型

扩展 `src/entity/Enemy.js`：

```javascript
class SpecialEnemy extends Enemy {
  constructor() {
    super();
    this.health = new Health(200); // 更高生命值
    this.detectionRange = 80;      // 更远检测
  }
}
```

## 许可证

MIT License

## 作者

LiJinlun0825