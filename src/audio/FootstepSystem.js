/**
 * 脚步声系统
 * 根据玩家移动状态播放相应的脚步声音效
 */
export class FootstepSystem {
  constructor(audioSystem) {
    this.audioSystem = audioSystem;
    this.enabled = true;

    // 脚步声配置
    this.config = {
      walk: { interval: 0.5, volume: 0.4 },
      run: { interval: 0.25, volume: 0.6 },
      crouch: { interval: 0.8, volume: 0.2 },
      jump: { volume: 0.5 },
      land: { volume: 0.7 }
    };

    // 状态
    this.lastFootstepTime = 0;
    this.isMoving = false;
    this.isRunning = false;
    this.isCrouching = false;
    this.wasOnGround = true;

    // 地面材质类型
    this.surfaceType = 'default';
  }

  /**
   * 初始化
   */
  init() {
    this.lastFootstepTime = 0;
    console.log('Footstep System initialized');
    return this;
  }

  /**
   * 更新脚步声状态
   */
  update(playerState, deltaTime) {
    if (!this.enabled) return;

    const {
      velocity,
      isGrounded,
      isRunning,
      isCrouching
    } = playerState;

    const horizontalSpeed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
    const isMoving = horizontalSpeed > 0.1;

    // 检测跳跃和落地
    if (this.wasOnGround && !isGrounded) {
      // 跳跃
      this.playFootstep('jump');
    } else if (!this.wasOnGround && isGrounded) {
      // 落地
      this.playFootstep('land');
    }

    this.wasOnGround = isGrounded;

    // 播放移动脚步声
    if (isMoving && isGrounded) {
      const config = this.getFootstepConfig(isRunning, isCrouching);
      const now = performance.now() / 1000;

      if (now - this.lastFootstepTime >= config.interval) {
        this.playFootstep('step', config.volume);
        this.lastFootstepTime = now;
      }
    }

    this.isMoving = isMoving;
    this.isRunning = isRunning;
    this.isCrouching = isCrouching;
  }

  /**
   * 获取脚步声配置
   */
  getFootstepConfig(isRunning, isCrouching) {
    if (isCrouching) return this.config.crouch;
    if (isRunning) return this.config.run;
    return this.config.walk;
  }

  /**
   * 播放脚步声
   */
  playFootstep(type, volume = 0.5) {
    if (!this.audioSystem || !this.audioSystem.enabled) return;

    // 程序化生成脚步声
    this.generateFootstepSound(type, volume);
  }

  /**
   * 程序化生成脚步声
   */
  generateFootstepSound(type, volume) {
    if (!this.audioSystem.audioContext) return;

    const ctx = this.audioSystem.audioContext;
    const now = ctx.currentTime;

    // 创建振荡器
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // 根据类型调整参数
    let frequency, duration, attackTime, decayTime;

    switch (type) {
      case 'jump':
        frequency = 150;
        duration = 0.15;
        attackTime = 0.01;
        decayTime = 0.1;
        break;
      case 'land':
        frequency = 80;
        duration = 0.2;
        attackTime = 0.01;
        decayTime = 0.15;
        break;
      default: // step
        frequency = 200 + Math.random() * 100;
        duration = 0.1;
        attackTime = 0.005;
        decayTime = 0.08;
    }

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency, now);
    osc.frequency.exponentialRampToValueAtTime(frequency * 0.5, now + duration);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume * 0.3, now + attackTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gainNode);
    gainNode.connect(this.audioSystem.masterGain);

    osc.start(now);
    osc.stop(now + duration);

    // 添加噪音成分
    this.addNoiseComponent(duration, volume * 0.2, now);
  }

  /**
   * 添加噪音成分
   */
  addNoiseComponent(duration, volume, startTime) {
    if (!this.audioSystem.audioContext) return;

    const ctx = this.audioSystem.audioContext;

    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const gainNode = ctx.createGain();
    gainNode.gain.value = volume;

    noise.connect(gainNode);
    gainNode.connect(this.audioSystem.masterGain);

    noise.start(startTime);
    noise.stop(startTime + duration);
  }

  /**
   * 设置地面类型
   */
  setSurfaceType(type) {
    this.surfaceType = type;
  }

  /**
   * 启用/禁用
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * 销毁
   */
  destroy() {
    // 清理
  }
}