<!-- floating_chatbot.html -->
<link href="https://fonts.googleapis.com/css2?family=Nunito&display=swap" rel="stylesheet">
<style>
  #chatbot-toggle {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
    background-color: #7b1fa2;
    color: white;
    border: none;
    border-radius: 50%;
    width: 60px;
    height: 60px;
    font-size: 28px;
    cursor: pointer;
    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
  }

  #chatbot-container {
    position: fixed;
    bottom: 90px;
    right: 20px;
    width: 360px;
    max-height: 550px;
    background: white;
    border-radius: 20px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.25);
    overflow: hidden;
    display: none;
    flex-direction: column;
    z-index: 9999;
    font-family: 'Nunito', sans-serif;
  }

  .chatbot-header {
    background: #7b1fa2;
    color: white;
    padding: 1rem;
    font-size: 18px;
    font-weight: bold;
    text-align: center;
  }

  .chatbot-messages {
    flex: 1;
    padding: 1rem;
    overflow-y: auto;
  }

  .chatbot-footer {
    display: flex;
    align-items: center;
    padding: 0.5rem 1rem;
    border-top: 1px solid #eee;
  }

  .chatbot-footer input[type="text"] {
    flex: 1;
    padding: 0.5rem;
    border-radius: 20px;
    border: 1px solid #ccc;
    outline: none;
  }

  .chatbot-footer button {
    background: none;
    border: none;
    cursor: pointer;
    margin-left: 0.5rem;
    font-size: 20px;
  }

  #lang-select {
    display: none;
    padding: 0.5rem;
    margin: 0.5rem 1rem;
    border: 1px solid #ddd;
    border-radius: 6px;
  }
</style>

<!-- Toggle Button -->
<button id="chatbot-toggle">💬</button>

<!-- Chatbot Box -->
<div id="chatbot-container">
  <div class="chatbot-header">
    Aarav AI 🛕
  </div>
  <div class="chatbot-messages" id="chat-messages">
    <!-- messages will appear here -->
  </div>
  <select id="lang-select">
    <option value="en">English</option>
    <option value="hi">Hindi</option>
    <option value="te">Telugu</option>
  </select>
  <div class="chatbot-footer">
    <input type="text" id="chat-input" placeholder="Ask about temples...">
    <button onclick="startVoiceInput()">🎙️</button>
    <button onclick="document.getElementById('image-upload').click()">➕</button>
    <input type="file" id="image-upload" style="display:none" accept="image/*">
    <button onclick="sendMessage()">➡️</button>
  </div>
</div>

<script>
  const toggle = document.getElementById("chatbot-toggle");
  const box = document.getElementById("chatbot-container");
  const input = document.getElementById("chat-input");
  const langSelect = document.getElementById("lang-select");
  const messages = document.getElementById("chat-messages");

  toggle.onclick = () => {
    box.style.display = box.style.display === "flex" ? "none" : "flex";
    box.style.flexDirection = "column";
  };

  function appendMessage(text, sender = "user") {
    const div = document.createElement("div");
    div.style.margin = "0.5rem 0";
    div.style.textAlign = sender === "user" ? "right" : "left";
    div.innerHTML = `<div style='display:inline-block; background:${sender === 'user' ? '#d1c4e9' : '#f0f0f0'}; padding:0.5rem 1rem; border-radius:15px;'>${text}</div>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  async function sendMessage() {
    const text = input.value;
    if (!text) return;
    appendMessage(text, "user");
    input.value = "";

    // Send to backend
    const res = await fetch("http://localhost:5000/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: text })
    });

    const data = await res.json();
    appendMessage(data.answer, "bot");

    if (data.map_url) {
      appendMessage(`<a href='${data.map_url}' target='_blank'>📍 View on Google Maps</a>`, "bot");
    }

    // Show language options after first reply
    langSelect.style.display = "block";
    langSelect.onchange = async () => {
      const transRes = await fetch("http://localhost:5000/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: data.answer, lang: langSelect.value })
      });
      const trans = await transRes.json();
      appendMessage(`🌐 ${trans.translated}`, "bot");
    };
  }

  function startVoiceInput() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-IN";
    recognition.start();

    recognition.onresult = (event) => {
      input.value = event.results[0][0].transcript;
    };
  }
</script>
