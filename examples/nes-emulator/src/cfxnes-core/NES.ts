import {log, Region} from './common';
import {CPUMemory, PPUMemory, DMA, createMapper} from './memory';
import {PPU, packColor, BLACK_COLOR, VIDEO_HEIGHT, VIDEO_WIDTH} from './video';
import {CPU, Interrupt} from './proc';
import {APU} from './audio';
import Mapper from './memory/mappers/Mapper';
import { Cartridge } from './cartridge/create';
import display from 'display';
import { Joypad, Zapper } from './devices';
import { NMI, RESET } from './proc/interrupts';

export default class NES {
  cpu: CPU;
  ppu: PPU;
  apu: APU;
  dma: DMA;
  cpuMemory: CPUMemory;
  ppuMemory: PPUMemory;
  cartridge: Cartridge | null;
  mapper: Mapper | null;
  region: null;

  constructor(units: {
    cpu?: CPU;
    ppu?: PPU;
    apu?: APU;
    dma?: DMA;
    cpuMemory?: CPUMemory;
    ppuMemory?: PPUMemory;
  } = {}) {
    log.info('Initializing NES');

    this.cpu = units.cpu || new CPU;
    this.ppu = units.ppu || new PPU;
    this.apu = units.apu || new APU;
    this.dma = units.dma || new DMA;
    this.cpuMemory = units.cpuMemory || new CPUMemory;
    this.ppuMemory = units.ppuMemory || new PPUMemory;

    this.cartridge = null;
    this.mapper = null;
    this.region = null;

    this.connectUnits();
    this.applyRegion();
  }

  //=========================================================
  // Units
  //=========================================================

  connectUnits() {
    this.cpu.connect(this);
    this.ppu.connect(this);
    this.apu.connect(this);
    this.dma.connect(this);
    this.cpuMemory.connect(this);
  }

  resetUnits() {
    this.cpuMemory.reset();
    this.ppuMemory.reset();
    this.mapper.reset(); // Must be done after memory
    this.ppu.reset();
    this.apu.reset();
    this.dma.reset();
    this.cpu.reset(); // Must be done last
  }

  //=========================================================
  // Region
  //=========================================================

  setRegion(region) {
    this.region = region;
    this.applyRegion();
  }

  getRegion() {
    return this.region;
  }

  getUsedRegion() {
    return this.region || (this.cartridge && this.cartridge.region) || Region.NTSC;
  }

  applyRegion() {
    log.info('Updating region parameters');
    const region = this.getUsedRegion();
    const params = Region.getParams(region);

    log.info(`Detected region: "${region}"`);
    this.ppu.setRegionParams(params);
    this.apu.setRegionParams(params);
  }

  //=========================================================
  // Cartridge
  //=========================================================

  setCartridge(cartridge) {
    if (this.cartridge) {
      log.info('Removing current cartridge');
      if (this.mapper) { // Does not have to be present in case of error during mapper creation.
        this.mapper.disconnect();
        this.mapper = null;
      }
      this.cartridge = null;
    }
    if (cartridge) {
      log.info('Inserting cartridge');
      this.cartridge = cartridge;
      this.mapper = createMapper(cartridge);
      this.mapper.connect(this);
      this.applyRegion();
      this.power();
    }
  }

  getCartridge() {
    return this.cartridge;
  }

  //=========================================================
  // Reset
  //=========================================================

  power() {
    if (this.cartridge) {
      this.resetUnits();
    }
  }

  reset() {
    this.cpu.activateInterrupt(Interrupt.RESET);
  }

  //=========================================================
  // Input devices
  //=========================================================

  setInputDevice(port, device: Joypad | Zapper) {
    const oldDevice = this.cpuMemory.getInputDevice(port);
    if (oldDevice) {
      oldDevice.disconnect();
    }
    this.cpuMemory.setInputDevice(port, device);
    if (device) {
      device.connect(this);
    }
  }

  getInputDevice(port) {
    return this.cpuMemory.getInputDevice(port);
  }

  //=========================================================
  // Video output
  //=========================================================

  setPalette(palette) {
    this.ppu.setBasePalette(palette);
  }

  getPalette() {
    return this.ppu.getBasePalette();
  }

  setFrameBuffer(buffer) {
    this.ppu.setFrameBuffer(buffer);
  }

  renderFrame() {
    this.ppu.resetFrameBuffer();
    let time = now();
    while (!this.ppu.isFrameAvailable()) {
      // this.cpu.step();
      const blocked = this.dma.cycle < 512;
      if (this.cpu.activeInterrupts && !blocked) {
        this.cpu.resolveInterrupt();
        if (this.cpu.activeInterrupts & RESET) {
          this.cpu.handleReset();
        } else if (this.cpu.activeInterrupts & NMI) {
          this.cpu.handleNMI();
        } else if (this.cpu.irqDisabled) {
          return; // IRQ requested, but disabled
        } else {
          this.cpu.handleIRQ();
        }

        for (let i = 0; i < 2; i++) {
          if (this.dma.cycle < 512) {
            this.dma.cycle++;
            if (this.dma.cycle & 1) {
              const address = this.dma.baseAddress + (this.dma.cycle >> 1);
              const data = address < 0x2000 ? this.cpuMemory.ram[address & 0x07FF] : this.cpuMemory.read(address);
              // this.cpuMemory.write(0x2004, data);
              if (!(!this.ppu.vblankActive && (this.ppu.spritesVisible || this.ppu.backgroundVisible))) {
                this.ppu.primaryOAM[this.ppu.oamAddress] = data;   // Disabled during rendering
              }
              this.ppu.oamAddress = (this.ppu.oamAddress + 1) & 0xFF;
            }
          }
          this.ppu.tick();
          this.ppu.tick();
          this.ppu.tick();
        }
      }

      if (this.cpu.halted || blocked) {
        if (this.dma.cycle < 512) {
          this.dma.cycle++;
          if (this.dma.cycle & 1) {
            const address = this.dma.baseAddress + (this.dma.cycle >> 1);
            const data = address < 0x2000 ? this.cpuMemory.ram[address & 0x07FF] : this.cpuMemory.read(address);
            // this.cpuMemory.write(0x2004, data);
              if (!(!this.ppu.vblankActive && (this.ppu.spritesVisible || this.ppu.backgroundVisible))) {
              this.ppu.primaryOAM[this.ppu.oamAddress] = data;   // Disabled during rendering
            }
            this.ppu.oamAddress = (this.ppu.oamAddress + 1) & 0xFF;
          }
        }
        this.ppu.tick();
        this.ppu.tick();
        this.ppu.tick();
      } else {
        this.cpu.readAndExecuteOperation();
      }
    }
    console.log('this.ppu.isFrameAvailable time:', now() - time);
  }

  renderDebugFrame(buffer) {
    if (this.cartridge) {
      this.ppu.setFrameBuffer(buffer);
      this.ppu.renderDebugFrame();
    } else {
      this.renderEmptyFrame(buffer);
    }
  }

  renderWhiteNoise(buffer) {
    for (let y = 0; y < 135; y++) {
      // const r = (random(0, 256));
      // const g = (random(0, 256));
      // const b = (random(0, 256));
      for (let x = 0; x < 240; x++) {
        // let color = ((r & 0xF8) << 8) | ((g & 0xFC) << 3) | (b >> 3);
        const color = ~~(0xFF * Math.random());
        buffer.drawPixel(x, y, packColor(color, color, color));
      }
    }
  }

  renderEmptyFrame(buffer) {
    buffer.fill(BLACK_COLOR);
  }

  //=========================================================
  // Audio output
  //=========================================================

  setAudioSampleRate(rate) {
    this.apu.setSampleRate(rate);
  }

  getAudioSampleRate() {
    return this.apu.getSampleRate();
  }

  setAudioCallback(callback) {
    this.apu.setCallback(callback);
  }

  getAudioCallback() {
    return this.apu.getCallback();
  }

  setAudioVolume(channel, volume) {
    this.apu.setVolume(channel, volume);
  }

  getAudioVolume(channel) {
    return this.apu.getVolume(channel);
  }

  //=========================================================
  // Non-volatile RAM
  //=========================================================

  getNVRAM() {
    return this.mapper ? this.mapper.getNVRAM() : null;
  }

}
