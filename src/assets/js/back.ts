import { io } from 'socket.io-client';

// const dataH = ['remitId', 'name', 'email', 'date'];
(() => {
  const winnerList = document.getElementById('winnerList') as HTMLDivElement | null;

  if (!winnerList) {
    console.log('back not wotking');
    return;
  }

  const socket = io('http://localhost:4000');
  // if (!winnerList) {
  //   return;
  // }

  socket.io.on('error', (error) => {
    console.log('sock', error);
  });
  socket.io.on('ping', () => {
    console.log('ping');
  });
  socket.io.on('open', () => {
    console.log('open');
    console.log(socket.id);

    socket.emit('test', 1);
    socket.on('test', (d: number) => {
      console.log(d);
      setTimeout(() => {
        socket.emit('test', d + 1);
      }, 200);
    });
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

      setTimeout(() => {
        if (socket.connected) {
          console.log('IAM Connected');
        }
      }, 10000);
    });

    socket.on('winner', (data) => {
      console.log('🚀 ~ file: back.ts ~ line 59 ~ socket.on ~ data', data);
      const winDiv = document.createElement('div');
      winDiv.setAttribute('id', 'winner');

      const li = document.createElement('div');
      li.setAttribute('class', 'li');
      // li.outerHTML = '123';

      winDiv.append(li);

      winnerList!.append();
      console.log(data, 'thhe data');
    });

    socket.on('disconnect', () => {
      console.log(socket.connected); // false
    });
  }
})();
