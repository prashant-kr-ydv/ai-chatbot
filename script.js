document.addEventListener('DOMContentLoaded', () => {
  const chatbox = document.getElementById('chatbox');
  const chatForm = document.getElementById('chat-form');
  const userInput = document.getElementById('user-input');
  const historyList = document.getElementById('history-list');
  const newChatBtn = document.getElementById('new-chat');
  const darkToggle = document.getElementById('toggle-dark');
  const datetime = document.getElementById('datetime');
  const micBtn = document.getElementById('mic');

  let chatHistory = [];

  // 🕒 Update date and time
  function updateDateTime() {
    const now = new Date();
    datetime.textContent = now.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }
  setInterval(updateDateTime, 1000);
  updateDateTime();

  // 📜 Load history from localStorage
  function loadHistory() {
    const saved = JSON.parse(localStorage.getItem('chatHistory')) || [];
    chatHistory = saved;
    renderHistory();
  }

  function saveHistory() {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }

  function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = sender === 'bot' ? 'bot-message message' : 'user-message message';

    // If code block, use <pre><code>
    if (text.includes('```')) {
      const parts = text.split(/```/g);
      parts.forEach((part, i) => {
        const block = document.createElement(i % 2 === 0 ? 'p' : 'pre');
        if (i % 2 !== 0) {
          const code = document.createElement('code');
          code.textContent = part.trim();
          block.appendChild(code);
        } else {
          block.textContent = part.trim();
        }
        messageDiv.appendChild(block);
      });
    } else {
      messageDiv.textContent = text;
    }

    chatbox.appendChild(messageDiv);
    chatbox.scrollTop = chatbox.scrollHeight;

    if (sender === 'bot' && !text.includes("Hello! How can I assist you")) {
      speakText(text);
    }
  }

  // 🔊 Text-to-Speech
  function speakText(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  }

 // 🤖 OpenAI Bot - call backend API route
async function getBotResponse(prompt) {
  addMessage('Typing...', 'bot');
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    const rawText = await response.text(); // read once

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      console.error("Non-JSON response from server:", rawText);
      chatbox.lastChild.remove();
      addMessage(`⚠️ Server error: ${rawText}`, 'bot');
      return;
    }

    chatbox.lastChild.remove();

    const botText = data.response?.trim();
    if (botText) {
      addMessage(botText, 'bot');
      return botText;
    } else {
      addMessage("⚠️ No response from AI.", 'bot');
    }
  } catch (error) {
    chatbox.lastChild.remove();
    addMessage("⚠️ Failed to fetch response.", 'bot');
    console.error("Fetch error:", error);
  }
}
  // 📨 Handle form submission
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = userInput.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    userInput.value = '';

    const botReply = await getBotResponse(text);

    // Store as multi-turn array of message objects
    chatHistory.push({
      preview: text.length > 30 ? text.slice(0, 30) + '...' : text,
      conversation: [
        { sender: 'user', text },
        { sender: 'bot', text: botReply || '' }
      ]
    });

    saveHistory();
    renderHistory();
  });

  // 🆕 New Chat - clear chat and input
  newChatBtn.addEventListener('click', () => {
    chatbox.innerHTML = '<div class="bot-message message">👋 Hello! How can I assist you today?</div>';
    userInput.value = '';
  });

  // 🌙 Dark Mode toggle
  darkToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
  });

  // 🎤 Speech-to-Text voice input
  micBtn.addEventListener('click', () => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      alert('Speech Recognition not supported in this browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      userInput.value = transcript;
    };

    recognition.onerror = (event) => {
      alert('Voice input error: ' + event.error);
    };
  });

  // 🧾 Load a chat conversation from history
  function loadChat(index) {
    const { conversation } = chatHistory[index];
    chatbox.innerHTML = '';
    conversation.forEach(msg => addMessage(msg.text, msg.sender));
  }

  // 📂 Context menu for chat history items
  function createHistoryItem(summary, index) {
    const li = document.createElement('li');
    li.innerText = summary;
    li.title = summary;

    li.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const existingMenu = document.querySelector('.context-menu');
      if (existingMenu) existingMenu.remove();

      const menu = document.createElement('div');
      menu.className = 'context-menu';
      menu.innerHTML = `
        <button onclick="renameChat(${index})">✏️ Rename</button>
        <button onclick="shareChat(${index})">📤 Share</button>
        <button onclick="archiveChat(${index})">📁 Archive</button>
        <button onclick="deleteChat(${index})">🗑️ Delete</button>
      `;
      menu.style.top = e.pageY + 'px';
      menu.style.left = e.pageX + 'px';
      document.body.appendChild(menu);

      const removeMenu = () => {
        menu.remove();
        document.removeEventListener('click', removeMenu);
      };
      setTimeout(() => document.addEventListener('click', removeMenu), 0);
    });

    li.addEventListener('click', () => loadChat(index));
    return li;
  }

  // Render chat history list
  function renderHistory() {
    historyList.innerHTML = '';
    chatHistory.forEach((item, index) => {
      const li = createHistoryItem(item.preview, index);
      historyList.appendChild(li);
    });
  }

  // Rename a chat in history
  window.renameChat = (index) => {
    const newName = prompt('Enter new name:');
    if (!newName) return;
    chatHistory[index].preview = newName;
    saveHistory();
    renderHistory();
  };

  // Delete a chat in history
  window.deleteChat = (index) => {
    if (confirm("Delete this chat?")) {
      chatHistory.splice(index, 1);
      saveHistory();
      renderHistory();
    }
  };

  // Share chat to clipboard
  window.shareChat = (index) => {
    const conversation = chatHistory[index].conversation;
    const content = conversation.map(m => (m.sender === 'user' ? '👤 You: ' : '🤖 Bot: ') + m.text).join('\n');
    navigator.clipboard.writeText(content).then(() => alert("Chat copied to clipboard!"));
  };

  // Archive chat
  window.archiveChat = (index) => {
    const archived = JSON.parse(localStorage.getItem('archivedChats') || '[]');
    archived.push(chatHistory[index]);
    chatHistory.splice(index, 1);
    localStorage.setItem("archivedChats", JSON.stringify(archived));
    saveHistory();
    renderHistory();
  };

  // Context menu styles
  const style = document.createElement("style");
  style.innerHTML = `
    .context-menu {
      position: absolute;
      background: #fff;
      border: 1px solid #ccc;
      box-shadow: 0 0 10px rgba(0,0,0,0.15);
      padding: 8px;
      border-radius: 8px;
      z-index: 9999;
    }
    .context-menu button {
      display: block;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      padding: 5px 10px;
      cursor: pointer;
    }
    .context-menu button:hover {
      background-color: #f0f0f0;
    }
    .bot-message.message {
      background-color: #eee;
      padding: 8px;
      border-radius: 8px;
      margin: 6px 0;
    }
    .user-message.message {
      background-color: #cce5ff;
      padding: 8px;
      border-radius: 8px;
      margin: 6px 0;
      text-align: right;
    }
  `;
  document.head.appendChild(style);

  // Initialize chat on page load
  loadHistory();
  newChatBtn.click(); // Show welcome message initially
});
