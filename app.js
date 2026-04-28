/***********************
  JOSEN AI APP - OPEN LOGIN SYSTEM
  (No Pre-set Password, User Choice Login)
************************/
import { JOSEN_MODELS } from "./josen.js";
import { MATH_INTENTS } from "./math.js";
import { SCIENCE_INTENTS } from "./science.js";
import { ENGLISH_INTENTS } from "./English.js";
import { BENGALI_INTENTS } from "./Bengali.js";

const ALL_INTENTS = [
  ...(JOSEN_MODELS?.ark_anaya?.intents || []),
  ...MATH_INTENTS,
  ...SCIENCE_INTENTS,
  ...ENGLISH_INTENTS,
  ...BENGALI_INTENTS
];

let chatHistory = [];

const EDUCATIONAL_SITES = [
  { name: "Satt Academy", url: "https://www.google.com/search?q=site:sattacademy.com+", icon: "🎓", description: "বিসিএস ও একাডেমিক সমাধান" },
  { name: "Wikipedia", url: "https://bn.wikipedia.org/wiki/", icon: "📚", description: "বিশ্বকোষ" },
  { name: "10 Minute School", url: "https://10minuteschool.com/search?q=", icon: "⏱️", description: "অনলাইন ক্লাস ও নোট" },
  { name: "Shikho", url: "https://www.shikho.com/search?q=", icon: "🇧🇩", description: "বাংলাদেশের শিক্ষা" }
];

/* =========================
   SPLASH SCREEN & DYNAMIC LOGIN
========================= */
const splashScreen = document.getElementById("splashScreen");
const loginScreen = document.getElementById("loginScreen");
const appScreen = document.getElementById("app");

window.addEventListener("load", () => {
  setTimeout(() => {
    splashScreen.classList.add("hidden");
    if (localStorage.getItem("loggedIn") === "true") {
      loginScreen.classList.add("hidden");
      appScreen.classList.remove("hidden");
      addMessage("স্বাগতম! আপনার পড়াশোনায় সাহায্য করতে আমি তৈরি। 😊", "ai");
    } else {
      loginScreen.classList.remove("hidden"); 
    }
  }, 3000);
});

document.getElementById("emailLogin")?.addEventListener("click", () => {
  const email = document.getElementById("emailInput").value.trim();
  const pass = document.getElementById("passwordInput").value.trim();

  if (!email || !pass) {
    alert("অনুগ্রহ করে ইমেইল এবং পাসওয়ার্ড দিন!");
    return;
  }

  // ইউজার ডেটা চেক করা (সার্ভার ছাড়া লোকাল স্টোরেজ ব্যবহার করে)
  let users = JSON.parse(localStorage.getItem("appUsers")) || {};

  if (!users[email]) {
    // যদি নতুন ইউজার হয়, তবে তার দেওয়া তথ্য সেভ করে নেওয়া হবে (Sign Up)
    users[email] = pass;
    localStorage.setItem("appUsers", JSON.stringify(users));
    doLogin(email);
    alert("আপনার একাউন্ট তৈরি হয়েছে! স্বাগতম।");
  } else {
    // যদি পুরনো ইউজার হয়, তবে পাসওয়ার্ড চেক করবে
    if (users[email] === pass) {
      doLogin(email);
    } else {
      alert("ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।");
    }
  }
});

function doLogin(email) {
  localStorage.setItem("loggedIn", "true");
  localStorage.setItem("userEmail", email);
  loginScreen.classList.add("hidden");
  appScreen.classList.remove("hidden");
  addMessage(`স্বাগতম! আপনি এখন প্রশ্ন করতে পারেন। 😊`, "ai");
}

/* =========================
   DAILY LIMIT SYSTEM
========================= */
const today = new Date().toDateString();
let usage = JSON.parse(localStorage.getItem("usage")) || {};
if (!usage[today]) usage[today] = 0;
const limitCount = document.getElementById("limitCount");
if (limitCount) limitCount.innerText = usage[today];

/* =========================
   CORE LOGIC & UI
========================= */
function askJosen(question) {
  const text = question.toLowerCase().trim();
  
  let bestIntent = null;
  let maxScore = 0;

  for (const intent of ALL_INTENTS) {
    let score = 0;
    if (intent.keywords) {
      for (const keyword of intent.keywords) {
        if (text.includes(keyword.toLowerCase())) {
          score += (keyword.length * 2);
        }
      }
    }
    if (score > maxScore) { maxScore = score; bestIntent = intent; }
  }

  if (bestIntent && maxScore > 1.5) {
    return bestIntent.responses[Math.floor(Math.random() * bestIntent.responses.length)];
  }

  return generateWebSearchResponse(question);
}

function generateWebSearchResponse(question) {
  const encoded = encodeURIComponent(question.trim());
  let html = `<div style="background:#fff; border:1px solid #ccc; padding:12px; border-radius:12px; color:#222;">
    <p style="font-weight:bold; font-size:14px; margin-bottom:10px;">🤔 সরাসরি উত্তর নেই, এখানে দেখো:</p>`;
  EDUCATIONAL_SITES.forEach(s => {
    html += `<a href="${s.url}${encoded}" target="_blank" style="text-decoration:none; display:flex; padding:8px; background:#f0f4f8; border-radius:8px; margin-bottom:5px;">
      <span style="font-size:18px; margin-right:10px;">${s.icon}</span>
      <div style="font-size:13px; color:#0056b3; font-weight:bold;">${s.name}</div>
    </a>`;
  });
  html += `</div>`;
  return html;
}

const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const chatBox = document.getElementById("chatBox");

function addMessage(text, type) {
  const div = document.createElement("div");
  div.className = type === "user" ? "user-msg" : "ai-msg";
  div.innerHTML = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

window.sendMessage = function() {
  const userEmail = localStorage.getItem("userEmail");
  
  // আপনার ইমেইল হলে কোনো লিমিট থাকবে না
  if (userEmail !== "arafat@gmail.com") {
    if (usage[today] >= 12) {
      showAdToUnlock(); 
      return;
    }
  }

  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, "user");
  userInput.value = "";

  setTimeout(() => {
    const answer = askJosen(text);
    addMessage(answer, "ai");

    usage[today]++;
    localStorage.setItem("usage", JSON.stringify(usage));
    if (limitCount) limitCount.innerText = usage[today];
  }, 500);
}

function showAdToUnlock() {
  const adHTML = `<div style="background:#fff3cd; padding:15px; border-radius:12px; text-align:center;">
    <p style="font-weight:bold;">⚠️ লিমিট শেষ!</p>
    <a href="https://omg10.com/4/10933866" target="_blank" onclick="extraLimit()" style="display:inline-block; background:#ffc107; padding:10px; border-radius:8px; text-decoration:none; color:#000; font-weight:bold; margin-top:10px;">বিজ্ঞাপন দেখুন ও ৫টি লিমিট কমান 🔓</a>
  </div>`;
  addMessage(adHTML, "ai");
}

window.extraLimit = function() {
  usage[today] = Math.max(0, usage[today] - 5);
  localStorage.setItem("usage", JSON.stringify(usage));
  if (limitCount) limitCount.innerText = usage[today];
  addMessage("✅ লিমিট কমানো হয়েছে!", "ai");
};

sendBtn?.addEventListener("click", sendMessage);

/* =========================
   MENU DROPDOWN (Fixed)
========================= */
const menuBtn = document.getElementById("menuBtn");
const menuDropdown = document.querySelector(".menu-dropdown");

if (menuBtn && menuDropdown) {
  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    menuDropdown.classList.toggle("show");
  });
  window.addEventListener("click", () => menuDropdown.classList.remove("show"));
}

document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("loggedIn");
  location.reload();
});