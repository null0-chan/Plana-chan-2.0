const textarea = document.getElementById("textArea");
const chatContainer = document.getElementById("chat-container");
const sendBtn = document.getElementById("buttonSend");
const clearBtn = document.getElementById("clearChat");
const scrollDownBtn = document.getElementById("scrollDownBtn");

const API_KEY = "AIzaSyCn3UbWdYFaPeVfLLrLWHnpIVaG048fe9s"; // ganti dengan API key kamu
const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const personaPrompt = `
Kamu adalah Plana dari game Blue Archive ... (isi sama seperti sebelumnya)
`;

// Cache obrolan
let chatCache = [];

// Scroll ke bawah
function scrollToBottom() {
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// === Textarea mirip WhatsApp ===
textarea.style.height = "35px";
textarea.addEventListener("input", function () {
  this.style.height = "35px";
  this.style.height = Math.min(this.scrollHeight, 120) + "px";
  scrollToBottom();
});

// Kirim pesan
async function sendMessage() {
  const text = textarea.value.trim();
  if (!text) return;

  chatCache.push({ role: "user", message: text });

  const message = document.createElement("div");
  message.classList.add("message", "user");
  message.textContent = text;
  chatContainer.appendChild(message);
  scrollToBottom();

  textarea.value = "";
  textarea.style.height = "35px";
  textarea.focus();

  const reply = document.createElement("div");
  reply.classList.add("message");
  reply.textContent = "Plana-chan sedang mengetik...";
  chatContainer.appendChild(reply);
  scrollToBottom();

  try {
    let fullPrompt = personaPrompt + "\n";
    chatCache.forEach((entry) => {
      if (entry.role === "user") {
        fullPrompt += `User: ${entry.message}\n`;
      } else {
        fullPrompt += `${entry.message}\n`;
      }
    });

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
      }),
    });

    const data = await response.json();
    const aiText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Maaf, Plana-chan bingung...";

    chatCache.push({ role: "plana", message: aiText });
    reply.textContent = aiText;
    scrollToBottom();
  } catch (error) {
    reply.textContent = "Terjadi kesalahan: " + error.message;
    scrollToBottom();
  }
}

// Tombol kirim
sendBtn.addEventListener("click", sendMessage);

// Enter = newline, Shift+Enter = kirim
textarea.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Clear chat
clearBtn.addEventListener("click", () => {
  chatContainer.innerHTML = "";
  chatCache = [];
});

// Tombol scroll pasif
chatContainer.addEventListener("scroll", () => {
  const distanceFromBottom =
    chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight;

  if (distanceFromBottom > 150) {
    scrollDownBtn.classList.add("show");
  } else {
    scrollDownBtn.classList.remove("show");
  }
});
scrollDownBtn.addEventListener("click", scrollToBottom);

// Pastikan tetap ke bawah saat keyboard naik (mobile)
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", () => {
    scrollToBottom();
  });
  }
