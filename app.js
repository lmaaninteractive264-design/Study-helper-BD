/***********************
  JOSEN AI APP - Full Integrated
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

// ১. কনভারসেশন মেমোরি
let chatHistory = [];

/* =========================
   SPLASH SCREEN & LOGIN
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

// লগইন লজিক
const loginBtn = document.getElementById("emailLogin");
loginBtn.addEventListener("click", () => {
  const email = document.getElementById("emailInput").value.trim();
  const pass = document.getElementById("passwordInput").value.trim();
  if (email === "arafat@gmail.com" && pass === "arafat") {
    localStorage.setItem("loggedIn", "true");
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
if(limitCount) limitCount.innerText = usage[today];

/* =========================
   SEARCH UTILITIES
========================= */

// Satt Academy সার্চ ফাংশন
function searchSattAcademy(query) {
  let clean = query.replace(/[?।]/g, "").trim(); 
  let sattSearchUrl = `https://www.google.com/search?q=site:sattacademy.com+${encodeURIComponent(clean)}`;
  return `
    <div style="border: 2px solid #28a745; padding: 12px; border-radius: 10px; background: #f0fff4; margin-top: 10px;">
      <p style="margin-bottom: 8px; color: #333;"><strong>Satt Academy</strong>-তে সমাধান খুঁজুন:</p>
      <a href="${sattSearchUrl}" target="_blank" style="display: inline-block; background: #28a745; color: white; padding: 8px 15px; text-decoration: none; border-radius: 5px; font-weight: bold;">
        সমাধান দেখুন ↗️
      </a>
    </div>`;
}

// ২. জেমিনি এআই ফাংশন
async function askGemini(prompt) {
  const API_KEY = "AIzaSyAWsgVXQLKMXJo1OjK7YfFJCf8UpH0Pgi0"; // 👈 আপনার কি-টি এখানে বসান
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    const data = await response.json();
    if (data.candidates && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    }
    return "দুঃখিত, আমি এই উত্তরটি খুঁজে পাচ্ছি না।";
  } catch (error) {
    return "ইন্টারনেট সংযোগ চেক করুন।";
  }
}

/* =========================
   AI CORE LOGIC
========================= */
async function askJosen(question) {
  const text = question.toLowerCase().trim();
  let bestIntent = null;
  let maxScore = 0;

  // লোকাল ডাটাবেজে ফুজি সার্চ
  for (const intent of ALL_INTENTS) {
    let score = 0;
    if (intent.keywords) {
      for (const keyword of intent.keywords) {
        if (text.includes(keyword.toLowerCase())) score += keyword.length;
      }
    }
    if (score > maxScore) { maxScore = score; bestIntent = intent; }
  }

  // ১. লোকাল ফাইলে মিললে
  if (bestIntent && maxScore > 2) {
    return bestIntent.responses[Math.floor(Math.random() * bestIntent.responses.length)];
  }

  // ২. সৃজনশীল বা পৃষ্ঠা হলে Satt Academy
  if (text.includes("পৃষ্ঠা") || text.includes("সৃজনশীল") || text.includes("শ্রেণি")) {
    return searchSattAcademy(question);
  }

  // ৩. ব্যাকআপ হিসেবে জেমিনি এআই ও মেমোরি
  const promptWithHistory = `ইউজারের সাথে আগের কথা: ${JSON.stringify(chatHistory.slice(-2))}. প্রশ্ন: ${question}. উত্তর দাও সংক্ষেপে।`;
  const aiResponse = await askGemini(promptWithHistory);

  // মেমোরি আপডেট
  chatHistory.push({ q: question, a: aiResponse });
  return aiResponse;
}

/* =========================
   SEND MESSAGE
========================= */
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const chatBox = document.getElementById("chatBox");

async function sendMessage() {
  if (usage[today] >= 12) {
    addMessage("❌ আজকের daily limit শেষ। কাল আবার চেষ্টা করো।", "ai");
    return;
  }

  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, "user");
  userInput.value = "";

  // Thinking... মেসেজ দেখানো এবং তার আইডি রাখা
  const thinkingId = "thinking-" + Date.now();
  addMessage("জশেন ভাবছে... 🤔", "ai", thinkingId);

  try {
    // এখানে await ব্যবহার করা খুবই জরুরি
    const answer = await askJosen(text); 

    // Thinking লেখাটি সরিয়ে আসল উত্তর বসানো
    const thinkingDiv = document.getElementById(thinkingId);
    if (thinkingDiv) {
      thinkingDiv.innerHTML = answer;
    }

    // লিমিট আপডেট
    usage[today]++;
    localStorage.setItem("usage", JSON.stringify(usage));
    if (limitCount) limitCount.innerText = usage[today];

  } catch (error) {
    const thinkingDiv = document.getElementById(thinkingId);
    if (thinkingDiv) thinkingDiv.innerText = "দুঃখিত, কিছু একটা ভুল হয়েছে।";
  }
}

function addMessage(text, type, id = null) {
  const div = document.createElement("div");
  div.className = type === "user" ? "user-msg" : "ai-msg";
  if (id) div.id = id;
  div.innerHTML = text; 
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
  return div;
}

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
