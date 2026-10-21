// Tab Navigation
function switchTab(tabId, btn) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    const target = document.getElementById(tabId);
    if (target) target.classList.add('active');
    if (btn) btn.classList.add('active');
}

// On page load
window.onload = async function() {
    await loadTextbooks();
    checkExistingKeyStatus();

    // Hide loading screen smoothly after everything is ready
    const loader = document.getElementById('loading-screen');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }
};

// Check key status on load for API guide alert box
function checkExistingKeyStatus() {
    const savedKey = localStorage.getItem("gemini_api_key");
    const alertBox = document.getElementById("api-alert-box");
    if (savedKey && alertBox) {
        alertBox.style.display = "block";
        alertBox.className = "alert-info";
        alertBox.innerText = "You have already entered the API Key. Now you can use the AI assistant.";
    }
}

// Fetch and display NCTB textbooks from data.json
async function loadTextbooks() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error("Failed to load JSON");
        const data = await response.json();
        
        const container = document.getElementById('textbook-list');
        if (container && data.textbooks) {
            let html = '';
            data.textbooks.forEach(book => {
                html += `
                    <div class="textbook-card">
                        <div>
                            <h3>${book.title}</h3>
                            <p>Class: ${book.classLevel} | Subject: ${book.subject}</p>
                        </div>
                        <a href="${book.link}" target="_blank" class="btn-link">View NCTB</a>
                    </div>
                `;
            });
            container.innerHTML = html;
        }
    } catch (error) {
        console.error("Error loading textbooks:", error);
        const container = document.getElementById('textbook-list');
        if (container) container.innerHTML = `<p style="color: red;">Could not load textbooks list.</p>`;
    }
}

// Save API Key with advanced conditional themes & messages
function saveApiKey() {
    const inputField = document.getElementById("api-key-input");
    const alertBox = document.getElementById("api-alert-box");
    if (!inputField || !alertBox) return;

    const key = inputField.value.trim();
    const existingKey = localStorage.getItem("gemini_api_key");

    if (!key) {
        alert("Please paste a valid API key before saving.");
        return;
    }

    alertBox.style.display = "block";

    if (existingKey) {
        // If already entered before
        alertBox.className = "alert-info";
        alertBox.innerText = "You have already entered the API Key. Now you can use the AI assistant.";
    } else {
        // First time entry
        localStorage.setItem("gemini_api_key", key);
        alertBox.className = "alert-success";
        alertBox.innerText = "Your API Key has been saved";
    }
    inputField.value = "";
}

// Handle Enter key in chat
function handleKeyPress(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
}

// Send message to Gemini AI or return required prompt notice
async function sendMessage() {
    const inputField = document.getElementById("user-input");
    if (!inputField) return;
    const userText = inputField.value.trim();
    const apiKey = localStorage.getItem("gemini_api_key");

    if (!userText) return;

    // Append user message
    appendMessage(userText, 'user');
    inputField.value = "";

    // Check if API key is inserted
    if (!apiKey) {
        appendMessage("You didn't insert the API Key yet. Insert it and use it. I am with you for your studies.", 'ai');
        return;
    }

    const loadingId = appendMessage("Thinking...", 'ai');

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userText }] }]
            })
        });

        const data = await response.json();
        const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                        data.error?.message || 
                        "Sorry, I couldn't process that question. Please check your API key.";
        
        const loadingNode = document.getElementById(loadingId);
        if (loadingNode) loadingNode.innerText = aiReply;

    } catch (error) {
        const loadingNode = document.getElementById(loadingId);
        if (loadingNode) loadingNode.innerText = "Connection error. Please check your internet.";
    }
}

// Helper to append messages to chat
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
