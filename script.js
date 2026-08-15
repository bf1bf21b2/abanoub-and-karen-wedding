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

const invitationScreen =
    document.getElementById("invitationScreen");

const openInvitation =
    document.getElementById("openInvitation");

const music =
    document.getElementById("weddingMusic");

const musicBtn =
    document.getElementById("musicBtn");


openInvitation.addEventListener("click", async () => {

    // Start opening animation
    invitationScreen.classList.add("opening");

    // Start music
    try {
        music.volume = 0;
        await music.play();

        // Fade in music
        let volume = 0;

        const fadeIn = setInterval(() => {

            volume += 0.02;

            if (volume >= 0.7) {
                volume = 0.7;
                clearInterval(fadeIn);
            }

            music.volume = volume;

        }, 80);

    } catch (error) {
        console.log("Music could not start:", error);
    }

    // Show music button
    musicBtn.classList.add("visible");


    // Wait for envelope animation
    setTimeout(() => {

        invitationScreen.classList.add("hidden");

    }, 1800);

});


/* Music button */

musicBtn.addEventListener("click", async () => {

    if (music.paused) {

        await music.play();

        musicBtn.innerHTML = "🔊";

    } else {

        music.pause();

        musicBtn.innerHTML = "🎵";

    }

});


/* =========================================
   WEDDING ATTENDANCE / RSVP
========================================= */

const attendanceForm = document.getElementById("attendanceForm");
const guestCountInput = document.getElementById("guestCount");
const minusGuest = document.getElementById("minusGuest");
const plusGuest = document.getElementById("plusGuest");
const guestsGroup = document.getElementById("guestsGroup");
const attendanceMessage = document.getElementById("attendanceMessage");
const attendanceSubmit = document.getElementById("attendanceSubmit");


// Change guest count
minusGuest.addEventListener("click", () => {

  let current = parseInt(guestCountInput.value);

  if (current > 1) {
    current--;
    guestCountInput.value = current;
  }

});


plusGuest.addEventListener("click", () => {

  let current = parseInt(guestCountInput.value);

  if (current < 30) {
    current++;
    guestCountInput.value = current;
  }

});


// Show / hide guest counter
const attendanceInputs = document.querySelectorAll(
  'input[name="attendance"]'
);

attendanceInputs.forEach(input => {

  input.addEventListener("change", () => {

    if (input.value === "No" && input.checked) {

      guestsGroup.classList.add("hidden");
      guestCountInput.value = 0;

    }

    if (input.value === "Yes" && input.checked) {

      guestsGroup.classList.remove("hidden");

      if (parseInt(guestCountInput.value) < 1) {
        guestCountInput.value = 1;
      }

    }

  });

});


// Submit attendance
attendanceForm.addEventListener("submit", async (e) => {

  e.preventDefault();

  const name =
    document.getElementById("guestName").value.trim();

  const attendance =
    document.querySelector(
      'input[name="attendance"]:checked'
    );

  if (!name) {
    attendanceMessage.textContent =
      "Please enter your name.";

    attendanceMessage.className =
      "form-message error";

    return;
  }

  if (!attendance) {
    attendanceMessage.textContent =
      "Please select your attendance.";

    attendanceMessage.className =
      "form-message error";

    return;
  }

  let guests =
    parseInt(guestCountInput.value);

  if (attendance.value === "No") {
    guests = 0;
  }

  attendanceSubmit.disabled = true;

  attendanceSubmit.textContent =
    "Sending...";

  attendanceMessage.textContent = "";

  try {

    // Make sure Firebase is connected
    if (!db) {
      throw new Error("Firebase is not configured.");
    }

    // Save attendance directly to Firestore
    await addDoc(
      collection(db, "attendance"),
      {
        name: name,
        attendance: attendance.value,
        guests: guests,
        createdAt: serverTimestamp()
      }
    );

    // Success
    attendanceMessage.textContent =
      "Thank you! Your attendance has been confirmed ♡";

    attendanceMessage.className =
      "form-message success";

    attendanceForm.reset();

    guestCountInput.value = 1;

    guestsGroup.classList.remove("hidden");

    attendanceSubmit.disabled = false;

    attendanceSubmit.textContent =
      "Confirmed ♡";

  } catch (error) {

    console.error("Attendance error:", error);

    attendanceMessage.textContent =
      "Something went wrong. Please try again.";

    attendanceMessage.className =
      "form-message error";

    attendanceSubmit.disabled = false;

    attendanceSubmit.textContent =
      "Confirm Attendance ♡";
  }

});
