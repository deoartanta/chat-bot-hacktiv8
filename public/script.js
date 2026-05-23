const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const submitButton = form.querySelector('button[type="submit"]');

// Store the conversation history according to the backend expectation:
// [{ role: "user" | "model", text: string }]
let conversationHistory = [];

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  // 1. Add user's message to the chat box
  appendMessage('user', userMessage);
  input.value = '';

  // Save to conversation history
  conversationHistory.push({ role: 'user', text: userMessage });

  // 2. Show a temporary "Thinking..." bot message
  const thinkingMessageElement = appendMessage('bot', 'Thinking...');

  // Disable inputs while waiting for the response to prevent duplicate submissions
  input.disabled = true;
  if (submitButton) submitButton.disabled = true;

  try {
    // 3. Send the user's message as a POST request to /api/chat.
    // Send both 'conversation' and 'conversations' keys to ensure compatibility
    // with both the spec and the current index.js implementation.
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        conversation: conversationHistory,
        conversations: conversationHistory 
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract reply checking both possible property names ('result' and 'generatedText')
    const replyText = data.result || data.generatedText;

    // 4. Replace the "Thinking..." message with the AI's reply
    if (data && replyText) {
      // Parse markdown to HTML and sanitize it to prevent XSS
      const rawHtml = marked.parse(replyText);
      thinkingMessageElement.innerHTML = DOMPurify.sanitize(rawHtml);
      
      // Save the model's message to conversation history
      conversationHistory.push({ role: 'model', text: replyText });
    } else {
      throw new Error('No result received from the server API');
    }
  } catch (error) {
    console.error('Error fetching response:', error);
    
    // 5. If an error occurs, show the error message
    thinkingMessageElement.textContent = 'Failed to get response from server.';
    
    // Remove the last user message from history as it failed to complete a full turn
    conversationHistory.pop();
  } finally {
    // Re-enable inputs
    input.disabled = false;
    if (submitButton) submitButton.disabled = false;
    input.focus();

    // Scroll chat box to the bottom
    chatBox.scrollTop = chatBox.scrollHeight;
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  
  if (sender === 'bot') {
    // For bot messages (and the temporary 'Thinking...' before it gets updated),
    // parse the Markdown to HTML and sanitize it.
    const rawHtml = marked.parse(text);
    msg.innerHTML = DOMPurify.sanitize(rawHtml);
  } else {
    // For user messages, treat as plain text to prevent XSS
    msg.textContent = text;
  }
  
  chatBox.appendChild(msg);

  // Clear floated elements to ensure messages stack correctly vertically
  const clear = document.createElement('div');
  clear.style.clear = 'both';
  chatBox.appendChild(clear);

  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}
