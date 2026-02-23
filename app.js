 /***********************
  JOSEN AI APP
************************/
import { JOSEN_MODELS } from "./josen.js";
import { MATH_INTENTS } from "./math.js";
import { SCIENCE_INTENTS } from "./science.js";
import { ENGLISH_INTENTS } from "./English.js";
import { BENGALI_INTENTS } from "./Bengali.js";

// সব intents একত্র করা
const ALL_INTENTS = [
  ...(JOSEN_MODELS?.ark_anaya?.intents || []),
  ...MATH_INTENTS,
  ...SCIENCE_INTENTS,
  ...ENGLISH_INTENTS,
...BENGALI_INTENTS
];
/* =========================
   SPLASH SCREEN
========================= */
const splashScreen = document.getElementById("splashScreen");
const loginScreen = document.getElementById("loginScreen");
const appScreen = document.getElementById("app");

window.addEventListener("load", () => {
  setTimeout(() => {
    splashScreen.classList.add("hidden");

    const isLoggedIn = localStorage.getItem("loggedIn");

    if (isLoggedIn === "true") {
      loginScreen.classList.add("hidden");
      appScreen.classList.remove("hidden");
      addMessage("স্বাগতম! আবার আপনাকে দেখে ভালো লাগছে 😊", "ai");
    } else {
      loginScreen.classList.remove("hidden"); 
    }

  }, 3000);
});

/* =========================
   LOCAL LOGIN (NO FIREBASE)
========================= */
const loginBtn = document.getElementById("emailLogin");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");

loginBtn.addEventListener("click", () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  // basic validation
  if (!email || !password) {
    alert("Email আর Password দিতে হবে");
    return;
  }

  // email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("Valid email দাও");
    return;
  }

  if (password.length < 6) {
    alert("Password কমপক্ষে 6 অক্ষরের হতে হবে");
    return;
  }

  
  localStorage.setItem("loggedIn", "true");
  localStorage.setItem("userEmail", email);

  loginScreen.classList.add("hidden");
  appScreen.classList.remove("hidden");

  addMessage(`স্বাগতম <b>${email}</b>! 😊`, "ai");
});

const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("loggedIn");
  location.reload();
});
/* =========================
   MENU TOGGLE
========================= */
const menu = document.querySelector(".menu");
const dropdown = document.querySelector(".menu-dropdown");

menu.addEventListener("click", (e) => {
  e.stopPropagation();
  dropdown.style.display =
    dropdown.style.display === "block" ? "none" : "block";
});

document.addEventListener("click", () => {
  dropdown.style.display = "none";
});

/* =========================
   CHAT ELEMENTS
========================= */
const sendBtn = document.getElementById("sendBtn");
const userInput = document.getElementById("userInput");
const chatBox = document.getElementById("chatBox");
const limitCount = document.getElementById("limitCount");

/* =========================
   DAILY LIMIT
========================= */
const today = new Date().toDateString();
let usage = JSON.parse(localStorage.getItem("usage")) || {};
if (!usage[today]) usage[today] = 0;
limitCount.innerText = usage[today];

function addMessage(text, type) {
  const div = document.createElement("div");
  div.className = type === "user" ? "user-msg" : "ai-msg";

  if (type === "ai") {
    div.innerHTML = text; // 👈 HTML allow
  } else {
    div.innerText = text;
  }

  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

/* =========================
   AI CORE FUNCTION
========================= */
function askJosen(question) {
  const text = question.toLowerCase().trim();

  let bestIntent = null;
  let maxScore = 0;

  for (const intent of ALL_INTENTS) {
    let score = 0;

    for (const keyword of intent.keywords) {
      const key = keyword.toLowerCase();

      if (text.includes(key)) {
        // longer keyword = higher score
        score += key.length;
      }
    }

    if (score > maxScore) {
      maxScore = score;
      bestIntent = intent;
    }
  }

  if (!bestIntent) {
    return "আমি এই প্রশ্নটা এখনও শিখিনি 🙂";
  }

  const replies = bestIntent.responses;
  return replies[Math.floor(Math.random() * replies.length)];
}

/* =========================
   SEND MESSAGE
========================= */
sendBtn.addEventListener("click", sendMessage);

userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

function sendMessage() {
  if (usage[today] >= 12) {
    addMessage("❌ আজকের daily limit শেষ। কাল আবার চেষ্টা করো।", "ai");
    return;
  }

  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, "user");
  userInput.value = "";

  addMessage("Thinking...", "ai");

  setTimeout(() => {
    chatBox.lastChild.remove();

    const answer = askJosen(text);
    addMessage(answer, "ai");

    usage[today]++;
    localStorage.setItem("usage", JSON.stringify(usage));
    limitCount.innerText = usage[today];
  }, 500);
}



