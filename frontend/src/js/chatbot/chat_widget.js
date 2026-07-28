const CHAT_API = "http://localhost:5000/api/chat";

const btn = document.getElementById("chatWidgetButton");
const box = document.getElementById("chatWidgetBox");
const closeBtn = document.getElementById("chatCloseBtn");
const messagesDiv = document.getElementById("chatMessages");
const input = document.getElementById("chatInput");
const sendBtn = document.getElementById("chatSendBtn");

// toggle open
btn.onclick = () => {
  box.style.display = "flex";
  loadChatHistory();
};

// close
closeBtn.onclick = () => {
  box.style.display = "none";
};

// send message
sendBtn.onclick = sendMessage;
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  appendMessage("student", text);
  input.value = "";

  const token = localStorage.getItem("sp_token");

  try {
    const res = await axios.post(
      `${CHAT_API}/message`,
      { message: text },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    appendMessage("bot", res.data.reply);
  } catch (err) {
    appendMessage("bot", "Error. Try again.");
  }
}

// load history
async function loadChatHistory() {
  messagesDiv.innerHTML = "";
  const token = localStorage.getItem("sp_token");

  try {
    const res = await axios.get(`${CHAT_API}/history`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    res.data.forEach((msg) => {
      appendMessage(msg.role, msg.message);
    });
  } catch {
    appendMessage("bot", "Cannot load previous messages.");
  }
}

function appendMessage(role, text) {
  const div = document.createElement("div");
  div.className = role === "student" ? "msg-student" : "msg-bot";
  div.innerHTML = `<span>${text}</span>`;
  messagesDiv.appendChild(div);

  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
