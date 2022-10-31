import confetti from 'canvas-confetti';
import Slot from '@js/Slot';
import SoundEffects from '@js/SoundEffects';
import { get, map } from 'lodash';
import Airtable from 'airtable';
import axios from 'axios';
import { io } from 'socket.io-client';

Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: 'key5s8eRImN47ypvV'
});

// const trackBase = Airtable.base('app0Vi7IfFDLGEvMi');

const axiosInst = axios.create({
  baseURL: process.env.APP_AXIOS_BASE_URL
});

const getData = async () => {
  const { data } = await axiosInst.get('test');
  return data;
};

// const all: Record<FieldSet>[] = [];
// trackBase('Gadget').select({
// eslint-disable-next-line max-len, max-len
//   // filterByFormula: `AND(IS_AFTER({Process Date}, "${moment().subtract(7, 'day').format('YYYY-MM-DD')}"), IS_BEFORE({Process Date}, "${moment().format('YYYY-MM-DD')}"))`,
//   view: 'Bot',
//   maxRecords: 100000000,
//   pageSize: 100
// }).eachPage((d, fetchNextPage) => {
//   d.forEach((record) => {
//     all.push(record);
//   });

//   fetchNextPage();
// }, (err) => {
//   if (err) { console.error(err); }
// });

// Initialize slot machine
(() => {
  const drawButton = document.getElementById('draw-button') as HTMLButtonElement | null;
  const fullscreenButton = document.getElementById('fullscreen-button') as HTMLButtonElement | null;
  const settingsButton = document.getElementById('settings-button') as HTMLButtonElement | null;
  const settingsWrapper = document.getElementById('settings') as HTMLDivElement | null;
  const settingsContent = document.getElementById('settings-panel') as HTMLDivElement | null;
  const settingsSaveButton = document.getElementById('settings-save') as HTMLButtonElement | null;
  const settingsCloseButton = document.getElementById('settings-close') as HTMLButtonElement | null;
  const sunburstSvg = document.getElementById('sunburst') as HTMLImageElement | null;
  const confettiCanvas = document.getElementById('confetti-canvas') as HTMLCanvasElement | null;
  const nameListTextArea = document.getElementById('name-list') as HTMLTextAreaElement | null;
  const removeNameFromListCheckbox = document.getElementById('remove-from-list') as HTMLInputElement | null;
  const enableSoundCheckbox = document.getElementById('enable-sound') as HTMLInputElement | null;
  const reactCountInput = document.getElementById('real-count') as HTMLInputElement | null;

  const winner = document.getElementById('winner') as HTMLDivElement | null;

  let data = [];

  getData().then((datas) => {
    data = datas;
  });

  // Graceful exit if necessary elements are not found
  if (!(
    drawButton
    && fullscreenButton
    && settingsButton
    && settingsWrapper
    && settingsContent
    && settingsSaveButton
    && settingsCloseButton
    && sunburstSvg
    && confettiCanvas
    && nameListTextArea
    && removeNameFromListCheckbox
    && enableSoundCheckbox
    && reactCountInput
  )) {
    if (winner) {
      return;
    }
    console.error('One or more Element ID is invalid. This is possibly a bug.');
    return;
  }

  const socket = io('http://localhost:4000');

  // eslint-disable-next-line no-shadow
  socket.on('winner', (data: unknown) => {
    // const winDiv = document.createElement('div');
    // winDiv.setAttribute('id', 'winner');

    // const li = document.createElement('div');
    // li.setAttribute('class', 'li');
    // li.outerText = '123';

    // winDiv.append(li);

    // winnerList!.append();
    console.log(data, 'thhe data');
  });

  if (!(confettiCanvas instanceof HTMLCanvasElement)) {
    console.error('Confetti canvas is not an instance of Canvas. This is possibly a bug.');
    return;
  }

  const soundEffects = new SoundEffects();

  let MAX_REEL_ITEMS = parseInt(get(reactCountInput, 'value', '40'), 10) * 10;

  const CONFETTI_COLORS = ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff'];
  let confettiAnimationId;

  /** Confeetti animation instance */
  const customConfetti = confetti.create(confettiCanvas, {
    resize: true,
    useWorker: true
  });

  /** Triggers cconfeetti animation until animation is canceled */
  const confettiAnimation = () => {
    const windowWidth = window.innerWidth || document.documentElement.clientWidth || document.getElementsByTagName('body')[0].clientWidth;
    const confettiScale = Math.max(0.5, Math.min(1, windowWidth / 1100));

    customConfetti({
      particleCount: 10,
      gravity: 0.8,
      spread: 90,
      origin: { y: 0.6 },
      colors: [CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]],
      scalar: confettiScale
    });

    confettiAnimationId = window.requestAnimationFrame(confettiAnimation);
  };

  /** Function to stop the winning animation */
  const stopWinningAnimation = () => {
    if (confettiAnimationId) {
      window.cancelAnimationFrame(confettiAnimationId);
    }
    sunburstSvg.style.display = 'none';
  };

  /**  Function to be trigger before spinning */
  const onSpinStart = () => {
    stopWinningAnimation();
    drawButton.disabled = true;
    settingsButton.disabled = true;
    soundEffects.spin((MAX_REEL_ITEMS - 1) / 10);
  };

  /**  Functions to be trigger after spinning */
  const onSpinEnd = async () => {
    confettiAnimation();
    sunburstSvg.style.display = 'block';
    await soundEffects.win();
    drawButton.disabled = false;
    settingsButton.disabled = false;
  };

  /** Slot instance */
  let slot = new Slot({
    reelContainerSelector: '#reel',
    maxReelItems: MAX_REEL_ITEMS,
    onSpinStart,
    onSpinEnd,
    onNameListChanged: stopWinningAnimation
  });

  /** To open the setting page */
  const onSettingsOpen = () => {
    console.log('🚀 ~ file: app.ts ~ line 41 ~ da', data.length);
    nameListTextArea.value = map(data, 'name').join('\n'); // slot.names.length ? slot.names.join('\n') : '';
    removeNameFromListCheckbox.checked = slot.shouldRemoveWinnerFromNameList;
    enableSoundCheckbox.checked = !soundEffects.mute;
    settingsWrapper.style.display = 'block';
  };

  /** To close the setting page */
  const onSettingsClose = () => {
    console.log(slot.names);
    settingsContent.scrollTop = 0;
    settingsWrapper.style.display = 'none';
  };

  // Click handler for "Change Real" button
  reactCountInput.addEventListener('blur', function event() {
    MAX_REEL_ITEMS = parseInt(this.value, 10) * 10;
    slot = slot.changeReelItem(parseInt(this.value, 10));
    console.log(slot);
  });
  // Click handler for "Draw" button
  drawButton.addEventListener('click', () => {
    if (!slot.names.length) {
      onSettingsOpen();
      return;
    }
    slot.spin(MAX_REEL_ITEMS, socket);
  });

  // Hide fullscreen button when it is not supported
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - for older browsers support
  if (!(document.documentElement.requestFullscreen && document.exitFullscreen)) {
    fullscreenButton.remove();
  }

  // Click handler for "Fullscreen" button
  fullscreenButton.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      return;
    }

    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  });

  // Click handler for "Settings" button
  settingsButton.addEventListener('click', onSettingsOpen);

  // Click handler for "Save" button for setting page
  settingsSaveButton.addEventListener('click', () => {
    slot.names = nameListTextArea.value
      ? nameListTextArea.value.split(/\n/).filter((name) => Boolean(name.trim()))
      : [];
    slot.shouldRemoveWinnerFromNameList = removeNameFromListCheckbox.checked;
    soundEffects.mute = !enableSoundCheckbox.checked;
    onSettingsClose();
  });

  // Click handler for "Discard and close" button for setting page
  settingsCloseButton.addEventListener('click', onSettingsClose);
})();
