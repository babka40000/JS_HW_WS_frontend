const authWindow = document.createElement('form');
authWindow.classList.add('auth-form');
authWindow.innerHTML = `<label for="nickname">Выберите псевдоним</label>
                        <input id="nickname" class="auth-form-input"></input>
                        <button>Продолжить</button>
                        <div class="warning"><div>`;

const container = document.querySelector('.container');
container.append(authWindow);

authWindow.addEventListener('submit', (e) => {
  e.preventDefault();

  const authFormInput = authWindow.querySelector('.auth-form-input');
  const nickName = authFormInput.value;

  const ws = new WebSocket('wss://js-hw-ws-backend.onrender.com/ws');

  ws.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);

    if ('isUser' in data) {
      if (data.isUser) {
        const warningPanel = authWindow.querySelector('.warning');
        warningPanel.textContent = 'Пользователь уже есть в системе, используйте другой псевдоним';
        authFormInput.value = '';
      } else {
        authWindow.remove();

        const chatFields = document.createElement('div');
        chatFields.classList.add('chat-fields');

        chatFields.innerHTML = `<div class="chat-users"></div>
                                <div class="chat-field">
                                  <div class="chat-field-messages"></div>
                                  <input class="chat-field-input" type="text"></input>
                                </div>`;

        container.append(chatFields);

        const chatFieldInput = chatFields.querySelector('.chat-field-input');
        chatFieldInput.focus();

        chatFieldInput.addEventListener('change', (eventChange) => {
          const { target } = eventChange;

          ws.send(JSON.stringify({ user: nickName, text: target.value }));
          target.value = '';
        });
      }
    } else {
      const deleteMessages = document.querySelectorAll('.message');
      for (const deleteMessage of deleteMessages) {
        deleteMessage.remove();
      }

      const deleteUsers = document.querySelectorAll('.user');
      for (const deleteUser of deleteUsers) {
        deleteUser.remove();
      }

      const chatFieldMessages = document.querySelector('.chat-field-messages');
      const chatUsers = document.querySelector('.chat-users');

      data.users.forEach((element) => {
        const user = document.createElement('div');
        user.classList.add('user');

        if (element === nickName) {
          user.textContent = 'YOU';
        } else {
          user.textContent = element;
        }

        chatUsers.append(user);
      });

      data.chat.forEach((element) => {
        const message = document.createElement('div');
        message.classList.add('message');
        message.innerHTML = ` <div class="message-status"></div>
                            <div class="message-test"></div>`;

        const messageStatus = message.querySelector('.message-status');

        if (element.user === nickName) {
          message.classList.add('my-message');
          messageStatus.textContent = `YOU ${element.time}`;
        } else {
          message.classList.add('alien-message');
          messageStatus.textContent = `${element.user}  ${element.time}`;
        }

        const messageText = message.querySelector('.message-test');
        messageText.textContent = element.text;

        chatFieldMessages.append(message);
      });

      chatFieldMessages.scrollTop = chatFieldMessages.scrollHeight;
    }
  });

  ws.addEventListener('open', () => {
    ws.send(JSON.stringify({ user: nickName }));
  });
});
