import { io } from 'socket.io-client';
import _ from 'lodash';

// const dataH = ['remitId', 'name', 'email', 'date'];
interface dataWinner {
  remitterId: string
  name: string
  email: string
  date: string
}
function addElement(text: string) {
  // create a new div element
  const newDiv = document.createElement('li');

  // and give it some content
  const newContent = document.createTextNode(text);

  // add the text node to the newly created div
  // newDiv.setAttribute('class', 'li');
  newDiv.appendChild(newContent);

  // add the newly created element and its content into the DOM
  return newDiv;
}

const newWinnder = (data: dataWinner) => {
  const remitId = addElement(data.remitterId);
  const name = addElement(data.name);
  const email = addElement(data.email);
  const date = addElement(data.date);

  const frag = document.createElement('ul');

  frag.appendChild(remitId);
  frag.appendChild(name);
  frag.appendChild(email);
  frag.appendChild(date);

  // const currentDiv = document.getElementsByClassName('l1');
  const winnerDiv = document.getElementById('winnerList');

  if (winnerDiv) {
    winnerDiv.append(frag);
  } else {
    console.log('no element');
  }
};

(() => {
  const winnerList = document.getElementById('winnerList') as HTMLDivElement | null;

  localStorage.setItem('remitData', JSON.stringify([]));

  if (!winnerList) {
    console.log('back not wotking');
    return;
  }

  const socket = io('http://localhost:4000');
  // if (!winnerList) {
  //   return;
  // }

  socket.on('winner', (data: dataWinner) => {
    console.log('🚀 ~ file: back.ts ~ line 59 ~ socket.on ~ data', data);

    const remitData = JSON.parse(localStorage.getItem('remitData')!) as dataWinner[];

    const index = _.findIndex(remitData, (o) => o.date === data.date);
    console.log(index);
    if (index === -1) {
      localStorage.setItem('remitData', JSON.stringify([
        ...remitData,
        data
      ]));
      newWinnder(data);
    }
  });

  if (socket.active) {
    console.log(socket.id);
    socket.onAny((d) => {
      console.log('any', d);
    });

    socket.on('connect', () => {
      console.log(socket.connected); // true
      console.log(socket.id);

      if (socket.connected) {
        console.log('IAM Connected');
      }
    });
    socket.on('disconnect', () => {
      console.log(socket.connected); // false
    });
  }
})();
