<!--
Sync Impact Report:
- Version change: N/A → 1.0.0
- New constitution created from template
- Added sections: Core Principles (5), Quality Standards, Development Workflow, Governance
- Templates status:
  ✅ plan-template.md - Constitution Check section compatible
  ✅ spec-template.md - No changes required
  ✅ tasks-template.md - No changes required
- Follow-up TODOs: None
-->

# Battle Royale Game Constitution

## Core Principles

### I. Performance First

游戏必须在主流浏览器中保持流畅运行。

- 游戏帧率必须保持在每秒30帧以上，目标60帧
- 首次加载时间不超过5秒
- 内存占用合理，避免内存泄漏
- 所有渲染优化必须优先考虑用户体验

**Rationale**: 作为网页游戏，性能直接影响用户留存。低帧率和长加载时间会导致用户立即离开。

### II. Modular Architecture

代码必须按功能模块组织，保持清晰的边界。

- 游戏系统（渲染、物理、AI、音效）必须独立封装
- 模块之间通过明确定义的接口通信
- 每个模块可独立测试和调试
- 避免全局状态污染

**Rationale**: 模块化架构使代码更易维护、测试和扩展，降低后期维护成本。

### III. User Experience Excellence

用户体验必须贯穿开发全过程。

- 所有交互必须有清晰的视觉反馈
- UI元素必须在各种屏幕尺寸下可用
- 键盘和鼠标控制必须响应灵敏且符合预期
- 游戏状态（生命值、弹药、安全区）必须清晰可见

**Rationale**: 良好的用户体验是游戏成功的关键，玩家期望流畅、直观的操作体验。

### IV. Code Quality

代码质量不可妥协。

- 变量和函数命名必须清晰表达意图
- 复杂逻辑必须添加注释说明
- 避免重复代码，提取公共逻辑
- 定期进行代码审查

**Rationale**: 高质量代码减少bug，提高可维护性，使团队协作更高效。

### V. Testing Discipline

关键功能必须有测试覆盖。

- 核心游戏逻辑必须有单元测试
- 新功能必须经过手动测试验证
- 性能关键路径必须有基准测试
- 回归测试防止功能退化

**Rationale**: 测试确保功能正确性，减少回归问题，提高发布信心。

## Quality Standards

### Performance Requirements

- 游戏帧率: 最低30fps，目标60fps
- 加载时间: 首次加载 < 5秒
- 响应延迟: 输入响应 < 16ms (一帧)
- 内存: 合理使用，无明显内存泄漏

### Compatibility Requirements

- 浏览器: Chrome 90+, Firefox 88+, Edge 90+, Safari 14+
- 设备: 支持主流桌面和移动设备
- 屏幕: 响应式设计，支持各种分辨率

### Code Standards

- 使用 ES6+ 语法
- 遵循一致的代码风格
- 文件命名使用小写和连字符 (kebab-case)
- 类命名使用大驼峰 (PascalCase)

## Development Workflow

### Feature Development

1. 创建功能规格说明 (`/speckit.specify`)
2. 澄清需求 (`/speckit.clarify`)
3. 制定实现计划 (`/speckit.plan`)
4. 生成任务列表 (`/speckit.tasks`)
5. 实现功能 (`/speckit.implement`)

### Code Review Checklist

- [ ] 代码符合项目风格规范
- [ ] 新功能有对应测试
- [ ] 无性能退化
- [ ] UI/UX 符合设计规范
- [ ] 无控制台错误或警告

### Release Process

1. 完成所有计划任务
2. 通过所有测试
3. 代码审查通过
4. 更新版本号和变更日志
5. 部署并验证

## Governance

### Amendment Procedure

- 宪法修改需要明确说明变更原因
- 修改后必须更新版本号
- 重大变更需要团队讨论确认

### Version Policy

- MAJOR: 核心原则变更或删除
- MINOR: 新增原则或重大扩展
- PATCH: 澄清、修正、小幅调整

### Compliance

- 所有新代码必须符合本宪法规定
- 定期审查项目是否符合宪法原则
- 发现违规必须及时修正或记录例外原因

**Version**: 1.0.0 | **Ratified**: 2026-03-22 | **Last Amended**: 2026-03-22