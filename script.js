const textarea = document.getElementById("textArea");
const chatContainer = document.getElementById("chat-container");
const sendBtn = document.getElementById("buttonSend");
const clearBtn = document.getElementById("clearChat");
const scrollDownBtn = document.getElementById("scrollDownBtn");

const API_KEY = "API_KEY"; // ganti dengan API key kamu
const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const personaPrompt = `... (isi prompt tetap sama) ...`;

// Cache obrolan
let chatCache = [];

// Scroll ke bawah
function scrollToBottom() {
  chatContainer.scrollTo({
    top: chatContainer.scrollHeight,
    behavior: "smooth",
  });
}

// === Textarea mirip WhatsApp ===
textarea.style.height = "35px";
textarea.addEventListener("input", function () {
  this.style.height = "35px";
  this.style.height = Math.min(this.scrollHeight, 120) + "px";
  setChatHeight();
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
  setChatHeight();

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

// ✅ Atur tinggi chat-container dinamis
function setChatHeight() {
  const header = document.querySelector(".header");
  const chatInput = document.querySelector(".chat-input");

  const headerHeight = header.offsetHeight;
  const inputHeight = chatInput.offsetHeight;

  const viewportHeight = window.visualViewport
    ? window.visualViewport.height
    : window.innerHeight;

  chatContainer.style.height =
    viewportHeight - headerHeight - inputHeight + "px";
}

// Jalankan sekali di awal
setChatHeight();
window.addEventListener("resize", setChatHeight);

// Input & chat naik saat keyboard muncul (mobile)
if (window.visualViewport) {
  const chatInput = document.querySelector(".chat-input");

  const adjustForKeyboard = () => {
    const viewport = window.visualViewport;
    const offset =
      viewport.height < window.innerHeight
        ? window.innerHeight - viewport.height
        : 0;

    chatInput.style.transform = `translateY(-${offset}px)`;
    setChatHeight();
    scrollToBottom();
  };

  window.visualViewport.addEventListener("resize", adjustForKeyboard);
  window.visualViewport.addEventListener("scroll", adjustForKeyboard);
}
