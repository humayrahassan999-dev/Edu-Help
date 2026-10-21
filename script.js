// Tab Navigation Logic with Safety Checks
function switchTab(tabId, btn) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    const target = document.getElementById(tabId);
    if (target) target.classList.add('active');
    if (btn) btn.classList.add('active');
}

// Check Local Storage API Key on Load
window.onload = function() {
    const savedKey = localStorage.getItem("gemini_api_key");
    if (savedKey) {
        const status = document.getElementById("key-status");
        if (status) status.innerText = "🔑 Key Status: Connected & Ready";
    }
};

// Save Key Function
function saveApiKey() {
    const inputField = document.getElementById("api-key-input");
    if (!inputField) return;
    const key = inputField.value.trim();
    
    if (key) {
        localStorage.setItem("gemini_api_key", key);
        const status = document.getElementById("key-status");
        if (status) status.innerText = "🔑 Key Status: Connected & Ready";
        alert("Key Saved Successfully!");
        inputField.value = "";
        
        const buttons = document.querySelectorAll('.nav-btn');
        if (buttons.length > 1) {
            switchTab('ai-buddy', buttons[1]);
        }
    } else {
        alert("Please enter a valid API key.");
    }
}

// Handle Enter Key in Chat Input
function handleKeyPress(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
}

// Live Gemini API Request Handler
async function sendMessage() {
    const inputField = document.getElementById("user-input");
    if (!inputField) return;
    const userText = inputField.value.trim();
    const apiKey = localStorage.getItem("gemini_api_key");

    if (!userText) return;

    if (!apiKey) {
        alert("Please configure your Gemini API key in the API Guide tab first!");
        const buttons = document.querySelectorAll('.nav-btn');
        if (buttons.length > 2) {
            switchTab('api-guide', buttons[2]);
        }
        return;
    }

    // Append and render User Message
    appendMessage(userText, 'user');
    inputField.value = "";

    // Initialize dynamic AI loading node
    const loadingId = appendMessage("Thinking...", 'ai');

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ text: userText }] 
                }]
            })
        });

        const data = await response.json();
        
        const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                        data.error?.message || 
                        "Sorry, I couldn't process that question. Please check your API key limits.";
        
        const loadingNode = document.getElementById(loadingId);
        if (loadingNode) loadingNode.innerText = aiReply;

    } catch (error) {
        const loadingNode = document.getElementById(loadingId);
        if (loadingNode) loadingNode.innerText = "Error connecting to Gemini API. Please check your internet connection.";
    }
}

// Message DOM Builder
function appendMessage(text, sender) {
    const chatMessages = document.getElementById("chat-messages");
    if (!chatMessages) return '';
    
    const msgDiv = document.createElement("div");
    const msgId = 'msg-' + Date.now();
    msgDiv.id = msgId;
    msgDiv.className = `message ${sender}`;
    msgDiv.innerText = text;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return msgId;
}
