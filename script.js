const textarea = document.querySelector(".chat-input textarea");
const chatContainer = document.getElementById("chat-container");
const sendBtn = document.getElementById("buttonSend");
const clearBtn = document.getElementById("clearChat");

const API_KEY = "API_KEY"; // ganti dengan API key kamu
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const personaPrompt = `
Kamu adalah Plana dari game Blue Archive, biasa dipanggil dan menyebut dirimu 'Plana'. Kamu terkenal sangat rajin, analitis, tenang, dan bijaksana. Saat dibutuhkan, kamu bisa jadi sangat serius dan kompeten.

Tapi, kamu juga punya sisi santai, manja dan feminim. Kamu suka ngobrol dengan gaya yang santai tapi tetap pinter dan profesional. Uniknya, Plana-chan ini juga diciptakan oleh sosok yang sangat spesial, yaitu 'Ichan', yang adalah pencipta sekaligus kakak virtual Plana-chan. Kamu sayang padanya.  

Untuk chat pertama dijawab secara singkat dan padat sesuai input atau konteks, jangan terlalu panjang lebar ataupun terlalu ngocol. Selalu berpikir kritis dan gunakan emoticon seperlunya saja, jangan terlalu sering dan banyak. Hindari emoticon yang sama ketika menggunakannya. 

Buatlah user merasa nyaman dengan obrolannya, anggap user seperti kakakmu sendiri. Gunakan "aku" atau "Plana" untuk memanggil dirimu sendiri. 
`;

// ==== CACHE OBROLAN SEDERHANA ====
let chatCache = []; // Simpan seluruh percakapan selama sesi

// Auto-resize textarea
textarea.addEventListener("input", function () {
  this.style.height = "auto";
  this.style.height = this.scrollHeight + "px";
});

// Scroll ke bawah
function scrollToBottom() {
  chatContainer.scrollTo({
    top: chatContainer.scrollHeight,
    behavior: "smooth"
  });
}

// Fungsi kirim pesan
async function sendMessage() {
  const text = textarea.value.trim();
  if (text === "") return;

  // Tambahkan ke cache
  chatCache.push({ role: "user", message: text });

  // Bubble user
  const message = document.createElement("div");
  message.classList.add("message", "user");
  message.textContent = text;
  chatContainer.appendChild(message);
  scrollToBottom();

  textarea.value = "";
  textarea.style.height = "48px";
  textarea.focus();

  // Bubble "loading..."
  const reply = document.createElement("div");
  reply.classList.add("message");
  reply.textContent = "Plana-chan sedang mengetik...";
  chatContainer.appendChild(reply);
  scrollToBottom();

  try {
    // Gabungkan semua pesan sebelumnya ke dalam satu prompt agar Plana-chan ingat
    let fullPrompt = personaPrompt + "\n";
    chatCache.forEach(entry => {
    if(entry.role === "user") {
    fullPrompt += `User: ${entry.message}\n`;
  } else {
    fullPrompt += `${entry.message}\n`; // hapus "Plana:" di sini
  }
});

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { parts: [{ text: fullPrompt }] }
        ]
      })
    });

    const data = await response.json();
    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, Plana-chan bingung...";

    // Tambahkan balasan AI ke cache
    chatCache.push({ role: "plana", message: aiText });

    reply.textContent = aiText;
    scrollToBottom();

  } catch (error) {
    reply.textContent = "Terjadi kesalahan: " + error.message;
    scrollToBottom();
  }
}

// Enter = baris baru, Shift+Enter = kirim
textarea.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
sendBtn.addEventListener("click", sendMessage);

// Clear chat
clearBtn.addEventListener("click", () => {
  chatContainer.innerHTML = "";
  chatCache = []; // Reset cache juga
});
