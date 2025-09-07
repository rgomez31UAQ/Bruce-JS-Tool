import { APU } from '../audio';
import { log } from '../common';
import { CPUMemory, DMA } from '../memory';
import Mapper from '../memory/mappers/Mapper';
import { PPU } from '../video';
import { RESET, NMI } from './interrupts';

// CPU operation flags
const F_EXTRA_CYCLE = 1 << 0; // Operation has +1 cycle
const F_DOUBLE_READ = 1 << 1; // Operation always does double read during "absolute X/Y" and "indirect Y" addressing modes

// Interrupt handler addresses
const RESET_ADDRESS = 0xFFFC;
const NMI_ADDRESS = 0xFFFA;
const IRQ_ADDRESS = 0xFFFE;

// Table of all CPU operations, changed to function

export default class CPU {

  //=========================================================
  // Initialization
  //=========================================================

  apu: APU;
  ppu: PPU;
  mapper: Mapper;
  dma: DMA;
  cpuMemory: CPUMemory;
  halted: boolean;
  operationFlags: number;
  activeInterrupts: number;
  irqDisabled: number;
  pageCrossed: boolean;
  programCounter: number;
  stackPointer: number;
  accumulator: number;
  registerX: number;
  registerY: number;
  carryFlag: number;
  zeroFlag: number;
  interruptFlag: number;
  decimalFlag: number;
  overflowFlag: number;
  negativeFlag: number;

  constructor() {
    log.info('Initializing CPU');

    // State
    this.halted = false;       // Whether CPU was halter by KIL operation code
    this.operationFlags = 0;   // Flags of the currently executed operation
    this.activeInterrupts = 0; // Bitmap of active interrupts (each type of interrupt has its own bit)
    this.irqDisabled = 0;      // Value that is read from the interrupt flag (see below) at the start of last cycle of each instruction
    this.pageCrossed = false;      // Whether page was crossed during address computation

    // Registers
    this.programCounter = 0; // 16-bit address of the next instruction to read
    this.stackPointer = 0;   //  8-bit address of top of the stack
    this.accumulator = 0;    //  8-bit accumulator register
    this.registerX = 0;      //  8-bit X register
    this.registerY = 0;      //  8-bit Y register

    // Bits of 8-bit status register
    // - S[4] and S[5] are not physically stored in status register
    // - S[4] is written on stack as 1 during PHP/BRK instructions (break command flag)
    // - S[5] is written on stack as 1 during PHP/BRK instructions and IRQ/NMI
    this.carryFlag = 0;     // S[0] Carry bit of the last operation
    this.zeroFlag = 0;      // S[1] Whether result of the last operation was zero
    this.interruptFlag = 0; // S[2] Whether all IRQ are disabled (this does not affect NMI/reset)
    this.decimalFlag = 0;   // S[3] NES CPU actually does not use this flag, but it's stored in status register and modified by CLD/SED instructions
    this.overflowFlag = 0;  // S[6] Whether result of the last operation caused overflow
    this.negativeFlag = 0;  // S[7] Whether result of the last operation was negative number (bit 7 of the result was 1)

    // Other units
    this.mapper = null;
    this.cpuMemory = null;
    this.dma = null;
    this.ppu = null;
    this.apu = null;
  }

  connect(nes) {
    log.info('Connecting CPU');
    this.cpuMemory = nes.cpuMemory;
    this.ppu = nes.ppu;
    this.apu = nes.apu;
    this.dma = nes.dma;
  }

  setMapper(mapper) {
    this.mapper = mapper;
  }

  //=========================================================
  // Reset
  //=========================================================

  reset() {
    log.info('Resetting CPU');
    this.resetState();
    this.resetMemory();
    this.handleReset();
  }

  resetState() {
    this.activeInterrupts = 0;
    this.halted = false;
    // Program counter will be set to a value at address 0xFFFC during handleReset call
    this.stackPointer = 0; // Will be set to 0x7D during handleReset call
    this.accumulator = 0;
    this.registerX = 0;
    this.registerY = 0;
    this.setStatus(0); // will be set to 0x34 during handleReset call
  }

  resetMemory() {
    for (let i = 0x0000; i < 0x0008; i++) {
      this.cpuMemory.write(i, 0xFF);
    }

    this.cpuMemory.write(0x0008, 0xF7);
    this.cpuMemory.write(0x0009, 0xEF);
    this.cpuMemory.write(0x000A, 0xDF);
    this.cpuMemory.write(0x000F, 0xBF);

    for (let i = 0x0010; i < 0x0800; i++) {
      this.cpuMemory.write(i, 0xFF);
    }

    for (let i = 0x4000; i < 0x4010; i++) {
      this.cpuMemory.write(i, 0x00);
    }

    // Writes to $4015 and $4017 are done during handleReset call
  }

  //=========================================================
  // Execution step
  //=========================================================

  step() {
    const blocked = this.dma.isBlockingCPU(); //  || this.apu.isBlockingCPU()
    if (this.activeInterrupts && !blocked) {
      this.resolveInterrupt();
    }
    if (this.halted || blocked) {
      this.tick(); // Tick everything else
    } else {
      this.readAndExecuteOperation();
    }
  }

  //=========================================================
  // Interrupt handling
  //=========================================================

  resolveInterrupt() {
    if (this.activeInterrupts & RESET) {
      this.handleReset();
    } else if (this.activeInterrupts & NMI) {
      this.handleNMI();
    } else if (this.irqDisabled) {
      return; // IRQ requested, but disabled
    } else {
      this.handleIRQ();
    }
    this.tick();
    this.tick(); // Each interrupt takes 7 cycles
  }

  handleReset() {
    this.writeByte(0x4015, 0x00);                       // Disable all APU channels immediately
    this.writeByte(0x4017, this.apu.frameCounterLast);  // Zero on power up, last written frame counter value otherwise
    this.stackPointer = (this.stackPointer - 3) & 0xFF; // Unlike IRQ/NMI, writing on stack does not modify CPU memory, so we just decrement the stack pointer 3 times
    this.enterInterruptHandler(RESET_ADDRESS);
    this.clearInterrupt(RESET);
    this.tick();
    this.halted = false;
  }

  handleNMI() {
    this.saveStateBeforeInterrupt();
    this.enterInterruptHandler(NMI_ADDRESS);
    this.clearInterrupt(NMI);
  }

  handleIRQ() {
    this.saveStateBeforeInterrupt();
    this.enterInterruptHandler(IRQ_ADDRESS);
    // Unlike reset/NMI, the interrupt flag is not cleared
  }

  saveStateBeforeInterrupt() {
    this.pushWord(this.programCounter);
    this.pushByte(this.getStatus());
  }

  enterInterruptHandler(address) {
    this.interruptFlag = 1;
    this.programCounter = this.readWord(address);
  }

  //=========================================================
  // Program execution
  //=========================================================

  readAndExecuteOperation() {
    const nextProgramByte = this.readNextProgramByte();

    this.irqDisabled = this.interruptFlag;

    let effectiveAddress;

    switch (nextProgramByte) {
      case 0x1A:
        this.operationFlags = 0; this.impliedMode(); this.NOP(); break;

      case 0x3A:
        this.operationFlags = 0; this.impliedMode(); this.NOP(); break; // 2 cycles
      case 0x5A:
        this.operationFlags = 0; this.impliedMode(); this.NOP(); break; // 2 cycles
      case 0x7A:
        this.operationFlags = 0; this.impliedMode(); this.NOP(); break; // 2 cycles
      case 0xDA:
        this.operationFlags = 0; this.impliedMode(); this.NOP(); break; // 2 cycles
      case 0xEA:
        this.operationFlags = 0; this.impliedMode(); this.NOP(); break; // 2 cycles
      case 0xFA:
        this.operationFlags = 0; this.impliedMode(); this.NOP(); break; // 2 cycles

      case 0x80:
        this.operationFlags = F_EXTRA_CYCLE; effectiveAddress = this.immediateMode(); this.NOP(); break; // 2 cycles
      case 0x82:
        this.operationFlags = F_EXTRA_CYCLE; effectiveAddress = this.immediateMode(); this.NOP(); break; // 2 cycles
      case 0x89:
        this.operationFlags = F_EXTRA_CYCLE; effectiveAddress = this.immediateMode(); this.NOP(); break; // 2 cycles
      case 0xC2:
        this.operationFlags = F_EXTRA_CYCLE; effectiveAddress = this.immediateMode(); this.NOP(); break; // 2 cycles
      case 0xE2:
        this.operationFlags = F_EXTRA_CYCLE; effectiveAddress = this.immediateMode(); this.NOP(); break; // 2 cycles

      case 0x04:
        this.operationFlags = F_EXTRA_CYCLE; effectiveAddress = this.zeroPageMode(); this.NOP(); break; // 3 cycles
      case 0x44:
        this.operationFlags = F_EXTRA_CYCLE; effectiveAddress = this.zeroPageMode(); this.NOP(); break; // 3 cycles
      case 0x64:
        this.operationFlags = F_EXTRA_CYCLE; effectiveAddress = this.zeroPageMode(); this.NOP(); break; // 3 cycles

      case 0x14:
        this.operationFlags = F_EXTRA_CYCLE; effectiveAddress = this.zeroPageXMode(); this.NOP(); break; // 4 cycles
      case 0x34:
        this.operationFlags = F_EXTRA_CYCLE; effectiveAddress = this.zeroPageXMode(); this.NOP(); break; // 4 cycles
      case 0x54:
        this.operationFlags = F_EXTRA_CYCLE; effectiveAddress = this.zeroPageXMode(); this.NOP(); break; // 4 cycles
      case 0x74:
        this.operationFlags = F_EXTRA_CYCLE; effectiveAddress = this.zeroPageXMode(); this.NOP(); break; // 4 cycles
      case 0xD4:
        this.operationFlags = F_EXTRA_CYCLE; effectiveAddress = this.zeroPageXMode(); this.NOP(); break; // 4 cycles
      case 0xF4:
        this.operationFlags = F_EXTRA_CYCLE; effectiveAddress = this.zeroPageXMode(); this.NOP(); break; // 4 cycles

      case 0x0C:
        this.operationFlags = F_EXTRA_CYCLE; effectiveAddress = this.absoluteMode(); this.NOP(); break; // 4 cycles

      case 0x1C:
        this.operationFlags = F_EXTRA_CYCLE; effectiveAddress = this.absoluteXMode(); this.NOP(); break; // 4 cycles (+1 if page crossed)
      case 0x3C:
        this.operationFlags = F_EXTRA_CYCLE; effectiveAddress = this.absoluteXMode(); this.NOP(); break; // 4 cycles (+1 if page crossed)
      case 0x5C:
        this.operationFlags = F_EXTRA_CYCLE; effectiveAddress = this.absoluteXMode(); this.NOP(); break; // 4 cycles (+1 if page crossed)
      case 0x7C:
        this.operationFlags = F_EXTRA_CYCLE; effectiveAddress = this.absoluteXMode(); this.NOP(); break; // 4 cycles (+1 if page crossed)
      case 0xDC:
        this.operationFlags = F_EXTRA_CYCLE; effectiveAddress = this.absoluteXMode(); this.NOP(); break; // 4 cycles (+1 if page crossed)
      case 0xFC:
        this.operationFlags = F_EXTRA_CYCLE; effectiveAddress = this.absoluteXMode(); this.NOP(); break; // 4 cycles (+1 if page crossed)

      //=========================================================
      // Clear flag instructions
      //=========================================================

      case 0x18:
        this.operationFlags = 0; this.impliedMode(); this.CLC(); break; // 2 cycles
      case 0x58:
        this.operationFlags = 0; this.impliedMode(); this.CLI(); break; // 2 cycles
      case 0xD8:
        this.operationFlags = 0; this.impliedMode(); this.CLD(); break; // 2 cycles
      case 0xB8:
        this.operationFlags = 0; this.impliedMode(); this.CLV(); break; // 2 cycles

      //=========================================================
      // Set flag instructions
      //=========================================================

      case 0x38:
        this.operationFlags = 0; this.impliedMode(); this.SEC(); break; // 2 cycles
      case 0x78:
        this.operationFlags = 0; this.impliedMode(); this.SEI(); break; // 2 cycles
      case 0xF8:
        this.operationFlags = 0; this.impliedMode(); this.SED(); break; // 2 cycles

      //=========================================================
      // Memory write instructions
      //=========================================================

      case 0x85:
        this.operationFlags = 0; effectiveAddress = this.zeroPageMode(); this.STA(effectiveAddress); break;  // 3 cycles
      case 0x95:
        this.operationFlags = 0; effectiveAddress = this.zeroPageXMode(); this.STA(effectiveAddress); break; // 4 cycles
      case 0x8D:
        this.operationFlags = 0; effectiveAddress = this.absoluteMode(); this.STA(effectiveAddress); break;  // 4 cycles
      case 0x9D:
        this.operationFlags = F_DOUBLE_READ; effectiveAddress = this.absoluteXMode(); this.STA(effectiveAddress); break; // 5 cycles
      case 0x99:
        this.operationFlags = F_DOUBLE_READ; effectiveAddress = this.absoluteYMode(); this.STA(effectiveAddress); break; // 5 cycles
      case 0x81:
        this.operationFlags = 0; effectiveAddress = this.indirectXMode(); this.STA(effectiveAddress); break; // 6 cycles
      case 0x91:
        this.operationFlags = F_DOUBLE_READ; effectiveAddress = this.indirectYMode(); this.STA(effectiveAddress); break; // 6 cycles

      case 0x86:
        this.operationFlags = 0; effectiveAddress = this.zeroPageMode(); this.STX(effectiveAddress); break;  // 3 cycles
      case 0x96:
        this.operationFlags = 0; effectiveAddress = this.zeroPageYMode(); this.STX(effectiveAddress); break; // 4 cycles
      case 0x8E:
        this.operationFlags = 0; effectiveAddress = this.absoluteMode(); this.STX(effectiveAddress); break;  // 4 cycles

      case 0x87:
        this.operationFlags = 0; effectiveAddress = this.zeroPageMode(); this.SAX(effectiveAddress); break;  // 3 cycles
      case 0x97:
        this.operationFlags = 0; effectiveAddress = this.zeroPageYMode(); this.SAX(effectiveAddress); break; // 4 cycles
      case 0x8F:
        this.operationFlags = 0; effectiveAddress = this.absoluteMode(); this.SAX(effectiveAddress); break;  // 4 cycles
      case 0x83:
        this.operationFlags = 0; effectiveAddress = this.indirectXMode(); this.SAX(effectiveAddress); break; // 6 cycles

      case 0x84:
        this.operationFlags = 0; effectiveAddress = this.zeroPageMode(); this.STY(effectiveAddress); break;  // 3 cycles
      case 0x94:
        this.operationFlags = 0; effectiveAddress = this.zeroPageXMode(); this.STY(effectiveAddress); break; // 4 cycles
      case 0x8C:
        this.operationFlags = 0; effectiveAddress = this.absoluteMode(); this.STY(effectiveAddress); break;  // 4 cycles

      case 0x93:
        this.operationFlags = F_DOUBLE_READ; effectiveAddress = this.indirectYMode(); this.SHA(effectiveAddress); break; // 6 cycles
      case 0x9F:
        this.operationFlags = F_DOUBLE_READ; effectiveAddress = this.absoluteYMode(); this.SHA(effectiveAddress); break; // 5 cycles
      case 0x9E:
        this.operationFlags = F_DOUBLE_READ; effectiveAddress = this.absoluteYMode(); this.SHX(effectiveAddress); break; // 5 cycles
      case 0x9C:
        this.operationFlags = F_DOUBLE_READ; effectiveAddress = this.absoluteXMode(); this.SHY(effectiveAddress); break; // 5 cycles

      //=========================================================
      // Memory read instructions
      //=========================================================

      case 0xA9:
        this.operationFlags = 0; effectiveAddress = this.immediateMode(); this.LDA(effectiveAddress); break; // 2 cycles
      case 0xA5:
        this.operationFlags = 0; effectiveAddress = this.zeroPageMode(); this.LDA(effectiveAddress); break;  // 3 cycles
      case 0xB5:
        this.operationFlags = 0; effectiveAddress = this.zeroPageXMode(); this.LDA(effectiveAddress); break; // 4 cycles
      case 0xAD:
        this.operationFlags = 0; effectiveAddress = this.absoluteMode(); this.LDA(effectiveAddress); break;  // 4 cycles
      case 0xBD:
        this.operationFlags = 0; effectiveAddress = this.absoluteXMode(); this.LDA(effectiveAddress); break; // 4 cycles (+1 if page crossed)
      case 0xB9:
        this.operationFlags = 0; effectiveAddress = this.absoluteYMode(); this.LDA(effectiveAddress); break; // 4 cycles (+1 if page crossed)
      case 0xA1:
        this.operationFlags = 0; effectiveAddress = this.indirectXMode(); this.LDA(effectiveAddress); break; // 6 cycles
      case 0xB1:
        this.operationFlags = 0; effectiveAddress = this.indirectYMode(); this.LDA(effectiveAddress); break; // 5 cycles (+1 if page crossed)

      case 0xA2:
        this.operationFlags = 0; effectiveAddress = this.immediateMode(); this.LDX(effectiveAddress); break; // 2 cycles
      case 0xA6:
        this.operationFlags = 0; effectiveAddress = this.zeroPageMode(); this.LDX(effectiveAddress); break;  // 3 cycles
      case 0xB6:
        this.operationFlags = 0; effectiveAddress = this.zeroPageYMode(); this.LDX(effectiveAddress); break; // 4 cycles
      case 0xAE:
        this.operationFlags = 0; effectiveAddress = this.absoluteMode(); this.LDX(effectiveAddress); break;  // 4 cycles
      case 0xBE:
        this.operationFlags = 0; effectiveAddress = this.absoluteYMode(); this.LDX(effectiveAddress); break; // 4 cycles (+1 if page crossed)

      case 0xA0:
        this.operationFlags = 0; effectiveAddress = this.immediateMode(); this.LDY(effectiveAddress); break; // 2 cycles
      case 0xA4:
        this.operationFlags = 0; effectiveAddress = this.zeroPageMode(); this.LDY(effectiveAddress); break;  // 3 cycles
      case 0xB4:
        this.operationFlags = 0; effectiveAddress = this.zeroPageXMode(); this.LDY(effectiveAddress); break; // 4 cycles
      case 0xAC:
        this.operationFlags = 0; effectiveAddress = this.absoluteMode(); this.LDY(effectiveAddress); break;  // 4 cycles
      case 0xBC:
        this.operationFlags = 0; effectiveAddress = this.absoluteXMode(); this.LDY(effectiveAddress); break; // 4 cycles (+1 if page crossed)

      case 0xAB:
        this.operationFlags = 0; effectiveAddress = this.immediateMode(); this.LAX(effectiveAddress); break; // 2 cycles
      case 0xA7:
        this.operationFlags = 0; effectiveAddress = this.zeroPageMode(); this.LAX(effectiveAddress); break;  // 3 cycles
      case 0xB7:
        this.operationFlags = 0; effectiveAddress = this.zeroPageYMode(); this.LAX(effectiveAddress); break; // 4 cycles
      case 0xAF:
        this.operationFlags = 0; effectiveAddress = this.absoluteMode(); this.LAX(effectiveAddress); break;  // 4 cycles
      case 0xBF:
        this.operationFlags = 0; effectiveAddress = this.absoluteYMode(); this.LAX(effectiveAddress); break; // 4 cycles (+1 if page crossed)
      case 0xA3:
        this.operationFlags = 0; effectiveAddress = this.indirectXMode(); this.LAX(effectiveAddress); break; // 6 cycles
      case 0xB3:
        this.operationFlags = 0; effectiveAddress = this.indirectYMode(); this.LAX(effectiveAddress); break; // 5 cycles (+1 if page crossed)

      case 0xBB:
        this.operationFlags = 0; effectiveAddress = this.absoluteYMode(); this.LAS(effectiveAddress); break; // 4 cycles (+1 if page crossed)

      //=========================================================
      // Register transfer instructions
      //=========================================================

      case 0xAA:
        this.operationFlags = 0; this.impliedMode(); this.TAX(); break; // 2 cycles
      case 0xA8:
        this.operationFlags = 0; this.impliedMode(); this.TAY(); break; // 2 cycles
      case 0x8A:
        this.operationFlags = 0; this.impliedMode(); this.TXA(); break; // 2 cycles
      case 0x98:
        this.operationFlags = 0; this.impliedMode(); this.TYA(); break; // 2 cycles
      case 0x9A:
        this.operationFlags = 0; this.impliedMode(); this.TXS(); break; // 2 cycles
      case 0xBA:
        this.operationFlags = 0; this.impliedMode(); this.TSX(); break; // 2 cycles

      //=========================================================
      // Stack push instructions
      //=========================================================

      case 0x48:
        this.operationFlags = 0; this.impliedMode(); this.PHA(); break; // 3 cycles
      case 0x08:
        this.operationFlags = 0; this.impliedMode(); this.PHP(); break; // 3 cycles

      //=========================================================
      // Stack pull instructions
      //=========================================================

      case 0x68:
        this.operationFlags = 0; this.impliedMode(); this.PLA(); break; // 4 cycles
      case 0x28:
        this.operationFlags = 0; this.impliedMode(); this.PLP(); break; // 4 cycles

      //=========================================================
      // Accumulator bitwise instructions
      //=========================================================

      case 0x29:
        this.operationFlags = 0; effectiveAddress = this.immediateMode(); this.AND(effectiveAddress); break; // 2 cycles
      case 0x25:
        this.operationFlags = 0; effectiveAddress = this.zeroPageMode(); this.AND(effectiveAddress); break;  // 3 cycles
      case 0x35:
        this.operationFlags = 0; effectiveAddress = this.zeroPageXMode(); this.AND(effectiveAddress); break; // 4 cycles
      case 0x2D:
        this.operationFlags = 0; effectiveAddress = this.absoluteMode(); this.AND(effectiveAddress); break;  // 4 cycles
      case 0x3D:
        this.operationFlags = 0; effectiveAddress = this.absoluteXMode(); this.AND(effectiveAddress); break; // 4 cycles (+1 if page crossed)
      case 0x39:
        this.operationFlags = 0; effectiveAddress = this.absoluteYMode(); this.AND(effectiveAddress); break; // 4 cycles (+1 if page crossed)
      case 0x21:
        this.operationFlags = 0; effectiveAddress = this.indirectXMode(); this.AND(effectiveAddress); break; // 6 cycles
      case 0x31:
        this.operationFlags = 0; effectiveAddress = this.indirectYMode(); this.AND(effectiveAddress); break; // 5 cycles (+1 if page crossed)

      case 0x09:
        this.operationFlags = 0; effectiveAddress = this.immediateMode(); this.ORA(effectiveAddress); break; // 2 cycles
      case 0x05:
        this.operationFlags = 0; effectiveAddress = this.zeroPageMode(); this.ORA(effectiveAddress); break;  // 3 cycles
      case 0x15:
        this.operationFlags = 0; effectiveAddress = this.zeroPageXMode(); this.ORA(effectiveAddress); break; // 4 cycles
      case 0x0D:
        this.operationFlags = 0; effectiveAddress = this.absoluteMode(); this.ORA(effectiveAddress); break;  // 4 cycles
      case 0x1D:
        this.operationFlags = 0; effectiveAddress = this.absoluteXMode(); this.ORA(effectiveAddress); break; // 4 cycles (+1 if page crossed)
      case 0x19:
        this.operationFlags = 0; effectiveAddress = this.absoluteYMode(); this.ORA(effectiveAddress); break; // 4 cycles (+1 if page crossed)
      case 0x01:
        this.operationFlags = 0; effectiveAddress = this.indirectXMode(); this.ORA(effectiveAddress); break; // 6 cycles
      case 0x11:
        this.operationFlags = 0; effectiveAddress = this.indirectYMode(); this.ORA(effectiveAddress); break; // 5 cycles (+1 if page crossed)

      case 0x49:
        this.operationFlags = 0; effectiveAddress = this.immediateMode(); this.EOR(effectiveAddress); break; // 2 cycles
      case 0x45:
        this.operationFlags = 0; effectiveAddress = this.zeroPageMode(); this.EOR(effectiveAddress); break;  // 3 cycles
      case 0x55:
        this.operationFlags = 0; effectiveAddress = this.zeroPageXMode(); this.EOR(effectiveAddress); break; // 4 cycles
      case 0x4D:
        this.operationFlags = 0; effectiveAddress = this.absoluteMode(); this.EOR(effectiveAddress); break;  // 4 cycles
      case 0x5D:
        this.operationFlags = 0; effectiveAddress = this.absoluteXMode(); this.EOR(effectiveAddress); break; // 4 cycles (+1 if page crossed)
      case 0x59:
        this.operationFlags = 0; effectiveAddress = this.absoluteYMode(); this.EOR(effectiveAddress); break; // 4 cycles (+1 if page crossed)
      case 0x41:
        this.operationFlags = 0; effectiveAddress = this.indirectXMode(); this.EOR(effectiveAddress); break; // 6 cycles
      case 0x51:
        this.operationFlags = 0; effectiveAddress = this.indirectYMode(); this.EOR(effectiveAddress); break; // 5 cycles (+1 if page crossed)

      case 0x24:
        this.operationFlags = 0; effectiveAddress = this.zeroPageMode(); this.BIT(effectiveAddress); break; // 3 cycles
      case 0x2C:
        this.operationFlags = 0; effectiveAddress = this.absoluteMode(); this.BIT(effectiveAddress); break; // 4 cycles

      //=========================================================
      // Increment instructions
      //=========================================================

      case 0xE6:
        this.operationFlags = 0; effectiveAddress = this.zeroPageMode(); this.INC(effectiveAddress); break;  // 5 cycles
      case 0xF6:
        this.operationFlags = 0; effectiveAddress = this.zeroPageXMode(); this.INC(effectiveAddress); break; // 6 cycles
      case 0xEE:
        this.operationFlags = 0; effectiveAddress = this.absoluteMode(); this.INC(effectiveAddress); break;  // 6 cycles
      case 0xFE:
        this.operationFlags = F_DOUBLE_READ; effectiveAddress = this.absoluteXMode(); this.INC(effectiveAddress); break; // 7 cycles

      case 0xE8:
        this.operationFlags = 0; this.impliedMode(); this.INX(); break; // 2 cycles
      case 0xC8:
        this.operationFlags = 0; this.impliedMode(); this.INY(); break; // 2 cycles

      //=========================================================
      // Decrement instructions
      //=========================================================

      case 0xC6:
        this.operationFlags = 0; effectiveAddress = this.zeroPageMode(); this.DEC(effectiveAddress); break;  // 5 cycles
      case 0xD6:
        this.operationFlags = 0; effectiveAddress = this.zeroPageXMode(); this.DEC(effectiveAddress); break; // 6 cycles
      case 0xCE:
        this.operationFlags = 0; effectiveAddress = this.absoluteMode(); this.DEC(effectiveAddress); break;  // 6 cycles
      case 0xDE:
        this.operationFlags = F_DOUBLE_READ; effectiveAddress = this.absoluteXMode(); this.DEC(effectiveAddress); break; // 7 cycles

      case 0xCA:
        this.operationFlags = 0; this.impliedMode(); this.DEX(); break; // 2 cycles
      case 0x88:
        this.operationFlags = 0; this.impliedMode(); this.DEY(); break; // 2 cycles

      //=========================================================
      // Comparison instructions
      //=========================================================

      case 0xC9:
        this.operationFlags = 0; effectiveAddress = this.immediateMode(); this.CMP(effectiveAddress); break; // 2 cycles
      case 0xC5:
        this.operationFlags = 0; effectiveAddress = this.zeroPageMode(); this.CMP(effectiveAddress); break;  // 3 cycles
      case 0xD5:
        this.operationFlags = 0; effectiveAddress = this.zeroPageXMode(); this.CMP(effectiveAddress); break; // 4 cycles
      case 0xCD:
        this.operationFlags = 0; effectiveAddress = this.absoluteMode(); this.CMP(effectiveAddress); break;  // 4 cycles
      case 0xDD:
        this.operationFlags = 0; effectiveAddress = this.absoluteXMode(); this.CMP(effectiveAddress); break; // 4 cycles (+1 if page crossed)
      case 0xD9:
        this.operationFlags = 0; effectiveAddress = this.absoluteYMode(); this.CMP(effectiveAddress); break; // 4 cycles (+1 if page crossed)
      case 0xC1:
        this.operationFlags = 0; effectiveAddress = this.indirectXMode(); this.CMP(effectiveAddress); break; // 6 cycles
      case 0xD1:
        this.operationFlags = 0; effectiveAddress = this.indirectYMode(); this.CMP(effectiveAddress); break; // 5 cycles (+1 if page crossed)

      case 0xE0:
        this.operationFlags = 0; effectiveAddress = this.immediateMode(); this.CPX(effectiveAddress); break; // 2 cycles
      case 0xE4:
        this.operationFlags = 0; effectiveAddress = this.zeroPageMode(); this.CPX(effectiveAddress); break;  // 3 cycles
      case 0xEC:
        this.operationFlags = 0; effectiveAddress = this.absoluteMode(); this.CPX(effectiveAddress); break;  // 4 cycles

      case 0xC0:
        this.operationFlags = 0; effectiveAddress = this.immediateMode(); this.CPY(effectiveAddress); break; // 2 cycles
      case 0xC4:
        this.operationFlags = 0; effectiveAddress = this.zeroPageMode(); this.CPY(effectiveAddress); break;  // 3 cycles
      case 0xCC:
        this.operationFlags = 0; effectiveAddress = this.absoluteMode(); this.CPY(effectiveAddress); break;  // 4 cycles

      //=========================================================
      // Branching instructions
      //=========================================================

      case 0x90:
        this.operationFlags = 0; effectiveAddress = this.relativeMode(); this.BCC(effectiveAddress); break; // 2 cycles (+1 if branch succeeds +2 if to a new page)
      case 0xB0:
        this.operationFlags = 0; effectiveAddress = this.relativeMode(); this.BCS(effectiveAddress); break; // 2 cycles (+1 if branch succeeds +2 if to a new page)

      case 0xD0:
        this.operationFlags = 0; effectiveAddress = this.relativeMode(); this.BNE(effectiveAddress); break; // 2 cycles (+1 if branch succeeds +2 if to a new page)
      case 0xF0:
        this.operationFlags = 0; effectiveAddress = this.relativeMode(); this.BEQ(effectiveAddress); break; // 2 cycles (+1 if branch succeeds +2 if to a new page)

      case 0x50:
        this.operationFlags = 0; effectiveAddress = this.relativeMode(); this.BVC(effectiveAddress); break; // 2 cycles (+1 if branch succeeds +2 if to a new page)
      case 0x70:
        this.operationFlags = 0; effectiveAddress = this.relativeMode(); this.BVS(effectiveAddress); break; // 2 cycles (+1 if branch succeeds +2 if to a new page)

      case 0x10:
        this.operationFlags = 0; effectiveAddress = this.relativeMode(); this.BPL(effectiveAddress); break; // 2 cycles (+1 if branch succeeds +2 if to a new page)
      case 0x30:
        this.operationFlags = 0; effectiveAddress = this.relativeMode(); this.BMI(effectiveAddress); break; // 2 cycles (+1 if branch succeeds +2 if to a new page)

      //=========================================================
      // Jump / subroutine instructions
      //=========================================================

      case 0x4C:
        this.operationFlags = 0; effectiveAddress = this.absoluteMode(); this.JMP(effectiveAddress); break; // 3 cycles
      case 0x6C:
        this.operationFlags = 0; effectiveAddress = this.indirectMode(); this.JMP(effectiveAddress); break; // 5 cycles
      case 0x20:
        this.operationFlags = 0; effectiveAddress = this.absoluteMode(); this.JSR(effectiveAddress); break; // 6 cycles
      case 0x60:
        this.operationFlags = 0; this.impliedMode(); this.RTS(); break;  // 6 cycles

      //=========================================================
      // Interrupt control instructions
      //=========================================================

      case 0x00:
        this.operationFlags = 0; this.impliedMode(); this.BRK(); break; // 7 cycles
      case 0x40:
        this.operationFlags = 0; this.impliedMode(); this.RTI(); break; // 6 cycles

      //=========================================================
      // Addition / subtraction instructions
      //=========================================================

      case 0x69:
        this.operationFlags = 0; effectiveAddress = this.immediateMode(); this.ADC(effectiveAddress); break; // 2 cycles
      case 0x65:
        this.operationFlags = 0; effectiveAddress = this.zeroPageMode(); this.ADC(effectiveAddress); break;  // 3 cycles
      case 0x75:
        this.operationFlags = 0; effectiveAddress = this.zeroPageXMode(); this.ADC(effectiveAddress); break; // 4 cycles
      case 0x6D:
        this.operationFlags = 0; effectiveAddress = this.absoluteMode(); this.ADC(effectiveAddress); break;  // 4 cycles
      case 0x7D:
        this.operationFlags = 0; effectiveAddress = this.absoluteXMode(); this.ADC(effectiveAddress); break; // 4 cycles (+1 if page crossed)
      case 0x79:
        this.operationFlags = 0; effectiveAddress = this.absoluteYMode(); this.ADC(effectiveAddress); break; // 4 cycles (+1 if page crossed)
      case 0x61:
        this.operationFlags = 0; effectiveAddress = this.indirectXMode(); this.ADC(effectiveAddress); break; // 6 cycles
      case 0x71:
        this.operationFlags = 0; effectiveAddress = this.indirectYMode(); this.ADC(effectiveAddress); break; // 5 cycles (+1 if page crossed)

      case 0xE9:
        this.operationFlags = 0; effectiveAddress = this.immediateMode(); this.SBC(effectiveAddress); break; // 2 cycles
      case 0xEB:
        this.operationFlags = 0; effectiveAddress = this.immediateMode(); this.SBC(effectiveAddress); break; // 2 cycles
      case 0xE5:
        this.operationFlags = 0; effectiveAddress = this.zeroPageMode(); this.SBC(effectiveAddress); break;  // 3 cycles
      case 0xF5:
        this.operationFlags = 0; effectiveAddress = this.zeroPageXMode(); this.SBC(effectiveAddress); break; // 4 cycles
      case 0xED:
        this.operationFlags = 0; effectiveAddress = this.absoluteMode(); this.SBC(effectiveAddress); break;  // 4 cycles
      case 0xFD:
        this.operationFlags = 0; effectiveAddress = this.absoluteXMode(); this.SBC(effectiveAddress); break; // 4 cycles (+1 if page crossed)
      case 0xF9:
        this.operationFlags = 0; effectiveAddress = this.absoluteYMode(); this.SBC(effectiveAddress); break; // 4 cycles (+1 if page crossed)
      case 0xE1:
        this.operationFlags = 0; effectiveAddress = this.indirectXMode(); this.SBC(effectiveAddress); break; // 6 cycles
      case 0xF1:
        this.operationFlags = 0; effectiveAddress = this.indirectYMode(); this.SBC(effectiveAddress); break; // 5 cycles (+1 if page crossed)

      //=========================================================
      // Shifting / rotation instructions
      //=========================================================

      case 0x0A:
        this.operationFlags = 0; effectiveAddress = this.accumulatorMode(); this.ASL(effectiveAddress); break; // 2 cycles
      case 0x06:
        this.operationFlags = 0; effectiveAddress = this.zeroPageMode(); this.ASL(effectiveAddress); break;    // 5 cycles
      case 0x16:
        this.operationFlags = 0; effectiveAddress = this.zeroPageXMode(); this.ASL(effectiveAddress); break;   // 6 cycles
      case 0x0E:
        this.operationFlags = 0; effectiveAddress = this.absoluteMode(); this.ASL(effectiveAddress); break;    // 6 cycles
      case 0x1E:
        this.operationFlags = F_DOUBLE_READ; effectiveAddress = this.absoluteXMode(); this.ASL(effectiveAddress); break; // 7 cycles

      case 0x4A:
        this.operationFlags = 0; effectiveAddress = this.accumulatorMode(); this.LSR(effectiveAddress); break; // 2 cycles
      case 0x46:
        this.operationFlags = 0; effectiveAddress = this.zeroPageMode(); this.LSR(effectiveAddress); break;    // 5 cycles
      case 0x56:
        this.operationFlags = 0; effectiveAddress = this.zeroPageXMode(); this.LSR(effectiveAddress); break;   // 6 cycles
      case 0x4E:
        this.operationFlags = 0; effectiveAddress = this.absoluteMode(); this.LSR(effectiveAddress); break;    // 6 cycles
      case 0x5E:
        this.operationFlags = F_DOUBLE_READ; effectiveAddress = this.absoluteXMode(); this.LSR(effectiveAddress); break; // 7 cycles

      case 0x2A:
        this.operationFlags = 0; effectiveAddress = this.accumulatorMode(); this.ROL(effectiveAddress); break; // 2 cycles
      case 0x26:
        this.operationFlags = 0; effectiveAddress = this.zeroPageMode(); this.ROL(effectiveAddress); break;    // 5 cycles
      case 0x36:
        this.operationFlags = 0; effectiveAddress = this.zeroPageXMode(); this.ROL(effectiveAddress); break;   // 6 cycles
      case 0x2E:
        this.operationFlags = 0; effectiveAddress = this.absoluteMode(); this.ROL(effectiveAddress); break;    // 6 cycles
      case 0x3E:
        this.operationFlags = F_DOUBLE_READ; effectiveAddress = this.absoluteXMode(); this.ROL(effectiveAddress); break; // 7 cycles

      case 0x6A:
        this.operationFlags = 0; effectiveAddress = this.accumulatorMode(); this.ROR(effectiveAddress); break; // 2 cycles
      case 0x66:
        this.operationFlags = 0; effectiveAddress = this.zeroPageMode(); this.ROR(effectiveAddress); break;    // 5 cycles
      case 0x76:
        this.operationFlags = 0; effectiveAddress = this.zeroPageXMode(); this.ROR(effectiveAddress); break;   // 6 cycles
      case 0x6E:
        this.operationFlags = 0; effectiveAddress = this.absoluteMode(); this.ROR(effectiveAddress); break;    // 6 cycles
      case 0x7E:
        this.operationFlags = F_DOUBLE_READ; effectiveAddress = this.absoluteXMode(); this.ROR(effectiveAddress); break; // 7 cycles

      //=========================================================
      // Hybrid instructions
      //=========================================================

      case 0xC7:
        this.operationFlags = 0; effectiveAddress = this.zeroPageMode(); this.DCP(effectiveAddress); break;  // 5 cycles
      case 0xD7:
        this.operationFlags = 0; effectiveAddress = this.zeroPageXMode(); this.DCP(effectiveAddress); break; // 6 cycles
      case 0xCF:
        this.operationFlags = 0; effectiveAddress = this.absoluteMode(); this.DCP(effectiveAddress); break;  // 6 cycles
      case 0xDF:
        this.operationFlags = F_DOUBLE_READ; effectiveAddress = this.absoluteXMode(); this.DCP(effectiveAddress); break; // 7 cycles
      case 0xDB:
        this.operationFlags = F_DOUBLE_READ; effectiveAddress = this.absoluteYMode(); this.DCP(effectiveAddress); break; // 7 cycles
      case 0xC3:
        this.operationFlags = 0; effectiveAddress = this.indirectXMode(); this.DCP(effectiveAddress); break; // 8 cycles
      case 0xD3:
        this.operationFlags = F_DOUBLE_READ; effectiveAddress = this.indirectYMode(); this.DCP(effectiveAddress); break; // 8 cycles

      case 0xE7:
        this.operationFlags = 0; effectiveAddress = this.zeroPageMode(); this.ISB(effectiveAddress); break;  // 5 cycles
      case 0xF7:
        this.operationFlags = 0; effectiveAddress = this.zeroPageXMode(); this.ISB(effectiveAddress); break; // 6 cycles
      case 0xEF:
        this.operationFlags = 0; effectiveAddress = this.absoluteMode(); this.ISB(effectiveAddress); break;  // 6 cycles
      case 0xFF:
        this.operationFlags = F_DOUBLE_READ; effectiveAddress = this.absoluteXMode(); this.ISB(effectiveAddress); break; // 7 cycles
      case 0xFB:
        this.operationFlags = F_DOUBLE_READ; effectiveAddress = this.absoluteYMode(); this.ISB(effectiveAddress); break; // 7 cycles
      case 0xE3:
        this.operationFlags = 0; effectiveAddress = this.indirectXMode(); this.ISB(effectiveAddress); break; // 8 cycles
      case 0xF3:
        this.operationFlags = F_DOUBLE_READ; effectiveAddress = this.indirectYMode(); this.ISB(effectiveAddress); break; // 8 cycles

      case 0x07:
        this.operationFlags = 0; effectiveAddress = this.zeroPageMode(); this.SLO(effectiveAddress); break;  // 5 cycles
      case 0x17:
        this.operationFlags = 0; effectiveAddress = this.zeroPageXMode(); this.SLO(effectiveAddress); break; // 6 cycles
      case 0x0F:
        this.operationFlags = 0; effectiveAddress = this.absoluteMode(); this.SLO(effectiveAddress); break;  // 6 cycles
      case 0x1F:
        this.operationFlags = F_DOUBLE_READ; effectiveAddress = this.absoluteXMode(); this.SLO(effectiveAddress); break; // 7 cycles
      case 0x1B:
        this.operationFlags = F_DOUBLE_READ; effectiveAddress = this.absoluteYMode(); this.SLO(effectiveAddress); break; // 7 cycles
      case 0x03:
        this.operationFlags = 0; effectiveAddress = this.indirectXMode(); this.SLO(effectiveAddress); break; // 8 cycles
      case 0x13:
        this.operationFlags = F_DOUBLE_READ; effectiveAddress = this.indirectYMode(); this.SLO(effectiveAddress); break; // 8 cycles

      case 0x47:
        this.operationFlags = 0; effectiveAddress = this.zeroPageMode(); this.SRE(effectiveAddress); break;  // 5 cycles
      case 0x57:
        this.operationFlags = 0; effectiveAddress = this.zeroPageXMode(); this.SRE(effectiveAddress); break; // 6 cycles
      case 0x4F:
        this.operationFlags = 0; effectiveAddress = this.absoluteMode(); this.SRE(effectiveAddress); break;  // 6 cycles
      case 0x5F:
        this.operationFlags = F_DOUBLE_READ; effectiveAddress = this.absoluteXMode(); this.SRE(effectiveAddress); break; // 7 cycles
      case 0x5B:
        this.operationFlags = F_DOUBLE_READ; effectiveAddress = this.absoluteYMode(); this.SRE(effectiveAddress); break; // 7 cycles
      case 0x43:
        this.operationFlags = 0; effectiveAddress = this.indirectXMode(); this.SRE(effectiveAddress); break; // 8 cycles
      case 0x53:
        this.operationFlags = F_DOUBLE_READ; effectiveAddress = this.indirectYMode(); this.SRE(effectiveAddress); break; // 8 cycles

      case 0x27:
        this.operationFlags = 0; effectiveAddress = this.zeroPageMode(); this.RLA(effectiveAddress); break;  // 5 cycles
      case 0x37:
        this.operationFlags = 0; effectiveAddress = this.zeroPageXMode(); this.RLA(effectiveAddress); break; // 6 cycles
      case 0x2F:
        this.operationFlags = 0; effectiveAddress = this.absoluteMode(); this.RLA(effectiveAddress); break;  // 6 cycles
      case 0x3F:
        this.operationFlags = F_DOUBLE_READ; effectiveAddress = this.absoluteXMode(); this.RLA(effectiveAddress); break; // 7 cycles
      case 0x3B:
        this.operationFlags = F_DOUBLE_READ; effectiveAddress = this.absoluteYMode(); this.RLA(effectiveAddress); break; // 7 cycles
      case 0x23:
        this.operationFlags = 0; effectiveAddress = this.indirectXMode(); this.RLA(effectiveAddress); break; // 8 cycles
      case 0x33:
        this.operationFlags = F_DOUBLE_READ; effectiveAddress = this.indirectYMode(); this.RLA(effectiveAddress); break; // 8 cycles

      case 0x8B:
        this.operationFlags = 0; effectiveAddress = this.immediateMode(); this.XAA(effectiveAddress); break; // 2 cycles

      case 0x67:
        this.operationFlags = 0; effectiveAddress = this.zeroPageMode(); this.RRA(effectiveAddress); break;  // 5 cycles
      case 0x77:
        this.operationFlags = 0; effectiveAddress = this.zeroPageXMode(); this.RRA(effectiveAddress); break; // 6 cycles
      case 0x6F:
        this.operationFlags = 0; effectiveAddress = this.absoluteMode(); this.RRA(effectiveAddress); break;  // 6 cycles
      case 0x7F:
        this.operationFlags = F_DOUBLE_READ; effectiveAddress = this.absoluteXMode(); this.RRA(effectiveAddress); break; // 7 cycles
      case 0x7B:
        this.operationFlags = F_DOUBLE_READ; effectiveAddress = this.absoluteYMode(); this.RRA(effectiveAddress); break; // 7 cycles
      case 0x63:
        this.operationFlags = 0; effectiveAddress = this.indirectXMode(); this.RRA(effectiveAddress); break; // 8 cycles
      case 0x73:
        this.operationFlags = F_DOUBLE_READ; effectiveAddress = this.indirectYMode(); this.RRA(effectiveAddress); break; // 8 cycles

      case 0xCB:
        this.operationFlags = 0; effectiveAddress = this.immediateMode(); this.AXS(effectiveAddress); break; // 2 cycles

      case 0x0B:
        this.operationFlags = 0; effectiveAddress = this.immediateMode(); this.ANC(effectiveAddress); break; // 2 cycles
      case 0x2B:
        this.operationFlags = 0; effectiveAddress = this.immediateMode(); this.ANC(effectiveAddress); break; // 2 cycles

      case 0x4B:
        this.operationFlags = 0; effectiveAddress = this.immediateMode(); this.ALR(effectiveAddress); break; // 2 cycles
      case 0x6B:
        this.operationFlags = 0; effectiveAddress = this.immediateMode(); this.ARR(effectiveAddress); break; // 2 cycles

      case 0x9B:
        this.operationFlags = F_DOUBLE_READ; effectiveAddress = this.absoluteYMode(); this.TAS(effectiveAddress); break; // 5 cycles


      default:
        break;
    }

  }

  beforeOperation(operation: [Function, Function, number]) {
    // The interrupt flag is checked at the start of last cycle of each instruction.
    // RTI and BRK instructions set the flag before it's read, so the change is immediately visible.
    // CLI, SEI and PLP instructions set the flag after it's read, so the change is delayed.
    // Most of instructions do not modify the flag, so we set the read value for them here.
    this.irqDisabled = this.interruptFlag;
    this.operationFlags = operation[2];
  }

  executeOperation([instruction, addressingMode, cycles]: [Function, Function, number]) {
    const effectiveAddress = addressingMode.call(this);
    instruction.call(this, effectiveAddress);
  }

  readOperation() {
    return;
  }

  readNextProgramByte() {
    return this.readByte(this.moveProgramCounter(1));
  }

  readNextProgramWord() {
    return this.readWord(this.moveProgramCounter(2));
  }

  moveProgramCounter(size: number) {
    const result = this.programCounter;
    this.programCounter = (this.programCounter + size) & 0xFFFF;
    return result;
  }

  //=========================================================
  // Memory access
  //=========================================================

  readByte(address: number): number {
    this.tick();
    return this.cpuMemory.read(address);
  }

  readWord(address) {
    const highAddress = (address + 1) & 0xFFFF;
    const lowByte = this.readByte(address);
    const highByte = this.readByte(highAddress);
    return (highByte << 8) | lowByte;
  }

  readWordFromSamePage(address) {
    const highAddress = (address & 0xFF00) | ((address + 1) & 0x00FF);
    const lowByte = this.readByte(address);
    const highByte = this.readByte(highAddress);
    return (highByte << 8) | lowByte;
  }

  writeByte(address, value) {
    this.tick();
    this.cpuMemory.write(address, value);
    return value;
  }

  writeWord(address, value) {
    this.writeByte(address, value & 0xFF);
    return this.writeByte((address + 1) & 0xFFFF, value >>> 8);
  }

  readWriteByte(address) {
    const value = this.readByte(address);
    return this.writeByte(address, value); // Some instructions do dummy write before their computation
  }

  //=========================================================
  // Stack access
  //=========================================================

  pushByte(value) {
    this.writeByte(0x100 + this.stackPointer, value);
    this.stackPointer = (this.stackPointer - 1) & 0xFF;
  }

  pushWord(value) {
    this.pushByte(value >>> 8);
    this.pushByte(value & 0xFF);
  }

  popByte() {
    this.stackPointer = (this.stackPointer + 1) & 0xFF;
    return this.readByte(0x100 + this.stackPointer);
  }

  popWord() {
    return this.popByte() | (this.popByte() << 8);
  }

  //=========================================================
  // Status register
  //=========================================================

  getStatus() {
    return this.carryFlag
      | (this.zeroFlag << 1)
      | (this.interruptFlag << 2)
      | (this.decimalFlag << 3)
      | (1 << 5)
      | (this.overflowFlag << 6)
      | (this.negativeFlag << 7);
  }

  setStatus(value) {
    this.carryFlag = value & 1;
    this.zeroFlag = (value >>> 1) & 1;
    this.interruptFlag = (value >>> 2) & 1;
    this.decimalFlag = (value >>> 3) & 1;
    this.overflowFlag = (value >>> 6) & 1;
    this.negativeFlag = value >>> 7;
  }

  //=========================================================
  // Interrupt signals
  //=========================================================

  activateInterrupt(type) {
    this.activeInterrupts |= type;
  }

  clearInterrupt(type) {
    this.activeInterrupts &= ~type;
  }

  //=========================================================
  // Tick
  //=========================================================

  tick() {
    // this.mapper.tick();
    // ppu 3 times faster than CPU
    this.dma.tick();
    this.ppu.tick();
    this.ppu.tick();
    this.ppu.tick();
    // this.apu.tick(); // Same rate as CPU
  }

  //=========================================================
  // Basic addressing modes
  //=========================================================

  impliedMode() {
    this.tick();
  }

  accumulatorMode() {
    this.tick();
  }

  immediateMode() {
    return this.moveProgramCounter(1);
  }

  //=========================================================
  // Zero page addressing modes
  //=========================================================

  zeroPageMode() {
    return this.readNextProgramByte();
  }

  zeroPageXMode() {
    return this.computeZeroPageAddress(this.readNextProgramByte(), this.registerX);
  }

  zeroPageYMode() {
    return this.computeZeroPageAddress(this.readNextProgramByte(), this.registerY);
  }

  //=========================================================
  // Absolute addressing modes
  //=========================================================

  absoluteMode() {
    return this.readNextProgramWord();
  }

  absoluteXMode() {
    return this.computeAbsoluteAddress(this.readNextProgramWord(), this.registerX);
  }

  absoluteYMode() {
    return this.computeAbsoluteAddress(this.readNextProgramWord(), this.registerY);
  }

  //=========================================================
  // Relative addressing mode
  //=========================================================

  relativeMode() {
    const value = this.readNextProgramByte();
    const offset = value & 0x80 ? value - 0x100 : value;
    return (this.programCounter + offset) & 0xFFFF;
  }

  //=========================================================
  // Indirect addressing modes
  //=========================================================

  indirectMode() {
    return this.readWordFromSamePage(this.readNextProgramWord());
  }

  indirectXMode() {
    return this.readWordFromSamePage(this.zeroPageXMode());
  }

  indirectYMode() {
    const base = this.readWordFromSamePage(this.readNextProgramByte());
    return this.computeAbsoluteAddress(base, this.registerY);
  }

  //=========================================================
  // Address computation
  //=========================================================

  computeZeroPageAddress(base, offset) {
    this.readByte(base); // Dummy read
    return (base + offset) & 0xFF;
  }

  computeAbsoluteAddress(base, offset) {
    const result = (base + offset) & 0xFFFF;
    this.pageCrossed = isDifferentPage(base, result);
    if ((this.operationFlags & F_DOUBLE_READ) || this.pageCrossed) {
      this.readByte((base & 0xFF00) | (result & 0x00FF)); // Dummy read from address before fixing page overflow in its higher byte
    }
    return result;
  }

  //=========================================================
  // No operation instruction
  //=========================================================

  NOP() {
    if (this.operationFlags & F_EXTRA_CYCLE) {
      this.tick();
    }
  }

  //=========================================================
  // Clear flag instructions
  //=========================================================

  CLC() {
    this.carryFlag = 0;
  }

  CLI() {
    this.irqDisabled = this.interruptFlag; // Delayed change to IRQ disablement
    this.interruptFlag = 0;
  }

  CLD() {
    this.decimalFlag = 0;
  }

  CLV() {
    this.overflowFlag = 0;
  }

  //=========================================================
  // Set flag instructions
  //=========================================================

  SEC() {
    this.carryFlag = 1;
  }

  SEI() {
    this.irqDisabled = this.interruptFlag; // Delayed change to IRQ disablement
    this.interruptFlag = 1;
  }

  SED() {
    this.decimalFlag = 1;
  }

  //=========================================================
  // Memory write instructions
  //=========================================================

  STA(address) {
    this.writeByte(address, this.accumulator);
  }

  STX(address) {
    this.writeByte(address, this.registerX);
  }

  SAX(address) {
    this.writeByte(address, this.accumulator & this.registerX);
  }

  STY(address) {
    this.writeByte(address, this.registerY);
  }

  SHA(address) { // Also known as AHX
    this.storeHighAddressIntoMemory(address, this.accumulator & this.registerX);
  }

  SHX(address) { // Also known as SXA
    this.storeHighAddressIntoMemory(address, this.registerX);
  }

  SHY(address) { // Also known as SYA
    this.storeHighAddressIntoMemory(address, this.registerY);
  }

  //=========================================================
  // Memory read instructions
  //=========================================================

  LDA(address) {
    this.storeValueIntoAccumulator(this.readByte(address));
  }

  LDX(address) {
    this.storeValueIntoRegisterX(this.readByte(address));
  }

  LDY(address) {
    this.storeValueIntoRegisterY(this.readByte(address));
  }

  LAX(address) {
    const value = this.readByte(address);
    this.storeValueIntoAccumulator(value);
    this.storeValueIntoRegisterX(value);
  }

  LAS(address) {
    this.stackPointer &= this.readByte(address);
    this.storeValueIntoAccumulator(this.stackPointer);
    this.storeValueIntoRegisterX(this.stackPointer);
  }

  //=========================================================
  // Register transfer instructions
  //=========================================================

  TAX() {
    this.storeValueIntoRegisterX(this.accumulator);
  }

  TAY() {
    this.storeValueIntoRegisterY(this.accumulator);
  }

  TXA() {
    this.storeValueIntoAccumulator(this.registerX);
  }

  TYA() {
    this.storeValueIntoAccumulator(this.registerY);
  }

  TSX() {
    this.storeValueIntoRegisterX(this.stackPointer);
  }

  TXS() {
    this.stackPointer = this.registerX;
  }

  //=========================================================
  // Stack push instructions
  //=========================================================

  PHA() {
    this.pushByte(this.accumulator);
  }

  PHP() {
    this.pushByte(this.getStatus() | 0x10); // Push status with bit 4 on (break command flag)
  }

  //=========================================================
  // Stack pull instructions
  //=========================================================

  PLA() {
    this.tick();
    this.storeValueIntoAccumulator(this.popByte());
  }

  PLP() {
    this.tick();
    this.irqDisabled = this.interruptFlag; // Delayed change to IRQ disablement
    this.setStatus(this.popByte());
  }

  //=========================================================
  // Accumulator bitwise instructions
  //=========================================================

  AND(address) {
    return this.storeValueIntoAccumulator(this.accumulator & this.readByte(address));
  }

  ORA(address) {
    this.storeValueIntoAccumulator(this.accumulator | this.readByte(address));
  }

  EOR(address) {
    this.storeValueIntoAccumulator(this.accumulator ^ this.readByte(address));
  }

  BIT(address) {
    const value = this.readByte(address);
    // @ts-expect-error
    this.zeroFlag = (!(this.accumulator & value)) | 0;
    this.overflowFlag = (value >>> 6) & 1;
    this.negativeFlag = value >>> 7;
  }

  //=========================================================
  // Increment instructions
  //=========================================================

  INC(address) {
    return this.storeValueIntoMemory(address, (this.readWriteByte(address) + 1) & 0xFF);
  }

  INX() {
    this.storeValueIntoRegisterX((this.registerX + 1) & 0xFF);
  }

  INY() {
    this.storeValueIntoRegisterY((this.registerY + 1) & 0xFF);
  }

  //=========================================================
  // Decrement instructions
  //=========================================================

  DEC(address) {
    return this.storeValueIntoMemory(address, (this.readWriteByte(address) - 1) & 0xFF);
  }

  DEX() {
    this.storeValueIntoRegisterX((this.registerX - 1) & 0xFF);
  }

  DEY() {
    this.storeValueIntoRegisterY((this.registerY - 1) & 0xFF);
  }

  //=========================================================
  // Comparison instructions
  //=========================================================

  CMP(address) {
    this.compareRegisterAndMemory(this.accumulator, address);
  }

  CPX(address) {
    this.compareRegisterAndMemory(this.registerX, address);
  }

  CPY(address) {
    this.compareRegisterAndMemory(this.registerY, address);
  }

  //=========================================================
  // Branching instructions
  //=========================================================

  BCC(address) {
    this.branchIf(!this.carryFlag, address);
  }

  BCS(address) {
    this.branchIf(this.carryFlag, address);
  }

  BNE(address) {
    this.branchIf(!this.zeroFlag, address);
  }

  BEQ(address) {
    this.branchIf(this.zeroFlag, address);
  }

  BVC(address) {
    this.branchIf(!this.overflowFlag, address);
  }

  BVS(address) {
    this.branchIf(this.overflowFlag, address);
  }

  BPL(address) {
    this.branchIf(!this.negativeFlag, address);
  }

  BMI(address) {
    this.branchIf(this.negativeFlag, address);
  }

  //=========================================================
  // Jump / subroutine instructions
  //=========================================================

  JMP(address) {
    this.programCounter = address;
  }

  JSR(address) {
    this.tick();
    this.pushWord((this.programCounter - 1) & 0xFFFF); // The pushed address must be the end of the current instruction
    this.programCounter = address;
  }

  RTS() {
    this.tick();
    this.tick();
    this.programCounter = (this.popWord() + 1) & 0xFFFF; // We decremented the address when pushing it during JSR
  }

  //=========================================================
  // Interrupt control instructions
  //=========================================================

  BRK() {
    this.moveProgramCounter(1);  // BRK is 2 byte instruction (skip the unused byte)
    this.pushWord(this.programCounter);
    this.pushByte(this.getStatus() | 0x10); // Push status with bit 4 on (break command flag)
    this.irqDisabled = 1;   // Immediate change to IRQ disablement
    this.interruptFlag = 1; // Immediate change to IRQ disablement
    this.programCounter = this.readWord(this.activeInterrupts & NMI ? NMI_ADDRESS : IRQ_ADDRESS); // Active NMI hijacks BRK
  }

  RTI() {
    this.tick();
    this.setStatus(this.popByte());
    this.irqDisabled = this.interruptFlag; // Immediate change to IRQ disablement
    this.programCounter = this.popWord();
  }

  //=========================================================
  // Addition / subtraction instructions
  //=========================================================

  ADC(address) {
    this.addValueToAccumulator(this.readByte(address));
  }

  SBC(address) {
    this.addValueToAccumulator((this.readByte(address)) ^ 0xFF); // With internal carry increment makes negative operand
  }

  //=========================================================
  // Shifting / rotation instructions
  //=========================================================

  ASL(address) {
    return this.rotateAccumulatorOrMemory(address, this.rotateLeft, false);
  }

  LSR(address) {
    return this.rotateAccumulatorOrMemory(address, this.rotateRight, false);
  }

  ROL(address) {
    return this.rotateAccumulatorOrMemory(address, this.rotateLeft, true);
  }

  ROR(address) {
    return this.rotateAccumulatorOrMemory(address, this.rotateRight, true);
  }

  //=========================================================
  // Hybrid instructions
  //=========================================================

  /* eslint-disable new-cap */

  DCP(address) {
    this.compareRegisterAndOperand(this.accumulator, this.DEC(address));
  }

  ISB(address) {
    this.addValueToAccumulator((this.INC(address)) ^ 0xFF); // With internal carry increment makes negative operand
  }

  SLO(address) {
    this.storeValueIntoAccumulator(this.accumulator | this.ASL(address));
  }

  SRE(address) {
    this.storeValueIntoAccumulator(this.accumulator ^ this.LSR(address));
  }

  RLA(address) {
    this.storeValueIntoAccumulator(this.accumulator & this.ROL(address));
  }

  XAA(address) { // Also known as ANE
    this.storeValueIntoAccumulator(this.registerX & this.AND(address));
  }

  RRA(address) {
    this.addValueToAccumulator(this.ROR(address));
  }

  AXS(address) { // Also known as SBX
    this.registerX = this.compareRegisterAndMemory(this.accumulator & this.registerX, address);
  }

  ANC(address) {
    this.rotateLeft(this.AND(address), false); // rotateLeft computes carry
  }

  ALR(address) {
    this.AND(address);
    this.LSR(null);
  }

  ARR(address) {
    this.AND(address);
    this.ROR(null);
    this.carryFlag = (this.accumulator >>> 6) & 1;
    this.overflowFlag = ((this.accumulator >>> 5) & 1) ^ this.carryFlag;
  }

  TAS(address) { // Also known as SHS
    this.stackPointer = this.accumulator & this.registerX;
    this.SHA(address);
  }

  /* eslint-enable new-cap */

  //=========================================================
  // Instruction helpers
  //=========================================================

  storeValueIntoAccumulator(value) {
    // @ts-expect-error
    this.zeroFlag = (!(value & 0xFF)) | 0;
    this.negativeFlag = (value >>> 7) & 1;
    return (this.accumulator = value);
  }

  storeValueIntoRegisterX(value) {
    // @ts-expect-error
    this.zeroFlag = (!(value & 0xFF)) | 0;
    this.negativeFlag = (value >>> 7) & 1;
    this.registerX = value;
  }

  storeValueIntoRegisterY(value) {
    // @ts-expect-error
    this.zeroFlag = (!(value & 0xFF)) | 0;
    this.negativeFlag = (value >>> 7) & 1;
    this.registerY = value;
  }

  storeValueIntoMemory(address, value) {
    // @ts-expect-error
    this.zeroFlag = (!(value & 0xFF)) | 0;
    this.negativeFlag = (value >>> 7) & 1;
    return this.writeByte(address, value);
  }

  storeHighAddressIntoMemory(address, register) {
    if (this.pageCrossed) {
      this.writeByte(address, this.cpuMemory.read(address)); // Just copy the same value
    } else {
      this.writeByte(address, register & ((address >>> 8) + 1));
    }
  }

  addValueToAccumulator(operand) {
    const result = this.accumulator + operand + this.carryFlag;
    this.carryFlag = (result >>> 8) & 1;
    this.overflowFlag = (((this.accumulator ^ result) & (operand ^ result)) >>> 7) & 1; // Signed overflow
    return this.storeValueIntoAccumulator(result & 0xFF);
  }

  compareRegisterAndMemory(register, address) {
    return this.compareRegisterAndOperand(register, this.readByte(address));
  }

  compareRegisterAndOperand(register, operand) {
    const result = register - operand;
    // @ts-expect-error
    this.carryFlag = (result >= 0) | 0; // Unsigned comparison (bit 8 is actually the result sign)
    // @ts-expect-error
    this.zeroFlag = (!(result & 0xFF)) | 0;
    this.negativeFlag = (result >>> 7) & 1;
    return result & 0xFF;
  }

  branchIf(condition, address) {
    if (condition) {
      this.tick();
      if (isDifferentPage(this.programCounter, address)) {
        this.tick();
      }
      this.programCounter = address;
    }
  }

  rotateAccumulatorOrMemory(address, rotation, transferCarry) {
    if (address != null) {
      const result = rotation.call(this, this.readWriteByte(address), transferCarry);
      return this.storeValueIntoMemory(address, result);
    }
    const result = rotation.call(this, this.accumulator, transferCarry);
    return this.storeValueIntoAccumulator(result);
  }

  rotateLeft(value, transferCarry) {
    const carry = transferCarry & this.carryFlag;
    this.carryFlag = value >>> 7;
    return ((value << 1) | carry) & 0xFF;
  }

  rotateRight(value, transferCarry) {
    const carry = (transferCarry & this.carryFlag) << 7;
    this.carryFlag = value & 1;
    return (value >>> 1) | carry;
  }

  updateZeroAndNegativeFlag(value: number) {
    // @ts-expect-error
    this.zeroFlag = (!(value & 0xFF)) | 0;
    this.negativeFlag = (value >>> 7) & 1;
  }

}

//=========================================================
// Utils
//=========================================================

function isDifferentPage(address1, address2) {
  return (address1 & 0xFF00) !== (address2 & 0xFF00);
}
