/***********************
  JOSEN AI APP - PRO UPDATED
  (Ads Limit, Fuzzy Memory & Owner Bypass)
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
   SPLASH SCREEN & LOGIN
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
      addMessage("স্বাগতম! আবার আপনাকে দেখে ভালো লাগছে 😊", "ai");
    } else {
      loginScreen.classList.remove("hidden"); 
    }
  }, 3000);
});

document.getElementById("emailLogin")?.addEventListener("click", () => {
  const email = document.getElementById("emailInput").value.trim();
  const pass = document.getElementById("passwordInput").value.trim();
  if (email === "arafat@gmail.com" && pass === "arafat") {
    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("userEmail", email);
    loginScreen.classList.add("hidden");
    appScreen.classList.remove("hidden");
    addMessage(`স্বাগতম <b>${email}</b>! 😊`, "ai");
  } else {
    alert("ভুল ইমেইল বা পাসওয়ার্ড!");
  }
});

/* =========================
   DAILY LIMIT
========================= */
const today = new Date().toDateString();
let usage = JSON.parse(localStorage.getItem("usage")) || {};
if (!usage[today]) usage[today] = 0;
const limitCount = document.getElementById("limitCount");
if (limitCount) limitCount.innerText = usage[today];

/* =========================
   UTILITIES & WEB SEARCH
======================== */
function generateWebSearchResponse(question) {
  const encodedQuestion = encodeURIComponent(question.replace(/[?।]/g, "").trim());
  
  let response = `
    <div style="background: #ffffff; border: 1px solid #ccc; padding: 12px; border-radius: 12px; color: #222 !important;">
      <p style="margin-bottom: 10px; font-weight: bold; font-size: 14px;">🤔 সরাসরি উত্তর পাওয়া যায়নি। নিচের সাইটগুলোতে ট্রাই করো:</p>
      <div style="display: flex; flex-direction: column; gap: 8px;">
  `;
  
  EDUCATIONAL_SITES.forEach(site => {
    response += `
      <a href="${site.url}${encodedQuestion}" target="_blank" style="text-decoration: none; display: flex; align-items: center; padding: 8px; background: #f0f4f8; border-radius: 8px; border: 1px solid #d1d9e6;">
        <span style="font-size: 20px; margin-right: 10px;">${site.icon}</span>
        <div style="text-align: left;">
          <div style="font-weight: bold; color: #0056b3; font-size: 13px;">${site.name}</div>
          <div style="font-size: 11px; color: #444;">${site.description} ↗️</div>
        </div>
      </a>
    `;
  });
  
  response += `
      </div>
      <p style="font-size: 12px; margin-top: 10px;">💡 সরাসরি <a href="https://www.google.com/search?q=${encodedQuestion}" target="_blank" style="color: blue; text-decoration: underline;">গুগলে সার্চ করো</a></p>
    </div>
  `;
  return response;
}

/* =========================
   CORE AI FUNCTION (FUZZY LOGIC)
========================= */
function askJosen(question) {
  const text = question.toLowerCase().trim();
  
  const previous = chatHistory.find(item => item.q === text);
  if (previous) return previous.a + " (আমি আগে এটাই বলেছিলাম)";

  let bestIntent = null;
  let maxScore = 0;

  for (const intent of ALL_INTENTS) {
    let score = 0;
    if (intent.keywords) {
      for (const keyword of intent.keywords) {
        const key = keyword.toLowerCase();
        
        if (text.includes(key)) {
          score += (key.length * 2); 
        } else {
          let matches = 0;
          for (let i = 0; i < key.length; i++) {
            if (text.includes(key[i])) matches++;
          }
          if (matches > (key.length * 0.7)) {
            score += matches;
          }
        }
      }
    }
    if (score > maxScore) { maxScore = score; bestIntent = intent; }
  }

  if (bestIntent && maxScore > 1.5) {
    const finalReply = bestIntent.responses[Math.floor(Math.random() * bestIntent.responses.length)];
    chatHistory.push({ q: text, a: finalReply });
    if (chatHistory.length > 10) chatHistory.shift();
    return finalReply;
  }

  return generateWebSearchResponse(question);
}

/* =========================
   UI & SENDING (PRO LIMIT SYSTEM)
========================= */
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

function sendMessage() {
  const userEmail = localStorage.getItem("userEmail");
  
  // ১. আপনার নিজের ইমেইল চেক (আপনার জন্য লিমিট নাই)
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

  // Thinking... মেসেজ
  const thinkingId = "thinking-" + Date.now();
  addMessage("জশেন ভাবছে... 🤔", "ai", thinkingId);

  setTimeout(() => {
    // আগের মেসেজ সরানো (সিম্পল রিমুভ)
    chatBox.lastChild.remove();
    
    const answer = askJosen(text);
    addMessage(answer, "ai");

    // লিমিট আপডেট
    usage[today]++;
    localStorage.setItem("usage", JSON.stringify(usage));
    if (limitCount) limitCount.innerText = usage[today];
  }, 500);
}

// লিমিট শেষ হলে অ্যাড দেখানো
function showAdToUnlock() {
  const adMessageHTML = `
    <div style="background: #fff3cd; border: 1px solid #ffeeba; padding: 15px; border-radius: 12px; text-align: center; color: #856404; margin: 10px 0;">
      <p style="font-weight: bold; margin-bottom: 8px;">⚠️ আজকের ফ্রি লিমিট শেষ!</p>
      <p style="font-size: 13px; margin-bottom: 12px;">নিচের বাটনে ক্লিক করে একটি বিজ্ঞাপন দেখলে আপনি <b>আরও ৫টি প্রশ্ন</b> করার সুযোগ পাবেন।</p>
      <a href="https://omg10.com/4/10933866" target="_blank" onclick="extraLimit()" style="display: inline-block; background: #ffc107; color: #212529; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        বিজ্ঞাপন দেখুন ও আনলক করুন 🔓
      </a>
    </div>
  `;
  addMessage(adMessageHTML, "ai");
}

// রিওয়ার্ড ফাংশন (উইন্ডো অবজেক্টে রাখা হয়েছে যাতে HTML থেকে কাজ করে)
window.extraLimit = function() {
  usage[today] = Math.max(0, usage[today] - 5); 
  localStorage.setItem("usage", JSON.stringify(usage));
  if (limitCount) limitCount.innerText = usage[today];
  
  setTimeout(() => {
    addMessage("✅ ধন্যবাদ! আপনার লিমিট কমানো হয়েছে। এখন আরও ৫টি প্রশ্ন করতে পারবেন।", "ai");
  }, 2000);
};

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
/* =========================
   MENU DROPDOWN LOGIC (FIXED)
========================= */
const menuBtn = document.getElementById("menuBtn");
const menuDropdown = document.getElementById("menuDropdown");

// ৩ ডট মেনুতে ক্লিক করলে ড্রপডাউন খুলবে বা বন্ধ হবে
if (menuBtn && menuDropdown) {
  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation(); 
    menuDropdown.classList.toggle("show");
  });

  // মেনুর বাইরে ক্লিক করলে ড্রপডাউন বন্ধ হয়ে যাবে
  window.addEventListener("click", () => {
    if (menuDropdown.classList.contains("show")) {
      menuDropdown.classList.remove("show");
    }
  });
}

// লগআউট বাটনের লজিক
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("userEmail");
  location.reload(); 
});
