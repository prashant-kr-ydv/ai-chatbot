🤖 AI Web Chatbot

A modern web-based AI chatbot built using HTML, CSS, JavaScript, and OpenAI/HuggingFace APIs.
The chatbot supports voice input/output, chat history, dark mode, and responsive UI.

🚀 Features
💬 Core Chat Features

AI-powered conversations

Real-time API response using fetch()

Chat history stored in localStorage

Sidebar navigation (Home, New Chat, History)

Date & Time display in chat

🎤 Voice Features

Speech-to-text (Voice input)

Text-to-speech (Voice output)

🎨 UI/UX

Beautiful modern interface

Dark mode toggle 🌙

Smooth animations

Fully responsive (Mobile + Desktop)

🛠️ Tech Stack
Layer	Technology
Frontend	HTML, CSS, JavaScript
AI API	OpenAI / Hugging Face
Storage	Browser LocalStorage
Voice	Web Speech API
📁 Project Structure
AI-Chatbot/
│
├── index.html        # Main UI
├── style.css         # Styling & animations
├── script.js         # Chat logic + API calls
├── assets/           # Icons / images (optional)
└── README.md
⚙️ Setup Instructions
1️⃣ Clone the repository
git clone https://github.com/yourusername/ai-chatbot.git
cd ai-chatbot

2️⃣ Add your API Key
Open script.js and replace:
const API_KEY = "YOUR_API_KEY_HERE";

You can use:


OpenAI API
OR


HuggingFace Inference API



3️⃣ Run the project
Just open:
index.html

in your browser 🎉
No server required.

🧠 How It Works


User types or speaks a message.


JavaScript sends request to AI API.


AI response is displayed in chat.


Conversation is saved in LocalStorage.


Voice output reads AI reply aloud.



🌙 Dark Mode
Toggle the Dark Mode button in the sidebar to switch themes.

📱 Responsive Design
Works smoothly on:


Desktop 💻


Tablet 📱


Mobile 📲



🔮 Future Improvements


User login & cloud chat history


File upload support


Multiple AI models selection


Emoji & GIF support


Backend deployment (Vercel)



👨‍💻 Author
Prashant Kumar
Electronics & Communication Engineer
Full-Stack & Generative AI Developer

