const button = document.getElementsByClassName('btn')[0];
const input = document.getElementsByClassName('txt')[0];
const start = document.getElementsByClassName('start')[0];
const chat = document.getElementsByClassName('chat-input')[0];
const area = document.getElementsByClassName('area')[0];
const openChat = document.getElementsByClassName('chat')[0];
const side = document.getElementsByClassName('side')[0];
let ws = new WebSocket('wss://chat-dz.herokuapp.com/');
let userName;
const names = [];

function crateRecord(name) {
  const div = document.createElement('div');
  const circle = document.createElement('div');
  circle.classList.add('circle');
  div.classList.add('left');
  div.classList.add(name);
  const p = document.createElement('p');
  p.style.fontSize = '20px';
  p.style.margin = '20px';
  p.innerText = name;
  circle.appendChild(p);
  div.appendChild(circle);
  side.appendChild(div);
}

function addMessage(name, dateTime, message, className) {
  let messageName = name;
  const element = document.createElement('p');
  element.classList.add(className);
  if (className === 'right') {
    element.classList.add('red');
    messageName = 'You';
  }
  if (className !== 'center') element.innerText = `${messageName}  ${dateTime}`;
  else element.innerText = dateTime;
  area.appendChild(element);
  const item = document.createElement('p');
  item.classList.add(className);
  item.innerText = message;
  area.appendChild(item);
}

input.addEventListener('keypress', () => {
  input.classList.remove('not-valid');
});

button.addEventListener('click', (event) => {
  event.preventDefault();
  userName = input.value.trim();
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ userName }));
  else {
    ws = new WebSocket('wss://chat-dz.herokuapp.com/');
    setTimeout(() => ws.send(JSON.stringify({ userName })), 1000);
  }
  document.body.style.cursor = 'wait';
});

ws.onmessage = (message) => {
  const messages = JSON.parse(message.data);
  const { startApp, successName, logOut } = messages;
  document.body.style.cursor = '';
  if (startApp) {
    const index = names.findIndex((item) => item === startApp);
    if (index < 0) {
      names.push(startApp);
      crateRecord(startApp);
    }
    return;
  }
  if (successName) {
    input.value = '';
    start.classList.add('hidden');
    openChat.classList.remove('hidden');
    side.classList.remove('hidden');
    crateRecord('You');
  } else if (successName === undefined && logOut === undefined) {
    messages.forEach((val) => {
      addMessage(val.name, val.dateTime, val.message, 'left');
      const index = names.findIndex((item) => item === val.name);
      if (index < 0) {
        names.push(val.name);
        crateRecord(val.name);
      }
    });
  } else if (logOut) {
    const { name } = messages;
    const element = document.getElementsByClassName(name)[0];
    element.outerHTML = '';
    const dateTime = `${new Date().toLocaleTimeString().substr(0, 5)}  ${new Date().toLocaleDateString()}`;
    addMessage(name, dateTime, `${name} left the chat`, 'center');
  } else {
    input.classList.add('not-valid');
    input.value = `This ${userName} occupied. Please change your nick`;
    userName = undefined;
  }
};

chat.addEventListener('keypress', (event) => {
  if (event.key === 'Enter' && chat.value !== '') {
    const message = chat.value;
    const name = userName;
    const dateTime = `${new Date().toLocaleTimeString().substr(0, 5)}  ${new Date().toLocaleDateString()}`;
    chat.value = '';
    ws.send(JSON.stringify({
      name, dateTime, message,
    }));
    if (ws.readyState === WebSocket.OPEN) {
      addMessage('You', dateTime, message, 'right');
    }
  }
});
