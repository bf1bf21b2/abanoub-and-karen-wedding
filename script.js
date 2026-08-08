import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

/*
  1) Create a Firebase project.
  2) Enable Firestore Database.
  3) Replace the values below with your Firebase Web App config.
*/
const firebaseConfig = {
  apiKey: "AIzaSyBE8YKn5dyNz5vWlbkL9gYjHjqL7odPJ1U",
  authDomain: "abanoub-and-karen-wedding.firebaseapp.com",
  projectId: "abanoub-and-karen-wedding",
  storageBucket: "abanoub-and-karen-wedding.firebasestorage.app",
  messagingSenderId: "172267708987",
  appId: "1:172267708987:web:02c172ffa37627dff8f21e",
  measurementId: "G-5RHWE28YVF"
};

let db = null;

try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (error) {
  console.warn("Firebase is not configured yet.", error);
}

window.addEventListener("load", () => {
  document.getElementById("loader").classList.add("hide");
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

const form = document.getElementById("rsvpForm");
const emailInput = document.getElementById("email");
const message = document.getElementById("formMessage");
const buttonText = document.getElementById("buttonText");
const spinner = document.getElementById("buttonSpinner");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = emailInput.value.trim().toLowerCase();

  if (!email) {
    message.textContent = "Please enter your email.";
    return;
  }

  buttonText.classList.add("hidden");
  spinner.classList.remove("hidden");
  message.textContent = "";

  try {
    // 1. Save guest email in Firestore
    if (!db) {
      throw new Error("Firebase is not configured.");
    }

    await addDoc(collection(db, "guests"), {
      email: email,
      createdAt: serverTimestamp(),
      invitationSent: false
    });

    // 2. Send invitation through Google Apps Script
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({
        email: email
      })
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Email sending failed.");
    }

    // 3. Success message
    message.textContent =
      "Your invitation has been sent to your email ♡";

    form.reset();

  } catch (error) {
    console.error(error);

    message.textContent =
      "Something went wrong. Please try again.";
  } finally {
    buttonText.classList.remove("hidden");
    spinner.classList.add("hidden");
  }
});

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyyJVZguJP386Ir9As-KLnel-q_i_qAypoR0Qk1uLKofpJVMELa6uzTJY0-XaR03gDo_A/exec";

