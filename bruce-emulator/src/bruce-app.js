"use strict";
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = function(cb, mod) {
  return function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
};

// dist/cfxnes-core/common/logLevels.js
var require_logLevels = __commonJS({
  "dist/cfxnes-core/common/logLevels.js": function(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.INFO = exports2.WARN = exports2.ERROR = exports2.OFF = void 0;
    exports2.OFF = "off";
    exports2.ERROR = "error";
    exports2.WARN = "warn";
    exports2.INFO = "info";
  }
});

// dist/cfxnes-core/common/utils.js
var require_utils = __commonJS({
  "dist/cfxnes-core/common/utils.js": function(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.detectEndianness = detectEndianness;
    exports2.decodeBase64 = decodeBase64;
    exports2.formatSize = formatSize;
    exports2.describe = describe;
    var MAX_TO_STRING_LENGTH = 80;
    function detectEndianness() {
      var u16 = new Uint16Array([4660]);
      var u8 = new Uint8Array(u16.buffer);
      return u8[0] === 52 ? "LE" : "BE";
    }
    function decodeBase64(input) {
      return Duktape.dec("base64", input);
    }
    function formatSize(size) {
      if (typeof size !== "number") {
        return void 0;
      }
      if (Math.abs(size) < 1024) {
        return size + " B";
      }
      if (Math.abs(size) < 1024 * 1024) {
        return roundSize(size / 1024) + " KB";
      }
      return roundSize(size / (1024 * 1024)) + " MB";
    }
    function roundSize(number) {
      return ~~(1e3 * number) / 1e3;
    }
    function describe(value) {
      var type = typeof value;
      if (type === "string") {
        if (value.length > MAX_TO_STRING_LENGTH) {
          return '"'.concat(value.substr(0, MAX_TO_STRING_LENGTH), '..."');
        }
        return '"'.concat(value, '"');
      }
      if (type === "function") {
        var constructorName = getFunctionName(value.constructor);
        var name = getFunctionName(value);
        return name ? "".concat(constructorName, "(").concat(name, ")") : constructorName;
      }
      if (value && type === "object") {
        var constructorName = getFunctionName(value.constructor);
        if (constructorName === "Object") {
          return constructorName;
        }
        var length = value.length;
        return length != null ? "".concat(constructorName, "(").concat(length, ")") : constructorName;
      }
      return String(value);
    }
    var functionNameRegexp = /function ([^(]+)/;
    function getFunctionName(fn) {
      if (fn.name) {
        return fn.name;
      }
      var matchResult = fn.toString().match(functionNameRegexp);
      if (matchResult && matchResult[1]) {
        return matchResult[1];
      }
      return "";
    }
  }
});

// dist/cfxnes-core/common/mirrorings.js
var require_mirrorings = __commonJS({
  "dist/cfxnes-core/common/mirrorings.js": function(exports2) {
    "use strict";
    var _a;
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.FOUR_SCREEN = exports2.VERTICAL = exports2.HORIZONTAL = exports2.SCREEN_3 = exports2.SCREEN_2 = exports2.SCREEN_1 = exports2.SCREEN_0 = void 0;
    exports2.getAreas = getAreas;
    exports2.getSingle = getSingle;
    var utils_1 = require_utils();
    exports2.SCREEN_0 = "S0";
    exports2.SCREEN_1 = "S1";
    exports2.SCREEN_2 = "S2";
    exports2.SCREEN_3 = "S3";
    exports2.HORIZONTAL = "H";
    exports2.VERTICAL = "V";
    exports2.FOUR_SCREEN = "4S";
    var areas = (_a = {}, _a[exports2.SCREEN_0] = [0, 0, 0, 0], _a[exports2.SCREEN_1] = [1, 1, 1, 1], _a[exports2.SCREEN_2] = [2, 2, 2, 2], _a[exports2.SCREEN_3] = [3, 3, 3, 3], _a[exports2.HORIZONTAL] = [0, 0, 1, 1], _a[exports2.VERTICAL] = [0, 1, 0, 1], _a[exports2.FOUR_SCREEN] = [0, 1, 2, 3], _a);
    function getAreas(mirroring) {
      var area = areas[mirroring];
      if (area) {
        return area;
      }
      throw new Error("Invalid mirroring: " + (0, utils_1.describe)(mirroring));
    }
    function getSingle(screen) {
      return "S" + screen;
    }
  }
});

// dist/cfxnes-core/common/regions.js
var require_regions = __commonJS({
  "dist/cfxnes-core/common/regions.js": function(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.PAL = exports2.NTSC = void 0;
    exports2.getParams = getParams;
    var utils_1 = require_utils();
    exports2.NTSC = "NTSC";
    exports2.PAL = "PAL";
    var ntscParams = {
      framesPerSecond: 60,
      cpuFrequency: 1789773,
      ppuClipTopBottom: true,
      frameCounterMax4: [7457, 7456, 7458, 7457, 1, 1],
      // 4-step frame counter
      frameCounterMax5: [7457, 7456, 7458, 7458, 7452, 1],
      // 5-step frame counter
      noiseChannelTimerPeriods: [4, 8, 16, 32, 64, 96, 128, 160, 202, 254, 380, 508, 762, 1016, 2034, 4068],
      dmcChannelTimerPeriods: [428, 380, 340, 320, 286, 254, 226, 214, 190, 160, 142, 128, 106, 84, 72, 54]
    };
    var palParams = {
      framesPerSecond: 50,
      cpuFrequency: 1789773 * 5 / 6,
      // NTSC frequency adjusted to the 50 Hz screen refresh rate (the real CPU frequency for PAL is 1662607 Hz)
      ppuClipTopBottom: false,
      frameCounterMax4: [8313, 8314, 8312, 8313, 1, 1],
      // 4-step frame counter
      frameCounterMax5: [8313, 8314, 8312, 8314, 8312, 1],
      // 5-step frame counter
      noiseChannelTimerPeriods: [4, 8, 14, 30, 60, 88, 118, 148, 188, 236, 354, 472, 708, 944, 1890, 3778],
      dmcChannelTimerPeriods: [398, 354, 316, 298, 276, 236, 210, 198, 176, 148, 132, 118, 98, 78, 66, 50]
    };
    function getParams(region) {
      switch (region) {
        case exports2.NTSC:
          return ntscParams;
        case exports2.PAL:
          return palParams;
        default:
          throw new Error("Invalid region: " + (0, utils_1.describe)(region));
      }
    }
  }
});

// dist/cfxnes-core/common/mappers.js
var require_mappers = __commonJS({
  "dist/cfxnes-core/common/mappers.js": function(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.UNROM = exports2.NROM = exports2.NINA_001 = exports2.MMC3 = exports2.MMC1 = exports2.COLOR_DREAMS = exports2.CNROM = exports2.BNROM = exports2.AOROM = void 0;
    exports2.AOROM = "AOROM";
    exports2.BNROM = "BNROM";
    exports2.CNROM = "CNROM";
    exports2.COLOR_DREAMS = "COLOR_DREAMS";
    exports2.MMC1 = "MMC1";
    exports2.MMC3 = "MMC3";
    exports2.NINA_001 = "NINA_001";
    exports2.NROM = "NROM";
    exports2.UNROM = "UNROM";
  }
});

// dist/cfxnes-core/common/submappers.js
var require_submappers = __commonJS({
  "dist/cfxnes-core/common/submappers.js": function(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SXROM = exports2.SOROM = exports2.SUROM = void 0;
    exports2.SUROM = "SUROM";
    exports2.SOROM = "SOROM";
    exports2.SXROM = "SXROM";
  }
});

// dist/cfxnes-core/common/log.js
var require_log = __commonJS({
  "dist/cfxnes-core/common/log.js": function(exports2) {
    "use strict";
    var _a;
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Log = void 0;
    var utils_1 = require_utils();
    var logLevels_1 = require_logLevels();
    var OFF_PRIORITY = 0;
    var ERROR_PRIORITY = 1;
    var WARN_PRIORITY = 2;
    var INFO_PRIORITY = 3;
    var priorities = (_a = {}, _a[logLevels_1.OFF] = OFF_PRIORITY, _a[logLevels_1.ERROR] = ERROR_PRIORITY, _a[logLevels_1.WARN] = WARN_PRIORITY, _a[logLevels_1.INFO] = INFO_PRIORITY, _a);
    var Log = (
      /** @class */
      function() {
        function Log2(output) {
          this.output = output;
          this.priority = OFF_PRIORITY;
          this.level = logLevels_1.OFF;
        }
        Log2.prototype.setLevel = function(level) {
          var priority = priorities[level];
          if (priority == null) {
            throw new Error("Invalid log level: " + (0, utils_1.describe)(level));
          }
          this.priority = priority;
          this.level = level;
        };
        Log2.prototype.getLevel = function() {
          return this.level;
        };
        Log2.prototype.error = function(message, error) {
          if (error === void 0) {
            error = void 0;
          }
          if (this.priority >= ERROR_PRIORITY) {
            this.output[logLevels_1.ERROR](message, error);
          }
        };
        Log2.prototype.warn = function(message) {
          if (this.priority >= WARN_PRIORITY) {
            this.output[logLevels_1.WARN](message);
          }
        };
        Log2.prototype.info = function(message) {
          if (this.priority >= INFO_PRIORITY) {
            this.output[logLevels_1.INFO](message);
          }
        };
        return Log2;
      }()
    );
    exports2.Log = Log;
    exports2.default = new Log(console);
  }
});

// dist/cfxnes-core/common/index.js
var require_common = __commonJS({
  "dist/cfxnes-core/common/index.js": function(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || /* @__PURE__ */ function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    }();
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.describe = exports2.formatSize = exports2.decodeBase64 = exports2.detectEndianness = exports2.Submapper = exports2.Mapper = exports2.Region = exports2.Mirroring = exports2.LogLevel = exports2.log = void 0;
    var LogLevel = __importStar(require_logLevels());
    exports2.LogLevel = LogLevel;
    var Mirroring = __importStar(require_mirrorings());
    exports2.Mirroring = Mirroring;
    var Region = __importStar(require_regions());
    exports2.Region = Region;
    var Mapper = __importStar(require_mappers());
    exports2.Mapper = Mapper;
    var Submapper = __importStar(require_submappers());
    exports2.Submapper = Submapper;
    var log_1 = require_log();
    Object.defineProperty(exports2, "log", { enumerable: true, get: function() {
      return __importDefault2(log_1).default;
    } });
    var utils_1 = require_utils();
    Object.defineProperty(exports2, "detectEndianness", { enumerable: true, get: function() {
      return utils_1.detectEndianness;
    } });
    Object.defineProperty(exports2, "decodeBase64", { enumerable: true, get: function() {
      return utils_1.decodeBase64;
    } });
    Object.defineProperty(exports2, "formatSize", { enumerable: true, get: function() {
      return utils_1.formatSize;
    } });
    Object.defineProperty(exports2, "describe", { enumerable: true, get: function() {
      return utils_1.describe;
    } });
  }
});

// dist/cfxnes-core/memory/CPUMemory.js
var require_CPUMemory = __commonJS({
  "dist/cfxnes-core/memory/CPUMemory.js": function(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var common_1 = require_common();
    var CPUMemory = (
      /** @class */
      function() {
        function CPUMemory2() {
          common_1.log.info("Initializing CPU memory");
          this.ram = new Uint8Array(2048);
          this.prgROM = null;
          this.prgRAM = null;
          this.prgROMMapping = new Uint32Array(4);
          this.prgRAMMapping = 0;
          this.inputDevice = null;
          this.inputStrobe = 0;
          this.ppu = null;
          this.apu = null;
          this.dma = null;
          this.mapper = null;
        }
        CPUMemory2.prototype.connect = function(nes) {
          common_1.log.info("Connecting CPU memory");
          this.ppu = nes.ppu;
          this.apu = nes.apu;
          this.dma = nes.dma;
        };
        CPUMemory2.prototype.setMapper = function(mapper) {
          this.mapper = mapper;
          this.prgRAM = mapper && mapper.prgRAM;
          this.prgROM = mapper && mapper.prgROM;
        };
        CPUMemory2.prototype.reset = function() {
          common_1.log.info("Resetting CPU memory");
          this.resetRAM();
          this.resetRegisters();
          this.resetPRGRAM();
          this.resetPRGROM();
        };
        CPUMemory2.prototype.read = function(address) {
          if (address >= 32768) {
            return this.readPRGROM(address);
          } else if (address < 8192) {
            return this.ram[address & 2047];
          } else if (address < 16416) {
            return this.readRegister(address);
          } else if (address >= 24576) {
            return this.readPRGRAM(address);
          }
          return this.readEXROM(address);
        };
        CPUMemory2.prototype.write = function(address, value) {
          if (address >= 32768) {
            this.writePRGROM(address, value);
          } else if (address < 8192) {
            this.ram[address & 2047] = value;
          } else if (address < 16416) {
            this.writeRegister(address, value);
          } else if (address >= 24576) {
            this.writePRGRAM(address, value);
          } else {
            this.writeEXROM(address, value);
          }
        };
        CPUMemory2.prototype.resetRAM = function() {
          this.ram.fill(0);
        };
        CPUMemory2.prototype.readRAM = function(address) {
          return this.ram[this.mapRAMAddress(address)];
        };
        CPUMemory2.prototype.writeRAM = function(address, value) {
          this.ram[this.mapRAMAddress(address)] = value;
        };
        CPUMemory2.prototype.mapRAMAddress = function(address) {
          return address & 2047;
        };
        CPUMemory2.prototype.resetRegisters = function() {
          this.inputStrobe = 0;
        };
        CPUMemory2.prototype.readRegister = function(address) {
          switch (this.mapRegisterAddress(address)) {
            case 8194:
              return this.ppu.readStatus();
            case 8196:
              return this.ppu.readOAMData();
            case 8199:
              return this.ppu.readData();
            case 16405:
              return this.apu.readStatus();
            case 16406:
              return this.readInputDevice(1);
            case 16407:
              return this.readInputDevice(2);
            default:
              return 0;
          }
        };
        CPUMemory2.prototype.writeRegister = function(address, value) {
          switch (this.mapRegisterAddress(address)) {
            case 8192:
              this.ppu.writeControl(value);
              break;
            case 8193:
              this.ppu.writeMask(value);
              break;
            case 8195:
              this.ppu.writeOAMAddress(value);
              break;
            case 8196:
              this.ppu.writeOAMData(value);
              break;
            case 8197:
              this.ppu.writeScroll(value);
              break;
            case 8198:
              this.ppu.writeAddress(value);
              break;
            case 8199:
              this.ppu.writeData(value);
              break;
            case 16404:
              this.dma.writeAddress(value);
              break;
            case 16406:
              this.writeInputDevice(value);
              break;
            case 16384:
              this.apu.writePulseDutyEnvelope(1, value);
              break;
            case 16385:
              this.apu.writePulseSweep(1, value);
              break;
            case 16386:
              this.apu.writePulseTimer(1, value);
              break;
            case 16387:
              this.apu.writePulseLengthCounter(1, value);
              break;
            case 16388:
              this.apu.writePulseDutyEnvelope(2, value);
              break;
            case 16389:
              this.apu.writePulseSweep(2, value);
              break;
            case 16390:
              this.apu.writePulseTimer(2, value);
              break;
            case 16391:
              this.apu.writePulseLengthCounter(2, value);
              break;
            case 16392:
              this.apu.writeTriangleLinearCounter(value);
              break;
            case 16394:
              this.apu.writeTriangleTimer(value);
              break;
            case 16395:
              this.apu.writeTriangleLengthCounter(value);
              break;
            case 16396:
              this.apu.writeNoiseEnvelope(value);
              break;
            case 16398:
              this.apu.writeNoiseTimer(value);
              break;
            case 16399:
              this.apu.writeNoiseLengthCounter(value);
              break;
            case 16400:
              this.apu.writeDMCFlagsTimer(value);
              break;
            case 16401:
              this.apu.writeDMCOutputLevel(value);
              break;
            case 16402:
              this.apu.writeDMCSampleAddress(value);
              break;
            case 16403:
              this.apu.writeDMCSampleLength(value);
              break;
            case 16405:
              this.apu.writeStatus(value);
              break;
            case 16407:
              this.apu.writeFrameCounter(value);
              this.writeInputDevice(value);
              break;
          }
        };
        CPUMemory2.prototype.mapRegisterAddress = function(address) {
          if (address < 16384) {
            return address & 8199;
          }
          return address;
        };
        CPUMemory2.prototype.setInputDevice = function(port, device) {
          common_1.log.info("".concat(device != null ? "Setting" : "Clearing", " device connected to CPU memory on port #").concat(port));
          this.inputDevice = device;
        };
        CPUMemory2.prototype.getInputDevice = function(port) {
          return this.inputDevice;
        };
        CPUMemory2.prototype.readInputDevice = function(port) {
          var device = this.inputDevice;
          return device ? device.read() : 0;
        };
        CPUMemory2.prototype.writeInputDevice = function(value) {
          var strobe = value & 1;
          if (strobe && !this.inputStrobe) {
            this.strobeInputDevice(1);
            this.strobeInputDevice(2);
          }
          this.inputStrobe = strobe;
        };
        CPUMemory2.prototype.strobeInputDevice = function(port) {
          var device = this.inputDevice;
          if (device) {
            device.strobe();
          }
        };
        CPUMemory2.prototype.readEXROM = function(address) {
          return 0;
        };
        CPUMemory2.prototype.writeEXROM = function(address, value) {
        };
        CPUMemory2.prototype.resetPRGRAM = function() {
          this.prgRAMMapping = 0;
        };
        CPUMemory2.prototype.readPRGRAM = function(address) {
          if (this.prgRAM && this.mapper.canReadPRGRAM) {
            return this.prgRAM[this.mapPRGRAMAddress(address)];
          }
          return 0;
        };
        CPUMemory2.prototype.writePRGRAM = function(address, value) {
          if (this.prgRAM && this.mapper.canWritePRGRAM) {
            this.prgRAM[this.mapPRGRAMAddress(address)] = value;
            if (this.mapper.hasPRGRAMRegisters) {
              this.mapper.write(address, value);
            }
          }
        };
        CPUMemory2.prototype.mapPRGRAMAddress = function(address) {
          return this.prgRAMMapping | address & 8191;
        };
        CPUMemory2.prototype.mapPRGRAMBank = function(srcBank, dstBank) {
          this.prgRAMMapping = dstBank * 8192;
        };
        CPUMemory2.prototype.resetPRGROM = function() {
          this.prgROMMapping.fill(0);
        };
        CPUMemory2.prototype.readPRGROM = function(address) {
          return this.prgROM[this.mapPRGROMAddress(address)];
        };
        CPUMemory2.prototype.writePRGROM = function(address, value) {
          this.mapper.write(address, value);
        };
        CPUMemory2.prototype.mapPRGROMAddress = function(address) {
          return this.prgROMMapping[(address & 24576) >>> 13] | address & 8191;
        };
        CPUMemory2.prototype.mapPRGROMBank = function(srcBank, dstBank) {
          this.prgROMMapping[srcBank] = dstBank * 8192;
        };
        return CPUMemory2;
      }()
    );
    exports2.default = CPUMemory;
  }
});

// dist/cfxnes-core/memory/PPUMemory.js
var require_PPUMemory = __commonJS({
  "dist/cfxnes-core/memory/PPUMemory.js": function(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var common_1 = require_common();
    var INITIAL_PALETTES = [
      9,
      1,
      0,
      1,
      0,
      2,
      2,
      13,
      // Background palettes 0, 1
      8,
      16,
      8,
      36,
      0,
      0,
      4,
      44,
      // Background palettes 2, 3
      9,
      1,
      52,
      3,
      0,
      4,
      0,
      20,
      // Sprite palettes 0, 1
      8,
      58,
      0,
      2,
      0,
      32,
      44,
      8
      // Sprite palettes 2, 3
    ];
    var PPUMemory = (
      /** @class */
      function() {
        function PPUMemory2() {
          common_1.log.info("Initializing PPU memory");
          this.patterns = null;
          this.patternsMapping = new Uint32Array(8);
          this.canWritePattern = false;
          this.nametables = new Uint8Array(4096);
          this.nametablesMapping = new Uint32Array(4);
          this.palettes = new Uint8Array(32);
          this.mapper = null;
        }
        PPUMemory2.prototype.setMapper = function(mapper) {
          this.mapper = mapper;
          this.patterns = mapper && (mapper.chrRAM || mapper.chrROM);
          this.canWritePattern = mapper != null && mapper.chrRAM != null;
        };
        PPUMemory2.prototype.reset = function() {
          common_1.log.info("Resetting PPU memory");
          this.resetPatterns();
          this.resetNametables();
          this.resetPalettes();
        };
        PPUMemory2.prototype.read = function(address) {
          address = this.mapAddress(address);
          if (address < 8192) {
            return this.readPattern(address);
          } else if (address < 16128) {
            return this.readNametable(address);
          }
          return this.readPalette(address);
        };
        PPUMemory2.prototype.write = function(address, value) {
          address = this.mapAddress(address);
          if (address < 8192) {
            this.writePattern(address, value);
          } else if (address < 16128) {
            this.writeNametable(address, value);
          } else {
            this.writePalette(address, value);
          }
        };
        PPUMemory2.prototype.mapAddress = function(address) {
          return address & 16383;
        };
        PPUMemory2.prototype.resetPatterns = function() {
          this.patternsMapping.fill(0);
        };
        PPUMemory2.prototype.readPattern = function(address) {
          return this.patterns[this.mapPatternAddress(address)];
        };
        PPUMemory2.prototype.writePattern = function(address, value) {
          if (this.canWritePattern) {
            this.patterns[this.mapPatternAddress(address)] = value;
          }
        };
        PPUMemory2.prototype.mapPatternAddress = function(address) {
          return this.patternsMapping[(address & 7168) >>> 10] | address & 1023;
        };
        PPUMemory2.prototype.mapPatternsBank = function(srcBank, dstBank) {
          this.patternsMapping[srcBank] = dstBank * 1024;
        };
        PPUMemory2.prototype.resetNametables = function() {
          this.nametables.fill(0);
          this.setNametablesMirroring(this.mapper && this.mapper.mirroring || common_1.Mirroring.SCREEN_0);
        };
        PPUMemory2.prototype.readNametable = function(address) {
          return this.nametables[this.mapNametableAddress(address)];
        };
        PPUMemory2.prototype.writeNametable = function(address, value) {
          this.nametables[this.mapNametableAddress(address)] = value;
        };
        PPUMemory2.prototype.mapNametableAddress = function(address) {
          return this.nametablesMapping[(address & 3072) >>> 10] | address & 1023;
        };
        PPUMemory2.prototype.setNametablesMirroring = function(mirroring) {
          var areas = common_1.Mirroring.getAreas(mirroring);
          for (var i = 0; i < 4; i++) {
            this.nametablesMapping[i] = areas[i] * 1024;
          }
        };
        PPUMemory2.prototype.resetPalettes = function() {
          this.palettes.set(INITIAL_PALETTES);
        };
        PPUMemory2.prototype.readPalette = function(address) {
          return this.palettes[this.mapPaletteAddress(address)];
        };
        PPUMemory2.prototype.writePalette = function(address, value) {
          this.palettes[this.mapPaletteAddress(address)] = value;
        };
        PPUMemory2.prototype.mapPaletteAddress = function(address) {
          if (address & 3) {
            return address & 31;
          }
          return address & 15;
        };
        return PPUMemory2;
      }()
    );
    exports2.default = PPUMemory;
  }
});

// dist/cfxnes-core/memory/DMA.js
var require_DMA = __commonJS({
  "dist/cfxnes-core/memory/DMA.js": function(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var common_1 = require_common();
    var DMA = (
      /** @class */
      function() {
        function DMA2() {
          common_1.log.info("Initializing DMA");
          this.cycle = 0;
          this.baseAddress = 0;
          this.cpuMemory = null;
        }
        DMA2.prototype.connect = function(nes) {
          common_1.log.info("Connecting DMA");
          this.cpuMemory = nes.cpuMemory;
        };
        DMA2.prototype.reset = function() {
          common_1.log.info("Resetting DMA");
          this.cycle = 512;
        };
        DMA2.prototype.writeAddress = function(address) {
          this.cycle = 0;
          this.baseAddress = address << 8;
        };
        DMA2.prototype.tick = function() {
          if (this.cycle < 512) {
            this.cycle++;
            if (this.cycle & 1) {
              var address = this.cpuMemory.dma.baseAddress + (this.cpuMemory.dma.cycle >> 1);
              var data = address < 8192 ? this.cpuMemory.ram[address & 2047] : this.cpuMemory.read(address);
              if (!(!this.cpuMemory.ppu.vblankActive && (this.cpuMemory.ppu.spritesVisible || this.cpuMemory.ppu.backgroundVisible))) {
                this.cpuMemory.ppu.primaryOAM[this.cpuMemory.ppu.oamAddress] = data;
              }
              this.cpuMemory.ppu.oamAddress = this.cpuMemory.ppu.oamAddress + 1 & 255;
            }
          }
        };
        DMA2.prototype.isBlockingCPU = function() {
          return this.cycle < 512;
        };
        DMA2.prototype.transferData = function() {
          var address = this.baseAddress + (this.cycle >> 1);
          var data = this.cpuMemory.read(address);
          this.cpuMemory.write(8196, data);
        };
        return DMA2;
      }()
    );
    exports2.default = DMA;
  }
});

// dist/cfxnes-core/memory/mappers/Mapper.js
var require_Mapper = __commonJS({
  "dist/cfxnes-core/memory/mappers/Mapper.js": function(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var common_1 = require_common();
    var Mapper = (
      /** @class */
      function() {
        function Mapper2(cartridge) {
          common_1.log.info("Initializing mapper");
          this.mirroring = cartridge.mirroring;
          this.prgROM = cartridge.prgROM;
          this.chrROM = cartridge.chrROM;
          this.prgROMSize = cartridge.prgROMSize;
          this.chrROMSize = cartridge.chrROMSize;
          var prgRAMSize = cartridge.prgRAMSize, prgRAMSizeBattery = cartridge.prgRAMSizeBattery;
          this.prgRAM = prgRAMSize ? new Uint8Array(prgRAMSize) : null;
          this.prgRAMSize = prgRAMSize;
          this.prgRAMSizeBattery = prgRAMSizeBattery;
          this.canReadPRGRAM = prgRAMSize > 0;
          this.canWritePRGRAM = prgRAMSize > 0;
          this.hasPRGRAMRegisters = false;
          var chrRAMSize = cartridge.chrRAMSize, chrRAMSizeBattery = cartridge.chrRAMSizeBattery;
          this.chrRAM = chrRAMSize ? new Uint8Array(chrRAMSize) : null;
          this.chrRAMSize = chrRAMSize;
          this.chrRAMSizeBattery = chrRAMSizeBattery;
          if (prgRAMSizeBattery) {
            this.nvram = this.prgRAM.subarray(0, prgRAMSizeBattery);
          } else if (chrRAMSizeBattery) {
            this.nvram = this.chrRAM.subarray(0, chrRAMSizeBattery);
          } else {
            this.nvram = null;
          }
          this.cpu = null;
          this.ppu = null;
          this.cpuMemory = null;
          this.ppuMemory = null;
        }
        Mapper2.prototype.connect = function(nes) {
          common_1.log.info("Connecting mapper");
          this.cpu = nes.cpu;
          this.ppu = nes.ppu;
          this.cpuMemory = nes.cpuMemory;
          this.ppuMemory = nes.ppuMemory;
          this.cpu.setMapper(this);
          this.cpuMemory.setMapper(this);
          this.ppuMemory.setMapper(this);
        };
        Mapper2.prototype.disconnect = function() {
          common_1.log.info("Disconnecting mapper");
          this.ppuMemory.setMapper(null);
          this.cpuMemory.setMapper(null);
          this.cpu.setMapper(null);
          this.ppuMemory = null;
          this.cpuMemory = null;
          this.ppu = null;
          this.cpu = null;
        };
        Mapper2.prototype.reset = function() {
          common_1.log.info("Resetting mapper");
          this.resetPRGRAM();
          this.resetCHRRAM();
          this.resetState();
        };
        Mapper2.prototype.resetState = function() {
        };
        Mapper2.prototype.write = function(address, value) {
        };
        Mapper2.prototype.tick = function() {
        };
        Mapper2.prototype.mapPRGROMBank32K = function(srcBank, dstBank) {
          this.mapPRGROMBank8K(srcBank * 4, dstBank * 4, 4);
        };
        Mapper2.prototype.mapPRGROMBank16K = function(srcBank, dstBank) {
          this.mapPRGROMBank8K(srcBank * 2, dstBank * 2, 2);
        };
        Mapper2.prototype.mapPRGROMBank8K = function(srcBank, dstBank, count) {
          if (count === void 0) {
            count = 1;
          }
          var maxBank = this.prgROMSize - 1 >> 13;
          for (var i = 0; i < count; i++) {
            this.cpuMemory.mapPRGROMBank(srcBank + i, dstBank + i & maxBank);
          }
        };
        Mapper2.prototype.resetPRGRAM = function() {
          if (this.prgRAM) {
            this.prgRAM.fill(0, this.prgRAMSizeBattery);
          }
        };
        Mapper2.prototype.mapPRGRAMBank8K = function(srcBank, dstBank) {
          var maxBank = this.prgRAMSize - 1 >> 13;
          this.cpuMemory.mapPRGRAMBank(srcBank, dstBank & maxBank);
        };
        Mapper2.prototype.resetCHRRAM = function() {
          if (this.chrRAM) {
            this.chrRAM.fill(0, this.chrRAMSizeBattery);
          }
        };
        Mapper2.prototype.mapCHRBank8K = function(srcBank, dstBank) {
          this.mapCHRBank1K(srcBank * 8, dstBank * 8, 8);
        };
        Mapper2.prototype.mapCHRBank4K = function(srcBank, dstBank) {
          this.mapCHRBank1K(srcBank * 4, dstBank * 4, 4);
        };
        Mapper2.prototype.mapCHRBank2K = function(srcBank, dstBank) {
          this.mapCHRBank1K(srcBank * 2, dstBank * 2, 2);
        };
        Mapper2.prototype.mapCHRBank1K = function(srcBank, dstBank, count) {
          if (count === void 0) {
            count = 1;
          }
          var chrSize = this.chrROMSize || this.chrRAMSize;
          var maxBank = chrSize - 1 >> 10;
          for (var i = 0; i < count; i++) {
            this.ppuMemory.mapPatternsBank(srcBank + i, dstBank + i & maxBank);
          }
        };
        Mapper2.prototype.getNVRAM = function() {
          return this.nvram;
        };
        Mapper2.prototype.setSingleScreenMirroring = function(area) {
          if (area === void 0) {
            area = 0;
          }
          this.ppuMemory.setNametablesMirroring(common_1.Mirroring.getSingle(area));
        };
        Mapper2.prototype.setVerticalMirroring = function() {
          this.ppuMemory.setNametablesMirroring(common_1.Mirroring.VERTICAL);
        };
        Mapper2.prototype.setHorizontalMirroring = function() {
          this.ppuMemory.setNametablesMirroring(common_1.Mirroring.HORIZONTAL);
        };
        Mapper2.prototype.setFourScreenMirroring = function() {
          this.ppuMemory.setNametablesMirroring(common_1.Mirroring.FOUR_SCREEN);
        };
        return Mapper2;
      }()
    );
    exports2.default = Mapper;
  }
});

// dist/cfxnes-core/memory/mappers/AOROM.js
var require_AOROM = __commonJS({
  "dist/cfxnes-core/memory/mappers/AOROM.js": function(exports2) {
    "use strict";
    var __extends = exports2 && exports2.__extends || /* @__PURE__ */ function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
          d2.__proto__ = b2;
        } || function(d2, b2) {
          for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
        };
        return extendStatics(d, b);
      };
      return function(d, b) {
        if (typeof b !== "function" && b !== null)
          throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    }();
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    var Mapper_1 = __importDefault2(require_Mapper());
    var AOROM = (
      /** @class */
      function(_super) {
        __extends(AOROM2, _super);
        function AOROM2() {
          return _super !== null && _super.apply(this, arguments) || this;
        }
        AOROM2.prototype.resetState = function() {
          this.mapPRGROMBank32K(0, 0);
          this.mapCHRBank8K(0, 0);
        };
        AOROM2.prototype.write = function(address, value) {
          this.mapPRGROMBank32K(0, value);
          this.setSingleScreenMirroring((value & 16) >>> 4);
        };
        return AOROM2;
      }(Mapper_1.default)
    );
    exports2.default = AOROM;
  }
});

// dist/cfxnes-core/memory/mappers/BNROM.js
var require_BNROM = __commonJS({
  "dist/cfxnes-core/memory/mappers/BNROM.js": function(exports2) {
    "use strict";
    var __extends = exports2 && exports2.__extends || /* @__PURE__ */ function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
          d2.__proto__ = b2;
        } || function(d2, b2) {
          for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
        };
        return extendStatics(d, b);
      };
      return function(d, b) {
        if (typeof b !== "function" && b !== null)
          throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    }();
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    var Mapper_1 = __importDefault2(require_Mapper());
    var BNROM = (
      /** @class */
      function(_super) {
        __extends(BNROM2, _super);
        function BNROM2() {
          return _super !== null && _super.apply(this, arguments) || this;
        }
        BNROM2.prototype.resetState = function() {
          this.mapPRGROMBank32K(0, 0);
          this.mapCHRBank8K(0, 0);
        };
        BNROM2.prototype.write = function(address, value) {
          this.mapPRGROMBank32K(0, value);
        };
        return BNROM2;
      }(Mapper_1.default)
    );
    exports2.default = BNROM;
  }
});

// dist/cfxnes-core/memory/mappers/CNROM.js
var require_CNROM = __commonJS({
  "dist/cfxnes-core/memory/mappers/CNROM.js": function(exports2) {
    "use strict";
    var __extends = exports2 && exports2.__extends || /* @__PURE__ */ function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
          d2.__proto__ = b2;
        } || function(d2, b2) {
          for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
        };
        return extendStatics(d, b);
      };
      return function(d, b) {
        if (typeof b !== "function" && b !== null)
          throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    }();
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    var Mapper_1 = __importDefault2(require_Mapper());
    var CNROM = (
      /** @class */
      function(_super) {
        __extends(CNROM2, _super);
        function CNROM2() {
          return _super !== null && _super.apply(this, arguments) || this;
        }
        CNROM2.prototype.resetState = function() {
          this.mapPRGROMBank16K(0, 0);
          this.mapPRGROMBank16K(1, -1);
          this.mapCHRBank8K(0, 0);
        };
        CNROM2.prototype.write = function(address, value) {
          this.mapCHRBank8K(0, value);
        };
        return CNROM2;
      }(Mapper_1.default)
    );
    exports2.default = CNROM;
  }
});

// dist/cfxnes-core/memory/mappers/ColorDreams.js
var require_ColorDreams = __commonJS({
  "dist/cfxnes-core/memory/mappers/ColorDreams.js": function(exports2) {
    "use strict";
    var __extends = exports2 && exports2.__extends || /* @__PURE__ */ function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
          d2.__proto__ = b2;
        } || function(d2, b2) {
          for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
        };
        return extendStatics(d, b);
      };
      return function(d, b) {
        if (typeof b !== "function" && b !== null)
          throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    }();
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    var Mapper_1 = __importDefault2(require_Mapper());
    var ColorDreams = (
      /** @class */
      function(_super) {
        __extends(ColorDreams2, _super);
        function ColorDreams2() {
          return _super !== null && _super.apply(this, arguments) || this;
        }
        ColorDreams2.prototype.resetState = function() {
          this.mapPRGROMBank32K(0, 0);
          this.mapCHRBank8K(0, 0);
        };
        ColorDreams2.prototype.write = function(address, value) {
          this.mapPRGROMBank32K(0, value);
          this.mapCHRBank8K(0, value >>> 4);
        };
        return ColorDreams2;
      }(Mapper_1.default)
    );
    exports2.default = ColorDreams;
  }
});

// dist/cfxnes-core/memory/mappers/MMC1.js
var require_MMC1 = __commonJS({
  "dist/cfxnes-core/memory/mappers/MMC1.js": function(exports2) {
    "use strict";
    var __extends = exports2 && exports2.__extends || /* @__PURE__ */ function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
          d2.__proto__ = b2;
        } || function(d2, b2) {
          for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
        };
        return extendStatics(d, b);
      };
      return function(d, b) {
        if (typeof b !== "function" && b !== null)
          throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    }();
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    var Mapper_1 = __importDefault2(require_Mapper());
    var MMC1 = (
      /** @class */
      function(_super) {
        __extends(MMC12, _super);
        function MMC12(mapper) {
          var _this = _super.call(this, mapper) || this;
          _this.shiftRegister = 0;
          _this.writesCount = 0;
          _this.controlRegister = 0;
          _this.prgBankRegister = 0;
          _this.chrBankRegister1 = 0;
          _this.chrBankRegister2 = 0;
          _this.snrom = (_this.prgROMSize === 131072 || _this.prgROMSize === 262144) && _this.prgRAMSize === 8192 && (_this.chrROMSize === 8192 || _this.chrRAMSize === 8192);
          return _this;
        }
        MMC12.prototype.resetState = function() {
          this.resetShiftRegister();
          this.resetBankRegisters();
          this.synchronizeMapping();
        };
        MMC12.prototype.resetShiftRegister = function() {
          this.shiftRegister = 0;
          this.writesCount = 0;
        };
        MMC12.prototype.resetBankRegisters = function() {
          this.controlRegister = 12;
          this.prgBankRegister = 0;
          this.chrBankRegister1 = 0;
          this.chrBankRegister2 = 0;
        };
        MMC12.prototype.write = function(address, value) {
          if (value & 128) {
            this.resetShiftRegister();
            this.controlRegister |= 12;
          } else {
            this.shiftRegister |= (value & 1) << this.writesCount;
            if (++this.writesCount >= 5) {
              this.copyShiftRegister(address);
              this.resetShiftRegister();
              this.synchronizeMapping();
            }
          }
        };
        MMC12.prototype.copyShiftRegister = function(address) {
          switch (address & 57344) {
            case 32768:
              this.controlRegister = this.shiftRegister;
              break;
            // $8000-$9FFF (100X)
            case 40960:
              this.chrBankRegister1 = this.shiftRegister;
              break;
            // $A000-$BFFF (101X)
            case 49152:
              this.chrBankRegister2 = this.shiftRegister;
              break;
            // $C000-$DFFF (110X)
            case 57344:
              this.prgBankRegister = this.shiftRegister;
              break;
          }
        };
        MMC12.prototype.synchronizeMapping = function() {
          this.switchMirroring();
          this.switchPRGROMBanks();
          this.switchPRGRAMBank();
          this.switchCHRBanks();
        };
        MMC12.prototype.switchMirroring = function() {
          switch (this.controlRegister & 3) {
            case 0:
              this.setSingleScreenMirroring(0);
              break;
            case 1:
              this.setSingleScreenMirroring(1);
              break;
            case 2:
              this.setVerticalMirroring();
              break;
            case 3:
              this.setHorizontalMirroring();
              break;
          }
        };
        MMC12.prototype.switchPRGROMBanks = function() {
          var base = this.chrRAM ? this.chrBankRegister1 & 16 : 0;
          var offset = this.prgBankRegister & 15;
          switch (this.controlRegister & 12) {
            case 12:
              this.mapPRGROMBank16K(0, base | offset);
              this.mapPRGROMBank16K(1, base | 15);
              break;
            case 8:
              this.mapPRGROMBank16K(0, base);
              this.mapPRGROMBank16K(1, base | offset);
              break;
            default:
              this.mapPRGROMBank32K(0, (base | offset) >>> 1);
              break;
          }
        };
        MMC12.prototype.switchPRGRAMBank = function() {
          var enabled = (this.prgBankRegister & 16) === 0;
          var enabledOnSNROM = (this.chrBankRegister1 & 16) === 0;
          var canAccessPRGRAM = enabled && (!this.snrom || enabledOnSNROM);
          this.mapPRGRAMBank8K(0, this.chrRAM ? this.chrBankRegister1 >>> 2 : 0);
          this.canReadPRGRAM = canAccessPRGRAM;
          this.canWritePRGRAM = canAccessPRGRAM;
        };
        MMC12.prototype.switchCHRBanks = function() {
          if (this.controlRegister & 16) {
            this.mapCHRBank4K(0, this.chrBankRegister1);
            this.mapCHRBank4K(1, this.chrBankRegister2);
          } else {
            this.mapCHRBank8K(0, this.chrBankRegister1 >>> 1);
          }
        };
        return MMC12;
      }(Mapper_1.default)
    );
    exports2.default = MMC1;
  }
});

// dist/cfxnes-core/proc/interrupts.js
var require_interrupts = __commonJS({
  "dist/cfxnes-core/proc/interrupts.js": function(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.IRQ = exports2.IRQ_EXT = exports2.IRQ_DMC = exports2.IRQ_APU = exports2.NMI = exports2.RESET = void 0;
    exports2.RESET = 1;
    exports2.NMI = 2;
    exports2.IRQ_APU = 4;
    exports2.IRQ_DMC = 8;
    exports2.IRQ_EXT = 16;
    exports2.IRQ = exports2.IRQ_APU | exports2.IRQ_DMC | exports2.IRQ_EXT;
  }
});

// dist/cfxnes-core/memory/mappers/MMC3.js
var require_MMC3 = __commonJS({
  "dist/cfxnes-core/memory/mappers/MMC3.js": function(exports2) {
    "use strict";
    var __extends = exports2 && exports2.__extends || /* @__PURE__ */ function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
          d2.__proto__ = b2;
        } || function(d2, b2) {
          for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
        };
        return extendStatics(d, b);
      };
      return function(d, b) {
        if (typeof b !== "function" && b !== null)
          throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    }();
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    var common_1 = require_common();
    var interrupts_1 = require_interrupts();
    var Mapper_1 = __importDefault2(require_Mapper());
    var MMC3 = (
      /** @class */
      function(_super) {
        __extends(MMC32, _super);
        function MMC32(mapper) {
          var _this = _super.call(this, mapper) || this;
          _this.bankSelect = 0;
          _this.irqCounter = 0;
          _this.irqLatch = 0;
          _this.irqReload = 0;
          _this.irqEnabled = 0;
          _this.irqDelay = 0;
          _this.alternateMode = false;
          return _this;
        }
        MMC32.prototype.resetState = function() {
          this.resetMapping();
          this.resetRegisters();
        };
        MMC32.prototype.resetMapping = function() {
          this.mapPRGROMBank16K(0, 0);
          this.mapPRGROMBank16K(1, -1);
          this.mapPRGRAMBank8K(0, 0);
          this.mapCHRBank8K(0, 0);
        };
        MMC32.prototype.resetRegisters = function() {
          this.bankSelect = 0;
          this.irqCounter = 0;
          this.irqLatch = 0;
          this.irqReload = 0;
          this.irqEnabled = 0;
          this.irqDelay = 0;
        };
        MMC32.prototype.write = function(address, value) {
          switch (address & 57345) {
            case 32768:
              this.bankSelect = value;
              break;
            // $8000-$9FFE (100X), even address
            case 32769:
              this.writeBankData(value);
              break;
            // $8001-$9FFF (100X), odd  address
            case 40960:
              this.writeMirroring(value);
              break;
            // $A000-$BFFE (101X), even address
            case 40961:
              this.writePRGRAMEnable(value);
              break;
            // $A001-$BFFF (101X), odd  address
            case 49152:
              this.irqLatch = value;
              break;
            // $C000-$DFFE (110X), even address
            case 49153:
              this.writeIRQReload();
              break;
            // $C001-$DFFF (110X), odd  address
            case 57344:
              this.writeIRQEnable(false);
              break;
            // $E000-$FFFE (111X), even address
            case 57345:
              this.writeIRQEnable(true);
              break;
          }
        };
        MMC32.prototype.writeBankData = function(value) {
          switch (this.bankSelect & 7) {
            case 0:
            // Select 2 KB CHR bank at $0000-$07FF (or $1000-$17FF)
            case 1:
              this.switchDoubleCHRROMBanks(value);
              break;
            case 2:
            // Select 1 KB CHR bank at $1000-$13FF (or $0000-$03FF)
            case 3:
            // Select 1 KB CHR bank at $1400-$17FF (or $0400-$07FF)
            case 4:
            // Select 1 KB CHR bank at $1800-$1BFF (or $0800-$0BFF)
            case 5:
              this.switchSingleCHRROMBanks(value);
              break;
            case 6:
              this.switchPRGROMBanks0And2(value);
              break;
            case 7:
              this.switchPRGROMBank1(value);
              break;
          }
        };
        MMC32.prototype.writeMirroring = function(value) {
          if (this.mirroring !== common_1.Mirroring.FOUR_SCREEN) {
            this.switchMirroring(value);
          }
        };
        MMC32.prototype.writePRGRAMEnable = function(value) {
          this.canReadPRGRAM = (value & 128) === 128;
          this.canWritePRGRAM = (value & 192) === 128;
        };
        MMC32.prototype.writeIRQReload = function() {
          if (this.alternateMode) {
            this.irqReload = 1;
          }
          this.irqCounter = 0;
        };
        MMC32.prototype.writeIRQEnable = function(enabled) {
          this.irqEnabled = enabled;
          if (!enabled) {
            this.cpu.clearInterrupt(interrupts_1.IRQ_EXT);
          }
        };
        MMC32.prototype.switchDoubleCHRROMBanks = function(target) {
          var source = (this.bankSelect & 128) >>> 6 | this.bankSelect & 1;
          this.mapCHRBank2K(source, target >>> 1);
        };
        MMC32.prototype.switchSingleCHRROMBanks = function(target) {
          var source = (~this.bankSelect & 128) >>> 5 | this.bankSelect - 2 & 3;
          this.mapCHRBank1K(source, target);
        };
        MMC32.prototype.switchPRGROMBanks0And2 = function(target) {
          var sourceA = (this.bankSelect & 64) >>> 5;
          var sourceB = (~this.bankSelect & 64) >>> 5;
          this.mapPRGROMBank8K(sourceA, target);
          this.mapPRGROMBank8K(sourceB, -2);
        };
        MMC32.prototype.switchPRGROMBank1 = function(target) {
          this.mapPRGROMBank8K(1, target);
        };
        MMC32.prototype.switchMirroring = function(value) {
          if (value & 1) {
            this.setHorizontalMirroring();
          } else {
            this.setVerticalMirroring();
          }
        };
        MMC32.prototype.tick = function() {
          if (this.ppu.addressBus & 4096) {
            if (!this.irqDelay) {
              this.updateIRQCounter();
            }
            this.irqDelay = 7;
          } else if (this.irqDelay) {
            this.irqDelay--;
          }
        };
        MMC32.prototype.updateIRQCounter = function() {
          var irqCounterOld = this.irqCounter;
          if (!this.irqCounter || this.irqReload) {
            this.irqCounter = this.irqLatch;
          } else {
            this.irqCounter--;
          }
          if (this.irqEnabled && !this.irqCounter && (!this.alternateMode || irqCounterOld || this.irqReload)) {
            this.cpu.activateInterrupt(interrupts_1.IRQ_EXT);
          }
          this.irqReload = 0;
        };
        return MMC32;
      }(Mapper_1.default)
    );
    exports2.default = MMC3;
  }
});

// dist/cfxnes-core/memory/mappers/NINA001.js
var require_NINA001 = __commonJS({
  "dist/cfxnes-core/memory/mappers/NINA001.js": function(exports2) {
    "use strict";
    var __extends = exports2 && exports2.__extends || /* @__PURE__ */ function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
          d2.__proto__ = b2;
        } || function(d2, b2) {
          for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
        };
        return extendStatics(d, b);
      };
      return function(d, b) {
        if (typeof b !== "function" && b !== null)
          throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    }();
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    var Mapper_1 = __importDefault2(require_Mapper());
    var NINA001 = (
      /** @class */
      function(_super) {
        __extends(NINA0012, _super);
        function NINA0012(mapper) {
          var _this = _super.call(this, mapper) || this;
          _this.hasPRGRAMRegisters = true;
          return _this;
        }
        NINA0012.prototype.resetState = function() {
          this.mapPRGROMBank32K(0, 0);
          this.mapPRGRAMBank8K(0, 0);
          this.mapCHRBank8K(0, 0);
        };
        NINA0012.prototype.write = function(address, value) {
          switch (address) {
            case 32765:
              this.mapPRGROMBank32K(0, value);
              break;
            // Select 32K PRG ROM bank at $8000
            case 32766:
              this.mapCHRBank4K(0, value);
              break;
            // Select 4K CHR ROM bank at $0000
            case 32767:
              this.mapCHRBank4K(1, value);
              break;
          }
        };
        return NINA0012;
      }(Mapper_1.default)
    );
    exports2.default = NINA001;
  }
});

// dist/cfxnes-core/memory/mappers/NROM.js
var require_NROM = __commonJS({
  "dist/cfxnes-core/memory/mappers/NROM.js": function(exports2) {
    "use strict";
    var __extends = exports2 && exports2.__extends || /* @__PURE__ */ function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
          d2.__proto__ = b2;
        } || function(d2, b2) {
          for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
        };
        return extendStatics(d, b);
      };
      return function(d, b) {
        if (typeof b !== "function" && b !== null)
          throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    }();
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    var Mapper_1 = __importDefault2(require_Mapper());
    var NROM = (
      /** @class */
      function(_super) {
        __extends(NROM2, _super);
        function NROM2() {
          return _super !== null && _super.apply(this, arguments) || this;
        }
        NROM2.prototype.resetState = function() {
          this.mapPRGROMBank16K(0, 0);
          this.mapPRGROMBank16K(1, -1);
          this.mapCHRBank8K(0, 0);
        };
        return NROM2;
      }(Mapper_1.default)
    );
    exports2.default = NROM;
  }
});

// dist/cfxnes-core/memory/mappers/UNROM.js
var require_UNROM = __commonJS({
  "dist/cfxnes-core/memory/mappers/UNROM.js": function(exports2) {
    "use strict";
    var __extends = exports2 && exports2.__extends || /* @__PURE__ */ function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
          d2.__proto__ = b2;
        } || function(d2, b2) {
          for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
        };
        return extendStatics(d, b);
      };
      return function(d, b) {
        if (typeof b !== "function" && b !== null)
          throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    }();
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    var Mapper_1 = __importDefault2(require_Mapper());
    var UNROM = (
      /** @class */
      function(_super) {
        __extends(UNROM2, _super);
        function UNROM2() {
          return _super !== null && _super.apply(this, arguments) || this;
        }
        UNROM2.prototype.resetState = function() {
          this.mapPRGROMBank16K(0, 0);
          this.mapPRGROMBank16K(1, -1);
          this.mapCHRBank8K(0, 0);
        };
        UNROM2.prototype.write = function(address, value) {
          this.mapPRGROMBank16K(0, value);
        };
        return UNROM2;
      }(Mapper_1.default)
    );
    exports2.default = UNROM;
  }
});

// dist/cfxnes-core/memory/mappers/index.js
var require_mappers2 = __commonJS({
  "dist/cfxnes-core/memory/mappers/index.js": function(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    var _a;
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.createMapper = createMapper;
    var common_1 = require_common();
    var AOROM_1 = __importDefault2(require_AOROM());
    var BNROM_1 = __importDefault2(require_BNROM());
    var CNROM_1 = __importDefault2(require_CNROM());
    var ColorDreams_1 = __importDefault2(require_ColorDreams());
    var MMC1_1 = __importDefault2(require_MMC1());
    var MMC3_1 = __importDefault2(require_MMC3());
    var NINA001_1 = __importDefault2(require_NINA001());
    var NROM_1 = __importDefault2(require_NROM());
    var UNROM_1 = __importDefault2(require_UNROM());
    var mappers = (_a = {}, _a[common_1.Mapper.AOROM] = AOROM_1.default, _a[common_1.Mapper.BNROM] = BNROM_1.default, _a[common_1.Mapper.CNROM] = CNROM_1.default, _a[common_1.Mapper.COLOR_DREAMS] = ColorDreams_1.default, _a[common_1.Mapper.MMC1] = MMC1_1.default, _a[common_1.Mapper.MMC3] = MMC3_1.default, _a[common_1.Mapper.NINA_001] = NINA001_1.default, _a[common_1.Mapper.NROM] = NROM_1.default, _a[common_1.Mapper.UNROM] = UNROM_1.default, _a);
    function createMapper(cartridge) {
      var name = cartridge.mapper;
      var Mapper = mappers[name];
      if (Mapper) {
        common_1.log.info('Creating "'.concat(name, '" mapper'));
        return new Mapper(cartridge);
      }
      throw new Error("Invalid mapper: " + (0, common_1.describe)(name));
    }
  }
});

// dist/cfxnes-core/memory/index.js
var require_memory = __commonJS({
  "dist/cfxnes-core/memory/index.js": function(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.createMapper = exports2.DMA = exports2.PPUMemory = exports2.CPUMemory = void 0;
    var CPUMemory_1 = require_CPUMemory();
    Object.defineProperty(exports2, "CPUMemory", { enumerable: true, get: function() {
      return __importDefault2(CPUMemory_1).default;
    } });
    var PPUMemory_1 = require_PPUMemory();
    Object.defineProperty(exports2, "PPUMemory", { enumerable: true, get: function() {
      return __importDefault2(PPUMemory_1).default;
    } });
    var DMA_1 = require_DMA();
    Object.defineProperty(exports2, "DMA", { enumerable: true, get: function() {
      return __importDefault2(DMA_1).default;
    } });
    var mappers_1 = require_mappers2();
    Object.defineProperty(exports2, "createMapper", { enumerable: true, get: function() {
      return mappers_1.createMapper;
    } });
  }
});

// dist/cfxnes-core/video/constants.js
var require_constants = __commonJS({
  "dist/cfxnes-core/video/constants.js": function(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.VIDEO_HEIGHT = exports2.VIDEO_WIDTH = void 0;
    exports2.VIDEO_WIDTH = 256;
    exports2.VIDEO_HEIGHT = 240;
  }
});

// dist/cfxnes-core/video/colors.js
var require_colors = __commonJS({
  "dist/cfxnes-core/video/colors.js": function(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.BLACK_COLOR = void 0;
    exports2.packColor = packColor;
    exports2.unpackColor = unpackColor;
    var common_1 = require_common();
    var le = (0, common_1.detectEndianness)() === "LE";
    exports2.BLACK_COLOR = packColor(0, 0, 0);
    function packColor(r, g, b, a) {
      if (a === void 0) {
        a = 255;
      }
      return (r & 248) << 8 | (g & 252) << 3 | b >> 3;
    }
    function unpackColor(c) {
      return [
        (c >> 11 & 31) << 3,
        // Extract 5-bit red, scale to 8-bit
        (c >> 5 & 63) << 2,
        // Extract 6-bit green, scale to 8-bit
        (c & 31) << 3
        // Extract 5-bit blue, scale to 8-bit
      ];
    }
  }
});

// dist/cfxnes-core/video/palettes/asq_real_a.js
var require_asq_real_a = __commonJS({
  "dist/cfxnes-core/video/palettes/asq_real_a.js": function(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.default = "YGBgACF7AACcMQCLWQBvbwAxZAAATxEALxkAJykAAEQAADk3ADlPAAAADAwMDAwMrq6uEFbOGyz/YCDsqQC/yhZUyhoInjoEZ1EAQ2EAAHwAAHFTAHGHDAwMDAwMDAwM////RJ7+XGz/mWb/12D//2KV/2RT9JQwwqwAkMQUUtIoIMaSGLrSTExMDAwMDAwM////o8z/pLT/wbb/4Lf//8DF/7yr/9Cf/OCQ4uqYyvKgoOrioOL6tra2DAwMDAwM";
  }
});

// dist/cfxnes-core/video/palettes/asq_real_b.js
var require_asq_real_b = __commonJS({
  "dist/cfxnes-core/video/palettes/asq_real_b.js": function(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.default = "bGxsACCUAACoPACYcABwfAA8cAAAaBAARhoAPCwAAFAAADxMADpmAAAAEBAQEBAQurq6KljWPDL/gCDwwADA0BR00hokpjweflIAWGQAAIgAAHRoAHKeEBAQEBAQEBAQ////XqD/jIL/xHD//1z//2i8/3J8/JZK2a0AmMYuTtROOsiaLr7cWFhYEBAQEBAQ////xtj/1Mr/8MT//7z//8Tw/8rU/9i+/+am6uyyxvTGuuzqtub/wsLCEBAQEBAQ";
  }
});

// dist/cfxnes-core/video/palettes/bmf_fin_r2.js
var require_bmf_fin_r2 = __commonJS({
  "dist/cfxnes-core/video/palettes/bmf_fin_r2.js": function(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.default = "UlJSAACACACKLAB+SgBOUAAGRAAAJggACiAAAC4AADIAACYKABxIAAAAAAAAAAAApKSkADjONBbsXgTcjACwmgBMkBgAcDYATFQADmwAAHQAAGwsAF6EAAAAAAAAAAAA////TJz/fHj/pmT/2lr/8FTA8GpW1oYQuqQAdsAARswaLshmNMK+Ojo6AAAAAAAA////ttr/yMr/2sL/8L7//Lzu+sLA8syi5tqSzOaOuO6iruq+rujisLCwAAAAAAAA";
  }
});

// dist/cfxnes-core/video/palettes/bmf_fin_r3.js
var require_bmf_fin_r3 = __commonJS({
  "dist/cfxnes-core/video/palettes/bmf_fin_r3.js": function(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.default = "aGhoABKZGgiqUQKafgBpjgAcfgMBURgAHzcAAU4AAFoAAFAcAEBhAAAAAAAAAAAAubm5DFzXUDXwiRnguwyzzgxhwCsOlU0BYW8AH4sAAZgMAJNLAIGbAAAAAAAAAAAA////Y7T/m5H/03f/72r/+WjA+X1s7Zstvb0WfNocS+hHNeWRP9ndYGBgAAAAAAAA////rOf/1c3/7br/+LD//rDs/b21+dKO6Ot8u/OCmfeiivXQkvTxvr6+AAAAAAAA";
  }
});

// dist/cfxnes-core/video/palettes/fceu_13.js
var require_fceu_13 = __commonJS({
  "dist/cfxnes-core/video/palettes/fceu_13.js": function(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.default = "YGBgAAB4FACALABuSgBObAAYWgMCURgANCQAADQAADIAADQgACx4AAAAAgICAgICxMTEAFjeMB/8fxTgqACwwAZcwCsOpkAQb2EAMIAAAHwAAHw8AG6EFBQUBAQEBAQE8PDwTKr/b3P1sHD/2lr/8GDA+INt0JAw1MAwZtAAJt0aLshmNMK+VFRUBgYGBgYG////ttr/yMr/2sL/8L7//Lzu/9C0/9qQ7OyS3PaeuP+iruq+nu/vvr6+CAgICAgI";
  }
});

// dist/cfxnes-core/video/palettes/fceu_15.js
var require_fceu_15 = __commonJS({
  "dist/cfxnes-core/video/palettes/fceu_15.js": function(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.default = "YGBgAABwFACALABuSgBObAAYWgMCURgANCQAADQAADIAADQgACx4AAAAAgICAgICxMTEAFjeMB/8fxTgqACwwAZcwCsOpkAQb2EAMIAAAHwAAHw8AG6EFBQUBAQEBAQE8PDwTKr/b3P1sHD/2lr/8GDA+INt0JAw1MAwZtAAJt0aLshmNMK+VFRUBgYGBgYG////ttr/yMr/2sL/8L7//Lzu/9C0/9qQ7OyS3PaeuP+iruq+nu/vvr6+CAgICAgI";
  }
});

// dist/cfxnes-core/video/palettes/fceux.js
var require_fceux = __commonJS({
  "dist/cfxnes-core/video/palettes/fceux.js": function(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.default = "dHR0JBiMAACoRACcjAB0qAAQpAAAfAgAQCwAAEQAAFAAADwUGDxcAAAAAAAAAAAAvLy8AHDsIDjsgADwvAC85ABY2CgAyEwMiHAAAJQAAKgAAJA4AICIAAAAAAAAAAAA/Pz8PLz8XJT8zIj89Hj8/HS0/HRg/Jg48Lw8gNAQTNxIWPiYAOjYeHh4AAAAAAAA/Pz8qOT8xNT81Mj8/MT8/MTY/Lyw/Nio/OSg4PygqPC8sPzMnPzwxMTEAAAAAAAA";
  }
});

// dist/cfxnes-core/video/palettes/nestopia_rgb.js
var require_nestopia_rgb = __commonJS({
  "dist/cfxnes-core/video/palettes/nestopia_rgb.js": function(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.default = "bW1tACSSAADbbUnbkgBttgBttiQAkkkAbUkAJEkAAG0kAJIAAElJAAAAAAAAAAAAtra2AG3bAEn/kgD/tgD//wCS/wAA220Akm0AJJIAAJIAALZtAJKSJCQkAAAAAAAA////bbb/kpL/223//wD//23//5IA/7YA29sAbdsAAP8ASf/bAP//SUlJAAAAAAAA////ttv/27b//7b//5L//7a2/9uS//9J//9ttv9Jkv9tSf/bktv/kpKSAAAAAAAA";
  }
});

// dist/cfxnes-core/video/palettes/nestopia_yuv.js
var require_nestopia_yuv = __commonJS({
  "dist/cfxnes-core/video/palettes/nestopia_yuv.js": function(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.default = "ZmZmACqIFBKnOwCkXAB+bgBAbAcAVh0AMzUADEgAAFIAAE8IAEBNAAAAAAAAAAAAra2tFV/ZQkD/dSf+oBrMtx57tTEgmU4Aa20AOIcADZMAAI8yAHyNAAAAAAAAAAAA////ZLD/kpD/xnb/8mr//27M/4Fw6p4ivL4AiNgAXOQwReCCSM3eT09PAAAAAAAA////wN//09L/6Mj/+sL//8Tq/8zF99il5OWUz++WvfSrs/PMtevyuLi4AAAAAAAA";
  }
});

// dist/cfxnes-core/video/palettes/sony_cxa2025as.js
var require_sony_cxa2025as = __commonJS({
  "dist/cfxnes-core/video/palettes/sony_cxa2025as.js": function(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.default = "WFhYACOMABObLQWFXQBSegAXeggAXxgANSoACTkAAD8AADwiADJdAAAAAAAAAAAAoaGhAFPuFTz+YCjkqR2Y1B5B0iwAqkQAbF4ALXMAAH0GAHhSAGmpAAAAAAAAAAAA////H6X+Xon+tXL+/mX2/meQ/nc8/pMIxLIAecoQOtVKEdGkBr/+QkJCAAAAAAAA////oNn+vcz+4cL+/rz7/r3Q/sWp/tGO6d6Gx+mSqO6wlezZkeT+rKysAAAAAAAA";
  }
});

// dist/cfxnes-core/video/palettes/unsaturated_v6.js
var require_unsaturated_v6 = __commonJS({
  "dist/cfxnes-core/video/palettes/unsaturated_v6.js": function(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.default = "a2trAB6HHwuWOwyHWQ1hXgUoVREARhsAMDIACkgAAE4AAEYZADpYAAAAAAAAAAAAsrKyGlPRSDXucSPsmh63pR5ipS0Zh0sAZ2kAKYQAA4sAAIJAAHiRAAAAAAAAAAAA////Y639kIr+uXf853H+92/J9YNq3ZwpvbgHhNEHW9w7SNd9SMzOVVVVAAAAAAAA////xOP+19X+5s3++cr+/snw/tHH99ys6Oic0fKdv/Sxt/XNt/Duvr6+AAAAAAAA";
  }
});

// dist/cfxnes-core/video/palettes/index.js
var require_palettes = __commonJS({
  "dist/cfxnes-core/video/palettes/index.js": function(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DEFAULT_PALETTE = void 0;
    exports2.isPaletteName = isPaletteName;
    exports2.createPalette = createPalette;
    exports2.createPaletteVariant = createPaletteVariant;
    var common_1 = require_common();
    var colors_1 = require_colors();
    var asq_real_a_1 = __importDefault2(require_asq_real_a());
    var asq_real_b_1 = __importDefault2(require_asq_real_b());
    var bmf_fin_r2_1 = __importDefault2(require_bmf_fin_r2());
    var bmf_fin_r3_1 = __importDefault2(require_bmf_fin_r3());
    var fceu_13_1 = __importDefault2(require_fceu_13());
    var fceu_15_1 = __importDefault2(require_fceu_15());
    var fceux_1 = __importDefault2(require_fceux());
    var nestopia_rgb_1 = __importDefault2(require_nestopia_rgb());
    var nestopia_yuv_1 = __importDefault2(require_nestopia_yuv());
    var sony_cxa2025as_1 = __importDefault2(require_sony_cxa2025as());
    var unsaturated_v6_1 = __importDefault2(require_unsaturated_v6());
    var PALETTE_LENGTH = 64;
    var palettes = {
      "asq-real-a": asq_real_a_1.default,
      "asq-real-b": asq_real_b_1.default,
      "bmf-fin-r2": bmf_fin_r2_1.default,
      "bmf-fin-r3": bmf_fin_r3_1.default,
      "fceu-13": fceu_13_1.default,
      "fceu-15": fceu_15_1.default,
      "fceux": fceux_1.default,
      "nestopia-rgb": nestopia_rgb_1.default,
      "nestopia-yuv": nestopia_yuv_1.default,
      "sony-cxa2025as": sony_cxa2025as_1.default,
      "unsaturated-v6": unsaturated_v6_1.default
    };
    exports2.DEFAULT_PALETTE = "fceux";
    function isPaletteName(name) {
      return name in palettes;
    }
    function createPalette(name) {
      if (name === void 0) {
        name = exports2.DEFAULT_PALETTE;
      }
      var base64 = palettes[name];
      if (base64) {
        common_1.log.info('Creating "'.concat(name, '" palette'));
        return decodePalette(base64);
      }
      throw new Error("Invalid palette: " + (0, common_1.describe)(name));
    }
    function decodePalette(base64) {
      var data = (0, common_1.decodeBase64)(base64);
      if (data.length !== PALETTE_LENGTH * 3) {
        throw new Error("Palette data does not contain ".concat(PALETTE_LENGTH, " entries"));
      }
      var palette = new Uint32Array(PALETTE_LENGTH);
      for (var i = 0; i < PALETTE_LENGTH; i++) {
        var pos = 3 * i;
        var r = data[pos];
        var g = data[pos + 1];
        var b = data[pos + 2];
        palette[i] = (0, colors_1.packColor)(r, g, b);
      }
      return palette;
    }
    function createPaletteVariant(palette, rRatio, gRatio, bRatio) {
      common_1.log.info("Creating palette variant (".concat(rRatio, ", ").concat(gRatio, ", ").concat(bRatio, ")"));
      var paletteVariant = new Uint32Array(PALETTE_LENGTH);
      for (var i = 0; i < PALETTE_LENGTH; i++) {
        var _a = (0, colors_1.unpackColor)(palette[i]), r = _a[0], g = _a[1], b = _a[2];
        r = Math.floor(rRatio * r);
        g = Math.floor(gRatio * g);
        b = Math.floor(bRatio * b);
        paletteVariant[i] = (0, colors_1.packColor)(r, g, b);
      }
      return paletteVariant;
    }
  }
});

// dist/cfxnes-core/video/flags.js
var require_flags = __commonJS({
  "dist/cfxnes-core/video/flags.js": function(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.cycles = exports2.scanlines = exports2.SKIP = exports2.VB_END = exports2.VB_START2 = exports2.VB_START = exports2.COPY_VS = exports2.COPY_HS = exports2.INC_FY = exports2.INC_CX = exports2.CLIP_TB = exports2.CLIP_LEFT = exports2.EVAL_SP = exports2.SHIFT_BG = exports2.COPY_BG = exports2.FETCH_SPH = exports2.FETCH_SPL = exports2.FETCH_BGH = exports2.FETCH_BGL = exports2.FETCH_AT = exports2.FETCH_NT = exports2.RENDER = void 0;
    exports2.compute = compute;
    exports2.RENDER = 1 << 1;
    exports2.FETCH_NT = 1 << 2;
    exports2.FETCH_AT = 1 << 3;
    exports2.FETCH_BGL = 1 << 4;
    exports2.FETCH_BGH = 1 << 5;
    exports2.FETCH_SPL = 1 << 6;
    exports2.FETCH_SPH = 1 << 7;
    exports2.COPY_BG = 1 << 8;
    exports2.SHIFT_BG = 1 << 9;
    exports2.EVAL_SP = 1 << 10;
    exports2.CLIP_LEFT = 1 << 11;
    exports2.CLIP_TB = 1 << 12;
    exports2.INC_CX = 1 << 13;
    exports2.INC_FY = 1 << 14;
    exports2.COPY_HS = 1 << 15;
    exports2.COPY_VS = 1 << 16;
    exports2.VB_START = 1 << 17;
    exports2.VB_START2 = 1 << 18;
    exports2.VB_END = 1 << 19;
    exports2.SKIP = 1 << 20;
    exports2.scanlines = new Uint32Array(262);
    for (i = 0; i < exports2.scanlines.length; i++) {
      if (i <= 239) {
        exports2.scanlines[i] |= exports2.RENDER;
        exports2.scanlines[i] |= exports2.SHIFT_BG;
        exports2.scanlines[i] |= exports2.CLIP_LEFT;
        exports2.scanlines[i] |= exports2.EVAL_SP;
      }
      if (i <= 239 || i === 261) {
        exports2.scanlines[i] |= exports2.FETCH_NT;
        exports2.scanlines[i] |= exports2.FETCH_AT;
        exports2.scanlines[i] |= exports2.FETCH_BGL;
        exports2.scanlines[i] |= exports2.FETCH_BGH;
        exports2.scanlines[i] |= exports2.FETCH_SPL;
        exports2.scanlines[i] |= exports2.FETCH_SPH;
        exports2.scanlines[i] |= exports2.COPY_BG;
        exports2.scanlines[i] |= exports2.INC_CX;
        exports2.scanlines[i] |= exports2.INC_FY;
        exports2.scanlines[i] |= exports2.COPY_HS;
      }
      if (i <= 7 || i >= 232 && i <= 239) {
        exports2.scanlines[i] |= exports2.CLIP_TB;
      }
    }
    var i;
    exports2.scanlines[241] |= exports2.VB_START;
    exports2.scanlines[241] |= exports2.VB_START2;
    exports2.scanlines[261] |= exports2.COPY_VS;
    exports2.scanlines[261] |= exports2.VB_END;
    exports2.scanlines[261] |= exports2.SKIP;
    exports2.cycles = new Uint32Array(341);
    for (i = 0; i < exports2.cycles.length; i++) {
      if (i >= 1 && i <= 256) {
        exports2.cycles[i] |= exports2.RENDER;
        exports2.cycles[i] |= exports2.CLIP_TB;
      }
      if ((i & 7) === 1 || i === 339) {
        exports2.cycles[i] |= exports2.FETCH_NT;
      }
      if ((i & 7) === 3 && i !== 339) {
        exports2.cycles[i] |= exports2.FETCH_AT;
      }
      if ((i & 7) === 5) {
        exports2.cycles[i] |= i <= 256 || i >= 321 ? exports2.FETCH_BGL : exports2.FETCH_SPL;
      }
      if ((i & 7) === 7) {
        exports2.cycles[i] |= i <= 256 || i >= 321 ? exports2.FETCH_BGH : exports2.FETCH_SPH;
      }
      if ((i & 7) === 0 && i >= 8 && i <= 256 || i === 328 || i === 336) {
        exports2.cycles[i] |= exports2.INC_CX;
      }
      if ((i & 7) === 1 && i >= 9 && i <= 257 || i === 329 || i === 337) {
        exports2.cycles[i] |= exports2.COPY_BG;
      }
      if (i >= 1 && i <= 256 || i >= 321 && i <= 336) {
        exports2.cycles[i] |= exports2.SHIFT_BG;
      }
      if (i >= 280 && i <= 304) {
        exports2.cycles[i] |= exports2.COPY_VS;
      }
      if (i >= 1 && i <= 8) {
        exports2.cycles[i] |= exports2.CLIP_LEFT;
      }
      if (i >= 1 && i <= 3) {
        exports2.cycles[i] |= exports2.VB_START2;
      }
    }
    var i;
    exports2.cycles[1] |= exports2.VB_START;
    exports2.cycles[1] |= exports2.VB_END;
    exports2.cycles[65] |= exports2.EVAL_SP;
    exports2.cycles[256] |= exports2.INC_FY;
    exports2.cycles[257] |= exports2.COPY_HS;
    exports2.cycles[338] |= exports2.SKIP;
    function compute(scanline, cycle) {
      return exports2.scanlines[scanline] & exports2.cycles[cycle];
    }
  }
});

// dist/cfxnes-core/video/Sprite.js
var require_Sprite = __commonJS({
  "dist/cfxnes-core/video/Sprite.js": function(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var Sprite = (
      /** @class */
      /* @__PURE__ */ function() {
        function Sprite2() {
          this.x = 0;
          this.zeroSprite = false;
          this.horizontalFlip = false;
          this.paletteNumber = 0;
          this.inFront = false;
          this.patternRowAddress = 0;
          this.patternRow0 = 0;
          this.patternRow1 = 0;
        }
        return Sprite2;
      }()
    );
    exports2.default = Sprite;
  }
});

// dist/cfxnes-core/video/PPU.js
var require_PPU = __commonJS({
  "dist/cfxnes-core/video/PPU.js": function(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || /* @__PURE__ */ function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    }();
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    var common_1 = require_common();
    var interrupts_1 = require_interrupts();
    var constants_1 = require_constants();
    var colors_1 = require_colors();
    var palettes_1 = require_palettes();
    var Flag = __importStar(require_flags());
    var Sprite_1 = __importDefault2(require_Sprite());
    var quickPallette = new Uint32Array([29614, 8401, 21, 16403, 34830, 43010, 40960, 30784, 16736, 544, 640, 482, 6635, 0, 0, 0, 48631, 925, 8669, 32798, 47127, 57355, 55616, 51809, 35712, 1184, 1344, 1159, 1041, 0, 0, 0, 65535, 15871, 23743, 52319, 62431, 64438, 64428, 64711, 62951, 34434, 20201, 24531, 1883, 31695, 0, 0, 65535, 44863, 50879, 54879, 65087, 65083, 65014, 65237, 65332, 59380, 44951, 47097, 40958, 50744, 0, 0]);
    var PPU = (
      /** @class */
      function() {
        function PPU2() {
          common_1.log.info("Initializing PPU");
          this.scanline = 261;
          this.cycle = 0;
          this.cycleFlags = 0;
          this.oddFrame = false;
          this.addressBus = 0;
          this.clipTopBottom = false;
          this.vblankActive = false;
          this.vblankSuppressed = false;
          this.nmiSuppressed = false;
          this.nmiDelay = 0;
          this.frameBuffer = null;
          this.frameAvailable = false;
          this.framePosition = 0;
          this.basePalette = null;
          this.paletteVariants = new Array(8);
          this.palette = null;
          this.spriteCount = 0;
          this.spriteNumber = 0;
          this.spriteCache = new Array(261);
          this.spritePixelCache = new Uint8Array(261);
          this.primaryOAM = new Uint8Array(256);
          this.secondaryOAM = new Array(8);
          this.oamAddress = 0;
          this.tempAddress = 0;
          this.vramAddress = 0;
          this.vramReadBuffer = 0;
          this.writeToggle = false;
          this.fineXScroll = 0;
          this.patternBuffer0 = 0;
          this.patternBuffer1 = 0;
          this.paletteBuffer0 = 0;
          this.paletteBuffer1 = 0;
          this.paletteLatch0 = 0;
          this.paletteLatch1 = 0;
          this.patternBufferNext0 = 0;
          this.patternBufferNext1 = 0;
          this.paletteLatchNext0 = 0;
          this.paletteLatchNext1 = 0;
          this.patternRowAddress = 0;
          this.bigAddressIncrement = 0;
          this.spPatternTableAddress = 0;
          this.bgPatternTableAddress = 0;
          this.bigSprites = 0;
          this.nmiEnabled = 0;
          this.monochromeMode = 0;
          this.backgroundClipping = 0;
          this.spriteClipping = 0;
          this.backgroundVisible = 0;
          this.spritesVisible = 0;
          this.colorEmphasis = 0;
          this.spriteOverflow = 0;
          this.spriteZeroHit = 0;
          this.vblankFlag = 0;
          this.cpu = null;
          this.ppuMemory = null;
        }
        PPU2.prototype.connect = function(nes) {
          common_1.log.info("Connecting PPU");
          this.cpu = nes.cpu;
          this.ppuMemory = nes.ppuMemory;
        };
        PPU2.prototype.reset = function() {
          common_1.log.info("Resetting PPU");
          this.resetOAM();
          this.resetRegisters();
          this.resetState();
        };
        PPU2.prototype.resetOAM = function() {
          this.primaryOAM.fill(0);
          for (var i = 0; i < this.secondaryOAM.length; i++) {
            this.secondaryOAM[i] = new Sprite_1.default();
          }
        };
        PPU2.prototype.resetRegisters = function() {
          this.setControl(0);
          this.setMask(0);
          this.setStatus(0);
          this.oamAddress = 0;
          this.tempAddress = 0;
          this.vramAddress = 0;
          this.vramReadBuffer = 0;
          this.writeToggle = false;
          this.fineXScroll = 0;
          this.patternBuffer0 = 0;
          this.patternBuffer1 = 0;
          this.paletteBuffer0 = 0;
          this.paletteBuffer1 = 0;
          this.paletteLatch0 = 0;
          this.paletteLatch1 = 0;
          this.patternBufferNext0 = 0;
          this.patternBufferNext1 = 0;
          this.paletteLatchNext0 = 0;
          this.paletteLatchNext1 = 0;
        };
        PPU2.prototype.resetState = function() {
          this.scanline = 261;
          this.cycle = 0;
          this.cycleFlags = 0;
          this.vblankSuppressed = false;
          this.nmiSuppressed = false;
          this.nmiDelay = 0;
          this.oddFrame = false;
          this.spriteCount = 0;
          this.spriteNumber = 0;
          this.clearSprites();
        };
        PPU2.prototype.setRegionParams = function(params) {
          common_1.log.info("Setting PPU region parameters");
          this.clipTopBottom = params.ppuClipTopBottom;
        };
        PPU2.prototype.setBasePalette = function(basePalette) {
          common_1.log.info("Setting PPU base palette");
          this.basePalette = basePalette;
          this.createPaletteVariants();
          this.updatePalette();
        };
        PPU2.prototype.getBasePalette = function() {
          return this.basePalette;
        };
        PPU2.prototype.createPaletteVariants = function() {
          for (var colorEmphasis = 0; colorEmphasis < this.paletteVariants.length; colorEmphasis++) {
            var rRatio = colorEmphasis & 6 ? 0.75 : 1;
            var gRatio = colorEmphasis & 5 ? 0.75 : 1;
            var bRatio = colorEmphasis & 3 ? 0.75 : 1;
            this.paletteVariants[colorEmphasis] = (0, palettes_1.createPaletteVariant)(this.basePalette, rRatio, gRatio, bRatio);
          }
        };
        PPU2.prototype.updatePalette = function() {
          this.palette = this.paletteVariants[this.colorEmphasis];
        };
        PPU2.prototype.writeControl = function(value) {
          var nmiEnabledOld = this.nmiEnabled;
          this.setControl(value);
          this.tempAddress = this.tempAddress & 62463 | (value & 3) << 10;
          if (this.vblankFlag && !nmiEnabledOld && this.nmiEnabled && !(this.cycleFlags & Flag.VB_END)) {
            this.nmiDelay = 1;
          }
        };
        PPU2.prototype.setControl = function(value) {
          this.bigAddressIncrement = value >>> 2 & 1;
          this.spPatternTableAddress = value << 9 & 4096;
          this.bgPatternTableAddress = value << 8 & 4096;
          this.bigSprites = value >>> 5 & 1;
          this.nmiEnabled = value >>> 7;
        };
        PPU2.prototype.writeMask = function(value) {
          this.setMask(value);
          this.updatePalette();
        };
        PPU2.prototype.setMask = function(value) {
          this.monochromeMode = value & 1;
          this.backgroundClipping = ~value >>> 1 & 1;
          this.spriteClipping = ~value >>> 2 & 1;
          this.backgroundVisible = value >>> 3 & 1;
          this.spritesVisible = value >>> 4 & 1;
          this.colorEmphasis = value >>> 5 & 7;
        };
        PPU2.prototype.readStatus = function() {
          var value = this.getStatus();
          this.vblankFlag = 0;
          this.writeToggle = false;
          if (this.cycleFlags & Flag.VB_START) {
            this.vblankSuppressed = true;
          }
          if (this.cycleFlags & Flag.VB_START2) {
            this.nmiSuppressed = true;
          }
          return value;
        };
        PPU2.prototype.getStatus = function() {
          return this.spriteOverflow << 5 | this.spriteZeroHit << 6 | this.vblankFlag << 7;
        };
        PPU2.prototype.setStatus = function(value) {
          this.spriteOverflow = value >>> 5 & 1;
          this.spriteZeroHit = value >>> 6 & 1;
          this.vblankFlag = value >>> 7;
        };
        PPU2.prototype.writeOAMAddress = function(address) {
          this.oamAddress = address;
        };
        PPU2.prototype.readOAMData = function() {
          var value = this.primaryOAM[this.oamAddress];
          if ((this.oamAddress & 3) === 2) {
            value &= 227;
          }
          return value;
        };
        PPU2.prototype.writeOAMData = function(value) {
          if (!this.isRenderingActive()) {
            this.primaryOAM[this.oamAddress] = value;
          }
          this.oamAddress = this.oamAddress + 1 & 255;
        };
        PPU2.prototype.writeAddress = function(address) {
          this.writeToggle = !this.writeToggle;
          if (this.writeToggle) {
            var addressHigh = (address & 63) << 8;
            this.tempAddress = this.tempAddress & 255 | addressHigh;
          } else {
            var addressLow = address;
            this.tempAddress = this.tempAddress & 65280 | addressLow;
            this.vramAddress = this.tempAddress;
          }
        };
        PPU2.prototype.readData = function() {
          if ((this.vramAddress & 16128) === 16128) {
            var value_1 = this.ppuMemory.read(this.vramAddress);
            this.vramReadBuffer = this.ppuMemory.read(this.vramAddress & 12287);
            this.incrementAddress();
            return value_1;
          }
          var value = this.vramReadBuffer;
          this.vramReadBuffer = this.ppuMemory.read(this.vramAddress);
          this.incrementAddress();
          return value;
        };
        PPU2.prototype.writeData = function(value) {
          if (!this.isRenderingActive()) {
            this.ppuMemory.write(this.vramAddress, value);
          }
          this.incrementAddress();
        };
        PPU2.prototype.incrementAddress = function() {
          var increment = this.bigAddressIncrement ? 32 : 1;
          this.vramAddress = this.vramAddress + increment & 65535;
        };
        PPU2.prototype.writeScroll = function(value) {
          this.writeToggle = !this.writeToggle;
          if (this.writeToggle) {
            this.fineXScroll = value & 7;
            var coarseXScroll = value >>> 3;
            this.tempAddress = this.tempAddress & 65504 | coarseXScroll;
          } else {
            var fineYScroll = (value & 7) << 12;
            var coarseYScroll = (value & 248) << 2;
            this.tempAddress = this.tempAddress & 3103 | coarseYScroll | fineYScroll;
          }
        };
        PPU2.prototype.updateScrolling = function() {
          if (this.cycleFlags & Flag.INC_CX) {
            this.incrementCoarseXScroll();
          }
          if (this.cycleFlags & Flag.INC_FY) {
            this.incrementFineYScroll();
          }
          if (this.cycleFlags & Flag.COPY_HS) {
            this.copyHorizontalScrollBits();
          }
          if (this.cycleFlags & Flag.COPY_VS) {
            this.copyVerticalScrollBits();
          }
        };
        PPU2.prototype.copyHorizontalScrollBits = function() {
          this.vramAddress = this.vramAddress & 31712 | this.tempAddress & 1055;
        };
        PPU2.prototype.copyVerticalScrollBits = function() {
          this.vramAddress = this.vramAddress & 1055 | this.tempAddress & 31712;
        };
        PPU2.prototype.incrementCoarseXScroll = function() {
          if ((this.vramAddress & 31) === 31) {
            this.vramAddress &= 65504;
            this.vramAddress ^= 1024;
          } else {
            this.vramAddress += 1;
          }
        };
        PPU2.prototype.incrementFineYScroll = function() {
          if ((this.vramAddress & 28672) === 28672) {
            this.vramAddress &= 4095;
            this.incrementCoarseYScroll();
          } else {
            this.vramAddress += 4096;
          }
        };
        PPU2.prototype.incrementCoarseYScroll = function() {
          if ((this.vramAddress & 992) === 992) {
            this.vramAddress &= 64543;
          } else if ((this.vramAddress & 992) === 928) {
            this.vramAddress &= 64543;
            this.vramAddress ^= 2048;
          } else {
            this.vramAddress += 32;
          }
        };
        PPU2.prototype.setFrameBuffer = function(buffer) {
          this.frameBuffer = buffer;
          this.framePosition = 0;
          this.frameAvailable = false;
        };
        PPU2.prototype.resetFrameBuffer = function() {
          this.framePosition = 0;
          this.frameAvailable = false;
        };
        PPU2.prototype.isFrameAvailable = function() {
          return this.frameAvailable;
        };
        PPU2.prototype.setFramePixel = function(color) {
          var x = this.framePosition % constants_1.VIDEO_WIDTH;
          var y = this.framePosition / constants_1.VIDEO_WIDTH | 0;
          this.frameBuffer[x + y * constants_1.VIDEO_WIDTH] = color;
          this.framePosition++;
        };
        PPU2.prototype.setFramePixelOnPosition = function(x, y, color) {
          this.frameBuffer[x + y * constants_1.VIDEO_WIDTH] = color;
        };
        PPU2.prototype.clearFramePixel = function() {
          var x = this.framePosition % constants_1.VIDEO_WIDTH;
          var y = this.framePosition / constants_1.VIDEO_WIDTH | 0;
          this.frameBuffer[x + y * constants_1.VIDEO_WIDTH] = colors_1.BLACK_COLOR;
          this.framePosition++;
        };
        PPU2.prototype.updateVBlank = function() {
          if (this.nmiDelay) {
            if (!this.nmiEnabled) {
              this.nmiDelay = 0;
            } else if (!--this.nmiDelay && !this.nmiSuppressed) {
              this.cpu.activeInterrupts |= interrupts_1.NMI;
            }
          }
          if (this.cycleFlags & Flag.VB_START) {
            if (!this.vblankSuppressed) {
              this.vblankFlag = 1;
            }
            this.vblankActive = true;
            this.frameAvailable = true;
            this.nmiDelay = 2;
          } else if (this.cycleFlags & Flag.VB_END) {
            this.vblankActive = false;
            this.vblankFlag = 0;
            this.vblankSuppressed = false;
            this.nmiSuppressed = false;
            this.spriteZeroHit = 0;
            this.spriteOverflow = 0;
          }
        };
        PPU2.prototype.enterVBlank = function() {
          if (!this.vblankSuppressed) {
            this.vblankFlag = 1;
          }
          this.vblankActive = true;
          this.frameAvailable = true;
          this.nmiDelay = 2;
        };
        PPU2.prototype.leaveVBlank = function() {
          this.vblankActive = false;
          this.vblankFlag = 0;
          this.vblankSuppressed = false;
          this.nmiSuppressed = false;
          this.spriteZeroHit = 0;
          this.spriteOverflow = 0;
        };
        PPU2.prototype.incrementCycle = function() {
          if (this.cycleFlags & Flag.SKIP && this.oddFrame && (this.spritesVisible || this.backgroundVisible)) {
            this.cycle++;
          }
          this.cycle++;
          if (this.cycle > 340) {
            this.cycle = 0;
            this.scanline++;
            if (this.scanline > 261) {
              this.scanline = 0;
              this.oddFrame = !this.oddFrame;
              this.framePosition = 0;
            }
            if (this.isRenderingEnabled()) {
              if (this.scanline <= 239) {
                this.clearSprites();
                if (this.scanline > 0) {
                  this.preRenderSprites();
                }
              }
            }
          }
          this.cycleFlags = Flag.scanlines[this.scanline] & Flag.cycles[this.cycle];
        };
        PPU2.prototype.incrementScanline = function() {
          this.cycle = 0;
          this.scanline++;
          if (this.scanline > 261) {
            this.scanline = 0;
            this.oddFrame = !this.oddFrame;
            this.framePosition = 0;
          }
          if (this.scanline <= 239) {
            this.clearSprites();
            if (this.scanline > 0) {
              this.preRenderSprites();
            }
          }
        };
        PPU2.prototype.incrementFrame = function() {
          this.scanline = 0;
          this.oddFrame = !this.oddFrame;
          this.framePosition = 0;
        };
        PPU2.prototype.tick = function() {
          if (this.isRenderingEnabled()) {
            this.fetchData();
            this.doRendering();
            this.updateScrolling();
          }
          if (this.nmiDelay) {
            if (!this.nmiEnabled) {
              this.nmiDelay = 0;
            } else if (!--this.nmiDelay && !this.nmiSuppressed) {
              this.cpu.activeInterrupts |= interrupts_1.NMI;
            }
          }
          if (this.cycleFlags & Flag.VB_START) {
            if (!this.vblankSuppressed) {
              this.vblankFlag = 1;
            }
            this.vblankActive = true;
            this.frameAvailable = true;
            this.nmiDelay = 2;
          } else if (this.cycleFlags & Flag.VB_END) {
            this.vblankActive = false;
            this.vblankFlag = 0;
            this.vblankSuppressed = false;
            this.nmiSuppressed = false;
            this.spriteZeroHit = 0;
            this.spriteOverflow = 0;
          }
          this.incrementCycle();
        };
        PPU2.prototype.fetchData = function() {
          if (this.cycleFlags & Flag.FETCH_NT) {
            this.fetchNametable();
          } else if (this.cycleFlags & Flag.FETCH_AT) {
            this.fetchAttribute();
          } else if (this.cycleFlags & Flag.FETCH_BGL) {
            this.fetchBackgroundLow();
          } else if (this.cycleFlags & Flag.FETCH_BGH) {
            this.fetchBackgroundHigh();
          } else if (this.cycleFlags & Flag.FETCH_SPL) {
            this.fetchSpriteLow();
          } else if (this.cycleFlags & Flag.FETCH_SPH) {
            this.fetchSpriteHigh();
          }
        };
        PPU2.prototype.doRendering = function() {
          if (this.cycleFlags & Flag.EVAL_SP) {
            this.evaluateSprites();
          }
          if (this.cycleFlags & Flag.COPY_BG) {
            this.copyBackground();
          }
          if (this.cycleFlags & Flag.RENDER) {
            this.updateFramePixel();
          }
          if (this.cycleFlags & Flag.SHIFT_BG) {
            this.shiftBackground();
          }
        };
        PPU2.prototype.skipRendering = function() {
          if (this.cycleFlags & Flag.RENDER) {
            this.clearFramePixel();
          }
        };
        PPU2.prototype.isRenderingActive = function() {
          return !this.vblankActive && (this.spritesVisible || this.backgroundVisible);
        };
        PPU2.prototype.isRenderingEnabled = function() {
          return this.spritesVisible || this.backgroundVisible;
        };
        PPU2.prototype.updateFramePixel = function() {
          var address = this.renderFramePixel();
          if (this.clipTopBottom && this.cycleFlags & Flag.CLIP_TB) {
            this.clearFramePixel();
          } else {
            var color = this.ppuMemory.readPalette(address);
            this.setFramePixel(color);
          }
        };
        PPU2.prototype.renderFramePixel = function() {
          var backgroundColorAddress = this.renderBackgroundPixel();
          var spriteColorAddress = this.renderSpritePixel();
          if (backgroundColorAddress & 3) {
            if (spriteColorAddress & 3) {
              var sprite = this.getRenderedSprite();
              if (sprite.zeroSprite && this.cycle !== 256) {
                this.spriteZeroHit = 1;
              }
              if (sprite.inFront) {
                return spriteColorAddress;
              }
            }
            return backgroundColorAddress;
          }
          if (spriteColorAddress & 3) {
            return spriteColorAddress;
          }
          return 0;
        };
        PPU2.prototype.fetchNametable = function() {
          this.addressBus = 8192 | this.vramAddress & 4095;
          var patternNumber = this.ppuMemory.readNametable(this.addressBus);
          var patternAddress = this.bgPatternTableAddress + (patternNumber << 4);
          var fineYScroll = this.vramAddress >>> 12 & 7;
          this.patternRowAddress = patternAddress + fineYScroll;
        };
        PPU2.prototype.fetchAttribute = function() {
          var attributeTableAddress = 9152 | this.vramAddress & 3072;
          var attributeNumber = this.vramAddress >>> 4 & 56 | this.vramAddress >>> 2 & 7;
          this.addressBus = attributeTableAddress + attributeNumber;
          var attribute = this.ppuMemory.readNametable(this.addressBus);
          var areaNumber = this.vramAddress >>> 4 & 4 | this.vramAddress & 2;
          var paletteNumber = attribute >>> areaNumber & 3;
          this.paletteLatchNext0 = paletteNumber & 1;
          this.paletteLatchNext1 = paletteNumber >>> 1 & 1;
        };
        PPU2.prototype.fetchBackgroundLow = function() {
          this.addressBus = this.patternRowAddress;
          this.patternBufferNext0 = this.ppuMemory.readPattern(this.addressBus);
        };
        PPU2.prototype.fetchBackgroundHigh = function() {
          this.addressBus = this.patternRowAddress + 8;
          this.patternBufferNext1 = this.ppuMemory.readPattern(this.addressBus);
        };
        PPU2.prototype.copyBackground = function() {
          this.patternBuffer0 |= this.patternBufferNext0;
          this.patternBuffer1 |= this.patternBufferNext1;
          this.paletteLatch0 = this.paletteLatchNext0;
          this.paletteLatch1 = this.paletteLatchNext1;
        };
        PPU2.prototype.shiftBackground = function() {
          this.patternBuffer0 = this.patternBuffer0 << 1;
          this.patternBuffer1 = this.patternBuffer1 << 1;
          this.paletteBuffer0 = this.paletteBuffer0 << 1 | this.paletteLatch0;
          this.paletteBuffer1 = this.paletteBuffer1 << 1 | this.paletteLatch1;
        };
        PPU2.prototype.renderBackgroundPixel = function() {
          if (this.isBackgroundPixelVisible()) {
            var colorBit0 = this.patternBuffer0 << this.fineXScroll >> 15 & 1;
            var colorBit1 = this.patternBuffer1 << this.fineXScroll >> 14 & 2;
            var paletteBit0 = this.paletteBuffer0 << this.fineXScroll >> 5 & 4;
            var paletteBit1 = this.paletteBuffer1 << this.fineXScroll >> 4 & 8;
            return paletteBit1 | paletteBit0 | colorBit1 | colorBit0;
          }
          return 0;
        };
        PPU2.prototype.isBackgroundPixelVisible = function() {
          return this.backgroundVisible && !(this.backgroundClipping && this.cycleFlags & Flag.CLIP_LEFT);
        };
        PPU2.prototype.evaluateSprites = function() {
          this.spriteNumber = 0;
          this.spriteCount = 0;
          var height = this.bigSprites ? 16 : 8;
          var bottomY = this.scanline + 1;
          var topY = bottomY - height + 1;
          for (var address = 0; address < this.primaryOAM.length; address += 4) {
            var spriteY = this.primaryOAM[address] + 1;
            if (spriteY < topY || spriteY > bottomY) {
              continue;
            }
            if (this.spriteCount >= 8) {
              this.spriteOverflow = 1;
              break;
            }
            var patternTableAddress = this.spPatternTableAddress;
            var patternNumber = this.primaryOAM[address + 1];
            if (this.bigSprites) {
              patternTableAddress = (patternNumber & 1) << 12;
              patternNumber &= 254;
            }
            var attributes = this.primaryOAM[address + 2];
            var rowNumber = bottomY - spriteY;
            if (attributes & 128) {
              rowNumber = height - rowNumber - 1;
            }
            if (rowNumber >= 8) {
              rowNumber -= 8;
              patternNumber++;
            }
            var sprite = this.secondaryOAM[this.spriteCount];
            sprite.x = this.primaryOAM[address + 3];
            sprite.zeroSprite = address === 0;
            sprite.horizontalFlip = attributes & 64;
            sprite.paletteNumber = 16 | (attributes & 3) << 2;
            sprite.inFront = (attributes & 32) === 0;
            var patternAddress = patternTableAddress + (patternNumber << 4);
            sprite.patternRowAddress = patternAddress + rowNumber;
            this.spriteCount++;
          }
        };
        PPU2.prototype.fetchSpriteLow = function() {
          if (this.spriteNumber < this.spriteCount) {
            var sprite = this.secondaryOAM[this.spriteNumber];
            this.addressBus = sprite.patternRowAddress;
            sprite.patternRow0 = this.ppuMemory.readPattern(this.addressBus);
          } else {
            this.addressBus = this.spPatternTableAddress | 4080;
          }
        };
        PPU2.prototype.fetchSpriteHigh = function() {
          if (this.spriteNumber < this.spriteCount) {
            var sprite = this.secondaryOAM[this.spriteNumber++];
            this.addressBus = sprite.patternRowAddress + 8;
            sprite.patternRow1 = this.ppuMemory.readPattern(this.addressBus);
          } else {
            this.addressBus = this.spPatternTableAddress | 4080;
          }
        };
        PPU2.prototype.clearSprites = function() {
          this.spriteCache.fill(null);
          this.spritePixelCache.fill(0);
        };
        PPU2.prototype.preRenderSprites = function() {
          for (var i = 0; i < this.spriteCount; i++) {
            var sprite = this.secondaryOAM[i];
            for (var j = 0; j < 8; j++) {
              var cycle = sprite.x + j + 1;
              if (cycle > constants_1.VIDEO_WIDTH) {
                break;
              }
              if (this.spriteCache[cycle]) {
                continue;
              }
              var columnNumber = sprite.horizontalFlip ? j : j ^ 7;
              var colorBit0 = sprite.patternRow0 >>> columnNumber & 1;
              var colorBit1 = (sprite.patternRow1 >>> columnNumber & 1) << 1;
              var colorNumber = colorBit1 | colorBit0;
              if (colorNumber) {
                this.spriteCache[cycle] = sprite;
                this.spritePixelCache[cycle] = sprite.paletteNumber | colorNumber;
              }
            }
          }
        };
        PPU2.prototype.renderSpritePixel = function() {
          if (this.isSpritePixelVisible()) {
            return this.spritePixelCache[this.cycle];
          }
          return 0;
        };
        PPU2.prototype.isSpritePixelVisible = function() {
          return this.spritesVisible && !(this.spriteClipping && this.cycleFlags & Flag.CLIP_LEFT);
        };
        PPU2.prototype.getRenderedSprite = function() {
          return this.spriteCache[this.cycle];
        };
        PPU2.prototype.renderDebugFrame = function() {
          this.renderPatterns();
          this.renderPalettes();
        };
        PPU2.prototype.renderPatterns = function() {
          for (var tileY = 0; tileY < 16; tileY++) {
            var baseY = tileY << 3;
            for (var tileX = 0; tileX < 32; tileX++) {
              var baseX = tileX << 3;
              var address = ((tileX & 16) << 4 | tileY << 4 | tileX & 15) << 4;
              this.renderPatternTile(baseX, baseY, address);
            }
          }
        };
        PPU2.prototype.renderPatternTile = function(baseX, baseY, address) {
          for (var rowNumber = 0; rowNumber < 8; rowNumber++) {
            var y = baseY + rowNumber;
            var patternBuffer0 = this.ppuMemory.readPattern(address + rowNumber);
            var patternBuffer1 = this.ppuMemory.readPattern(address + rowNumber + 8);
            for (var columnNumber = 0; columnNumber < 8; columnNumber++) {
              var x = baseX + columnNumber;
              var bitPosition = columnNumber ^ 7;
              var colorBit0 = patternBuffer0 >> bitPosition & 1;
              var colorBit1 = (patternBuffer1 >> bitPosition & 1) << 1;
              var color = this.ppuMemory.readPalette(colorBit1 | colorBit0);
              this.setFramePixelOnPosition(x, y, color);
            }
          }
        };
        PPU2.prototype.renderPalettes = function() {
          for (var tileY = 0; tileY < 4; tileY++) {
            var baseY = tileY * 28 + 128;
            for (var tileX = 0; tileX < 8; tileX++) {
              var baseX = tileX << 5;
              var color = this.ppuMemory.readPalette(tileY << 3 | tileX);
              this.renderPaletteTile(baseX, baseY, color);
            }
          }
        };
        PPU2.prototype.renderPaletteTile = function(baseX, baseY, color) {
          for (var y = baseY; y < baseY + 28; y++) {
            for (var x = baseX; x < baseX + 32; x++) {
              this.setFramePixelOnPosition(x, y, color);
            }
          }
        };
        return PPU2;
      }()
    );
    exports2.default = PPU;
  }
});

// dist/cfxnes-core/video/index.js
var require_video = __commonJS({
  "dist/cfxnes-core/video/index.js": function(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DEFAULT_PALETTE = exports2.isPaletteName = exports2.createPalette = exports2.BLACK_COLOR = exports2.unpackColor = exports2.packColor = exports2.VIDEO_HEIGHT = exports2.VIDEO_WIDTH = exports2.PPU = void 0;
    var PPU_1 = require_PPU();
    Object.defineProperty(exports2, "PPU", { enumerable: true, get: function() {
      return __importDefault2(PPU_1).default;
    } });
    var constants_1 = require_constants();
    Object.defineProperty(exports2, "VIDEO_WIDTH", { enumerable: true, get: function() {
      return constants_1.VIDEO_WIDTH;
    } });
    Object.defineProperty(exports2, "VIDEO_HEIGHT", { enumerable: true, get: function() {
      return constants_1.VIDEO_HEIGHT;
    } });
    var colors_1 = require_colors();
    Object.defineProperty(exports2, "packColor", { enumerable: true, get: function() {
      return colors_1.packColor;
    } });
    Object.defineProperty(exports2, "unpackColor", { enumerable: true, get: function() {
      return colors_1.unpackColor;
    } });
    Object.defineProperty(exports2, "BLACK_COLOR", { enumerable: true, get: function() {
      return colors_1.BLACK_COLOR;
    } });
    var palettes_1 = require_palettes();
    Object.defineProperty(exports2, "createPalette", { enumerable: true, get: function() {
      return palettes_1.createPalette;
    } });
    Object.defineProperty(exports2, "isPaletteName", { enumerable: true, get: function() {
      return palettes_1.isPaletteName;
    } });
    Object.defineProperty(exports2, "DEFAULT_PALETTE", { enumerable: true, get: function() {
      return palettes_1.DEFAULT_PALETTE;
    } });
  }
});

// dist/cfxnes-core/proc/CPU.js
var require_CPU = __commonJS({
  "dist/cfxnes-core/proc/CPU.js": function(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var common_1 = require_common();
    var interrupts_1 = require_interrupts();
    var F_EXTRA_CYCLE = 1 << 0;
    var F_DOUBLE_READ = 1 << 1;
    var RESET_ADDRESS = 65532;
    var NMI_ADDRESS = 65530;
    var IRQ_ADDRESS = 65534;
    var CPU = (
      /** @class */
      function() {
        function CPU2() {
          common_1.log.info("Initializing CPU");
          this.halted = false;
          this.operationFlags = 0;
          this.activeInterrupts = 0;
          this.irqDisabled = 0;
          this.pageCrossed = false;
          this.programCounter = 0;
          this.stackPointer = 0;
          this.accumulator = 0;
          this.registerX = 0;
          this.registerY = 0;
          this.carryFlag = 0;
          this.zeroFlag = 0;
          this.interruptFlag = 0;
          this.decimalFlag = 0;
          this.overflowFlag = 0;
          this.negativeFlag = 0;
          this.mapper = null;
          this.cpuMemory = null;
          this.dma = null;
          this.ppu = null;
          this.apu = null;
        }
        CPU2.prototype.connect = function(nes) {
          common_1.log.info("Connecting CPU");
          this.cpuMemory = nes.cpuMemory;
          this.ppu = nes.ppu;
          this.apu = nes.apu;
          this.dma = nes.dma;
        };
        CPU2.prototype.setMapper = function(mapper) {
          this.mapper = mapper;
        };
        CPU2.prototype.reset = function() {
          common_1.log.info("Resetting CPU");
          this.resetState();
          this.resetMemory();
          this.handleReset();
        };
        CPU2.prototype.resetState = function() {
          this.activeInterrupts = 0;
          this.halted = false;
          this.stackPointer = 0;
          this.accumulator = 0;
          this.registerX = 0;
          this.registerY = 0;
          this.setStatus(0);
        };
        CPU2.prototype.resetMemory = function() {
          for (var i = 0; i < 8; i++) {
            this.cpuMemory.write(i, 255);
          }
          this.cpuMemory.write(8, 247);
          this.cpuMemory.write(9, 239);
          this.cpuMemory.write(10, 223);
          this.cpuMemory.write(15, 191);
          for (var i = 16; i < 2048; i++) {
            this.cpuMemory.write(i, 255);
          }
          for (var i = 16384; i < 16400; i++) {
            this.cpuMemory.write(i, 0);
          }
        };
        CPU2.prototype.step = function() {
          var blocked = this.dma.isBlockingCPU();
          if (this.activeInterrupts && !blocked) {
            this.resolveInterrupt();
          }
          if (this.halted || blocked) {
            this.tick();
          } else {
            this.readAndExecuteOperation();
          }
        };
        CPU2.prototype.resolveInterrupt = function() {
          if (this.activeInterrupts & interrupts_1.RESET) {
            this.handleReset();
          } else if (this.activeInterrupts & interrupts_1.NMI) {
            this.handleNMI();
          } else if (this.irqDisabled) {
            return;
          } else {
            this.handleIRQ();
          }
          this.tick();
          this.tick();
        };
        CPU2.prototype.handleReset = function() {
          this.writeByte(16405, 0);
          this.writeByte(16407, this.apu.frameCounterLast);
          this.stackPointer = this.stackPointer - 3 & 255;
          this.enterInterruptHandler(RESET_ADDRESS);
          this.clearInterrupt(interrupts_1.RESET);
          this.tick();
          this.halted = false;
        };
        CPU2.prototype.handleNMI = function() {
          this.saveStateBeforeInterrupt();
          this.enterInterruptHandler(NMI_ADDRESS);
          this.clearInterrupt(interrupts_1.NMI);
        };
        CPU2.prototype.handleIRQ = function() {
          this.saveStateBeforeInterrupt();
          this.enterInterruptHandler(IRQ_ADDRESS);
        };
        CPU2.prototype.saveStateBeforeInterrupt = function() {
          this.pushWord(this.programCounter);
          this.pushByte(this.getStatus());
        };
        CPU2.prototype.enterInterruptHandler = function(address) {
          this.interruptFlag = 1;
          this.programCounter = this.readWord(address);
        };
        CPU2.prototype.readAndExecuteOperation = function() {
          var nextProgramByte = this.readNextProgramByte();
          this.irqDisabled = this.interruptFlag;
          var effectiveAddress;
          switch (nextProgramByte) {
            case 26:
              this.operationFlags = 0;
              this.impliedMode();
              this.NOP();
              break;
            case 58:
              this.operationFlags = 0;
              this.impliedMode();
              this.NOP();
              break;
            // 2 cycles
            case 90:
              this.operationFlags = 0;
              this.impliedMode();
              this.NOP();
              break;
            // 2 cycles
            case 122:
              this.operationFlags = 0;
              this.impliedMode();
              this.NOP();
              break;
            // 2 cycles
            case 218:
              this.operationFlags = 0;
              this.impliedMode();
              this.NOP();
              break;
            // 2 cycles
            case 234:
              this.operationFlags = 0;
              this.impliedMode();
              this.NOP();
              break;
            // 2 cycles
            case 250:
              this.operationFlags = 0;
              this.impliedMode();
              this.NOP();
              break;
            // 2 cycles
            case 128:
              this.operationFlags = F_EXTRA_CYCLE;
              effectiveAddress = this.immediateMode();
              this.NOP();
              break;
            // 2 cycles
            case 130:
              this.operationFlags = F_EXTRA_CYCLE;
              effectiveAddress = this.immediateMode();
              this.NOP();
              break;
            // 2 cycles
            case 137:
              this.operationFlags = F_EXTRA_CYCLE;
              effectiveAddress = this.immediateMode();
              this.NOP();
              break;
            // 2 cycles
            case 194:
              this.operationFlags = F_EXTRA_CYCLE;
              effectiveAddress = this.immediateMode();
              this.NOP();
              break;
            // 2 cycles
            case 226:
              this.operationFlags = F_EXTRA_CYCLE;
              effectiveAddress = this.immediateMode();
              this.NOP();
              break;
            // 2 cycles
            case 4:
              this.operationFlags = F_EXTRA_CYCLE;
              effectiveAddress = this.zeroPageMode();
              this.NOP();
              break;
            // 3 cycles
            case 68:
              this.operationFlags = F_EXTRA_CYCLE;
              effectiveAddress = this.zeroPageMode();
              this.NOP();
              break;
            // 3 cycles
            case 100:
              this.operationFlags = F_EXTRA_CYCLE;
              effectiveAddress = this.zeroPageMode();
              this.NOP();
              break;
            // 3 cycles
            case 20:
              this.operationFlags = F_EXTRA_CYCLE;
              effectiveAddress = this.zeroPageXMode();
              this.NOP();
              break;
            // 4 cycles
            case 52:
              this.operationFlags = F_EXTRA_CYCLE;
              effectiveAddress = this.zeroPageXMode();
              this.NOP();
              break;
            // 4 cycles
            case 84:
              this.operationFlags = F_EXTRA_CYCLE;
              effectiveAddress = this.zeroPageXMode();
              this.NOP();
              break;
            // 4 cycles
            case 116:
              this.operationFlags = F_EXTRA_CYCLE;
              effectiveAddress = this.zeroPageXMode();
              this.NOP();
              break;
            // 4 cycles
            case 212:
              this.operationFlags = F_EXTRA_CYCLE;
              effectiveAddress = this.zeroPageXMode();
              this.NOP();
              break;
            // 4 cycles
            case 244:
              this.operationFlags = F_EXTRA_CYCLE;
              effectiveAddress = this.zeroPageXMode();
              this.NOP();
              break;
            // 4 cycles
            case 12:
              this.operationFlags = F_EXTRA_CYCLE;
              effectiveAddress = this.absoluteMode();
              this.NOP();
              break;
            // 4 cycles
            case 28:
              this.operationFlags = F_EXTRA_CYCLE;
              effectiveAddress = this.absoluteXMode();
              this.NOP();
              break;
            // 4 cycles (+1 if page crossed)
            case 60:
              this.operationFlags = F_EXTRA_CYCLE;
              effectiveAddress = this.absoluteXMode();
              this.NOP();
              break;
            // 4 cycles (+1 if page crossed)
            case 92:
              this.operationFlags = F_EXTRA_CYCLE;
              effectiveAddress = this.absoluteXMode();
              this.NOP();
              break;
            // 4 cycles (+1 if page crossed)
            case 124:
              this.operationFlags = F_EXTRA_CYCLE;
              effectiveAddress = this.absoluteXMode();
              this.NOP();
              break;
            // 4 cycles (+1 if page crossed)
            case 220:
              this.operationFlags = F_EXTRA_CYCLE;
              effectiveAddress = this.absoluteXMode();
              this.NOP();
              break;
            // 4 cycles (+1 if page crossed)
            case 252:
              this.operationFlags = F_EXTRA_CYCLE;
              effectiveAddress = this.absoluteXMode();
              this.NOP();
              break;
            // 4 cycles (+1 if page crossed)
            //=========================================================
            // Clear flag instructions
            //=========================================================
            case 24:
              this.operationFlags = 0;
              this.impliedMode();
              this.CLC();
              break;
            // 2 cycles
            case 88:
              this.operationFlags = 0;
              this.impliedMode();
              this.CLI();
              break;
            // 2 cycles
            case 216:
              this.operationFlags = 0;
              this.impliedMode();
              this.CLD();
              break;
            // 2 cycles
            case 184:
              this.operationFlags = 0;
              this.impliedMode();
              this.CLV();
              break;
            // 2 cycles
            //=========================================================
            // Set flag instructions
            //=========================================================
            case 56:
              this.operationFlags = 0;
              this.impliedMode();
              this.SEC();
              break;
            // 2 cycles
            case 120:
              this.operationFlags = 0;
              this.impliedMode();
              this.SEI();
              break;
            // 2 cycles
            case 248:
              this.operationFlags = 0;
              this.impliedMode();
              this.SED();
              break;
            // 2 cycles
            //=========================================================
            // Memory write instructions
            //=========================================================
            case 133:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageMode();
              this.STA(effectiveAddress);
              break;
            // 3 cycles
            case 149:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageXMode();
              this.STA(effectiveAddress);
              break;
            // 4 cycles
            case 141:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteMode();
              this.STA(effectiveAddress);
              break;
            // 4 cycles
            case 157:
              this.operationFlags = F_DOUBLE_READ;
              effectiveAddress = this.absoluteXMode();
              this.STA(effectiveAddress);
              break;
            // 5 cycles
            case 153:
              this.operationFlags = F_DOUBLE_READ;
              effectiveAddress = this.absoluteYMode();
              this.STA(effectiveAddress);
              break;
            // 5 cycles
            case 129:
              this.operationFlags = 0;
              effectiveAddress = this.indirectXMode();
              this.STA(effectiveAddress);
              break;
            // 6 cycles
            case 145:
              this.operationFlags = F_DOUBLE_READ;
              effectiveAddress = this.indirectYMode();
              this.STA(effectiveAddress);
              break;
            // 6 cycles
            case 134:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageMode();
              this.STX(effectiveAddress);
              break;
            // 3 cycles
            case 150:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageYMode();
              this.STX(effectiveAddress);
              break;
            // 4 cycles
            case 142:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteMode();
              this.STX(effectiveAddress);
              break;
            // 4 cycles
            case 135:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageMode();
              this.SAX(effectiveAddress);
              break;
            // 3 cycles
            case 151:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageYMode();
              this.SAX(effectiveAddress);
              break;
            // 4 cycles
            case 143:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteMode();
              this.SAX(effectiveAddress);
              break;
            // 4 cycles
            case 131:
              this.operationFlags = 0;
              effectiveAddress = this.indirectXMode();
              this.SAX(effectiveAddress);
              break;
            // 6 cycles
            case 132:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageMode();
              this.STY(effectiveAddress);
              break;
            // 3 cycles
            case 148:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageXMode();
              this.STY(effectiveAddress);
              break;
            // 4 cycles
            case 140:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteMode();
              this.STY(effectiveAddress);
              break;
            // 4 cycles
            case 147:
              this.operationFlags = F_DOUBLE_READ;
              effectiveAddress = this.indirectYMode();
              this.SHA(effectiveAddress);
              break;
            // 6 cycles
            case 159:
              this.operationFlags = F_DOUBLE_READ;
              effectiveAddress = this.absoluteYMode();
              this.SHA(effectiveAddress);
              break;
            // 5 cycles
            case 158:
              this.operationFlags = F_DOUBLE_READ;
              effectiveAddress = this.absoluteYMode();
              this.SHX(effectiveAddress);
              break;
            // 5 cycles
            case 156:
              this.operationFlags = F_DOUBLE_READ;
              effectiveAddress = this.absoluteXMode();
              this.SHY(effectiveAddress);
              break;
            // 5 cycles
            //=========================================================
            // Memory read instructions
            //=========================================================
            case 169:
              this.operationFlags = 0;
              effectiveAddress = this.immediateMode();
              this.LDA(effectiveAddress);
              break;
            // 2 cycles
            case 165:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageMode();
              this.LDA(effectiveAddress);
              break;
            // 3 cycles
            case 181:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageXMode();
              this.LDA(effectiveAddress);
              break;
            // 4 cycles
            case 173:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteMode();
              this.LDA(effectiveAddress);
              break;
            // 4 cycles
            case 189:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteXMode();
              this.LDA(effectiveAddress);
              break;
            // 4 cycles (+1 if page crossed)
            case 185:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteYMode();
              this.LDA(effectiveAddress);
              break;
            // 4 cycles (+1 if page crossed)
            case 161:
              this.operationFlags = 0;
              effectiveAddress = this.indirectXMode();
              this.LDA(effectiveAddress);
              break;
            // 6 cycles
            case 177:
              this.operationFlags = 0;
              effectiveAddress = this.indirectYMode();
              this.LDA(effectiveAddress);
              break;
            // 5 cycles (+1 if page crossed)
            case 162:
              this.operationFlags = 0;
              effectiveAddress = this.immediateMode();
              this.LDX(effectiveAddress);
              break;
            // 2 cycles
            case 166:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageMode();
              this.LDX(effectiveAddress);
              break;
            // 3 cycles
            case 182:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageYMode();
              this.LDX(effectiveAddress);
              break;
            // 4 cycles
            case 174:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteMode();
              this.LDX(effectiveAddress);
              break;
            // 4 cycles
            case 190:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteYMode();
              this.LDX(effectiveAddress);
              break;
            // 4 cycles (+1 if page crossed)
            case 160:
              this.operationFlags = 0;
              effectiveAddress = this.immediateMode();
              this.LDY(effectiveAddress);
              break;
            // 2 cycles
            case 164:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageMode();
              this.LDY(effectiveAddress);
              break;
            // 3 cycles
            case 180:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageXMode();
              this.LDY(effectiveAddress);
              break;
            // 4 cycles
            case 172:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteMode();
              this.LDY(effectiveAddress);
              break;
            // 4 cycles
            case 188:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteXMode();
              this.LDY(effectiveAddress);
              break;
            // 4 cycles (+1 if page crossed)
            case 171:
              this.operationFlags = 0;
              effectiveAddress = this.immediateMode();
              this.LAX(effectiveAddress);
              break;
            // 2 cycles
            case 167:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageMode();
              this.LAX(effectiveAddress);
              break;
            // 3 cycles
            case 183:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageYMode();
              this.LAX(effectiveAddress);
              break;
            // 4 cycles
            case 175:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteMode();
              this.LAX(effectiveAddress);
              break;
            // 4 cycles
            case 191:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteYMode();
              this.LAX(effectiveAddress);
              break;
            // 4 cycles (+1 if page crossed)
            case 163:
              this.operationFlags = 0;
              effectiveAddress = this.indirectXMode();
              this.LAX(effectiveAddress);
              break;
            // 6 cycles
            case 179:
              this.operationFlags = 0;
              effectiveAddress = this.indirectYMode();
              this.LAX(effectiveAddress);
              break;
            // 5 cycles (+1 if page crossed)
            case 187:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteYMode();
              this.LAS(effectiveAddress);
              break;
            // 4 cycles (+1 if page crossed)
            //=========================================================
            // Register transfer instructions
            //=========================================================
            case 170:
              this.operationFlags = 0;
              this.impliedMode();
              this.TAX();
              break;
            // 2 cycles
            case 168:
              this.operationFlags = 0;
              this.impliedMode();
              this.TAY();
              break;
            // 2 cycles
            case 138:
              this.operationFlags = 0;
              this.impliedMode();
              this.TXA();
              break;
            // 2 cycles
            case 152:
              this.operationFlags = 0;
              this.impliedMode();
              this.TYA();
              break;
            // 2 cycles
            case 154:
              this.operationFlags = 0;
              this.impliedMode();
              this.TXS();
              break;
            // 2 cycles
            case 186:
              this.operationFlags = 0;
              this.impliedMode();
              this.TSX();
              break;
            // 2 cycles
            //=========================================================
            // Stack push instructions
            //=========================================================
            case 72:
              this.operationFlags = 0;
              this.impliedMode();
              this.PHA();
              break;
            // 3 cycles
            case 8:
              this.operationFlags = 0;
              this.impliedMode();
              this.PHP();
              break;
            // 3 cycles
            //=========================================================
            // Stack pull instructions
            //=========================================================
            case 104:
              this.operationFlags = 0;
              this.impliedMode();
              this.PLA();
              break;
            // 4 cycles
            case 40:
              this.operationFlags = 0;
              this.impliedMode();
              this.PLP();
              break;
            // 4 cycles
            //=========================================================
            // Accumulator bitwise instructions
            //=========================================================
            case 41:
              this.operationFlags = 0;
              effectiveAddress = this.immediateMode();
              this.AND(effectiveAddress);
              break;
            // 2 cycles
            case 37:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageMode();
              this.AND(effectiveAddress);
              break;
            // 3 cycles
            case 53:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageXMode();
              this.AND(effectiveAddress);
              break;
            // 4 cycles
            case 45:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteMode();
              this.AND(effectiveAddress);
              break;
            // 4 cycles
            case 61:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteXMode();
              this.AND(effectiveAddress);
              break;
            // 4 cycles (+1 if page crossed)
            case 57:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteYMode();
              this.AND(effectiveAddress);
              break;
            // 4 cycles (+1 if page crossed)
            case 33:
              this.operationFlags = 0;
              effectiveAddress = this.indirectXMode();
              this.AND(effectiveAddress);
              break;
            // 6 cycles
            case 49:
              this.operationFlags = 0;
              effectiveAddress = this.indirectYMode();
              this.AND(effectiveAddress);
              break;
            // 5 cycles (+1 if page crossed)
            case 9:
              this.operationFlags = 0;
              effectiveAddress = this.immediateMode();
              this.ORA(effectiveAddress);
              break;
            // 2 cycles
            case 5:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageMode();
              this.ORA(effectiveAddress);
              break;
            // 3 cycles
            case 21:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageXMode();
              this.ORA(effectiveAddress);
              break;
            // 4 cycles
            case 13:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteMode();
              this.ORA(effectiveAddress);
              break;
            // 4 cycles
            case 29:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteXMode();
              this.ORA(effectiveAddress);
              break;
            // 4 cycles (+1 if page crossed)
            case 25:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteYMode();
              this.ORA(effectiveAddress);
              break;
            // 4 cycles (+1 if page crossed)
            case 1:
              this.operationFlags = 0;
              effectiveAddress = this.indirectXMode();
              this.ORA(effectiveAddress);
              break;
            // 6 cycles
            case 17:
              this.operationFlags = 0;
              effectiveAddress = this.indirectYMode();
              this.ORA(effectiveAddress);
              break;
            // 5 cycles (+1 if page crossed)
            case 73:
              this.operationFlags = 0;
              effectiveAddress = this.immediateMode();
              this.EOR(effectiveAddress);
              break;
            // 2 cycles
            case 69:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageMode();
              this.EOR(effectiveAddress);
              break;
            // 3 cycles
            case 85:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageXMode();
              this.EOR(effectiveAddress);
              break;
            // 4 cycles
            case 77:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteMode();
              this.EOR(effectiveAddress);
              break;
            // 4 cycles
            case 93:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteXMode();
              this.EOR(effectiveAddress);
              break;
            // 4 cycles (+1 if page crossed)
            case 89:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteYMode();
              this.EOR(effectiveAddress);
              break;
            // 4 cycles (+1 if page crossed)
            case 65:
              this.operationFlags = 0;
              effectiveAddress = this.indirectXMode();
              this.EOR(effectiveAddress);
              break;
            // 6 cycles
            case 81:
              this.operationFlags = 0;
              effectiveAddress = this.indirectYMode();
              this.EOR(effectiveAddress);
              break;
            // 5 cycles (+1 if page crossed)
            case 36:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageMode();
              this.BIT(effectiveAddress);
              break;
            // 3 cycles
            case 44:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteMode();
              this.BIT(effectiveAddress);
              break;
            // 4 cycles
            //=========================================================
            // Increment instructions
            //=========================================================
            case 230:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageMode();
              this.INC(effectiveAddress);
              break;
            // 5 cycles
            case 246:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageXMode();
              this.INC(effectiveAddress);
              break;
            // 6 cycles
            case 238:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteMode();
              this.INC(effectiveAddress);
              break;
            // 6 cycles
            case 254:
              this.operationFlags = F_DOUBLE_READ;
              effectiveAddress = this.absoluteXMode();
              this.INC(effectiveAddress);
              break;
            // 7 cycles
            case 232:
              this.operationFlags = 0;
              this.impliedMode();
              this.INX();
              break;
            // 2 cycles
            case 200:
              this.operationFlags = 0;
              this.impliedMode();
              this.INY();
              break;
            // 2 cycles
            //=========================================================
            // Decrement instructions
            //=========================================================
            case 198:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageMode();
              this.DEC(effectiveAddress);
              break;
            // 5 cycles
            case 214:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageXMode();
              this.DEC(effectiveAddress);
              break;
            // 6 cycles
            case 206:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteMode();
              this.DEC(effectiveAddress);
              break;
            // 6 cycles
            case 222:
              this.operationFlags = F_DOUBLE_READ;
              effectiveAddress = this.absoluteXMode();
              this.DEC(effectiveAddress);
              break;
            // 7 cycles
            case 202:
              this.operationFlags = 0;
              this.impliedMode();
              this.DEX();
              break;
            // 2 cycles
            case 136:
              this.operationFlags = 0;
              this.impliedMode();
              this.DEY();
              break;
            // 2 cycles
            //=========================================================
            // Comparison instructions
            //=========================================================
            case 201:
              this.operationFlags = 0;
              effectiveAddress = this.immediateMode();
              this.CMP(effectiveAddress);
              break;
            // 2 cycles
            case 197:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageMode();
              this.CMP(effectiveAddress);
              break;
            // 3 cycles
            case 213:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageXMode();
              this.CMP(effectiveAddress);
              break;
            // 4 cycles
            case 205:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteMode();
              this.CMP(effectiveAddress);
              break;
            // 4 cycles
            case 221:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteXMode();
              this.CMP(effectiveAddress);
              break;
            // 4 cycles (+1 if page crossed)
            case 217:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteYMode();
              this.CMP(effectiveAddress);
              break;
            // 4 cycles (+1 if page crossed)
            case 193:
              this.operationFlags = 0;
              effectiveAddress = this.indirectXMode();
              this.CMP(effectiveAddress);
              break;
            // 6 cycles
            case 209:
              this.operationFlags = 0;
              effectiveAddress = this.indirectYMode();
              this.CMP(effectiveAddress);
              break;
            // 5 cycles (+1 if page crossed)
            case 224:
              this.operationFlags = 0;
              effectiveAddress = this.immediateMode();
              this.CPX(effectiveAddress);
              break;
            // 2 cycles
            case 228:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageMode();
              this.CPX(effectiveAddress);
              break;
            // 3 cycles
            case 236:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteMode();
              this.CPX(effectiveAddress);
              break;
            // 4 cycles
            case 192:
              this.operationFlags = 0;
              effectiveAddress = this.immediateMode();
              this.CPY(effectiveAddress);
              break;
            // 2 cycles
            case 196:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageMode();
              this.CPY(effectiveAddress);
              break;
            // 3 cycles
            case 204:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteMode();
              this.CPY(effectiveAddress);
              break;
            // 4 cycles
            //=========================================================
            // Branching instructions
            //=========================================================
            case 144:
              this.operationFlags = 0;
              effectiveAddress = this.relativeMode();
              this.BCC(effectiveAddress);
              break;
            // 2 cycles (+1 if branch succeeds +2 if to a new page)
            case 176:
              this.operationFlags = 0;
              effectiveAddress = this.relativeMode();
              this.BCS(effectiveAddress);
              break;
            // 2 cycles (+1 if branch succeeds +2 if to a new page)
            case 208:
              this.operationFlags = 0;
              effectiveAddress = this.relativeMode();
              this.BNE(effectiveAddress);
              break;
            // 2 cycles (+1 if branch succeeds +2 if to a new page)
            case 240:
              this.operationFlags = 0;
              effectiveAddress = this.relativeMode();
              this.BEQ(effectiveAddress);
              break;
            // 2 cycles (+1 if branch succeeds +2 if to a new page)
            case 80:
              this.operationFlags = 0;
              effectiveAddress = this.relativeMode();
              this.BVC(effectiveAddress);
              break;
            // 2 cycles (+1 if branch succeeds +2 if to a new page)
            case 112:
              this.operationFlags = 0;
              effectiveAddress = this.relativeMode();
              this.BVS(effectiveAddress);
              break;
            // 2 cycles (+1 if branch succeeds +2 if to a new page)
            case 16:
              this.operationFlags = 0;
              effectiveAddress = this.relativeMode();
              this.BPL(effectiveAddress);
              break;
            // 2 cycles (+1 if branch succeeds +2 if to a new page)
            case 48:
              this.operationFlags = 0;
              effectiveAddress = this.relativeMode();
              this.BMI(effectiveAddress);
              break;
            // 2 cycles (+1 if branch succeeds +2 if to a new page)
            //=========================================================
            // Jump / subroutine instructions
            //=========================================================
            case 76:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteMode();
              this.JMP(effectiveAddress);
              break;
            // 3 cycles
            case 108:
              this.operationFlags = 0;
              effectiveAddress = this.indirectMode();
              this.JMP(effectiveAddress);
              break;
            // 5 cycles
            case 32:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteMode();
              this.JSR(effectiveAddress);
              break;
            // 6 cycles
            case 96:
              this.operationFlags = 0;
              this.impliedMode();
              this.RTS();
              break;
            // 6 cycles
            //=========================================================
            // Interrupt control instructions
            //=========================================================
            case 0:
              this.operationFlags = 0;
              this.impliedMode();
              this.BRK();
              break;
            // 7 cycles
            case 64:
              this.operationFlags = 0;
              this.impliedMode();
              this.RTI();
              break;
            // 6 cycles
            //=========================================================
            // Addition / subtraction instructions
            //=========================================================
            case 105:
              this.operationFlags = 0;
              effectiveAddress = this.immediateMode();
              this.ADC(effectiveAddress);
              break;
            // 2 cycles
            case 101:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageMode();
              this.ADC(effectiveAddress);
              break;
            // 3 cycles
            case 117:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageXMode();
              this.ADC(effectiveAddress);
              break;
            // 4 cycles
            case 109:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteMode();
              this.ADC(effectiveAddress);
              break;
            // 4 cycles
            case 125:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteXMode();
              this.ADC(effectiveAddress);
              break;
            // 4 cycles (+1 if page crossed)
            case 121:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteYMode();
              this.ADC(effectiveAddress);
              break;
            // 4 cycles (+1 if page crossed)
            case 97:
              this.operationFlags = 0;
              effectiveAddress = this.indirectXMode();
              this.ADC(effectiveAddress);
              break;
            // 6 cycles
            case 113:
              this.operationFlags = 0;
              effectiveAddress = this.indirectYMode();
              this.ADC(effectiveAddress);
              break;
            // 5 cycles (+1 if page crossed)
            case 233:
              this.operationFlags = 0;
              effectiveAddress = this.immediateMode();
              this.SBC(effectiveAddress);
              break;
            // 2 cycles
            case 235:
              this.operationFlags = 0;
              effectiveAddress = this.immediateMode();
              this.SBC(effectiveAddress);
              break;
            // 2 cycles
            case 229:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageMode();
              this.SBC(effectiveAddress);
              break;
            // 3 cycles
            case 245:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageXMode();
              this.SBC(effectiveAddress);
              break;
            // 4 cycles
            case 237:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteMode();
              this.SBC(effectiveAddress);
              break;
            // 4 cycles
            case 253:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteXMode();
              this.SBC(effectiveAddress);
              break;
            // 4 cycles (+1 if page crossed)
            case 249:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteYMode();
              this.SBC(effectiveAddress);
              break;
            // 4 cycles (+1 if page crossed)
            case 225:
              this.operationFlags = 0;
              effectiveAddress = this.indirectXMode();
              this.SBC(effectiveAddress);
              break;
            // 6 cycles
            case 241:
              this.operationFlags = 0;
              effectiveAddress = this.indirectYMode();
              this.SBC(effectiveAddress);
              break;
            // 5 cycles (+1 if page crossed)
            //=========================================================
            // Shifting / rotation instructions
            //=========================================================
            case 10:
              this.operationFlags = 0;
              effectiveAddress = this.accumulatorMode();
              this.ASL(effectiveAddress);
              break;
            // 2 cycles
            case 6:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageMode();
              this.ASL(effectiveAddress);
              break;
            // 5 cycles
            case 22:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageXMode();
              this.ASL(effectiveAddress);
              break;
            // 6 cycles
            case 14:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteMode();
              this.ASL(effectiveAddress);
              break;
            // 6 cycles
            case 30:
              this.operationFlags = F_DOUBLE_READ;
              effectiveAddress = this.absoluteXMode();
              this.ASL(effectiveAddress);
              break;
            // 7 cycles
            case 74:
              this.operationFlags = 0;
              effectiveAddress = this.accumulatorMode();
              this.LSR(effectiveAddress);
              break;
            // 2 cycles
            case 70:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageMode();
              this.LSR(effectiveAddress);
              break;
            // 5 cycles
            case 86:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageXMode();
              this.LSR(effectiveAddress);
              break;
            // 6 cycles
            case 78:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteMode();
              this.LSR(effectiveAddress);
              break;
            // 6 cycles
            case 94:
              this.operationFlags = F_DOUBLE_READ;
              effectiveAddress = this.absoluteXMode();
              this.LSR(effectiveAddress);
              break;
            // 7 cycles
            case 42:
              this.operationFlags = 0;
              effectiveAddress = this.accumulatorMode();
              this.ROL(effectiveAddress);
              break;
            // 2 cycles
            case 38:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageMode();
              this.ROL(effectiveAddress);
              break;
            // 5 cycles
            case 54:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageXMode();
              this.ROL(effectiveAddress);
              break;
            // 6 cycles
            case 46:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteMode();
              this.ROL(effectiveAddress);
              break;
            // 6 cycles
            case 62:
              this.operationFlags = F_DOUBLE_READ;
              effectiveAddress = this.absoluteXMode();
              this.ROL(effectiveAddress);
              break;
            // 7 cycles
            case 106:
              this.operationFlags = 0;
              effectiveAddress = this.accumulatorMode();
              this.ROR(effectiveAddress);
              break;
            // 2 cycles
            case 102:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageMode();
              this.ROR(effectiveAddress);
              break;
            // 5 cycles
            case 118:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageXMode();
              this.ROR(effectiveAddress);
              break;
            // 6 cycles
            case 110:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteMode();
              this.ROR(effectiveAddress);
              break;
            // 6 cycles
            case 126:
              this.operationFlags = F_DOUBLE_READ;
              effectiveAddress = this.absoluteXMode();
              this.ROR(effectiveAddress);
              break;
            // 7 cycles
            //=========================================================
            // Hybrid instructions
            //=========================================================
            case 199:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageMode();
              this.DCP(effectiveAddress);
              break;
            // 5 cycles
            case 215:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageXMode();
              this.DCP(effectiveAddress);
              break;
            // 6 cycles
            case 207:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteMode();
              this.DCP(effectiveAddress);
              break;
            // 6 cycles
            case 223:
              this.operationFlags = F_DOUBLE_READ;
              effectiveAddress = this.absoluteXMode();
              this.DCP(effectiveAddress);
              break;
            // 7 cycles
            case 219:
              this.operationFlags = F_DOUBLE_READ;
              effectiveAddress = this.absoluteYMode();
              this.DCP(effectiveAddress);
              break;
            // 7 cycles
            case 195:
              this.operationFlags = 0;
              effectiveAddress = this.indirectXMode();
              this.DCP(effectiveAddress);
              break;
            // 8 cycles
            case 211:
              this.operationFlags = F_DOUBLE_READ;
              effectiveAddress = this.indirectYMode();
              this.DCP(effectiveAddress);
              break;
            // 8 cycles
            case 231:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageMode();
              this.ISB(effectiveAddress);
              break;
            // 5 cycles
            case 247:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageXMode();
              this.ISB(effectiveAddress);
              break;
            // 6 cycles
            case 239:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteMode();
              this.ISB(effectiveAddress);
              break;
            // 6 cycles
            case 255:
              this.operationFlags = F_DOUBLE_READ;
              effectiveAddress = this.absoluteXMode();
              this.ISB(effectiveAddress);
              break;
            // 7 cycles
            case 251:
              this.operationFlags = F_DOUBLE_READ;
              effectiveAddress = this.absoluteYMode();
              this.ISB(effectiveAddress);
              break;
            // 7 cycles
            case 227:
              this.operationFlags = 0;
              effectiveAddress = this.indirectXMode();
              this.ISB(effectiveAddress);
              break;
            // 8 cycles
            case 243:
              this.operationFlags = F_DOUBLE_READ;
              effectiveAddress = this.indirectYMode();
              this.ISB(effectiveAddress);
              break;
            // 8 cycles
            case 7:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageMode();
              this.SLO(effectiveAddress);
              break;
            // 5 cycles
            case 23:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageXMode();
              this.SLO(effectiveAddress);
              break;
            // 6 cycles
            case 15:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteMode();
              this.SLO(effectiveAddress);
              break;
            // 6 cycles
            case 31:
              this.operationFlags = F_DOUBLE_READ;
              effectiveAddress = this.absoluteXMode();
              this.SLO(effectiveAddress);
              break;
            // 7 cycles
            case 27:
              this.operationFlags = F_DOUBLE_READ;
              effectiveAddress = this.absoluteYMode();
              this.SLO(effectiveAddress);
              break;
            // 7 cycles
            case 3:
              this.operationFlags = 0;
              effectiveAddress = this.indirectXMode();
              this.SLO(effectiveAddress);
              break;
            // 8 cycles
            case 19:
              this.operationFlags = F_DOUBLE_READ;
              effectiveAddress = this.indirectYMode();
              this.SLO(effectiveAddress);
              break;
            // 8 cycles
            case 71:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageMode();
              this.SRE(effectiveAddress);
              break;
            // 5 cycles
            case 87:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageXMode();
              this.SRE(effectiveAddress);
              break;
            // 6 cycles
            case 79:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteMode();
              this.SRE(effectiveAddress);
              break;
            // 6 cycles
            case 95:
              this.operationFlags = F_DOUBLE_READ;
              effectiveAddress = this.absoluteXMode();
              this.SRE(effectiveAddress);
              break;
            // 7 cycles
            case 91:
              this.operationFlags = F_DOUBLE_READ;
              effectiveAddress = this.absoluteYMode();
              this.SRE(effectiveAddress);
              break;
            // 7 cycles
            case 67:
              this.operationFlags = 0;
              effectiveAddress = this.indirectXMode();
              this.SRE(effectiveAddress);
              break;
            // 8 cycles
            case 83:
              this.operationFlags = F_DOUBLE_READ;
              effectiveAddress = this.indirectYMode();
              this.SRE(effectiveAddress);
              break;
            // 8 cycles
            case 39:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageMode();
              this.RLA(effectiveAddress);
              break;
            // 5 cycles
            case 55:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageXMode();
              this.RLA(effectiveAddress);
              break;
            // 6 cycles
            case 47:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteMode();
              this.RLA(effectiveAddress);
              break;
            // 6 cycles
            case 63:
              this.operationFlags = F_DOUBLE_READ;
              effectiveAddress = this.absoluteXMode();
              this.RLA(effectiveAddress);
              break;
            // 7 cycles
            case 59:
              this.operationFlags = F_DOUBLE_READ;
              effectiveAddress = this.absoluteYMode();
              this.RLA(effectiveAddress);
              break;
            // 7 cycles
            case 35:
              this.operationFlags = 0;
              effectiveAddress = this.indirectXMode();
              this.RLA(effectiveAddress);
              break;
            // 8 cycles
            case 51:
              this.operationFlags = F_DOUBLE_READ;
              effectiveAddress = this.indirectYMode();
              this.RLA(effectiveAddress);
              break;
            // 8 cycles
            case 139:
              this.operationFlags = 0;
              effectiveAddress = this.immediateMode();
              this.XAA(effectiveAddress);
              break;
            // 2 cycles
            case 103:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageMode();
              this.RRA(effectiveAddress);
              break;
            // 5 cycles
            case 119:
              this.operationFlags = 0;
              effectiveAddress = this.zeroPageXMode();
              this.RRA(effectiveAddress);
              break;
            // 6 cycles
            case 111:
              this.operationFlags = 0;
              effectiveAddress = this.absoluteMode();
              this.RRA(effectiveAddress);
              break;
            // 6 cycles
            case 127:
              this.operationFlags = F_DOUBLE_READ;
              effectiveAddress = this.absoluteXMode();
              this.RRA(effectiveAddress);
              break;
            // 7 cycles
            case 123:
              this.operationFlags = F_DOUBLE_READ;
              effectiveAddress = this.absoluteYMode();
              this.RRA(effectiveAddress);
              break;
            // 7 cycles
            case 99:
              this.operationFlags = 0;
              effectiveAddress = this.indirectXMode();
              this.RRA(effectiveAddress);
              break;
            // 8 cycles
            case 115:
              this.operationFlags = F_DOUBLE_READ;
              effectiveAddress = this.indirectYMode();
              this.RRA(effectiveAddress);
              break;
            // 8 cycles
            case 203:
              this.operationFlags = 0;
              effectiveAddress = this.immediateMode();
              this.AXS(effectiveAddress);
              break;
            // 2 cycles
            case 11:
              this.operationFlags = 0;
              effectiveAddress = this.immediateMode();
              this.ANC(effectiveAddress);
              break;
            // 2 cycles
            case 43:
              this.operationFlags = 0;
              effectiveAddress = this.immediateMode();
              this.ANC(effectiveAddress);
              break;
            // 2 cycles
            case 75:
              this.operationFlags = 0;
              effectiveAddress = this.immediateMode();
              this.ALR(effectiveAddress);
              break;
            // 2 cycles
            case 107:
              this.operationFlags = 0;
              effectiveAddress = this.immediateMode();
              this.ARR(effectiveAddress);
              break;
            // 2 cycles
            case 155:
              this.operationFlags = F_DOUBLE_READ;
              effectiveAddress = this.absoluteYMode();
              this.TAS(effectiveAddress);
              break;
            // 5 cycles
            default:
              break;
          }
        };
        CPU2.prototype.beforeOperation = function(operation) {
          this.irqDisabled = this.interruptFlag;
          this.operationFlags = operation[2];
        };
        CPU2.prototype.executeOperation = function(_a) {
          var instruction = _a[0], addressingMode = _a[1], cycles = _a[2];
          var effectiveAddress = addressingMode.call(this);
          instruction.call(this, effectiveAddress);
        };
        CPU2.prototype.readOperation = function() {
          return;
        };
        CPU2.prototype.readNextProgramByte = function() {
          return this.readByte(this.moveProgramCounter(1));
        };
        CPU2.prototype.readNextProgramWord = function() {
          return this.readWord(this.moveProgramCounter(2));
        };
        CPU2.prototype.moveProgramCounter = function(size) {
          var result = this.programCounter;
          this.programCounter = this.programCounter + size & 65535;
          return result;
        };
        CPU2.prototype.readByte = function(address) {
          this.tick();
          return this.cpuMemory.read(address);
        };
        CPU2.prototype.readWord = function(address) {
          var highAddress = address + 1 & 65535;
          var lowByte = this.readByte(address);
          var highByte = this.readByte(highAddress);
          return highByte << 8 | lowByte;
        };
        CPU2.prototype.readWordFromSamePage = function(address) {
          var highAddress = address & 65280 | address + 1 & 255;
          var lowByte = this.readByte(address);
          var highByte = this.readByte(highAddress);
          return highByte << 8 | lowByte;
        };
        CPU2.prototype.writeByte = function(address, value) {
          this.tick();
          this.cpuMemory.write(address, value);
          return value;
        };
        CPU2.prototype.writeWord = function(address, value) {
          this.writeByte(address, value & 255);
          return this.writeByte(address + 1 & 65535, value >>> 8);
        };
        CPU2.prototype.readWriteByte = function(address) {
          var value = this.readByte(address);
          return this.writeByte(address, value);
        };
        CPU2.prototype.pushByte = function(value) {
          this.writeByte(256 + this.stackPointer, value);
          this.stackPointer = this.stackPointer - 1 & 255;
        };
        CPU2.prototype.pushWord = function(value) {
          this.pushByte(value >>> 8);
          this.pushByte(value & 255);
        };
        CPU2.prototype.popByte = function() {
          this.stackPointer = this.stackPointer + 1 & 255;
          return this.readByte(256 + this.stackPointer);
        };
        CPU2.prototype.popWord = function() {
          return this.popByte() | this.popByte() << 8;
        };
        CPU2.prototype.getStatus = function() {
          return this.carryFlag | this.zeroFlag << 1 | this.interruptFlag << 2 | this.decimalFlag << 3 | 1 << 5 | this.overflowFlag << 6 | this.negativeFlag << 7;
        };
        CPU2.prototype.setStatus = function(value) {
          this.carryFlag = value & 1;
          this.zeroFlag = value >>> 1 & 1;
          this.interruptFlag = value >>> 2 & 1;
          this.decimalFlag = value >>> 3 & 1;
          this.overflowFlag = value >>> 6 & 1;
          this.negativeFlag = value >>> 7;
        };
        CPU2.prototype.activateInterrupt = function(type) {
          this.activeInterrupts |= type;
        };
        CPU2.prototype.clearInterrupt = function(type) {
          this.activeInterrupts &= ~type;
        };
        CPU2.prototype.tick = function() {
          this.dma.tick();
          this.ppu.tick();
          this.ppu.tick();
          this.ppu.tick();
        };
        CPU2.prototype.impliedMode = function() {
          this.tick();
        };
        CPU2.prototype.accumulatorMode = function() {
          this.tick();
        };
        CPU2.prototype.immediateMode = function() {
          return this.moveProgramCounter(1);
        };
        CPU2.prototype.zeroPageMode = function() {
          return this.readNextProgramByte();
        };
        CPU2.prototype.zeroPageXMode = function() {
          return this.computeZeroPageAddress(this.readNextProgramByte(), this.registerX);
        };
        CPU2.prototype.zeroPageYMode = function() {
          return this.computeZeroPageAddress(this.readNextProgramByte(), this.registerY);
        };
        CPU2.prototype.absoluteMode = function() {
          return this.readNextProgramWord();
        };
        CPU2.prototype.absoluteXMode = function() {
          return this.computeAbsoluteAddress(this.readNextProgramWord(), this.registerX);
        };
        CPU2.prototype.absoluteYMode = function() {
          return this.computeAbsoluteAddress(this.readNextProgramWord(), this.registerY);
        };
        CPU2.prototype.relativeMode = function() {
          var value = this.readNextProgramByte();
          var offset = value & 128 ? value - 256 : value;
          return this.programCounter + offset & 65535;
        };
        CPU2.prototype.indirectMode = function() {
          return this.readWordFromSamePage(this.readNextProgramWord());
        };
        CPU2.prototype.indirectXMode = function() {
          return this.readWordFromSamePage(this.zeroPageXMode());
        };
        CPU2.prototype.indirectYMode = function() {
          var base = this.readWordFromSamePage(this.readNextProgramByte());
          return this.computeAbsoluteAddress(base, this.registerY);
        };
        CPU2.prototype.computeZeroPageAddress = function(base, offset) {
          this.readByte(base);
          return base + offset & 255;
        };
        CPU2.prototype.computeAbsoluteAddress = function(base, offset) {
          var result = base + offset & 65535;
          this.pageCrossed = isDifferentPage(base, result);
          if (this.operationFlags & F_DOUBLE_READ || this.pageCrossed) {
            this.readByte(base & 65280 | result & 255);
          }
          return result;
        };
        CPU2.prototype.NOP = function() {
          if (this.operationFlags & F_EXTRA_CYCLE) {
            this.tick();
          }
        };
        CPU2.prototype.CLC = function() {
          this.carryFlag = 0;
        };
        CPU2.prototype.CLI = function() {
          this.irqDisabled = this.interruptFlag;
          this.interruptFlag = 0;
        };
        CPU2.prototype.CLD = function() {
          this.decimalFlag = 0;
        };
        CPU2.prototype.CLV = function() {
          this.overflowFlag = 0;
        };
        CPU2.prototype.SEC = function() {
          this.carryFlag = 1;
        };
        CPU2.prototype.SEI = function() {
          this.irqDisabled = this.interruptFlag;
          this.interruptFlag = 1;
        };
        CPU2.prototype.SED = function() {
          this.decimalFlag = 1;
        };
        CPU2.prototype.STA = function(address) {
          this.writeByte(address, this.accumulator);
        };
        CPU2.prototype.STX = function(address) {
          this.writeByte(address, this.registerX);
        };
        CPU2.prototype.SAX = function(address) {
          this.writeByte(address, this.accumulator & this.registerX);
        };
        CPU2.prototype.STY = function(address) {
          this.writeByte(address, this.registerY);
        };
        CPU2.prototype.SHA = function(address) {
          this.storeHighAddressIntoMemory(address, this.accumulator & this.registerX);
        };
        CPU2.prototype.SHX = function(address) {
          this.storeHighAddressIntoMemory(address, this.registerX);
        };
        CPU2.prototype.SHY = function(address) {
          this.storeHighAddressIntoMemory(address, this.registerY);
        };
        CPU2.prototype.LDA = function(address) {
          this.storeValueIntoAccumulator(this.readByte(address));
        };
        CPU2.prototype.LDX = function(address) {
          this.storeValueIntoRegisterX(this.readByte(address));
        };
        CPU2.prototype.LDY = function(address) {
          this.storeValueIntoRegisterY(this.readByte(address));
        };
        CPU2.prototype.LAX = function(address) {
          var value = this.readByte(address);
          this.storeValueIntoAccumulator(value);
          this.storeValueIntoRegisterX(value);
        };
        CPU2.prototype.LAS = function(address) {
          this.stackPointer &= this.readByte(address);
          this.storeValueIntoAccumulator(this.stackPointer);
          this.storeValueIntoRegisterX(this.stackPointer);
        };
        CPU2.prototype.TAX = function() {
          this.storeValueIntoRegisterX(this.accumulator);
        };
        CPU2.prototype.TAY = function() {
          this.storeValueIntoRegisterY(this.accumulator);
        };
        CPU2.prototype.TXA = function() {
          this.storeValueIntoAccumulator(this.registerX);
        };
        CPU2.prototype.TYA = function() {
          this.storeValueIntoAccumulator(this.registerY);
        };
        CPU2.prototype.TSX = function() {
          this.storeValueIntoRegisterX(this.stackPointer);
        };
        CPU2.prototype.TXS = function() {
          this.stackPointer = this.registerX;
        };
        CPU2.prototype.PHA = function() {
          this.pushByte(this.accumulator);
        };
        CPU2.prototype.PHP = function() {
          this.pushByte(this.getStatus() | 16);
        };
        CPU2.prototype.PLA = function() {
          this.tick();
          this.storeValueIntoAccumulator(this.popByte());
        };
        CPU2.prototype.PLP = function() {
          this.tick();
          this.irqDisabled = this.interruptFlag;
          this.setStatus(this.popByte());
        };
        CPU2.prototype.AND = function(address) {
          return this.storeValueIntoAccumulator(this.accumulator & this.readByte(address));
        };
        CPU2.prototype.ORA = function(address) {
          this.storeValueIntoAccumulator(this.accumulator | this.readByte(address));
        };
        CPU2.prototype.EOR = function(address) {
          this.storeValueIntoAccumulator(this.accumulator ^ this.readByte(address));
        };
        CPU2.prototype.BIT = function(address) {
          var value = this.readByte(address);
          this.zeroFlag = !(this.accumulator & value) | 0;
          this.overflowFlag = value >>> 6 & 1;
          this.negativeFlag = value >>> 7;
        };
        CPU2.prototype.INC = function(address) {
          return this.storeValueIntoMemory(address, this.readWriteByte(address) + 1 & 255);
        };
        CPU2.prototype.INX = function() {
          this.storeValueIntoRegisterX(this.registerX + 1 & 255);
        };
        CPU2.prototype.INY = function() {
          this.storeValueIntoRegisterY(this.registerY + 1 & 255);
        };
        CPU2.prototype.DEC = function(address) {
          return this.storeValueIntoMemory(address, this.readWriteByte(address) - 1 & 255);
        };
        CPU2.prototype.DEX = function() {
          this.storeValueIntoRegisterX(this.registerX - 1 & 255);
        };
        CPU2.prototype.DEY = function() {
          this.storeValueIntoRegisterY(this.registerY - 1 & 255);
        };
        CPU2.prototype.CMP = function(address) {
          this.compareRegisterAndMemory(this.accumulator, address);
        };
        CPU2.prototype.CPX = function(address) {
          this.compareRegisterAndMemory(this.registerX, address);
        };
        CPU2.prototype.CPY = function(address) {
          this.compareRegisterAndMemory(this.registerY, address);
        };
        CPU2.prototype.BCC = function(address) {
          this.branchIf(!this.carryFlag, address);
        };
        CPU2.prototype.BCS = function(address) {
          this.branchIf(this.carryFlag, address);
        };
        CPU2.prototype.BNE = function(address) {
          this.branchIf(!this.zeroFlag, address);
        };
        CPU2.prototype.BEQ = function(address) {
          this.branchIf(this.zeroFlag, address);
        };
        CPU2.prototype.BVC = function(address) {
          this.branchIf(!this.overflowFlag, address);
        };
        CPU2.prototype.BVS = function(address) {
          this.branchIf(this.overflowFlag, address);
        };
        CPU2.prototype.BPL = function(address) {
          this.branchIf(!this.negativeFlag, address);
        };
        CPU2.prototype.BMI = function(address) {
          this.branchIf(this.negativeFlag, address);
        };
        CPU2.prototype.JMP = function(address) {
          this.programCounter = address;
        };
        CPU2.prototype.JSR = function(address) {
          this.tick();
          this.pushWord(this.programCounter - 1 & 65535);
          this.programCounter = address;
        };
        CPU2.prototype.RTS = function() {
          this.tick();
          this.tick();
          this.programCounter = this.popWord() + 1 & 65535;
        };
        CPU2.prototype.BRK = function() {
          this.moveProgramCounter(1);
          this.pushWord(this.programCounter);
          this.pushByte(this.getStatus() | 16);
          this.irqDisabled = 1;
          this.interruptFlag = 1;
          this.programCounter = this.readWord(this.activeInterrupts & interrupts_1.NMI ? NMI_ADDRESS : IRQ_ADDRESS);
        };
        CPU2.prototype.RTI = function() {
          this.tick();
          this.setStatus(this.popByte());
          this.irqDisabled = this.interruptFlag;
          this.programCounter = this.popWord();
        };
        CPU2.prototype.ADC = function(address) {
          this.addValueToAccumulator(this.readByte(address));
        };
        CPU2.prototype.SBC = function(address) {
          this.addValueToAccumulator(this.readByte(address) ^ 255);
        };
        CPU2.prototype.ASL = function(address) {
          return this.rotateAccumulatorOrMemory(address, this.rotateLeft, false);
        };
        CPU2.prototype.LSR = function(address) {
          return this.rotateAccumulatorOrMemory(address, this.rotateRight, false);
        };
        CPU2.prototype.ROL = function(address) {
          return this.rotateAccumulatorOrMemory(address, this.rotateLeft, true);
        };
        CPU2.prototype.ROR = function(address) {
          return this.rotateAccumulatorOrMemory(address, this.rotateRight, true);
        };
        CPU2.prototype.DCP = function(address) {
          this.compareRegisterAndOperand(this.accumulator, this.DEC(address));
        };
        CPU2.prototype.ISB = function(address) {
          this.addValueToAccumulator(this.INC(address) ^ 255);
        };
        CPU2.prototype.SLO = function(address) {
          this.storeValueIntoAccumulator(this.accumulator | this.ASL(address));
        };
        CPU2.prototype.SRE = function(address) {
          this.storeValueIntoAccumulator(this.accumulator ^ this.LSR(address));
        };
        CPU2.prototype.RLA = function(address) {
          this.storeValueIntoAccumulator(this.accumulator & this.ROL(address));
        };
        CPU2.prototype.XAA = function(address) {
          this.storeValueIntoAccumulator(this.registerX & this.AND(address));
        };
        CPU2.prototype.RRA = function(address) {
          this.addValueToAccumulator(this.ROR(address));
        };
        CPU2.prototype.AXS = function(address) {
          this.registerX = this.compareRegisterAndMemory(this.accumulator & this.registerX, address);
        };
        CPU2.prototype.ANC = function(address) {
          this.rotateLeft(this.AND(address), false);
        };
        CPU2.prototype.ALR = function(address) {
          this.AND(address);
          this.LSR(null);
        };
        CPU2.prototype.ARR = function(address) {
          this.AND(address);
          this.ROR(null);
          this.carryFlag = this.accumulator >>> 6 & 1;
          this.overflowFlag = this.accumulator >>> 5 & 1 ^ this.carryFlag;
        };
        CPU2.prototype.TAS = function(address) {
          this.stackPointer = this.accumulator & this.registerX;
          this.SHA(address);
        };
        CPU2.prototype.storeValueIntoAccumulator = function(value) {
          this.zeroFlag = !(value & 255) | 0;
          this.negativeFlag = value >>> 7 & 1;
          return this.accumulator = value;
        };
        CPU2.prototype.storeValueIntoRegisterX = function(value) {
          this.zeroFlag = !(value & 255) | 0;
          this.negativeFlag = value >>> 7 & 1;
          this.registerX = value;
        };
        CPU2.prototype.storeValueIntoRegisterY = function(value) {
          this.zeroFlag = !(value & 255) | 0;
          this.negativeFlag = value >>> 7 & 1;
          this.registerY = value;
        };
        CPU2.prototype.storeValueIntoMemory = function(address, value) {
          this.zeroFlag = !(value & 255) | 0;
          this.negativeFlag = value >>> 7 & 1;
          return this.writeByte(address, value);
        };
        CPU2.prototype.storeHighAddressIntoMemory = function(address, register) {
          if (this.pageCrossed) {
            this.writeByte(address, this.cpuMemory.read(address));
          } else {
            this.writeByte(address, register & (address >>> 8) + 1);
          }
        };
        CPU2.prototype.addValueToAccumulator = function(operand) {
          var result = this.accumulator + operand + this.carryFlag;
          this.carryFlag = result >>> 8 & 1;
          this.overflowFlag = ((this.accumulator ^ result) & (operand ^ result)) >>> 7 & 1;
          return this.storeValueIntoAccumulator(result & 255);
        };
        CPU2.prototype.compareRegisterAndMemory = function(register, address) {
          return this.compareRegisterAndOperand(register, this.readByte(address));
        };
        CPU2.prototype.compareRegisterAndOperand = function(register, operand) {
          var result = register - operand;
          this.carryFlag = result >= 0 | 0;
          this.zeroFlag = !(result & 255) | 0;
          this.negativeFlag = result >>> 7 & 1;
          return result & 255;
        };
        CPU2.prototype.branchIf = function(condition, address) {
          if (condition) {
            this.tick();
            if (isDifferentPage(this.programCounter, address)) {
              this.tick();
            }
            this.programCounter = address;
          }
        };
        CPU2.prototype.rotateAccumulatorOrMemory = function(address, rotation, transferCarry) {
          if (address != null) {
            var result_1 = rotation.call(this, this.readWriteByte(address), transferCarry);
            return this.storeValueIntoMemory(address, result_1);
          }
          var result = rotation.call(this, this.accumulator, transferCarry);
          return this.storeValueIntoAccumulator(result);
        };
        CPU2.prototype.rotateLeft = function(value, transferCarry) {
          var carry = transferCarry & this.carryFlag;
          this.carryFlag = value >>> 7;
          return (value << 1 | carry) & 255;
        };
        CPU2.prototype.rotateRight = function(value, transferCarry) {
          var carry = (transferCarry & this.carryFlag) << 7;
          this.carryFlag = value & 1;
          return value >>> 1 | carry;
        };
        CPU2.prototype.updateZeroAndNegativeFlag = function(value) {
          this.zeroFlag = !(value & 255) | 0;
          this.negativeFlag = value >>> 7 & 1;
        };
        return CPU2;
      }()
    );
    exports2.default = CPU;
    function isDifferentPage(address1, address2) {
      return (address1 & 65280) !== (address2 & 65280);
    }
  }
});

// dist/cfxnes-core/proc/index.js
var require_proc = __commonJS({
  "dist/cfxnes-core/proc/index.js": function(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || /* @__PURE__ */ function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    }();
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Interrupt = exports2.CPU = void 0;
    var Interrupt = __importStar(require_interrupts());
    exports2.Interrupt = Interrupt;
    var CPU_1 = require_CPU();
    Object.defineProperty(exports2, "CPU", { enumerable: true, get: function() {
      return __importDefault2(CPU_1).default;
    } });
  }
});

// dist/cfxnes-core/audio/channels/constants.js
var require_constants2 = __commonJS({
  "dist/cfxnes-core/audio/channels/constants.js": function(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.LENGTH_COUNTER_VALUES = void 0;
    exports2.LENGTH_COUNTER_VALUES = [
      10,
      254,
      20,
      2,
      40,
      4,
      80,
      6,
      160,
      8,
      60,
      10,
      14,
      12,
      26,
      14,
      // 00-0F
      12,
      16,
      24,
      18,
      48,
      20,
      96,
      22,
      192,
      24,
      72,
      26,
      16,
      28,
      32,
      30
      // 10-1F
    ];
  }
});

// dist/cfxnes-core/audio/channels/Pulse.js
var require_Pulse = __commonJS({
  "dist/cfxnes-core/audio/channels/Pulse.js": function(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var common_1 = require_common();
    var constants_1 = require_constants2();
    var DUTY_WAVEFORMS = [
      [0, 1, 0, 0, 0, 0, 0, 0],
      // _X______ (12.5%)
      [0, 1, 1, 0, 0, 0, 0, 0],
      // _XX_____ (25%)
      [0, 1, 1, 1, 1, 0, 0, 0],
      // _XXXX___ (50%)
      [1, 0, 0, 1, 1, 1, 1, 1]
      // X__XXXXX (25% negated)
    ];
    var Pulse = (
      /** @class */
      function() {
        function Pulse2(id) {
          common_1.log.info("Initializing pulse channel #".concat(id));
          this.id = id;
          this.enabled = false;
          this.gain = 1;
          this.timerCycle = 0;
          this.timerPeriod = 0;
          this.lengthCounter = 0;
          this.lengthCounterHalt = false;
          this.useConstantVolume = false;
          this.constantVolume = 0;
          this.envelopeReset = false;
          this.envelopeCycle = 0;
          this.envelopeVolume = 0;
          this.envelopeLoop = false;
          this.envelopePeriod = 0;
          this.sweepEnabled = false;
          this.sweepCycle = 0;
          this.sweepReset = false;
          this.sweepNegate = false;
          this.sweepPeriod = 0;
          this.sweepShift = 0;
          this.dutyPosition = 0;
          this.dutySelection = 0;
        }
        Pulse2.prototype.reset = function() {
          common_1.log.info("Resetting pulse channel #".concat(this.id));
          this.timerCycle = 0;
          this.timerPeriod = 0;
          this.envelopeCycle = 0;
          this.envelopeVolume = 0;
          this.sweepCycle = 0;
          this.setEnabled(false);
          this.writeDutyEnvelope(0);
          this.writeSweep(0);
          this.writeTimer(0);
          this.writeLengthCounter(0);
        };
        Pulse2.prototype.setEnabled = function(enabled) {
          if (!enabled) {
            this.lengthCounter = 0;
          }
          this.enabled = enabled;
        };
        Pulse2.prototype.writeDutyEnvelope = function(value) {
          this.dutySelection = (value & 192) >>> 6;
          this.lengthCounterHalt = (value & 32) !== 0;
          this.useConstantVolume = (value & 16) !== 0;
          this.constantVolume = value & 15;
          this.envelopeLoop = this.lengthCounterHalt;
          this.envelopePeriod = this.constantVolume;
        };
        Pulse2.prototype.writeSweep = function(value) {
          this.sweepEnabled = (value & 128) !== 0;
          this.sweepPeriod = (value & 112) >>> 4;
          this.sweepNegate = (value & 8) !== 0;
          this.sweepShift = value & 7;
          this.sweepReset = true;
        };
        Pulse2.prototype.writeTimer = function(value) {
          this.timerPeriod = this.timerPeriod & 1792 | value & 255;
        };
        Pulse2.prototype.writeLengthCounter = function(value) {
          if (this.enabled) {
            this.lengthCounter = constants_1.LENGTH_COUNTER_VALUES[(value & 248) >>> 3];
          }
          this.timerPeriod = this.timerPeriod & 255 | (value & 7) << 8;
          this.dutyPosition = 0;
          this.envelopeReset = true;
        };
        Pulse2.prototype.tick = function() {
          if (--this.timerCycle <= 0) {
            this.timerCycle = this.timerPeriod + 1 << 1;
            this.dutyPosition = this.dutyPosition + 1 & 7;
          }
        };
        Pulse2.prototype.tickQuarterFrame = function() {
          this.updateEnvelope();
        };
        Pulse2.prototype.tickHalfFrame = function() {
          this.updateLengthCounter();
          this.updateSweep();
        };
        Pulse2.prototype.updateEnvelope = function() {
          if (this.envelopeReset) {
            this.envelopeReset = false;
            this.envelopeCycle = this.envelopePeriod;
            this.envelopeVolume = 15;
          } else if (this.envelopeCycle > 0) {
            this.envelopeCycle--;
          } else {
            this.envelopeCycle = this.envelopePeriod;
            if (this.envelopeVolume > 0) {
              this.envelopeVolume--;
            } else if (this.envelopeLoop) {
              this.envelopeVolume = 15;
            }
          }
        };
        Pulse2.prototype.updateLengthCounter = function() {
          if (this.lengthCounter > 0 && !this.lengthCounterHalt) {
            this.lengthCounter--;
          }
        };
        Pulse2.prototype.updateSweep = function() {
          if (this.sweepCycle > 0) {
            this.sweepCycle--;
          } else {
            if (this.sweepEnabled && this.sweepShift && this.isTimerPeriodValid()) {
              this.timerPeriod += this.getSweep();
            }
            this.sweepCycle = this.sweepPeriod;
          }
          if (this.sweepReset) {
            this.sweepReset = false;
            this.sweepCycle = this.sweepPeriod;
          }
        };
        Pulse2.prototype.getSweep = function() {
          var sweep = this.timerPeriod >>> this.sweepShift;
          if (this.sweepNegate) {
            return this.id === 1 ? ~sweep : -sweep;
          }
          return sweep;
        };
        Pulse2.prototype.isTimerPeriodValid = function() {
          return this.timerPeriod >= 8 && this.timerPeriod + this.getSweep() < 2048;
        };
        Pulse2.prototype.getOutput = function() {
          if (this.lengthCounter && this.isTimerPeriodValid()) {
            var volume = this.useConstantVolume ? this.constantVolume : this.envelopeVolume;
            return this.gain * volume * DUTY_WAVEFORMS[this.dutySelection][this.dutyPosition];
          }
          return 0;
        };
        return Pulse2;
      }()
    );
    exports2.default = Pulse;
  }
});

// dist/cfxnes-core/audio/channels/Triangle.js
var require_Triangle = __commonJS({
  "dist/cfxnes-core/audio/channels/Triangle.js": function(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var common_1 = require_common();
    var constants_1 = require_constants2();
    var DUTY_WAVEFORM = [
      15,
      14,
      13,
      12,
      11,
      10,
      9,
      8,
      7,
      6,
      5,
      4,
      3,
      2,
      1,
      0,
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15
    ];
    var Triangle = (
      /** @class */
      function() {
        function Triangle2() {
          common_1.log.info("Initializing triangle channel");
          this.enabled = false;
          this.gain = 1;
          this.timerCycle = 0;
          this.timerPeriod = 0;
          this.lengthCounter = 0;
          this.lengthCounterHalt = false;
          this.linearCounter = 0;
          this.linearCounterMax = 0;
          this.linearCounterControl = false;
          this.linearCounterReset = false;
          this.dutyPosition = 15;
        }
        Triangle2.prototype.reset = function() {
          common_1.log.info("Resetting triangle channel");
          this.timerCycle = 0;
          this.timerPeriod = 0;
          this.dutyPosition = 0;
          this.linearCounter = 0;
          this.setEnabled(false);
          this.writeLinearCounter(0);
          this.writeTimer(0);
          this.writeLengthCounter(0);
        };
        Triangle2.prototype.setEnabled = function(enabled) {
          if (!enabled) {
            this.lengthCounter = 0;
          }
          this.enabled = enabled;
        };
        Triangle2.prototype.writeLinearCounter = function(value) {
          this.lengthCounterHalt = (value & 128) !== 0;
          this.linearCounterMax = value & 127;
          this.linearCounterControl = this.lengthCounterHalt;
        };
        Triangle2.prototype.writeTimer = function(value) {
          this.timerPeriod = this.timerPeriod & 1792 | value & 255;
        };
        Triangle2.prototype.writeLengthCounter = function(value) {
          if (this.enabled) {
            this.lengthCounter = constants_1.LENGTH_COUNTER_VALUES[(value & 248) >>> 3];
          }
          this.timerPeriod = this.timerPeriod & 255 | (value & 7) << 8;
          this.linearCounterReset = true;
        };
        Triangle2.prototype.tick = function() {
          if (--this.timerCycle <= 0) {
            this.timerCycle = this.timerPeriod + 1;
            if (this.lengthCounter && this.linearCounter && this.timerPeriod > 3) {
              this.dutyPosition = this.dutyPosition + 1 & 31;
            }
          }
        };
        Triangle2.prototype.tickQuarterFrame = function() {
          this.updateLinearCounter();
        };
        Triangle2.prototype.tickHalfFrame = function() {
          this.updateLengthCounter();
        };
        Triangle2.prototype.updateLinearCounter = function() {
          if (this.linearCounterReset) {
            this.linearCounter = this.linearCounterMax;
          } else if (this.linearCounter > 0) {
            this.linearCounter--;
          }
          if (!this.linearCounterControl) {
            this.linearCounterReset = false;
          }
        };
        Triangle2.prototype.updateLengthCounter = function() {
          if (this.lengthCounter > 0 && !this.lengthCounterHalt) {
            this.lengthCounter--;
          }
        };
        Triangle2.prototype.getOutput = function() {
          return this.gain * DUTY_WAVEFORM[this.dutyPosition];
        };
        return Triangle2;
      }()
    );
    exports2.default = Triangle;
  }
});

// dist/cfxnes-core/audio/channels/Noise.js
var require_Noise = __commonJS({
  "dist/cfxnes-core/audio/channels/Noise.js": function(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var common_1 = require_common();
    var constants_1 = require_constants2();
    var Noise = (
      /** @class */
      function() {
        function Noise2() {
          common_1.log.info("Initializing noise channel");
          this.enabled = false;
          this.gain = 1;
          this.timerMode = false;
          this.timerCycle = 0;
          this.timerPeriod = 0;
          this.timerPeriods = null;
          this.lengthCounter = 0;
          this.lengthCounterHalt = false;
          this.useConstantVolume = false;
          this.constantVolume = 0;
          this.envelopeReset = false;
          this.envelopeCycle = 0;
          this.envelopeVolume = 0;
          this.envelopeLoop = false;
          this.envelopePeriod = 0;
          this.shiftRegister = 0;
        }
        Noise2.prototype.reset = function() {
          common_1.log.info("Resetting noise channel");
          this.timerCycle = 0;
          this.envelopeCycle = 0;
          this.envelopeVolume = 0;
          this.shiftRegister = 1;
          this.setEnabled(false);
          this.writeEnvelope(0);
          this.writeTimer(0);
          this.writeLengthCounter(0);
        };
        Noise2.prototype.setEnabled = function(enabled) {
          if (!enabled) {
            this.lengthCounter = 0;
          }
          this.enabled = enabled;
        };
        Noise2.prototype.setRegionParams = function(params) {
          this.timerPeriods = params.noiseChannelTimerPeriods;
        };
        Noise2.prototype.writeEnvelope = function(value) {
          this.lengthCounterHalt = (value & 32) !== 0;
          this.useConstantVolume = (value & 16) !== 0;
          this.constantVolume = value & 15;
          this.envelopeLoop = this.lengthCounterHalt;
          this.envelopePeriod = this.constantVolume;
        };
        Noise2.prototype.writeTimer = function(value) {
          this.timerMode = (value & 128) !== 0;
          this.timerPeriod = this.timerPeriods[value & 15];
        };
        Noise2.prototype.writeLengthCounter = function(value) {
          if (this.enabled) {
            this.lengthCounter = constants_1.LENGTH_COUNTER_VALUES[(value & 248) >>> 3];
          }
          this.envelopeReset = true;
        };
        Noise2.prototype.tick = function() {
          if (--this.timerCycle <= 0) {
            this.timerCycle = this.timerPeriod;
            this.updateShiftRegister();
          }
        };
        Noise2.prototype.tickQuarterFrame = function() {
          this.updateEnvelope();
        };
        Noise2.prototype.tickHalfFrame = function() {
          this.updateLengthCounter();
        };
        Noise2.prototype.updateShiftRegister = function() {
          var feedbackPosition = this.timerMode ? 6 : 1;
          var feedbackValue = this.shiftRegister & 1 ^ this.shiftRegister >>> feedbackPosition & 1;
          this.shiftRegister = this.shiftRegister >>> 1 | feedbackValue << 14;
        };
        Noise2.prototype.updateEnvelope = function() {
          if (this.envelopeReset) {
            this.envelopeReset = false;
            this.envelopeCycle = this.envelopePeriod;
            this.envelopeVolume = 15;
          } else if (this.envelopeCycle > 0) {
            this.envelopeCycle--;
          } else {
            this.envelopeCycle = this.envelopePeriod;
            if (this.envelopeVolume > 0) {
              this.envelopeVolume--;
            } else if (this.envelopeLoop) {
              this.envelopeVolume = 15;
            }
          }
        };
        Noise2.prototype.updateLengthCounter = function() {
          if (this.lengthCounter > 0 && !this.lengthCounterHalt) {
            this.lengthCounter--;
          }
        };
        Noise2.prototype.getOutput = function() {
          if (this.lengthCounter && !(this.shiftRegister & 1)) {
            var volume = this.useConstantVolume ? this.constantVolume : this.envelopeVolume;
            return this.gain * volume;
          }
          return 0;
        };
        return Noise2;
      }()
    );
    exports2.default = Noise;
  }
});

// dist/cfxnes-core/audio/channels/DMC.js
var require_DMC = __commonJS({
  "dist/cfxnes-core/audio/channels/DMC.js": function(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var common_1 = require_common();
    var interrupts_1 = require_interrupts();
    var DMC = (
      /** @class */
      function() {
        function DMC2() {
          common_1.log.info("Initializing DMC channel");
          this.enabled = false;
          this.output = 0;
          this.gain = 1;
          this.timerCycle = 0;
          this.timerPeriod = 0;
          this.timerPeriods = null;
          this.sampleAddress = 0;
          this.sampleLength = 0;
          this.sampleCurrentAddress = 0;
          this.sampleRemainingLength = 0;
          this.sampleLoop = false;
          this.sampleBuffer = -1;
          this.shiftRegister = -1;
          this.shiftRegisterBits = 0;
          this.memoryAccessCycles = 0;
          this.irqEnabled = false;
          this.irqActive = false;
          this.cpu = null;
          this.cpuMemory = null;
        }
        DMC2.prototype.connect = function(nes) {
          common_1.log.info("Connecting DMC channel");
          this.cpu = nes.cpu;
          this.cpuMemory = nes.cpuMemory;
        };
        DMC2.prototype.reset = function() {
          common_1.log.info("Resetting DMC channel");
          this.timerCycle = 0;
          this.sampleBuffer = -1;
          this.shiftRegister = -1;
          this.shiftRegisterBits = 0;
          this.memoryAccessCycles = 0;
          this.setEnabled(false);
          this.writeFlagsTimer(0);
          this.writeOutputLevel(0);
          this.writeSampleAddress(0);
          this.writeSampleLength(0);
        };
        DMC2.prototype.setEnabled = function(enabled) {
          if (!enabled) {
            this.sampleRemainingLength = 0;
          } else if (this.sampleRemainingLength === 0) {
            this.sampleCurrentAddress = this.sampleAddress;
            this.sampleRemainingLength = this.sampleLength;
          }
          this.enabled = enabled;
          this.clearIRQ();
        };
        DMC2.prototype.setRegionParams = function(params) {
          this.timerPeriods = params.dmcChannelTimerPeriods;
        };
        DMC2.prototype.activateIRQ = function() {
          this.irqActive = true;
          this.cpu.activateInterrupt(interrupts_1.IRQ_DMC);
        };
        DMC2.prototype.clearIRQ = function() {
          this.irqActive = false;
          this.cpu.clearInterrupt(interrupts_1.IRQ_DMC);
        };
        DMC2.prototype.writeFlagsTimer = function(value) {
          this.irqEnabled = (value & 128) !== 0;
          this.sampleLoop = (value & 64) !== 0;
          this.timerPeriod = this.timerPeriods[value & 15];
          if (!this.irqEnabled) {
            this.clearIRQ();
          }
        };
        DMC2.prototype.writeOutputLevel = function(value) {
          this.output = value & 127;
        };
        DMC2.prototype.writeSampleAddress = function(value) {
          this.sampleAddress = 49152 | (value & 255) << 6;
        };
        DMC2.prototype.writeSampleLength = function(value) {
          this.sampleLength = (value & 255) << 4 | 1;
        };
        DMC2.prototype.tick = function() {
          if (this.memoryAccessCycles > 0) {
            this.memoryAccessCycles--;
          }
          if (--this.timerCycle <= 0) {
            this.timerCycle = this.timerPeriod;
            this.updateSample();
          }
        };
        DMC2.prototype.updateSample = function() {
          this.updateSampleBuffer();
          this.updateShiftRegister();
          this.updateOutput();
        };
        DMC2.prototype.updateSampleBuffer = function() {
          if (this.sampleBuffer < 0 && this.sampleRemainingLength > 0) {
            this.sampleBuffer = this.cpuMemory.read(this.sampleCurrentAddress);
            this.memoryAccessCycles = 4;
            if (this.sampleCurrentAddress < 65535) {
              this.sampleCurrentAddress++;
            } else {
              this.sampleCurrentAddress = 32768;
            }
            if (--this.sampleRemainingLength <= 0) {
              if (this.sampleLoop) {
                this.sampleCurrentAddress = this.sampleAddress;
                this.sampleRemainingLength = this.sampleLength;
              } else if (this.irqEnabled) {
                this.activateIRQ();
              }
            }
          }
        };
        DMC2.prototype.updateShiftRegister = function() {
          if (--this.shiftRegisterBits <= 0) {
            this.shiftRegisterBits = 8;
            this.shiftRegister = this.sampleBuffer;
            this.sampleBuffer = -1;
          }
        };
        DMC2.prototype.updateOutput = function() {
          if (this.shiftRegister >= 0) {
            if (this.shiftRegister & 1) {
              if (this.output <= 125) {
                this.output += 2;
              }
            } else if (this.output >= 2) {
              this.output -= 2;
            }
            this.shiftRegister >>>= 1;
          }
        };
        DMC2.prototype.getOutput = function() {
          return this.gain * this.output;
        };
        return DMC2;
      }()
    );
    exports2.default = DMC;
  }
});

// dist/cfxnes-core/audio/channels/index.js
var require_channels = __commonJS({
  "dist/cfxnes-core/audio/channels/index.js": function(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DMC = exports2.Noise = exports2.Triangle = exports2.Pulse = void 0;
    var Pulse_1 = require_Pulse();
    Object.defineProperty(exports2, "Pulse", { enumerable: true, get: function() {
      return __importDefault2(Pulse_1).default;
    } });
    var Triangle_1 = require_Triangle();
    Object.defineProperty(exports2, "Triangle", { enumerable: true, get: function() {
      return __importDefault2(Triangle_1).default;
    } });
    var Noise_1 = require_Noise();
    Object.defineProperty(exports2, "Noise", { enumerable: true, get: function() {
      return __importDefault2(Noise_1).default;
    } });
    var DMC_1 = require_DMC();
    Object.defineProperty(exports2, "DMC", { enumerable: true, get: function() {
      return __importDefault2(DMC_1).default;
    } });
  }
});

// dist/cfxnes-core/audio/APU.js
var require_APU = __commonJS({
  "dist/cfxnes-core/audio/APU.js": function(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var common_1 = require_common();
    var interrupts_1 = require_interrupts();
    var channels_1 = require_channels();
    var TICKS_PER_FRAME = 29829.55;
    var APU = (
      /** @class */
      function() {
        function APU2() {
          common_1.log.info("Initializing APU");
          this.pulse1 = new channels_1.Pulse(1);
          this.pulse2 = new channels_1.Pulse(2);
          this.triangle = new channels_1.Triangle();
          this.noise = new channels_1.Noise();
          this.dmc = new channels_1.DMC();
          this.channels = [this.pulse1, this.pulse2, this.triangle, this.noise, this.dmc];
          this.frameCounter = -1;
          this.frameCounterMax4 = null;
          this.frameCounterMax5 = null;
          this.frameCounterResetDelay = 0;
          this.frameCounterLast = 0;
          this.frameFiveStepMode = false;
          this.frameStep = 0;
          this.frameIrqActive = false;
          this.frameIrqDisabled = false;
          this.sampleRate = 0;
          this.ticksToOutput = 0;
          this.ticksPerSecond = 0;
          this.callback = null;
          this.cpu = null;
        }
        APU2.prototype.connect = function(nes) {
          common_1.log.info("Connecting APU");
          this.cpu = nes.cpu;
          this.dmc.connect(nes);
        };
        APU2.prototype.reset = function() {
          common_1.log.info("Resetting APU");
          this.pulse1.reset();
          this.pulse2.reset();
          this.triangle.reset();
          this.noise.reset();
          this.dmc.reset();
          this.clearFrameIRQ();
          this.writeFrameCounter(0);
        };
        APU2.prototype.setRegionParams = function(params) {
          common_1.log.info("Setting APU region parameters");
          this.frameCounterMax4 = params.frameCounterMax4;
          this.frameCounterMax5 = params.frameCounterMax5;
          this.ticksPerSecond = TICKS_PER_FRAME * params.framesPerSecond;
          this.noise.setRegionParams(params);
          this.dmc.setRegionParams(params);
        };
        APU2.prototype.setSampleRate = function(rate) {
          this.sampleRate = rate;
        };
        APU2.prototype.getSampleRate = function() {
          return this.sampleRate;
        };
        APU2.prototype.setCallback = function(callback) {
          common_1.log.info((callback ? "Setting" : "Removing") + " APU callback");
          this.callback = callback;
        };
        APU2.prototype.getCallback = function() {
          return this.callback;
        };
        APU2.prototype.setVolume = function(id, volume) {
          common_1.log.info("Setting volume of APU channel #".concat(id, " to ").concat(volume));
          this.channels[id].gain = volume;
        };
        APU2.prototype.getVolume = function(id) {
          return this.channels[id].gain;
        };
        APU2.prototype.writeFrameCounter = function(value) {
          this.frameCounterLast = value;
          this.frameFiveStepMode = (value & 128) !== 0;
          this.frameIrqDisabled = (value & 64) !== 0;
          this.frameCounterResetDelay = 4;
          this.frameStep = 0;
          if (this.frameCounter < 0) {
            this.frameCounter = this.getFrameCounterMax();
          }
          if (this.frameIrqDisabled) {
            this.clearFrameIRQ();
          }
          if (this.frameFiveStepMode) {
            this.tickHalfFrame();
            this.tickQuarterFrame();
          }
        };
        APU2.prototype.getFrameCounterMax = function() {
          var maxValues = this.frameFiveStepMode ? this.frameCounterMax5 : this.frameCounterMax4;
          return maxValues[this.frameStep];
        };
        APU2.prototype.activateFrameIRQ = function() {
          this.frameIrqActive = true;
          this.cpu.activateInterrupt(interrupts_1.IRQ_APU);
        };
        APU2.prototype.clearFrameIRQ = function() {
          this.frameIrqActive = false;
          this.cpu.clearInterrupt(interrupts_1.IRQ_APU);
        };
        APU2.prototype.writePulseDutyEnvelope = function(id, value) {
          this.getPulse(id).writeDutyEnvelope(value);
        };
        APU2.prototype.writePulseSweep = function(id, value) {
          this.getPulse(id).writeSweep(value);
        };
        APU2.prototype.writePulseTimer = function(id, value) {
          this.getPulse(id).writeTimer(value);
        };
        APU2.prototype.writePulseLengthCounter = function(id, value) {
          this.getPulse(id).writeLengthCounter(value);
        };
        APU2.prototype.getPulse = function(id) {
          return id === 1 ? this.pulse1 : this.pulse2;
        };
        APU2.prototype.writeTriangleLinearCounter = function(value) {
          this.triangle.writeLinearCounter(value);
        };
        APU2.prototype.writeTriangleTimer = function(value) {
          this.triangle.writeTimer(value);
        };
        APU2.prototype.writeTriangleLengthCounter = function(value) {
          this.triangle.writeLengthCounter(value);
        };
        APU2.prototype.writeNoiseEnvelope = function(value) {
          this.noise.writeEnvelope(value);
        };
        APU2.prototype.writeNoiseTimer = function(value) {
          this.noise.writeTimer(value);
        };
        APU2.prototype.writeNoiseLengthCounter = function(value) {
          this.noise.writeLengthCounter(value);
        };
        APU2.prototype.writeDMCFlagsTimer = function(value) {
          this.dmc.writeFlagsTimer(value);
        };
        APU2.prototype.writeDMCOutputLevel = function(value) {
          this.dmc.writeOutputLevel(value);
        };
        APU2.prototype.writeDMCSampleAddress = function(value) {
          this.dmc.writeSampleAddress(value);
        };
        APU2.prototype.writeDMCSampleLength = function(value) {
          this.dmc.writeSampleLength(value);
        };
        APU2.prototype.writeStatus = function(value) {
          this.pulse1.setEnabled((value & 1) !== 0);
          this.pulse2.setEnabled((value & 2) !== 0);
          this.triangle.setEnabled((value & 4) !== 0);
          this.noise.setEnabled((value & 8) !== 0);
          this.dmc.setEnabled((value & 16) !== 0);
        };
        APU2.prototype.readStatus = function() {
          var value = this.getStatus();
          this.clearFrameIRQ();
          return value;
        };
        APU2.prototype.getStatus = function() {
          return this.pulse1.lengthCounter > 0 | (this.pulse2.lengthCounter > 0) << 1 | (this.triangle.lengthCounter > 0) << 2 | (this.noise.lengthCounter > 0) << 3 | (this.dmc.sampleRemainingLength > 0) << 4 | this.frameIrqActive << 6 | this.dmc.irqActive << 7;
        };
        APU2.prototype.isBlockingCPU = function() {
          return this.dmc.memoryAccessCycles > 0;
        };
        APU2.prototype.isBlockingDMA = function() {
          return this.dmc.memoryAccessCycles > 2;
        };
        APU2.prototype.tick = function() {
          this.tickFrameCounter();
          this.pulse1.tick();
          this.pulse2.tick();
          this.triangle.tick();
          this.noise.tick();
          this.dmc.tick();
          this.tickOutput();
        };
        APU2.prototype.tickFrameCounter = function() {
          if (this.frameCounterResetDelay && --this.frameCounterResetDelay <= 0) {
            this.frameCounter = this.getFrameCounterMax();
          }
          if (--this.frameCounter <= 0) {
            this.tickFrameStep();
          }
        };
        APU2.prototype.tickFrameStep = function() {
          this.frameStep = (this.frameStep + 1) % 6;
          this.frameCounter = this.getFrameCounterMax();
          switch (this.frameStep) {
            case 1:
              this.tickQuarterFrame();
              break;
            case 2:
              this.tickQuarterFrame();
              this.tickHalfFrame();
              break;
            case 3:
              this.tickQuarterFrame();
              break;
            case 4:
              this.tickFrameIRQ();
              break;
            case 5:
              this.tickQuarterFrame();
              this.tickHalfFrame();
              this.tickFrameIRQ();
              break;
            case 0:
              this.tickFrameIRQ();
              break;
          }
        };
        APU2.prototype.tickQuarterFrame = function() {
          this.pulse1.tickQuarterFrame();
          this.pulse2.tickQuarterFrame();
          this.triangle.tickQuarterFrame();
          this.noise.tickQuarterFrame();
        };
        APU2.prototype.tickHalfFrame = function() {
          this.pulse1.tickHalfFrame();
          this.pulse2.tickHalfFrame();
          this.triangle.tickHalfFrame();
          this.noise.tickHalfFrame();
        };
        APU2.prototype.tickFrameIRQ = function() {
          if (!this.frameIrqDisabled && !this.frameFiveStepMode) {
            this.activateFrameIRQ();
          }
        };
        APU2.prototype.tickOutput = function() {
          if (this.callback && --this.ticksToOutput <= 0) {
            this.ticksToOutput += this.ticksPerSecond / this.sampleRate;
            this.callback(this.getOutput());
          }
        };
        APU2.prototype.getOutput = function() {
          var output = 0;
          var pulse1 = this.pulse1.getOutput();
          var pulse2 = this.pulse2.getOutput();
          if (pulse1 || pulse2) {
            output += 95.88 / (8128 / (pulse1 + pulse2) + 100);
          }
          var triangle = this.triangle.getOutput();
          var noise = this.noise.getOutput();
          var dmc = this.dmc.getOutput();
          if (triangle || noise || dmc) {
            output += 159.79 / (1 / (triangle / 8227 + noise / 12241 + dmc / 22638) + 100);
          }
          return output;
        };
        return APU2;
      }()
    );
    exports2.default = APU;
  }
});

// dist/cfxnes-core/audio/index.js
var require_audio = __commonJS({
  "dist/cfxnes-core/audio/index.js": function(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.APU = void 0;
    var APU_1 = require_APU();
    Object.defineProperty(exports2, "APU", { enumerable: true, get: function() {
      return __importDefault2(APU_1).default;
    } });
  }
});

// dist/cfxnes-core/NES.js
var require_NES = __commonJS({
  "dist/cfxnes-core/NES.js": function(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var common_1 = require_common();
    var memory_1 = require_memory();
    var video_1 = require_video();
    var proc_1 = require_proc();
    var audio_1 = require_audio();
    var interrupts_1 = require_interrupts();
    var NES = (
      /** @class */
      function() {
        function NES2(units) {
          if (units === void 0) {
            units = {};
          }
          common_1.log.info("Initializing NES");
          this.cpu = units.cpu || new proc_1.CPU();
          this.ppu = units.ppu || new video_1.PPU();
          this.apu = units.apu || new audio_1.APU();
          this.dma = units.dma || new memory_1.DMA();
          this.cpuMemory = units.cpuMemory || new memory_1.CPUMemory();
          this.ppuMemory = units.ppuMemory || new memory_1.PPUMemory();
          this.cartridge = null;
          this.mapper = null;
          this.region = null;
          this.connectUnits();
          this.applyRegion();
        }
        NES2.prototype.connectUnits = function() {
          this.cpu.connect(this);
          this.ppu.connect(this);
          this.apu.connect(this);
          this.dma.connect(this);
          this.cpuMemory.connect(this);
        };
        NES2.prototype.resetUnits = function() {
          this.cpuMemory.reset();
          this.ppuMemory.reset();
          this.mapper.reset();
          this.ppu.reset();
          this.apu.reset();
          this.dma.reset();
          this.cpu.reset();
        };
        NES2.prototype.setRegion = function(region) {
          this.region = region;
          this.applyRegion();
        };
        NES2.prototype.getRegion = function() {
          return this.region;
        };
        NES2.prototype.getUsedRegion = function() {
          return this.region || this.cartridge && this.cartridge.region || common_1.Region.NTSC;
        };
        NES2.prototype.applyRegion = function() {
          common_1.log.info("Updating region parameters");
          var region = this.getUsedRegion();
          var params = common_1.Region.getParams(region);
          common_1.log.info('Detected region: "'.concat(region, '"'));
          this.ppu.setRegionParams(params);
          this.apu.setRegionParams(params);
        };
        NES2.prototype.setCartridge = function(cartridge) {
          if (this.cartridge) {
            common_1.log.info("Removing current cartridge");
            if (this.mapper) {
              this.mapper.disconnect();
              this.mapper = null;
            }
            this.cartridge = null;
          }
          if (cartridge) {
            common_1.log.info("Inserting cartridge");
            this.cartridge = cartridge;
            this.mapper = (0, memory_1.createMapper)(cartridge);
            this.mapper.connect(this);
            this.applyRegion();
            this.power();
          }
        };
        NES2.prototype.getCartridge = function() {
          return this.cartridge;
        };
        NES2.prototype.power = function() {
          if (this.cartridge) {
            this.resetUnits();
          }
        };
        NES2.prototype.reset = function() {
          this.cpu.activateInterrupt(proc_1.Interrupt.RESET);
        };
        NES2.prototype.setInputDevice = function(port, device) {
          var oldDevice = this.cpuMemory.getInputDevice(port);
          if (oldDevice) {
            oldDevice.disconnect();
          }
          this.cpuMemory.setInputDevice(port, device);
          if (device) {
            device.connect(this);
          }
        };
        NES2.prototype.getInputDevice = function(port) {
          return this.cpuMemory.getInputDevice(port);
        };
        NES2.prototype.setPalette = function(palette) {
          this.ppu.setBasePalette(palette);
        };
        NES2.prototype.getPalette = function() {
          return this.ppu.getBasePalette();
        };
        NES2.prototype.setFrameBuffer = function(buffer) {
          this.ppu.setFrameBuffer(buffer);
        };
        NES2.prototype.renderFrame = function() {
          this.ppu.resetFrameBuffer();
          var time = now();
          while (!this.ppu.isFrameAvailable()) {
            var blocked = this.dma.cycle < 512;
            if (this.cpu.activeInterrupts && !blocked) {
              this.cpu.resolveInterrupt();
              if (this.cpu.activeInterrupts & interrupts_1.RESET) {
                this.cpu.handleReset();
              } else if (this.cpu.activeInterrupts & interrupts_1.NMI) {
                this.cpu.handleNMI();
              } else if (this.cpu.irqDisabled) {
                return;
              } else {
                this.cpu.handleIRQ();
              }
              for (var i = 0; i < 2; i++) {
                if (this.dma.cycle < 512) {
                  this.dma.cycle++;
                  if (this.dma.cycle & 1) {
                    var address = this.dma.baseAddress + (this.dma.cycle >> 1);
                    var data = address < 8192 ? this.cpuMemory.ram[address & 2047] : this.cpuMemory.read(address);
                    if (!(!this.ppu.vblankActive && (this.ppu.spritesVisible || this.ppu.backgroundVisible))) {
                      this.ppu.primaryOAM[this.ppu.oamAddress] = data;
                    }
                    this.ppu.oamAddress = this.ppu.oamAddress + 1 & 255;
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
                  var address = this.dma.baseAddress + (this.dma.cycle >> 1);
                  var data = address < 8192 ? this.cpuMemory.ram[address & 2047] : this.cpuMemory.read(address);
                  if (!(!this.ppu.vblankActive && (this.ppu.spritesVisible || this.ppu.backgroundVisible))) {
                    this.ppu.primaryOAM[this.ppu.oamAddress] = data;
                  }
                  this.ppu.oamAddress = this.ppu.oamAddress + 1 & 255;
                }
              }
              this.ppu.tick();
              this.ppu.tick();
              this.ppu.tick();
            } else {
              this.cpu.readAndExecuteOperation();
            }
          }
          console.log("this.ppu.isFrameAvailable time:", now() - time);
        };
        NES2.prototype.renderDebugFrame = function(buffer) {
          if (this.cartridge) {
            this.ppu.setFrameBuffer(buffer);
            this.ppu.renderDebugFrame();
          } else {
            this.renderEmptyFrame(buffer);
          }
        };
        NES2.prototype.renderWhiteNoise = function(buffer) {
          for (var y = 0; y < 135; y++) {
            for (var x = 0; x < 240; x++) {
              var color = ~~(255 * Math.random());
              buffer.drawPixel(x, y, (0, video_1.packColor)(color, color, color));
            }
          }
        };
        NES2.prototype.renderEmptyFrame = function(buffer) {
          buffer.fill(video_1.BLACK_COLOR);
        };
        NES2.prototype.setAudioSampleRate = function(rate) {
          this.apu.setSampleRate(rate);
        };
        NES2.prototype.getAudioSampleRate = function() {
          return this.apu.getSampleRate();
        };
        NES2.prototype.setAudioCallback = function(callback) {
          this.apu.setCallback(callback);
        };
        NES2.prototype.getAudioCallback = function() {
          return this.apu.getCallback();
        };
        NES2.prototype.setAudioVolume = function(channel, volume) {
          this.apu.setVolume(channel, volume);
        };
        NES2.prototype.getAudioVolume = function(channel) {
          return this.apu.getVolume(channel);
        };
        NES2.prototype.getNVRAM = function() {
          return this.mapper ? this.mapper.getNVRAM() : null;
        };
        return NES2;
      }()
    );
    exports2.default = NES;
  }
});

// dist/cfxnes-core/devices/Joypad.js
var require_Joypad = __commonJS({
  "dist/cfxnes-core/devices/Joypad.js": function(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Button = void 0;
    var common_1 = require_common();
    exports2.Button = {
      A: 0,
      B: 1,
      SELECT: 2,
      START: 3,
      UP: 4,
      DOWN: 5,
      LEFT: 6,
      RIGHT: 7
    };
    var Joypad = (
      /** @class */
      function() {
        function Joypad2() {
          this.buttonStates = new Uint8Array(24);
          this.buttonStates[19] = 1;
          this.readPosition = 0;
        }
        Joypad2.prototype.connect = function() {
          common_1.log.info("Connecting joypad");
        };
        Joypad2.prototype.disconnect = function() {
          common_1.log.info("Disconnecting joypad");
        };
        Joypad2.prototype.strobe = function() {
          this.readPosition = 0;
        };
        Joypad2.prototype.read = function() {
          var state = this.buttonStates[this.readPosition];
          this.readPosition = (this.readPosition + 1) % this.buttonStates.length;
          return state;
        };
        Joypad2.prototype.setButtonPressed = function(button, pressed) {
          this.buttonStates[button] = pressed ? 1 : 0;
        };
        Joypad2.prototype.isButtonPressed = function(button) {
          return this.buttonStates[button] === 1;
        };
        return Joypad2;
      }()
    );
    exports2.default = Joypad;
  }
});

// dist/cfxnes-core/devices/Zapper.js
var require_Zapper = __commonJS({
  "dist/cfxnes-core/devices/Zapper.js": function(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var common_1 = require_common();
    var video_1 = require_video();
    var Zapper = (
      /** @class */
      function() {
        function Zapper2() {
          this.triggerPressed = false;
          this.beamX = -1;
          this.beamY = -1;
          this.ppu = null;
        }
        Zapper2.prototype.connect = function(nes) {
          common_1.log.info("Connecting zapper");
          this.ppu = nes.ppu;
        };
        Zapper2.prototype.disconnect = function() {
          common_1.log.info("Disconnecting zapper");
          this.ppu = null;
        };
        Zapper2.prototype.strobe = function() {
        };
        Zapper2.prototype.read = function() {
          return this.triggerPressed << 4 | !this.isLightDetected() << 3;
        };
        Zapper2.prototype.isLightDetected = function() {
          return this.beamX >= 0 && this.beamX < video_1.VIDEO_WIDTH && this.beamY >= 0 && this.beamY < video_1.VIDEO_HEIGHT && this.ppu.isBrightFramePixel(this.beamX, this.beamY);
        };
        Zapper2.prototype.setTriggerPressed = function(pressed) {
          this.triggerPressed = pressed;
        };
        Zapper2.prototype.isTriggerPressed = function() {
          return this.triggerPressed;
        };
        Zapper2.prototype.setBeamPosition = function(x, y) {
          this.beamX = x;
          this.beamY = y;
        };
        Zapper2.prototype.getBeamPosition = function() {
          return [this.beamX, this.beamY];
        };
        return Zapper2;
      }()
    );
    exports2.default = Zapper;
  }
});

// dist/cfxnes-core/devices/index.js
var require_devices = __commonJS({
  "dist/cfxnes-core/devices/index.js": function(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Zapper = exports2.Button = exports2.Joypad = void 0;
    var Joypad_1 = require_Joypad();
    Object.defineProperty(exports2, "Joypad", { enumerable: true, get: function() {
      return __importDefault2(Joypad_1).default;
    } });
    Object.defineProperty(exports2, "Button", { enumerable: true, get: function() {
      return Joypad_1.Button;
    } });
    var Zapper_1 = require_Zapper();
    Object.defineProperty(exports2, "Zapper", { enumerable: true, get: function() {
      return __importDefault2(Zapper_1).default;
    } });
  }
});

// dist/cfxnes-core/cartridge/parsers/ines.js
var require_ines = __commonJS({
  "dist/cfxnes-core/cartridge/parsers/ines.js": function(exports2) {
    "use strict";
    var _a;
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.name = void 0;
    exports2.supports = supports;
    exports2.parse = parse;
    var common_1 = require_common();
    exports2.name = "iNES / NES 2.0";
    var mappers = {
      0: common_1.Mapper.NROM,
      1: common_1.Mapper.MMC1,
      2: common_1.Mapper.UNROM,
      3: common_1.Mapper.CNROM,
      4: common_1.Mapper.MMC3,
      7: common_1.Mapper.AOROM,
      11: common_1.Mapper.COLOR_DREAMS,
      34: common_1.Mapper.BNROM
      // NINA-001 uses the same ID
    };
    var submappers = (_a = {}, _a[joinMapperIds(1, 1)] = common_1.Submapper.SUROM, _a[joinMapperIds(1, 2)] = common_1.Submapper.SOROM, _a[joinMapperIds(1, 3)] = common_1.Submapper.SXROM, _a);
    function joinMapperIds(mapperId, submapperId) {
      return mapperId << 4 | submapperId;
    }
    function supports(data) {
      return data[0] === 78 && data[1] === 69 && data[2] === 83 && data[3] === 26;
    }
    function parse(data) {
      if (!supports(data)) {
        throw new Error("Incorrect signature");
      }
      if (data.length < 16) {
        throw new Error("Input is too short: expected at least 16 B but got " + (0, common_1.formatSize)(data.length));
      }
      var version;
      var prgROMUnits = data[4];
      var chrROMUnits = data[5];
      var region, mirroring;
      var mapperId = data[7] & 240 | data[6] >>> 4;
      var submapperId;
      var prgRAMSize, prgRAMSizeBattery;
      var chrRAMSize, chrRAMSizeBattery;
      if (data[6] & 8) {
        mirroring = common_1.Mirroring.FOUR_SCREEN;
      } else if (data[6] & 1) {
        mirroring = common_1.Mirroring.VERTICAL;
      } else {
        mirroring = common_1.Mirroring.HORIZONTAL;
      }
      if ((data[7] & 12) === 8) {
        common_1.log.info("Detected NES 2.0 format");
        version = 2;
        mapperId |= (data[8] & 15) << 8;
        submapperId = (data[8] & 240) >>> 4;
        prgROMUnits |= (data[9] & 15) << 8;
        chrROMUnits |= (data[9] & 240) << 4;
        prgRAMSizeBattery = computeExpSize((data[10] & 240) >>> 4);
        chrRAMSizeBattery = computeExpSize((data[11] & 240) >>> 4);
        prgRAMSize = prgRAMSizeBattery + computeExpSize(data[10] & 15);
        chrRAMSize = chrRAMSizeBattery + computeExpSize(data[11] & 15);
        region = data[12] & 1 ? common_1.Region.PAL : common_1.Region.NTSC;
      } else {
        common_1.log.info("Detected iNES format");
        version = 1;
        prgRAMSize = (data[8] || 1) * 8192;
        prgRAMSizeBattery = data[6] & 2 ? prgRAMSize : 0;
        chrRAMSize = chrROMUnits ? 0 : 8192;
        chrRAMSizeBattery = 0;
        region = data[9] & 1 ? common_1.Region.PAL : common_1.Region.NTSC;
      }
      if (prgROMUnits === 0) {
        throw new Error("Invalid header: 0 PRG ROM units");
      }
      var prgROMStart = 16 + (data[6] & 4 ? 512 : 0);
      var prgROMSize = prgROMUnits * 16384;
      var prgROMEnd = prgROMStart + prgROMSize;
      var chrROMStart = prgROMEnd;
      var chrROMSize = chrROMUnits * 8192;
      var chrROMEnd = chrROMStart + chrROMSize;
      var mapper = mappers[mapperId] || mapperId.toString();
      if (mapper === common_1.Mapper.BNROM && chrROMSize > 0) {
        mapper = common_1.Mapper.NINA_001;
      }
      var submapper = submappers[joinMapperIds(mapperId, submapperId)];
      if (data.length < chrROMEnd) {
        throw new Error("Input is too short: expected at least ".concat((0, common_1.formatSize)(chrROMEnd), " but got ").concat((0, common_1.formatSize)(data.length)));
      }
      var prgROM = data.subarray(prgROMStart, prgROMEnd);
      var chrROM = chrROMSize ? data.subarray(chrROMStart, chrROMEnd) : void 0;
      return {
        version: version,
        mirroring: mirroring,
        region: region,
        mapper: mapper,
        submapper: submapper,
        prgROMSize: prgROMSize,
        prgROM: prgROM,
        prgRAMSize: prgRAMSize,
        prgRAMSizeBattery: prgRAMSizeBattery,
        chrROMSize: chrROMSize,
        chrROM: chrROM,
        chrRAMSize: chrRAMSize,
        chrRAMSizeBattery: chrRAMSizeBattery
      };
    }
    function computeExpSize(value) {
      if (value > 0) {
        return Math.pow(2, value - 1) * 128;
      }
      return 0;
    }
  }
});

// dist/cfxnes-core/cartridge/parsers/index.js
var require_parsers = __commonJS({
  "dist/cfxnes-core/cartridge/parsers/index.js": function(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || /* @__PURE__ */ function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    }();
    Object.defineProperty(exports2, "__esModule", { value: true });
    var ines = __importStar(require_ines());
    exports2.default = [ines];
  }
});

// dist/cfxnes-core/cartridge/sha1.js
var require_sha1 = __commonJS({
  "dist/cfxnes-core/cartridge/sha1.js": function(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.default = sha1;
    var HEX_CHARS = "0123456789abcdef".split("");
    var EXTRA = [-2147483648, 8388608, 32768, 128];
    var SHIFT = [24, 16, 8, 0];
    function sha1(data) {
      var length = data.length;
      var blocks = new Uint8Array(17);
      var block = 0;
      var index = 0;
      var start = 0;
      var bytes = 0;
      var end = false;
      var t, f, i, j;
      var h0 = 1732584193;
      var h1 = 4023233417;
      var h2 = 2562383102;
      var h3 = 271733878;
      var h4 = 3285377520;
      do {
        blocks[0] = block;
        blocks.fill(0, 1, 17);
        for (i = start; index < length && i < 64; index++) {
          blocks[i >> 2] |= data[index] << SHIFT[i++ & 3];
        }
        bytes += i - start;
        start = i - 64;
        if (index === length) {
          blocks[i >> 2] |= EXTRA[i & 3];
          index++;
        }
        block = blocks[16];
        if (index > length && i < 56) {
          blocks[15] = bytes << 3;
          end = true;
        }
        for (j = 16; j < 80; j++) {
          t = blocks[j - 3] ^ blocks[j - 8] ^ blocks[j - 14] ^ blocks[j - 16];
          blocks[j] = t << 1 | t >>> 31;
        }
        var a = h0, b = h1, c = h2, d = h3, e = h4;
        for (j = 0; j < 20; j += 5) {
          f = b & c | ~b & d;
          t = a << 5 | a >>> 27;
          e = t + f + e + 1518500249 + blocks[j] << 0;
          b = b << 30 | b >>> 2;
          f = a & b | ~a & c;
          t = e << 5 | e >>> 27;
          d = t + f + d + 1518500249 + blocks[j + 1] << 0;
          a = a << 30 | a >>> 2;
          f = e & a | ~e & b;
          t = d << 5 | d >>> 27;
          c = t + f + c + 1518500249 + blocks[j + 2] << 0;
          e = e << 30 | e >>> 2;
          f = d & e | ~d & a;
          t = c << 5 | c >>> 27;
          b = t + f + b + 1518500249 + blocks[j + 3] << 0;
          d = d << 30 | d >>> 2;
          f = c & d | ~c & e;
          t = b << 5 | b >>> 27;
          a = t + f + a + 1518500249 + blocks[j + 4] << 0;
          c = c << 30 | c >>> 2;
        }
        for (; j < 40; j += 5) {
          f = b ^ c ^ d;
          t = a << 5 | a >>> 27;
          e = t + f + e + 1859775393 + blocks[j] << 0;
          b = b << 30 | b >>> 2;
          f = a ^ b ^ c;
          t = e << 5 | e >>> 27;
          d = t + f + d + 1859775393 + blocks[j + 1] << 0;
          a = a << 30 | a >>> 2;
          f = e ^ a ^ b;
          t = d << 5 | d >>> 27;
          c = t + f + c + 1859775393 + blocks[j + 2] << 0;
          e = e << 30 | e >>> 2;
          f = d ^ e ^ a;
          t = c << 5 | c >>> 27;
          b = t + f + b + 1859775393 + blocks[j + 3] << 0;
          d = d << 30 | d >>> 2;
          f = c ^ d ^ e;
          t = b << 5 | b >>> 27;
          a = t + f + a + 1859775393 + blocks[j + 4] << 0;
          c = c << 30 | c >>> 2;
        }
        for (; j < 60; j += 5) {
          f = b & c | b & d | c & d;
          t = a << 5 | a >>> 27;
          e = t + f + e - 1894007588 + blocks[j] << 0;
          b = b << 30 | b >>> 2;
          f = a & b | a & c | b & c;
          t = e << 5 | e >>> 27;
          d = t + f + d - 1894007588 + blocks[j + 1] << 0;
          a = a << 30 | a >>> 2;
          f = e & a | e & b | a & b;
          t = d << 5 | d >>> 27;
          c = t + f + c - 1894007588 + blocks[j + 2] << 0;
          e = e << 30 | e >>> 2;
          f = d & e | d & a | e & a;
          t = c << 5 | c >>> 27;
          b = t + f + b - 1894007588 + blocks[j + 3] << 0;
          d = d << 30 | d >>> 2;
          f = c & d | c & e | d & e;
          t = b << 5 | b >>> 27;
          a = t + f + a - 1894007588 + blocks[j + 4] << 0;
          c = c << 30 | c >>> 2;
        }
        for (; j < 80; j += 5) {
          f = b ^ c ^ d;
          t = a << 5 | a >>> 27;
          e = t + f + e - 899497514 + blocks[j] << 0;
          b = b << 30 | b >>> 2;
          f = a ^ b ^ c;
          t = e << 5 | e >>> 27;
          d = t + f + d - 899497514 + blocks[j + 1] << 0;
          a = a << 30 | a >>> 2;
          f = e ^ a ^ b;
          t = d << 5 | d >>> 27;
          c = t + f + c - 899497514 + blocks[j + 2] << 0;
          e = e << 30 | e >>> 2;
          f = d ^ e ^ a;
          t = c << 5 | c >>> 27;
          b = t + f + b - 899497514 + blocks[j + 3] << 0;
          d = d << 30 | d >>> 2;
          f = c ^ d ^ e;
          t = b << 5 | b >>> 27;
          a = t + f + a - 899497514 + blocks[j + 4] << 0;
          c = c << 30 | c >>> 2;
        }
        h0 = h0 + a << 0;
        h1 = h1 + b << 0;
        h2 = h2 + c << 0;
        h3 = h3 + d << 0;
        h4 = h4 + e << 0;
      } while (!end);
      return HEX_CHARS[h0 >> 28 & 15] + HEX_CHARS[h0 >> 24 & 15] + HEX_CHARS[h0 >> 20 & 15] + HEX_CHARS[h0 >> 16 & 15] + HEX_CHARS[h0 >> 12 & 15] + HEX_CHARS[h0 >> 8 & 15] + HEX_CHARS[h0 >> 4 & 15] + HEX_CHARS[h0 & 15] + HEX_CHARS[h1 >> 28 & 15] + HEX_CHARS[h1 >> 24 & 15] + HEX_CHARS[h1 >> 20 & 15] + HEX_CHARS[h1 >> 16 & 15] + HEX_CHARS[h1 >> 12 & 15] + HEX_CHARS[h1 >> 8 & 15] + HEX_CHARS[h1 >> 4 & 15] + HEX_CHARS[h1 & 15] + HEX_CHARS[h2 >> 28 & 15] + HEX_CHARS[h2 >> 24 & 15] + HEX_CHARS[h2 >> 20 & 15] + HEX_CHARS[h2 >> 16 & 15] + HEX_CHARS[h2 >> 12 & 15] + HEX_CHARS[h2 >> 8 & 15] + HEX_CHARS[h2 >> 4 & 15] + HEX_CHARS[h2 & 15] + HEX_CHARS[h3 >> 28 & 15] + HEX_CHARS[h3 >> 24 & 15] + HEX_CHARS[h3 >> 20 & 15] + HEX_CHARS[h3 >> 16 & 15] + HEX_CHARS[h3 >> 12 & 15] + HEX_CHARS[h3 >> 8 & 15] + HEX_CHARS[h3 >> 4 & 15] + HEX_CHARS[h3 & 15] + HEX_CHARS[h4 >> 28 & 15] + HEX_CHARS[h4 >> 24 & 15] + HEX_CHARS[h4 >> 20 & 15] + HEX_CHARS[h4 >> 16 & 15] + HEX_CHARS[h4 >> 12 & 15] + HEX_CHARS[h4 >> 8 & 15] + HEX_CHARS[h4 >> 4 & 15] + HEX_CHARS[h4 & 15];
    }
  }
});

// dist/cfxnes-core/cartridge/create.js
var require_create = __commonJS({
  "dist/cfxnes-core/cartridge/create.js": function(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.default = createCartridge;
    var common_1 = require_common();
    var parsers_1 = __importDefault2(require_parsers());
    var sha1_1 = __importDefault2(require_sha1());
    function createCartridge(data) {
      common_1.log.info("Creating cartridge from ROM image");
      if (!(data instanceof Uint8Array)) {
        throw new Error("Invalid ROM image: " + (0, common_1.describe)(data));
      }
      common_1.log.info("Parsing ".concat((0, common_1.formatSize)(data.length), " of data"));
      for (var _i = 0, parsers_2 = parsers_1.default; _i < parsers_2.length; _i++) {
        var parser = parsers_2[_i];
        if (parser.supports(data)) {
          common_1.log.info('Using "'.concat(parser.name, '" parser'));
          var cartridge = parser.parse(data);
          computeSHA1(cartridge);
          printInfo(cartridge);
          return cartridge;
        }
      }
      throw new Error("Unknown ROM image format");
    }
    function computeSHA1(cartridge) {
      common_1.log.info("Computing SHA-1");
      var buffer = new Uint8Array(cartridge.prgROMSize + cartridge.chrROMSize);
      buffer.set(cartridge.prgROM);
      if (cartridge.chrROM) {
        buffer.set(cartridge.chrROM, cartridge.prgROMSize);
      }
      cartridge.sha1 = (0, sha1_1.default)(buffer);
    }
    function printInfo(cartridge) {
      common_1.log.info("==========[Cartridge Info - Start]==========");
      common_1.log.info("SHA-1                 : " + cartridge.sha1);
      common_1.log.info("Mapper                : " + cartridge.mapper);
      common_1.log.info("Submapper             : " + cartridge.submapper);
      common_1.log.info("Region                : " + cartridge.region);
      common_1.log.info("Mirroring             : " + cartridge.mirroring);
      common_1.log.info("PRG ROM size          : " + (0, common_1.formatSize)(cartridge.prgROMSize));
      common_1.log.info("PRG RAM size          : " + (0, common_1.formatSize)(cartridge.prgRAMSize));
      common_1.log.info("PRG RAM size (battery): " + (0, common_1.formatSize)(cartridge.prgRAMSizeBattery));
      common_1.log.info("CHR ROM size          : " + (0, common_1.formatSize)(cartridge.chrROMSize));
      common_1.log.info("CHR RAM size          : " + (0, common_1.formatSize)(cartridge.chrRAMSize));
      common_1.log.info("CHR RAM size (battery): " + (0, common_1.formatSize)(cartridge.chrRAMSizeBattery));
      common_1.log.info("==========[Cartridge Info - End]==========");
    }
  }
});

// dist/cfxnes-core/cartridge/read.js
var require_read = __commonJS({
  "dist/cfxnes-core/cartridge/read.js": function(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.default = readCartridge;
    var common_1 = require_common();
    var create_1 = __importDefault2(require_create());
    function readCartridge(path) {
      common_1.log.info('Reading ROM image from file "'.concat(path, '"'));
      var data = [];
      return (0, create_1.default)(new Uint8Array(data));
    }
  }
});

// dist/cfxnes-core/cartridge/index.js
var require_cartridge = __commonJS({
  "dist/cfxnes-core/cartridge/index.js": function(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.readCartridge = exports2.createCartridge = void 0;
    var create_1 = require_create();
    Object.defineProperty(exports2, "createCartridge", { enumerable: true, get: function() {
      return __importDefault2(create_1).default;
    } });
    var read_1 = require_read();
    Object.defineProperty(exports2, "readCartridge", { enumerable: true, get: function() {
      return __importDefault2(read_1).default;
    } });
  }
});

// dist/cfxnes-core/index.js
var require_cfxnes_core = __commonJS({
  "dist/cfxnes-core/index.js": function(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.VIDEO_HEIGHT = exports2.VIDEO_WIDTH = exports2.BLACK_COLOR = exports2.DEFAULT_PALETTE = exports2.unpackColor = exports2.isPaletteName = exports2.createPalette = exports2.PPU = exports2.describe = exports2.formatSize = exports2.Mapper = exports2.Region = exports2.LogLevel = exports2.log = exports2.readCartridge = exports2.createCartridge = exports2.Zapper = exports2.Joypad = exports2.Button = exports2.CPU = exports2.APU = exports2.NES = void 0;
    var NES_1 = require_NES();
    Object.defineProperty(exports2, "NES", { enumerable: true, get: function() {
      return __importDefault2(NES_1).default;
    } });
    var audio_1 = require_audio();
    Object.defineProperty(exports2, "APU", { enumerable: true, get: function() {
      return audio_1.APU;
    } });
    var proc_1 = require_proc();
    Object.defineProperty(exports2, "CPU", { enumerable: true, get: function() {
      return proc_1.CPU;
    } });
    var devices_1 = require_devices();
    Object.defineProperty(exports2, "Button", { enumerable: true, get: function() {
      return devices_1.Button;
    } });
    Object.defineProperty(exports2, "Joypad", { enumerable: true, get: function() {
      return devices_1.Joypad;
    } });
    Object.defineProperty(exports2, "Zapper", { enumerable: true, get: function() {
      return devices_1.Zapper;
    } });
    var cartridge_1 = require_cartridge();
    Object.defineProperty(exports2, "createCartridge", { enumerable: true, get: function() {
      return cartridge_1.createCartridge;
    } });
    Object.defineProperty(exports2, "readCartridge", { enumerable: true, get: function() {
      return cartridge_1.readCartridge;
    } });
    var common_1 = require_common();
    Object.defineProperty(exports2, "log", { enumerable: true, get: function() {
      return common_1.log;
    } });
    Object.defineProperty(exports2, "LogLevel", { enumerable: true, get: function() {
      return common_1.LogLevel;
    } });
    Object.defineProperty(exports2, "Region", { enumerable: true, get: function() {
      return common_1.Region;
    } });
    Object.defineProperty(exports2, "Mapper", { enumerable: true, get: function() {
      return common_1.Mapper;
    } });
    Object.defineProperty(exports2, "formatSize", { enumerable: true, get: function() {
      return common_1.formatSize;
    } });
    Object.defineProperty(exports2, "describe", { enumerable: true, get: function() {
      return common_1.describe;
    } });
    var video_1 = require_video();
    Object.defineProperty(exports2, "PPU", { enumerable: true, get: function() {
      return video_1.PPU;
    } });
    Object.defineProperty(exports2, "createPalette", { enumerable: true, get: function() {
      return video_1.createPalette;
    } });
    Object.defineProperty(exports2, "isPaletteName", { enumerable: true, get: function() {
      return video_1.isPaletteName;
    } });
    Object.defineProperty(exports2, "unpackColor", { enumerable: true, get: function() {
      return video_1.unpackColor;
    } });
    Object.defineProperty(exports2, "DEFAULT_PALETTE", { enumerable: true, get: function() {
      return video_1.DEFAULT_PALETTE;
    } });
    Object.defineProperty(exports2, "BLACK_COLOR", { enumerable: true, get: function() {
      return video_1.BLACK_COLOR;
    } });
    Object.defineProperty(exports2, "VIDEO_WIDTH", { enumerable: true, get: function() {
      return video_1.VIDEO_WIDTH;
    } });
    Object.defineProperty(exports2, "VIDEO_HEIGHT", { enumerable: true, get: function() {
      return video_1.VIDEO_HEIGHT;
    } });
  }
});

// dist/index.js
var __importDefault = exports && exports.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var display_1 = __importDefault(require("display"));
var keyboard_1 = __importDefault(require("keyboard"));
var index_js_1 = require_cfxnes_core();
var storage_1 = __importDefault(require("storage"));
function fill(value, start, end) {
  var array = this.valueOf();
  var length = array.length;
  start = parseInt(start, 10) || 0;
  end = end === void 0 ? length : parseInt(end, 10) || 0;
  var i;
  var l;
  if (start < 0) {
    i = Math.max(length + start, 0);
  } else {
    i = Math.min(start, length);
  }
  if (end < 0) {
    l = Math.max(length + end, 0);
  } else {
    l = Math.min(end, length);
  }
  for (; i < l; i++) {
    array[i] = value;
  }
  return array;
}
if (!Array.prototype.fill) {
  Array.prototype.fill = fill;
}
if (!Uint8Array.prototype.fill) {
  Uint8Array.prototype.fill = fill;
}
if (!Uint32Array.prototype.fill) {
  Uint32Array.prototype.fill = fill;
}
var COLOR_WHITE = display_1.default.color(255, 255, 255);
async function main() {
  var nes = new index_js_1.NES();
  console.log("reading rom...");
  var romData = storage_1.default.read("/Super Mario Bros (E).nes", true);
  console.log("loading rom...");
  var cartridge1 = (0, index_js_1.createCartridge)(romData);
  nes.setCartridge(cartridge1);
  var getNextPressDown = false;
  var getPrevPressDown = false;
  var getSelPressDown = false;
  var joypad = new index_js_1.Joypad();
  nes.setInputDevice(1, joypad);
  console.log("creating video...");
  var palette = (0, index_js_1.createPalette)("fceux");
  nes.setPalette(palette);
  var videoSprite = new Uint8Array(index_js_1.VIDEO_WIDTH * index_js_1.VIDEO_HEIGHT);
  nes.setRegion(null);
  console.log("starting...");
  nes.setFrameBuffer(videoSprite);
  while (true) {
    if (keyboard_1.default.getNextPress()) {
      joypad.setButtonPressed(index_js_1.Button.RIGHT, true);
      getNextPressDown = true;
    } else if (getNextPressDown) {
      joypad.setButtonPressed(index_js_1.Button.RIGHT, false);
      getNextPressDown = false;
    }
    if (keyboard_1.default.getPrevPress()) {
      joypad.setButtonPressed(index_js_1.Button.A, true);
      getPrevPressDown = true;
    } else if (getPrevPressDown) {
      joypad.setButtonPressed(index_js_1.Button.A, false);
      getPrevPressDown = false;
    }
    if (keyboard_1.default.getSelPress()) {
      joypad.setButtonPressed(index_js_1.Button.START, true);
      getSelPressDown = true;
    } else if (getSelPressDown) {
      joypad.setButtonPressed(index_js_1.Button.START, false);
      getSelPressDown = false;
    }
    nes.renderFrame();
    display_1.default.drawBitmap(0, -80, videoSprite, index_js_1.VIDEO_WIDTH, index_js_1.VIDEO_HEIGHT, 8);
    await delay(24);
  }
}
main();
