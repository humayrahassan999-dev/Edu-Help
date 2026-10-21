// Tab Navigation Logic
function switchTab(tabId, btn) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    btn.classList.add('active');
}

// Check Local Storage API Key on Load
window.onload = function() {
    const savedKey = localStorage.getItem("gemini_api_key");
    if (savedKey) {
        document.getElementById("key-status").innerText = "🔑 Key Status: Connected & Ready";
    }
};

// Save Key
function saveApiKey() {
    const key = document.getElementById("api-key-input").value.trim();
    if (key) {
        localStorage.setItem("gemini_api_key", key);
        document.getElementById("key-status").innerText = "🔑 Key Status: Connected & Ready";
        alert("Key Saved Successfully!");
        document.getElementById("api-key-input").value = "";
        switchTab('ai-buddy', document.querySelectorAll('.nav-btn')[1]);
    } else {
        alert("Please enter a valid API key.");
    }
}

// Handle Enter Key in Chat
function handleKeyPress(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
}

// Live Gemini API Request
async function sendMessage() {
    const inputField = document.getElementById("user-input");
    const userText = inputField.value.trim();
    const apiKey = localStorage.getItem("gemini_api_key");

    if (!userText) return;

    if (!apiKey) {
        alert("Please set your Gemini API key in the API Guide tab first!");
        switchTab('api-guide', document.querySelectorAll('.nav-btn')[3]);
        return;
    }

    // Append User Message
    appendMessage(userText, 'user');
    inputField.value = "";

    // Loading state
    const loadingId = appendMessage("Thinking...", 'ai');

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userText }] }],
                generationConfig: { maxOutputTokens: 8192 }
            })
        });

        const data = await response.json();
        const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process that question. Please try again.";
        
        document.getElementById(loadingId).innerText = aiReply;
    } catch (error) {
        document.getElementById(loadingId).innerText = "Error connecting to Gemini API. Please check your API key or internet connection.";
    }
}

// Message DOM Builder
function appendMessage(text, sender) {
    const chatMessages = document.getElementById("chat-messages");
    const msgDiv = document.createElement("div");
    const msgId = 'msg-' + Date.now();
    msgDiv.id = msgId;
    msgDiv.className = `message ${sender}`;
    msgDiv.innerText = text;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return msgId;
  }
