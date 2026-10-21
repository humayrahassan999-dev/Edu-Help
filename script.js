// Tab Navigation Logic with Safety Checks
function switchTab(tabId, btn) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    const target = document.getElementById(tabId);
    if (target) target.classList.add('active');
    if (btn) btn.classList.add('active');
}

// Run on Page Load: Check API Key and Load JSON Data
window.onload = function() {
    const savedKey = localStorage.getItem("gemini_api_key");
    if (savedKey) {
        const status = document.getElementById("key-status");
        if (status) status.innerText = "🔑 Key Status: Connected & Ready";
    }
    
    // Fetch and display textbooks from data.json
    loadTextbooks();
};

// Fetch data.json and populate the Textbooks tab
async function loadTextbooks() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        
        const textbookSection = document.getElementById('textbooks');
        if (textbookSection && data.textbooks) {
            let html = `<h2>Class Textbooks (${data.studentInfo.class})</h2>`;
            html += `<p style="color: #555; margin-bottom: 15px;"><strong>Subject:</strong> ${data.studentInfo.subject}</p>`;
            html += `<ul style="padding-left: 20px; line-height: 1.6;">`;
            
            data.textbooks.forEach(book => {
                html += `<li style="margin-bottom: 8px;"><strong>${book.title}</strong> — Page ${book.page} <br><span style="font-size: 0.9rem; color: #666;">Topic: ${book.topic}</span></li>`;
            });
            
            html += `</ul>`;
            textbookSection.innerHTML = html;
        }
    } catch (error) {
        console.error("Error loading textbooks JSON:", error);
        const textbookSection = document.getElementById('textbooks');
        if (textbookSection) {
            textbookSection.innerHTML = `<h2>Class Textbooks</h2><p style="color: red;">Could not load textbook data from JSON file.</p>`;
        }
    }
}

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
