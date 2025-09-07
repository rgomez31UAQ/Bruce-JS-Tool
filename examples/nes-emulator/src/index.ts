import display from 'display';
import keyboard from 'keyboard';
import {
  NES,
  createCartridge,
  createPalette, VIDEO_WIDTH, VIDEO_HEIGHT,
  Joypad, Button,
} from './cfxnes-core/index.js';
import storage from 'storage';

// Array.fill polyfill
function fill<T>(value: T[], start, end) {
  var array = this.valueOf() as T[];

  var length = array.length;
  start = parseInt(start, 10) || 0;
  end = end === undefined ? length : (parseInt(end, 10) || 0);

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
    array[i] = value as T;
  }

  return array;
}
// @ts-ignore
if (!Array.prototype.fill)  {
  // @ts-ignore
  Array.prototype.fill = fill;
}
if (!Uint8Array.prototype.fill)  {
  // @ts-ignore
  Uint8Array.prototype.fill = fill;
}
if (!Uint32Array.prototype.fill)  {
  // @ts-ignore
  Uint32Array.prototype.fill = fill;
}

// I am putting all code in function to optimise, if variables are outside
// functions they are put in global namespace, and it's slower to get

const COLOR_WHITE = display.color(255, 255, 255);

function main() {
  const nes = new NES();

  console.log('reading rom...');
  const romData = storage.read('/Super Mario Bros (E).nes', true);
  console.log('loading rom...');
  const cartridge1 = createCartridge(romData);
  nes.setCartridge(cartridge1);

  let getNextPressDown = false;
  let getPrevPressDown = false;
  let getSelPressDown = false;
  const joypad = new Joypad;
  nes.setInputDevice(1, joypad);

  console.log('creating video...');
  const palette = createPalette('fceux'); // Predefined palette
  nes.setPalette(palette);
  const videoSprite = new Uint8Array(VIDEO_WIDTH * VIDEO_HEIGHT);
  nes.setRegion(null);

  console.log('starting...');

  nes.setFrameBuffer(videoSprite);

  while (true) {
    if (keyboard.getNextPress()) {
      joypad.setButtonPressed(Button.RIGHT, true);
      getNextPressDown = true;
    } else if (getNextPressDown) {
      joypad.setButtonPressed(Button.RIGHT, false);
      getNextPressDown = false;
    }

    if (keyboard.getPrevPress()) {
      joypad.setButtonPressed(Button.A, true);
      getPrevPressDown = true;
    } else if (getPrevPressDown) {
      joypad.setButtonPressed(Button.A, false);
      getPrevPressDown = false;
    }

    if (keyboard.getSelPress()) {
      joypad.setButtonPressed(Button.START, true);
      getSelPressDown = true;
    } else if (getSelPressDown) {
      joypad.setButtonPressed(Button.START, false);
      getSelPressDown = false;
    }

    nes.renderFrame();

    display.drawBitmap(0, -80, videoSprite, VIDEO_WIDTH, VIDEO_HEIGHT, 8);

    // @preserve delay(24);
  }
}
main();
