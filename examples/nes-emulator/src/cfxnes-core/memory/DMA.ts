import {log} from '../common';
import CPUMemory from './CPUMemory';

// const TOTAL_DMA_CYCLES = 512;

export default class DMA {
  cycle: number;
  baseAddress: number;
  cpuMemory: CPUMemory;

  constructor() {
    log.info('Initializing DMA');
    this.cycle = 0; // DMA cycle counter
    this.baseAddress = 0; // Base of DMA source address
    this.cpuMemory = null;
  }

  connect(nes) {
    log.info('Connecting DMA');
    this.cpuMemory = nes.cpuMemory;
  }

  reset() {
    log.info('Resetting DMA');
    this.cycle = 512; // TOTAL_DMA_CYCLES
  }

  writeAddress(address) {
    this.cycle = 0;
    this.baseAddress = address << 8; // Source address multiplied by 0x100
  }

  tick() {
    if (this.cycle < 512) {
      this.cycle++;
      if (this.cycle & 1) {
        const address = this.cpuMemory.dma.baseAddress + (this.cpuMemory.dma.cycle >> 1);
        const data = address < 0x2000 ? this.cpuMemory.ram[address & 0x07FF] : this.cpuMemory.read(address);
        // this.cpuMemory.write(0x2004, data);
          if (!(!this.cpuMemory.ppu.vblankActive && (this.cpuMemory.ppu.spritesVisible || this.cpuMemory.ppu.backgroundVisible))) {
          this.cpuMemory.ppu.primaryOAM[this.cpuMemory.ppu.oamAddress] = data;   // Disabled during rendering
        }
        this.cpuMemory.ppu.oamAddress = (this.cpuMemory.ppu.oamAddress + 1) & 0xFF;
      }
    }
  }

  isBlockingCPU() {
    return this.cycle < 512; // TOTAL_DMA_CYCLES
  }

  transferData() {
    const address = this.baseAddress + (this.cycle >> 1);
    const data = this.cpuMemory.read(address);
    this.cpuMemory.write(0x2004, data);
  }

}
