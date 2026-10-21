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
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userText }] }],
                generationConfig: { maxOutputTokens: 8192 }
            })
        });

        const data = await response.json();
        console.log("Full API Response:", data); // Check console if it fails
        
        const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process that question. Please try again.";
        
        document.getElementById(loadingId).innerText = aiReply;
    } catch (error) {
        document.getElementById(loadingId).innerText = "Error connecting to Gemini API. Please check your API key or internet connection.";
    }
}
