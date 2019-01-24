import io from 'socket.io-client';

declare var Odometer: any;

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
      this.comboBoxSize = 50;
    });
  }

  draw(dt: number) {
    const pixelY = 440 - (380 / 30 * average);

    this.shrinkComboBox(dt);

    this.totalElement.innerText = `${total}`;
    this.speedElement.innerText = `${padLeft0(average * 60)}`;
    this.maxElement.innerText = `${padLeft0(max * 60)}`;
    this.comboBoxElement.style.fontSize = `${this.comboBoxSize}px`;
    this.gaugeElement.style.clip = `rect(${pixelY}px, 300px, 440px, 0px)`;

  }

  shrinkComboBox(dt: number) {
    if(!this.comboBoxSize) return;
    this.comboBoxSize -= 150 * dt;
    if(this.comboBoxSize >= 0) return;
    this.comboBoxSize = 0; 
  }
}

class CarTheme {
  mainElement: HTMLElement;
  arrowElement: HTMLElement;
  totalElement: HTMLElement;
  speedElement: HTMLElement;
  maxElement: HTMLElement;
  counterElement: HTMLElement;
  odometer: any;

  constructor() {
    this.mainElement = document.getElementById('car');
    this.arrowElement = document.getElementById("car_arrow");
    this.totalElement = document.getElementById('car_total');
    this.speedElement = document.getElementById('car_speed');
    this.maxElement = document.getElementById('car_max');
    this.counterElement = document.getElementById('car_counter');

    this.mainElement.style.display = 'block';

    (window as any).odometerOptions = {
      // auto: false, // Don't automatically initialize everything with class 'odometer'
      // selector: '.my-numbers', // Change the selector used to automatically find things to be animated
      // format: '(,ddd).dd', // Change how digit groups are formatted, and how many digits are shown after the decimal point
      duration: 60, // Change how long the javascript expects the CSS animation to take
      // theme: 'car', // Specify the theme (if you have more than one theme css file on the page)
      // animation: 'count' // Count is a simpler animation method which just increments the value,
      //                    // use it when you're looking for something more subtle.
    };

    this.odometer = new Odometer({
      el: this.counterElement,
      value: 0,
      // format: '',
      // theme: 'digital'
    });

  }

  draw(dt: number) {
    const degree = 240 / 30 * average - 120;

    this.totalElement.innerText = `${total}`;
    this.speedElement.innerText = `${padLeft0(average * 60)}`;
    this.maxElement.innerText = `${max * 60}`;

    this.odometer.update(total);
    this.arrowElement.style.transform = `rotate(${degree}deg)`;
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