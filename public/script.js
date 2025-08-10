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
    let currentChatIndex = -1;

    function initializeNewChat() {
        chatbox.innerHTML = '<div class="message bot-message">👋 Hello! How can I assist you today?</div>';
        userInput.value = '';
        currentChatIndex = -1;
    }

    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender === 'bot' ? 'bot-message' : 'user-message');
        messageDiv.textContent = text;
        chatbox.appendChild(messageDiv);
        chatbox.scrollTop = chatbox.scrollHeight;
    }

    async function getBotResponse(prompt) {
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'message bot-message';
        typingIndicator.textContent = 'Typing...';
        chatbox.appendChild(typingIndicator);
        chatbox.scrollTop = chatbox.scrollHeight;

        try {
            const response = await fetch('/api/chat', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });
            typingIndicator.remove();
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Server error: ${response.status}`);
            }
            const data = await response.json();
            return data.response?.trim();
        } catch (error) {
            typingIndicator.remove();
            addMessage(`⚠️ Error: ${error.message}`, 'bot');
            return null;
        }
    }

    function saveHistory() { localStorage.setItem('chatHistory', JSON.stringify(chatHistory)); }
    function loadHistory() { chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || []; renderHistory(); }
    function renderHistory() { historyList.innerHTML = ''; chatHistory.forEach((item, index) => historyList.appendChild(createHistoryItem(item.preview, index))); }

    function createHistoryItem(summary, index) {
        const li = document.createElement('li');
        li.textContent = summary;
        li.title = summary;
        li.addEventListener('click', () => loadChat(index));
        return li;
    }
    
    function loadChat(index) {
        const { conversation } = chatHistory[index];
        chatbox.innerHTML = '';
        conversation.forEach(msg => addMessage(msg.text, msg.sender));
        currentChatIndex = index;
    }

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = userInput.value.trim();
        if (!text) return;
        addMessage(text, 'user');
        userInput.value = '';
        const botReply = await getBotResponse(text);
        if (!botReply) return;

        if (currentChatIndex === -1) {
            const newConversation = { preview: text.slice(0, 30) + (text.length > 30 ? '...' : ''), conversation: [{ sender: 'user', text }, { sender: 'bot', text: botReply }]};
            chatHistory.push(newConversation);
            currentChatIndex = chatHistory.length - 1;
        } else {
            chatHistory[currentChatIndex].conversation.push({ sender: 'user', text }, { sender: 'bot', text: botReply });
        }
        saveHistory();
        renderHistory();
    });

    newChatBtn.addEventListener('click', initializeNewChat);
    darkToggle.addEventListener('click', () => { document.body.classList.toggle('dark'); localStorage.setItem('darkMode', document.body.classList.contains('dark')); });

    function updateDateTime() { datetime.textContent = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }); }
    if (localStorage.getItem('darkMode') === 'true') { document.body.classList.add('dark'); }
    loadHistory();
    initializeNewChat();
    updateDateTime();
    setInterval(updateDateTime, 30000);
});