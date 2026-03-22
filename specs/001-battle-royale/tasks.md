# Tasks: 大逃杀游戏 (Battle Royale Game)

**Input**: Design documents from `/specs/001-battle-royale/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: 手动测试为主，无自动化测试要求

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` at repository root
- **CSS**: `css/` at repository root
- **HTML**: Root level

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project structure per implementation plan (src/, css/ directories)
- [X] T002 [P] Create index.html entry point with Three.js CDN import
- [X] T003 [P] Create main stylesheet in css/style.css
- [X] T004 [P] Create battle royale specific styles in css/battleroyale.css

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Create Engine class in src/core/Engine.js (Three.js initialization, render loop)
- [X] T006 [P] Create InputManager class in src/core/InputManager.js (keyboard, mouse handling)
- [X] T007 [P] Create Entity base class in src/entity/Entity.js (position, rotation, id)
- [X] T008 Create World class in src/world/World.js (terrain, map boundaries 500x500)
- [X] T009 Create main entry point in src/main.js (game initialization)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - 进入战场并生存 (Priority: P1) 🎯 MVP

**Goal**: 玩家能够进入战场地图，移动探索，在安全区内生存

**Independent Test**: 启动游戏、看到角色出现在地图上、使用WASD控制移动、看到安全区边界

### Implementation for User Story 1

- [X] T010 [P] [US1] Create Player entity in src/entity/Player.js (position, health, velocity)
- [X] T011 [P] [US1] Create Health component in src/component/Health.js (current, max, damage, heal)
- [X] T012 [US1] Create CharacterController in src/component/CharacterController.js (WASD movement, sprint, crouch)
- [X] T013 [US1] Create FirstPersonCamera in src/camera/FirstPersonCamera.js (mouse look, pitch/yaw)
- [X] T014 [US1] Implement SafeZone system in World.js (circle shrink, damage outside zone)
- [X] T015 [US1] Create basic terrain in World.js (flat ground, boundaries visualization)
- [X] T016 [US1] Add HUD display for health and safe zone timer in index.html/css
- [X] T017 [US1] Integrate player movement with camera and world in main.js

**Checkpoint**: Player can spawn, move around the map, and see the safe zone shrinking

---

## Phase 4: User Story 2 - 收集武器和装备 (Priority: P1)

**Goal**: 玩家能够在地图上发现并拾取武器、弹药和装备

**Independent Test**: 在地图上放置物品、玩家移动到物品位置、按E拾取、物品出现在物品栏

### Implementation for User Story 2

- [X] T018 [P] [US2] Create Item entity in src/entity/Item.js (type, subType, position, amount)
- [X] T019 [P] [US2] Create Inventory component in src/component/Inventory.js (3 weapon slots, ammo tracking)
- [X] T020 [US2] Create Weapon data structure in src/weapon/WeaponSystem.js (pistol, rifle, sniper, shotgun stats)
- [X] T021 [US2] Implement item spawning system in World.js (random placement, item types)
- [X] T022 [US2] Implement pickup detection in Player.js (distance check, E key interaction)
- [X] T023 [US2] Add pickup prompt UI in index.html (nearby item indicator)
- [X] T024 [US2] Add inventory display in HUD (weapon slots, ammo count)

**Checkpoint**: Items spawn on map, player can pick them up, inventory shows collected items

---

## Phase 5: User Story 3 - 使用武器战斗 (Priority: P1)

**Goal**: 玩家能够使用武器射击，造成伤害，消灭敌人

**Independent Test**: 装备武器、瞄准、射击、看到射击效果和伤害

### Implementation for User Story 3

- [X] T025 [P] [US3] Create Projectile class in src/weapon/Projectile.js (position, velocity, damage, owner)
- [X] T026 [P] [US3] Create WeaponController in src/component/WeaponController.js (fire, reload, switch weapons)
- [X] T027 [US3] Implement shooting mechanics in WeaponSystem.js (fire rate, spread, bullet spawn)
- [X] T028 [US3] Implement projectile physics in Projectile.js (movement, collision detection)
- [X] T029 [US3] Implement hit detection system (raycasting for hitscan, collision for projectiles)
- [X] T030 [US3] Add weapon switching (1/2/3 keys) in WeaponController.js
- [X] T031 [US3] Add reload mechanic (R key, reload time, ammo reserve) in WeaponController.js
- [X] T032 [US3] Create FPSHandsModel in src/model/FPSHandsModel.js (weapon visualization)
- [X] T033 [US3] Create muzzle flash and bullet tracer effects in src/effects/TracerSystem.js
- [X] T034 [US3] Add weapon HUD display (current ammo, reserve ammo, weapon name)

**Checkpoint**: Player can shoot weapons, bullets fly and hit targets, damage is dealt

---

## Phase 6: User Story 4 - 获得最终胜利 (Priority: P2)

**Goal**: 当玩家成为最后生存者时显示胜利画面

**Independent Test**: 消灭所有敌人、确认胜利画面显示、查看结算数据

### Implementation for User Story 4

- [X] T035 [P] [US4] Create game state manager (menu, playing, paused, gameover, victory)
- [X] T036 [US4] Implement victory condition check (last survivor detection)
- [X] T037 [US4] Create victory screen UI ("大吉大利，今晚吃鸡" message)
- [X] T038 [US4] Create defeat screen UI (game over message)
- [X] T039 [US4] Add game statistics tracking (kills, survival time, damage dealt)
- [X] T040 [US4] Create end-game statistics display (kill count, time survived)
- [X] T041 [US4] Add restart game functionality (return to menu)

**Checkpoint**: Game properly ends with victory or defeat, shows results, can restart

---

## Phase 7: User Story 5 - 与AI敌人对战 (Priority: P2)

**Goal**: AI敌人会主动寻找并攻击玩家

**Independent Test**: 观察AI行为、被AI发现和攻击、击败AI敌人

### Implementation for User Story 5

- [X] T042 [P] [US5] Create Enemy entity in src/entity/Enemy.js (extends Entity, health, aiState)
- [X] T043 [P] [US5] Create AIController in src/ai/AIController.js (FSM: patrol, chase, attack, flee)
- [X] T044 [US5] Implement enemy spawning system in World.js (20 enemies, random positions)
- [X] T045 [US5] Implement AI patrol behavior (random movement, idle)
- [X] T046 [US5] Implement AI detection system (player visibility, distance check)
- [X] T047 [US5] Implement AI chase behavior (pathfinding toward player)
- [X] T048 [US5] Implement AI attack behavior (aim and shoot at player)
- [X] T049 [US5] Implement AI flee behavior (low health retreat)
- [X] T050 [US5] Add enemy death handling (remove from world, increment kill count)
- [X] T051 [US5] Add enemy model/visualization (simple low-poly character)

**Checkpoint**: AI enemies spawn, patrol, detect and attack player, can be killed

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T052 [P] Create PostProcessing effects in src/render/PostProcessing.js (optional bloom, color correction)
- [X] T053 [P] Create EnhancedMaterialSystem in src/render/EnhancedMaterialSystem.js
- [X] T054 [P] Create SkySystem in src/environment/SkySystem.js (skybox, day/night)
- [X] T055 [P] Create EnhancedTerrainSystem in src/environment/EnhancedTerrainSystem.js
- [X] T056 [P] Create AmbientAudioSystem in src/audio/AmbientAudioSystem.js
- [X] T057 [P] Create FootstepSystem in src/audio/FootstepSystem.js
- [X] T058 [P] Create BulletHoleSystem in src/effects/BulletHoleSystem.js
- [X] T059 [P] Create WeatherEffects in src/effects/WeatherEffects.js (optional)
- [X] T060 Create RealisticWeaponModel in src/model/RealisticWeaponModel.js
- [X] T061 Add pause menu functionality (ESC key, resume/quit options)
- [X] T062 Performance optimization (object pooling, LOD, frustum culling)
- [X] T063 Run quickstart.md validation (test all user scenarios)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1, US2, US3 are all P1 - implement sequentially for best flow
  - US4, US5 are P2 - implement after P1 stories
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies
- **User Story 2 (P1)**: Depends on US1 (Player entity needed for inventory)
- **User Story 3 (P1)**: Depends on US2 (Weapons needed for shooting)
- **User Story 4 (P2)**: Depends on US3 (Combat system for victory condition)
- **User Story 5 (P2)**: Depends on US3 (Weapon system for AI attacks)

### Within Each User Story

- Models/components before controllers
- Controllers before integration
- Core implementation before UI
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel
- Within each user story, tasks marked [P] can run in parallel
- Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch parallel tasks for User Story 1:
Task: "Create Player entity in src/entity/Player.js"
Task: "Create Health component in src/component/Health.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Player can move around and see safe zone
5. Continue with US2, US3 for full gameplay

### Full Game Flow

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Player movement and safe zone
3. Add User Story 2 → Item pickup system
4. Add User Story 3 → Combat system
5. Add User Story 4 → Win/lose conditions
6. Add User Story 5 → AI enemies
7. Polish → Effects, audio, optimization

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Low-poly style for performance
- Target: 30-60 fps, <5 second load time

---

## Completion Summary

**Status**: ✅ ALL TASKS COMPLETED

**Total Tasks**: 63
**Completed**: 63
**Remaining**: 0

**Implementation Highlights**:
- Full 3D FPS game with Three.js
- Player movement with WASD, sprint, crouch, jump
- First-person camera with mouse look
- Safe zone shrinking mechanic
- Weapon system with multiple weapon types
- AI enemies with FSM behavior (patrol, chase, attack, flee)
- Victory/defeat conditions
- Complete UI (menu, HUD, pause, gameover)

**Implementation Highlights**:
- Full 3D FPS game with Three.js
- Detailed player and enemy models
- Complete weapon system with 5 weapon categories (pistol, assault, smg, sniper, shotgun)
- AI enemies with FSM behavior (patrol, chase, attack, flee)
- Safe zone shrinking mechanic
- Item pickup system
- Victory/defeat conditions
- Audio systems
- Visual effects (tracers, muzzle flash, bullet holes, weather)
- Post-processing effects