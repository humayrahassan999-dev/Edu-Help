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

// Ultra-Advanced Live Gemini API Request Handler
async function sendMessage() {
    const inputField = document.getElementById("user-input");
    const userText = inputField.value.trim();
    const apiKey = localStorage.getItem("gemini_api_key");

    if (!userText) return;

    if (!apiKey) {
        alert("Please configure your Gemini API key in the API Guide tab first!");
        switchTab('api-guide', document.querySelectorAll('.nav-btn')[2]);
        return;
    }

    // Append and render User Message
    appendMessage(userText, 'user');
    inputField.value = "";

    // Initialize dynamic AI loading node
    const loadingId = appendMessage("Thinking...", 'ai');

    try {
        // Utilizing the current high-performance production model endpoint: gemini-3.8-flash
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ text: userText }] 
                }],
                generationConfig: { 
                    maxOutputTokens: 8192,
                    temperature: 0.7
                }
            })
        });

        const data = await response.json();
        
        // Advanced diagnostics logging to inspect full payload structure if necessary
        console.debug("API Response Payload:", data);

        // Safely extract text utilizing optional chaining architecture
        const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                        data.error?.message || 
                        "Sorry, I couldn't process that question. Please verify your API key limits.";
        
        document.getElementById(loadingId).innerText = aiReply;

    } catch (networkError) {
        console.error("Critical Network Exception:", networkError);
        document.getElementById(loadingId).innerText = "Error connecting to the Gemini API network. Please check your connection.";
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
