import io from 'socket.io-client';

console.log('i am loaded, i am lord. i am tachanka');

const serverUrl = 'http://192.168.0.2:58825';

const socket = io(serverUrl);
window.onerror = (message, file, line, col, error) => {
  socket.emit('log', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
};

socket.on('refresh', () => {
  location.reload();
});

class RhythmGameTheme {
  mainElement: HTMLElement;
  gaugeElement: HTMLElement;
  speedElement: HTMLElement;
  totalElement: HTMLElement;
  comboBoxElement: HTMLElement;
  maxElement: HTMLElement;
  comboBoxSize: number;

  constructor() {
    this.mainElement = document.getElementById('rhythmGame')
    this.gaugeElement = document.getElementById('rhythmGame_gauge_mid')
    this.speedElement = document.getElementById('rhythmGame_speed')
    this.totalElement = document.getElementById('rhythmGame_total')
    this.comboBoxElement = document.getElementById('rhythmGame_comboBox')
    this.maxElement = document.getElementById('rhythmGame_max')
    this.comboBoxSize = 0;

    this.mainElement.style.display = 'block';

    socket.on('key', async (key) => {
      this.comboBoxSize = 10;
    });
  }

  draw(dt: number) {
    this.shrinkComboBox(dt);

    this.totalElement.innerText = `${total}`;
    this.speedElement.innerText = `${padLeft0(average * 60)}`;
    this.maxElement.innerText = `${padLeft0(max * 60)}`;
    this.comboBoxElement.style.fontSize = `${this.comboBoxSize}vh`;

    const percentY = 12 + (100 - 24) / 16 * (16 - average);
    this.gaugeElement.style.clip = `rect(${percentY}vh, 100vw, 100vh, 0)`;
  }

  shrinkComboBox(dt: number) {
    if(!this.comboBoxSize) return;
    this.comboBoxSize -= 30 * dt;
    if(this.comboBoxSize >= 0) return;
    this.comboBoxSize = 0;
  }
}

const theme = new RhythmGameTheme;

let average = 0;
let total = 0;
let max = 0;
let previousTime = 0;

socket.on('key', async (key) => {
  average += 1;
  total += 1;
  console.log(key);
  setTimeout(() => {
    average -= 1;
  }, 1000);
  if(max >= average) return;
  max = average;
});


function padLeft0(num: number) {
  const temp = '000' + `${num}`;
  return temp.slice(-4);
}

function tick() {
  const currentTime = Date.now();
  const dt = (currentTime - previousTime) / 1000;
  previousTime = currentTime;

  theme.draw(dt);

  // console.log(degree);
  requestAnimationFrame(tick);
}
previousTime = Date.now();
tick();