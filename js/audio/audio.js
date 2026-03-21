// js/audio/audio.js - 音频管理器
export class AudioManager {
  constructor() {
    this.ctx = null;
    this.volume = 0.7;
    this.bgmOscillator = null;
    this.bgmGain = null;
    // 空间音效监听器位置
    this.listenerPosition = new THREE.Vector3();

    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  init() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * 更新监听器位置
   */
  setListenerPosition(x, y, z) {
    this.listenerPosition.set(x, y, z);
  }

  /**
   * 根据距离计算音量和滤波
   */
  getDistanceParams(soundPosition, maxDistance = 300) {
    const distance = this.listenerPosition.distanceTo(soundPosition);
    const normalizedDistance = Math.min(distance / maxDistance, 1);

    // 音量随距离衰减
    const volume = Math.max(0, 1 - normalizedDistance * normalizedDistance);

    // 远距离使用低通滤波
    const filterFreq = Math.max(200, 2000 * (1 - normalizedDistance * 0.8));

    return { volume, filterFreq, distance };
  }

  /**
   * 播放空间音效
   */
  playSpatialSound(soundPosition, soundFn, maxDistance = 300) {
    const params = this.getDistanceParams(soundPosition, maxDistance);

    if (params.volume < 0.05) return; // 太远不播放

    // 调用原有音效函数
    soundFn.call(this, params);
  }

  playTone(freq, type, duration, vol = 1) {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(vol * this.volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  // 播放噪音（用于枪声）
  playNoise(duration, vol = 1, filter = 'lowpass', freq = 1000) {
    if (!this.ctx) return;

    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filterNode = this.ctx.createBiquadFilter();
    filterNode.type = filter;
    filterNode.frequency.value = freq;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol * this.volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    noise.connect(filterNode);
    filterNode.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
    noise.stop(this.ctx.currentTime + duration);
  }

  // 创建冲击声
  playImpact(freq, duration, vol) {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.1, this.ctx.currentTime + duration);

    gain.gain.setValueAtTime(vol * this.volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  // 手枪射击音效 - 9mm手枪，清脆有力
  playPistol() {
    const now = this.ctx.currentTime;

    // 主爆发音 - 清脆的高频爆裂
    this.playNoise(0.06, 0.55, 'highpass', 1200);
    this.playNoise(0.08, 0.4, 'bandpass', 2500);

    // 机械撞击声
    this.playTone(350, 'square', 0.03, 0.25);
    this.playTone(180, 'sawtooth', 0.04, 0.15);

    // 低频冲击
    this.playImpact(180, 0.05, 0.35);

    // 高频爆裂
    this.playTone(2800, 'sawtooth', 0.025, 0.35);

    // 滑套回位声
    setTimeout(() => {
      this.playTone(200, 'triangle', 0.04, 0.12);
      this.playNoise(0.02, 0.08, 'highpass', 3000);
    }, 60);
  }

  // 步枪射击音效 - 5.56mm突击步枪，快速有力
  playRifle() {
    // 主爆发音 - 强烈的中频爆裂
    this.playNoise(0.05, 0.7, 'bandpass', 1800);
    this.playNoise(0.06, 0.5, 'highpass', 800);

    // 高频爆裂
    this.playTone(3200, 'sawtooth', 0.03, 0.45);
    this.playTone(2400, 'square', 0.04, 0.3);

    // 低频冲击 - 更强的冲击感
    this.playImpact(120, 0.08, 0.5);
    this.playImpact(80, 0.1, 0.35);

    // 机械声
    this.playTone(280, 'triangle', 0.025, 0.2);

    // 枪口制退器效果
    setTimeout(() => {
      this.playNoise(0.03, 0.25, 'lowpass', 600);
    }, 20);

    // 远处回音
    setTimeout(() => {
      this.playNoise(0.04, 0.15, 'lowpass', 400);
    }, 50);
  }

  // 狙击枪射击音效 - .308/7.62mm，震撼深沉
  playSniper() {
    // 巨大的爆发音
    this.playNoise(0.2, 0.9, 'lowpass', 600);
    this.playNoise(0.15, 0.7, 'bandpass', 1200);

    // 深沉的低频 - 胸腔共鸣感
    this.playImpact(60, 0.35, 0.8);
    this.playImpact(90, 0.25, 0.6);
    this.playImpact(120, 0.15, 0.45);

    // 高频爆裂
    this.playTone(4000, 'sawtooth', 0.06, 0.45);
    this.playTone(2800, 'square', 0.08, 0.35);

    // 机械撞击
    this.playTone(180, 'triangle', 0.08, 0.25);

    // 多重回音 - 模拟远距离射击
    setTimeout(() => this.playNoise(0.12, 0.35, 'lowpass', 250), 80);
    setTimeout(() => this.playNoise(0.08, 0.2, 'lowpass', 180), 160);
    setTimeout(() => this.playNoise(0.05, 0.1, 'lowpass', 120), 240);
  }

  // 霰弹枪射击音效 - 12号口径，厚重猛烈
  playShotgun() {
    // 厚重的爆发音 - 多层噪音叠加
    this.playNoise(0.18, 0.9, 'lowpass', 500);
    this.playNoise(0.12, 0.7, 'bandpass', 800);
    this.playNoise(0.08, 0.5, 'highpass', 400);

    // 多层低频 - 震撼感
    this.playImpact(50, 0.3, 0.75);
    this.playImpact(80, 0.2, 0.6);
    this.playImpact(110, 0.15, 0.45);
    this.playImpact(150, 0.1, 0.35);

    // 高频碎裂声
    this.playTone(3500, 'sawtooth', 0.05, 0.4);
    this.playTone(2000, 'square', 0.07, 0.3);

    // 双管爆发效果
    this.playNoise(0.04, 0.4, 'bandpass', 2000);

    // 泵动机械声
    setTimeout(() => {
      this.playTone(180, 'triangle', 0.12, 0.25);
      this.playTone(120, 'sine', 0.08, 0.15);
      this.playNoise(0.06, 0.2, 'highpass', 2500);
    }, 150);

    // 弹壳落地声
    setTimeout(() => {
      this.playTone(800, 'sine', 0.05, 0.1);
      this.playTone(600, 'sine', 0.04, 0.08);
    }, 300);
  }

  // 根据武器ID播放射击音效
  playShoot(weaponId) {
    switch (weaponId) {
      // 手枪类
      case 'glock17':
        this.playGlock17();
        break;
      case 'deagle':
        this.playDeagle();
        break;
      case 'revolver':
        this.playRevolver();
        break;
      // 步枪类
      case 'ak47':
        this.playAK47();
        break;
      case 'm4a1':
        this.playM4A1();
        break;
      case 'scarh':
        this.playSCARH();
        break;
      // 冲锋枪类
      case 'mp5':
        this.playMP5();
        break;
      case 'p90':
        this.playP90();
        break;
      // 狙击枪类
      case 'awp':
        this.playAWP();
        break;
      case 'barrett':
        this.playBarrett();
        break;
      // 霰弹枪类
      case 'spas12':
        this.playSPAS12();
        break;
      case 'aa12':
        this.playAA12();
        break;
      // 默认使用Glock音效
      default:
        this.playGlock17();
    }
  }

  /**
   * 播放远距离射击音效 - 低通滤波，闷响效果
   */
  playDistantShot(distance) {
    // 根据距离调整参数
    const normalizedDistance = Math.min(distance / 300, 1);
    const volume = Math.max(0.1, 0.8 - normalizedDistance * 0.7);
    const filterFreq = Math.max(150, 800 - normalizedDistance * 650);

    // 播放闷响
    this.playNoise(0.15, volume, 'lowpass', filterFreq);

    // 远距离回音
    if (distance > 100) {
      setTimeout(() => {
        this.playNoise(0.08, volume * 0.3, 'lowpass', filterFreq * 0.5);
      }, 50 + distance * 0.2);
    }
  }

  // ===== 手枪类音效 =====

  // Glock 17 - 9mm手枪，清脆快速
  playGlock17() {
    this.playNoise(0.05, 0.5, 'highpass', 1500);
    this.playNoise(0.07, 0.35, 'bandpass', 2800);
    this.playTone(320, 'square', 0.025, 0.22);
    this.playImpact(200, 0.04, 0.3);
    this.playTone(3000, 'sawtooth', 0.02, 0.3);
    setTimeout(() => {
      this.playTone(220, 'triangle', 0.035, 0.1);
    }, 50);
  }

  // Desert Eagle - .50 AE口径，深沉震撼
  playDeagle() {
    this.playNoise(0.12, 0.85, 'lowpass', 800);
    this.playNoise(0.08, 0.6, 'bandpass', 1500);
    this.playImpact(80, 0.25, 0.75);
    this.playImpact(120, 0.15, 0.5);
    this.playTone(150, 'square', 0.08, 0.4);
    this.playTone(2500, 'sawtooth', 0.04, 0.35);
    setTimeout(() => {
      this.playNoise(0.06, 0.25, 'lowpass', 500);
    }, 60);
    setTimeout(() => {
      this.playTone(180, 'triangle', 0.06, 0.15);
    }, 120);
  }

  // Python .357 左轮手枪 - 金属感强，回声明显
  playRevolver() {
    this.playNoise(0.1, 0.7, 'bandpass', 1200);
    this.playNoise(0.08, 0.5, 'highpass', 2000);
    this.playImpact(100, 0.2, 0.65);
    this.playTone(180, 'sawtooth', 0.06, 0.35);
    this.playTone(2800, 'square', 0.03, 0.3);
    // 左轮特有的金属回声
    setTimeout(() => {
      this.playTone(400, 'sine', 0.04, 0.15);
      this.playNoise(0.03, 0.12, 'highpass', 3500);
    }, 40);
    setTimeout(() => {
      this.playTone(350, 'sine', 0.03, 0.08);
    }, 80);
  }

  // ===== 步枪类音效 =====

  // AK-47 - 7.62mm，粗糙有力
  playAK47() {
    this.playNoise(0.06, 0.75, 'bandpass', 1400);
    this.playNoise(0.05, 0.55, 'lowpass', 600);
    this.playImpact(100, 0.12, 0.6);
    this.playImpact(70, 0.08, 0.4);
    this.playTone(200, 'sawtooth', 0.035, 0.3);
    this.playTone(1800, 'square', 0.025, 0.35);
    // 独特的金属咔哒声
    setTimeout(() => {
      this.playTone(500, 'triangle', 0.02, 0.18);
    }, 30);
  }

  // M4A1 - 5.56mm，清脆高频
  playM4A1() {
    this.playNoise(0.04, 0.65, 'highpass', 1000);
    this.playNoise(0.05, 0.5, 'bandpass', 2500);
    this.playImpact(150, 0.08, 0.5);
    this.playTone(350, 'square', 0.025, 0.25);
    this.playTone(3500, 'sawtooth', 0.02, 0.35);
    setTimeout(() => {
      this.playNoise(0.025, 0.2, 'lowpass', 700);
    }, 25);
  }

  /**
   * 空间化M4A1射击 - 根据距离调整
   */
  playM4A1Spatial(params) {
    const { volume, filterFreq } = params;

    this.playNoise(0.04, 0.65 * volume, 'highpass', Math.max(filterFreq, 800));
    this.playNoise(0.05, 0.5 * volume, 'bandpass', Math.max(filterFreq * 1.5, 1500));
    this.playImpact(150, 0.08, 0.5 * volume);

    // 远距离时减少高频成分
    if (filterFreq > 800) {
      this.playTone(350, 'square', 0.025, 0.25 * volume);
    }
    this.playTone(3500, 'sawtooth', 0.02, 0.35 * volume * (filterFreq / 2000));
  }

  // SCAR-H - 7.62mm战术步枪，厚重但精准
  playSCARH() {
    this.playNoise(0.05, 0.7, 'bandpass', 1600);
    this.playNoise(0.06, 0.5, 'lowpass', 800);
    this.playImpact(90, 0.1, 0.55);
    this.playTone(220, 'square', 0.03, 0.28);
    this.playTone(3000, 'sawtooth', 0.022, 0.32);
    // 战术消音效果
    setTimeout(() => {
      this.playNoise(0.03, 0.18, 'highpass', 4000);
    }, 20);
  }

  // ===== 冲锋枪类音效 =====

  // MP5 - 9mm冲锋枪，紧凑清脆
  playMP5() {
    this.playNoise(0.035, 0.5, 'highpass', 1800);
    this.playNoise(0.04, 0.35, 'bandpass', 3000);
    this.playImpact(250, 0.04, 0.35);
    this.playTone(450, 'square', 0.018, 0.2);
    this.playTone(4000, 'sawtooth', 0.012, 0.25);
    setTimeout(() => {
      this.playTone(300, 'triangle', 0.015, 0.1);
    }, 20);
  }

  // P90 - 5.7mm，高射速独特声音
  playP90() {
    this.playNoise(0.03, 0.45, 'highpass', 2200);
    this.playNoise(0.035, 0.35, 'bandpass', 3500);
    this.playImpact(300, 0.035, 0.3);
    this.playTone(500, 'square', 0.015, 0.18);
    this.playTone(4500, 'sawtooth', 0.01, 0.22);
    setTimeout(() => {
      this.playNoise(0.02, 0.12, 'highpass', 5000);
    }, 15);
  }

  // ===== 狙击枪类音效 =====

  // AWP - .338 Lapua，精准深沉
  playAWP() {
    this.playNoise(0.18, 0.85, 'lowpass', 500);
    this.playNoise(0.12, 0.65, 'bandpass', 1000);
    this.playImpact(50, 0.35, 0.8);
    this.playImpact(80, 0.2, 0.55);
    this.playTone(100, 'sawtooth', 0.12, 0.5);
    this.playTone(2000, 'square', 0.06, 0.4);
    // 远距离回声
    setTimeout(() => this.playNoise(0.1, 0.3, 'lowpass', 300), 100);
    setTimeout(() => this.playNoise(0.06, 0.15, 'lowpass', 200), 200);
  }

  // Barrett M82 - .50 BMG反器材，震撼巨响
  playBarrett() {
    this.playNoise(0.25, 0.95, 'lowpass', 400);
    this.playNoise(0.18, 0.75, 'bandpass', 800);
    this.playImpact(35, 0.4, 0.9);
    this.playImpact(55, 0.25, 0.7);
    this.playImpact(80, 0.15, 0.5);
    this.playTone(60, 'sawtooth', 0.2, 0.6);
    this.playTone(1500, 'square', 0.08, 0.45);
    // 巨大的回声
    setTimeout(() => this.playNoise(0.15, 0.4, 'lowpass', 250), 80);
    setTimeout(() => this.playNoise(0.1, 0.25, 'lowpass', 180), 160);
    setTimeout(() => this.playNoise(0.05, 0.12, 'lowpass', 120), 240);
  }

  // ===== 霰弹枪类音效 =====

  // SPAS-12 - 12号口径泵动霰弹枪
  playSPAS12() {
    this.playNoise(0.16, 0.9, 'lowpass', 450);
    this.playNoise(0.1, 0.7, 'bandpass', 700);
    this.playNoise(0.06, 0.45, 'highpass', 500);
    this.playImpact(45, 0.28, 0.75);
    this.playImpact(75, 0.18, 0.55);
    this.playTone(80, 'sawtooth', 0.15, 0.45);
    this.playTone(1200, 'square', 0.05, 0.35);
    // 泵动声
    setTimeout(() => {
      this.playTone(200, 'triangle', 0.1, 0.22);
      this.playTone(140, 'sine', 0.07, 0.12);
      this.playNoise(0.05, 0.18, 'highpass', 2000);
    }, 120);
  }

  // AA-12 - 全自动霰弹枪
  playAA12() {
    this.playNoise(0.12, 0.8, 'lowpass', 500);
    this.playNoise(0.08, 0.6, 'bandpass', 800);
    this.playImpact(55, 0.2, 0.65);
    this.playImpact(85, 0.12, 0.45);
    this.playTone(100, 'sawtooth', 0.1, 0.4);
    this.playTone(1500, 'square', 0.04, 0.3);
    // 自动循环声
    setTimeout(() => {
      this.playNoise(0.03, 0.15, 'highpass', 3000);
    }, 30);
  }

  playHit() {
    this.playTone(800 + Math.random() * 200, 'sine', 0.15, 0.5);
    this.playNoise(0.03, 0.15, 'highpass', 2000);
  }

  playHeadshot() {
    this.playTone(1200, 'sine', 0.2, 0.6);
    this.playTone(1800, 'sine', 0.15, 0.4);
    setTimeout(() => {
      this.playTone(1500, 'sine', 0.1, 0.3);
    }, 50);
  }

  playSpawn() {
    this.playTone(400 + Math.random() * 100, 'triangle', 0.05, 0.2);
  }

  playCombo(count) {
    const baseFreq = 440;
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.playTone(baseFreq + (count % 5) * 100 + i * 100, 'square', 0.1, 0.3);
      }, i * 80);
    }
  }

  playLevelUp() {
    // 更丰富的升级音效
    const notes = [523, 659, 784, 880, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 'square', 0.15, 0.25);
        this.playTone(freq * 1.5, 'sine', 0.1, 0.15);
      }, i * 120);
    });
  }

  playGameOver() {
    // 更戏剧性的游戏结束音效
    const notes = [523, 466, 440, 392, 349, 330];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 'sawtooth', 0.25, 0.25);
        this.playTone(freq * 0.5, 'sine', 0.3, 0.15);
      }, i * 180);
    });
    // 最后的回音
    setTimeout(() => {
      this.playTone(262, 'sine', 0.5, 0.2);
    }, 1200);
  }

  playGameStart() {
    // 游戏开始音效
    const notes = [392, 523, 659, 784];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 'square', 0.12, 0.2);
        this.playTone(freq * 2, 'sine', 0.08, 0.1);
      }, i * 100);
    });
  }

  playCountdown() {
    // 倒计时滴答声
    this.playTone(800, 'square', 0.08, 0.25);
    this.playTone(800, 'sine', 0.05, 0.15);
  }

  playCountdownFinal() {
    // 倒计时最后一声
    this.playTone(1000, 'square', 0.15, 0.35);
    this.playTone(1200, 'sine', 0.1, 0.2);
  }

  playReload() {
    // 弹匣释放
    this.playTone(350, 'triangle', 0.06, 0.25);
    this.playNoise(0.03, 0.12, 'highpass', 3000);

    // 弹匣取出
    setTimeout(() => {
      this.playTone(280, 'triangle', 0.08, 0.2);
      this.playNoise(0.04, 0.1, 'bandpass', 2000);
    }, 80);

    // 新弹匣插入
    setTimeout(() => {
      this.playTone(450, 'sine', 0.05, 0.22);
      this.playTone(380, 'triangle', 0.06, 0.18);
      this.playNoise(0.03, 0.12, 'highpass', 2500);
    }, 200);

    // 滑套释放
    setTimeout(() => {
      this.playTone(500, 'sine', 0.04, 0.2);
      this.playNoise(0.02, 0.1, 'highpass', 4000);
    }, 300);
  }

  playWeaponSwitch() {
    this.playTone(600, 'sine', 0.06, 0.22);
    this.playTone(800, 'sine', 0.04, 0.18);
    this.playNoise(0.02, 0.1, 'highpass', 3000);
  }

  playEmpty() {
    // 击针空击声
    this.playTone(120, 'square', 0.04, 0.35);
    this.playTone(80, 'sine', 0.03, 0.2);
    this.playNoise(0.02, 0.15, 'highpass', 4000);
  }

  startBGM() {
    if (!this.ctx) return;

    this.stopBGM();

    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.value = 0.06 * this.volume;
    this.bgmGain.connect(this.ctx.destination);

    const createLoop = () => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 45;
      osc.connect(this.bgmGain);
      osc.start();
      this.bgmOscillator = osc;
    };

    createLoop();
  }

  stopBGM() {
    if (this.bgmOscillator) {
      this.bgmOscillator.stop();
      this.bgmOscillator.disconnect();
      this.bgmOscillator = null;
    }
    if (this.bgmGain) {
      this.bgmGain.disconnect();
      this.bgmGain = null;
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
  }
}