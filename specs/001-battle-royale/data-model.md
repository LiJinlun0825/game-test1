# Data Model: 大逃杀游戏 (Battle Royale Game)

**Feature**: 001-battle-royale
**Date**: 2026-03-22

## 实体关系图

```
┌─────────────┐     ┌─────────────┐
│   Player    │     │    Enemy    │
├─────────────┤     ├─────────────┤
│ id          │     │ id          │
│ position    │     │ position    │
│ rotation    │     │ rotation    │
│ health      │     │ health      │
│ inventory   │     │ aiState     │
│ weapons[]   │     │ weapons[]   │
└─────────────┘     └─────────────┘
       │                   │
       │                   │
       ▼                   ▼
┌─────────────┐     ┌─────────────┐
│   Weapon    │     │     AI      │
├─────────────┤     ├─────────────┤
│ type        │     │ state       │
│ ammo        │     │ target      │
│ damage      │     │ path[]      │
└─────────────┘     └─────────────┘
```

## 核心实体

### Player (玩家)

| 字段 | 类型 | 描述 | 约束 |
|------|------|------|------|
| id | string | 唯一标识 | 固定 "player" |
| position | Vector3 | 世界坐标 | x,z ∈ [-250, 250], y ≥ 0 |
| rotation | Euler | 旋转角度 | yaw ∈ [0, 2π], pitch ∈ [-π/2, π/2] |
| health | Health | 生命值组件 | maxHealth = 100 |
| armor | number | 护甲值 | ∈ [0, 100] |
| inventory | Inventory | 物品栏组件 | 最多3个武器槽 |
| velocity | Vector3 | 移动速度 | |velocity| ≤ 10 |

### Enemy (AI敌人)

| 字段 | 类型 | 描述 | 约束 |
|------|------|------|------|
| id | string | 唯一标识 | 自动生成 |
| position | Vector3 | 世界坐标 | 同Player |
| rotation | Euler | 旋转角度 | 同Player |
| health | Health | 生命值组件 | maxHealth = 100 |
| aiState | string | AI状态 | patrol/chase/attack/flee |
| target | Entity | 目标实体 | 可为null |
| detectionRange | number | 检测范围 | 默认 50 |
| attackRange | number | 攻击范围 | 默认 30 |

### Weapon (武器)

| 字段 | 类型 | 描述 | 约束 |
|------|------|------|------|
| id | string | 武器ID | weapon_* |
| type | enum | 武器类型 | pistol/rifle/sniper/shotgun |
| name | string | 显示名称 | - |
| damage | number | 基础伤害 | pistol=25, rifle=35, sniper=100, shotgun=80 |
| fireRate | number | 射速(发/秒) | pistol=2, rifle=10, sniper=0.5, shotgun=1 |
| magazineSize | number | 弹夹容量 | pistol=15, rifle=30, sniper=5, shotgun=8 |
| currentAmmo | number | 当前弹药 | ≤ magazineSize |
| reserveAmmo | number | 备弹数量 | ≤ 200 |
| reloadTime | number | 换弹时间(秒) | pistol=1.5, rifle=2.5, sniper=3, shotgun=2 |
| isReloading | boolean | 是否换弹中 | - |

### Item (物品)

| 字段 | 类型 | 描述 | 约束 |
|------|------|------|------|
| id | string | 物品ID | 自动生成 |
| type | enum | 物品类型 | weapon/ammo/health/armor |
| subType | string | 子类型 | 武器类型/弹药口径 |
| position | Vector3 | 世界坐标 | - |
| amount | number | 数量 | 默认1 |

### SafeZone (安全区)

| 字段 | 类型 | 描述 | 约束 |
|------|------|------|------|
| center | Vector2 | 中心点 | 地图范围内 |
| currentRadius | number | 当前半径 | 初始250, 最小10 |
| targetRadius | number | 目标半径 | < currentRadius |
| shrinkStartTime | number | 开始收缩时间 | 游戏开始后 |
| shrinkDuration | number | 收缩持续时间 | 默认60秒 |
| damagePerSecond | number | 安全区外伤害 | 默认5 |

### World (游戏世界)

| 字段 | 类型 | 描述 | 约束 |
|------|------|------|------|
| size | Vector2 | 地图尺寸 | 固定 (500, 500) |
| terrain | Terrain | 地形数据 | - |
| buildings | Building[] | 建筑列表 | - |
| spawnPoints | Vector3[] | 刷新点 | - |
| enemies | Enemy[] | 敌人列表 | 数量 = 20 |

## 状态转换

### AI状态机

```
                ┌──────────┐
                │  patrol  │←──────────┐
                └────┬─────┘           │
                     │ 玩家进入检测范围  │ 失去目标
                     ▼                  │
                ┌──────────┐            │
          ┌────→│  chase   │────────────┘
          │     └────┬─────┘
          │          │ 进入攻击范围
          │          ▼
          │     ┌──────────┐
          │     │  attack  │
          │     └────┬─────┘
          │          │ 生命值<30%
          │          ▼
          │     ┌──────────┐
          └─────│   flee   │
                └──────────┘
```

### 游戏状态

```
menu → playing ↔ paused → gameover → menu
                 ↓
               playing (重启)
```

## 验证规则

### 位置验证
- 所有实体位置必须在地图边界内
- y坐标必须 ≥ 地形高度

### 生命值验证
- health.current ∈ [0, health.max]
- 当 health.current = 0 时触发死亡

### 物品栏验证
- 武器槽位 0-2
- 每个槽位最多一个武器
- 弹药总量不超过上限

### 安全区验证
- currentRadius ≥ targetRadius
- 安全区中心必须最终收敛到地图中心附近