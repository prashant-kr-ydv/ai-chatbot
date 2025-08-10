document.addEventListener('DOMContentLoaded', () => {
    const chatbox = document.getElementById('chatbox');
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const historyList = document.getElementById('history-list');
    const newChatBtn = document.getElementById('new-chat');
    const darkToggle = document.getElementById('toggle-dark');
    const datetime = document.getElementById('datetime');

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
        li.dataset.index = index;
        li.addEventListener('click', () => loadChat(index));
        li.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            document.querySelector('.context-menu')?.remove();
            const menu = document.createElement('div');
            menu.className = 'context-menu';
            menu.style.top = `${e.pageY}px`;
            menu.style.left = `${e.pageX}px`;
            const actions = [
                { label: '✏️ Rename', action: () => renameChat(index) },
                { label: '🗑️ Delete', action: () => deleteChat(index) }
            ];
            actions.forEach(item => {
                const button = document.createElement('button');
                button.innerHTML = item.label;
                button.addEventListener('click', () => { item.action(); menu.remove(); });
                menu.appendChild(button);
            });
            document.body.appendChild(menu);
            const closeListener = (event) => {
                if (!menu.contains(event.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeListener);
                }
            };
            setTimeout(() => document.addEventListener('click', closeListener), 0);
        });
        return li;
    }
    
    function loadChat(index) {
        const { conversation } = chatHistory[index];
        chatbox.innerHTML = '';
        conversation.forEach(msg => addMessage(msg.text, msg.sender));
        currentChatIndex = index;
    }
    
    function renameChat(index) {
        const newName = prompt('Enter a new name for this chat:', chatHistory[index].preview);
        if (newName && newName.trim()) {
            chatHistory[index].preview = newName.trim();
            saveHistory();
            renderHistory();
        }
    }

    function deleteChat(index) {
        if (confirm(`Are you sure you want to delete the chat: "${chatHistory[index].preview}"?`)) {
            chatHistory.splice(index, 1);
            saveHistory();
            renderHistory();
            if (chatHistory.length > 0) {
                loadChat(Math.max(0, index - 1));
            } else {
                initializeNewChat();
            }
        }
    }

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = userInput.value.trim();
        if (!text) return;
        addMessage(text, 'user');
        userInput.value = '';
        const botReply = await getBotResponse(text);
        if (!botReply) return;
        addMessage(botReply, 'bot');
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