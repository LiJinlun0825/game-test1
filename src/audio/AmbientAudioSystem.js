/**
 * 环境音频系统
 * 管理背景音乐、环境音效等
 */
export class AmbientAudioSystem {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.sounds = new Map();
    this.musicVolume = 0.5;
    this.sfxVolume = 0.7;
    this.enabled = true;
    this.initialized = false;
  }

  /**
   * 初始化音频系统
   */
  async init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // 主音量控制
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 1.0;

      this.initialized = true;
      console.log('Ambient Audio System initialized');

      return this;
    } catch (error) {
      console.warn('Audio System initialization failed:', error);
      this.enabled = false;
      return this;
    }
  }

  /**
   * 恢复音频上下文（用户交互后调用）
   */
  async resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  /**
   * 加载音频
   */
  async loadSound(name, url) {
    if (!this.initialized) return null;

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      this.sounds.set(name, audioBuffer);
      return audioBuffer;
    } catch (error) {
      console.warn(`Failed to load sound: ${name}`, error);
      return null;
    }
  }

  /**
   * 播放音效
   */
  playSound(name, options = {}) {
    if (!this.enabled || !this.initialized) return null;

    const buffer = this.sounds.get(name);
    if (!buffer) {
      console.warn(`Sound not found: ${name}`);
      return null;
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = (options.volume || 1) * this.sfxVolume;

    source.connect(gainNode);
    gainNode.connect(this.masterGain);

    source.loop = options.loop || false;
    source.start(0);

    return {
      source,
      gainNode,
      stop: () => {
        try {
          source.stop();
        } catch (e) {}
      }
    };
  }

  /**
   * 播放背景音乐
   */
  playMusic(name, fadeIn = true) {
    // 简化实现
    console.log(`Playing music: ${name}`);
  }

  /**
   * 停止背景音乐
   */
  stopMusic(fadeOut = true) {
    console.log('Stopping music');
  }

  /**
   * 生成程序化环境音
   */
  generateAmbientNoise(type = 'wind') {
    if (!this.initialized || !this.enabled) return;

    // 创建噪音节点
    const bufferSize = 2 * this.audioContext.sampleRate;
    const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.audioContext.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // 滤波器
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = type === 'wind' ? 400 : 200;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = 0.05 * this.musicVolume;

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    whiteNoise.start();

    return {
      stop: () => whiteNoise.stop(),
      setVolume: (v) => gainNode.gain.value = v * 0.05
    };
  }

  /**
   * 设置主音量
   */
  setMasterVolume(volume) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * 设置音乐音量
   */
  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * 设置音效音量
   */
  setSFXVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * 启用/禁用音频
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    if (this.masterGain) {
      this.masterGain.gain.value = enabled ? 1.0 : 0;
    }
  }

  /**
   * 销毁
   */
  destroy() {
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.sounds.clear();
  }
}