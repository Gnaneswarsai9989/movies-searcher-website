import { db, auth } from "./firebase.js";
import { doc, setDoc, getDoc } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const activateBtn = document.getElementById("activateBtn");
const codeInput = document.getElementById("secretCode");
const statusBox = document.getElementById("subscriptionStatus");
const successModal = document.getElementById("successModal");
const card = document.querySelector(".premium-card");

let currentUser = null;

/* ===============================
   INITIAL STATE
================================ */

if (successModal) {
  successModal.style.display = "none";
}

/* ===============================
   AUTH + SUBSCRIPTION CHECK
================================ */

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  currentUser = user;

  try {

    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (userDoc.exists() && userDoc.data().isSubscribed) {

      const expiryTimestamp = userDoc.data().expiryDate;

      if (expiryTimestamp) {

        const expiryDate = expiryTimestamp.toDate();
        const today = new Date();

        if (today > expiryDate) {

          // 🔴 Expired → auto disable
          await setDoc(
            doc(db, "users", user.uid),
            { isSubscribed: false },
            { merge: true }
          );

          statusBox.innerHTML = "Subscription Expired ❌";
          activateBtn.style.display = "block";

        } else {

          // 🟢 Active
          const formattedDate = expiryDate.toLocaleDateString("en-IN");

          statusBox.innerHTML =
            `✓ Premium Active <br> Expires on: ${formattedDate}`;

          activateBtn.style.display = "none";
        }

      }

    } else {

      statusBox.innerHTML = "";
      activateBtn.style.display = "block";

    }

  } catch (error) {
    console.error("Subscription check error:", error);
  }

});


/* ===============================
   ACTIVATE PREMIUM (30 DAYS)
================================ */

activateBtn.addEventListener("click", async () => {

  if (!currentUser) {
    alert("Login first");
    return;
  }

  const enteredCode = codeInput.value.trim();

  if (enteredCode !== "SAI1919821") {
    alert("Invalid Secret Code");
    return;
  }

  activateBtn.innerHTML = "Scanning...";
  activateBtn.disabled = true;

  setTimeout(async () => {

    try {

      const now = new Date();
      const expiry = new Date();
      expiry.setDate(now.getDate() + 30);

      await setDoc(
        doc(db, "users", currentUser.uid),
        { 
          isSubscribed: true,
          subscribedAt: now,
          expiryDate: expiry
        },
        { merge: true }
      );

      const formattedDate = expiry.toLocaleDateString("en-IN");

      statusBox.innerHTML =
        `✓ Premium Active <br> Expires on: ${formattedDate}`;

      activateBtn.style.display = "none";

      // Show modal
      if (successModal) {
        successModal.style.display = "flex";
      }

      // Glow
      if (card) {
        card.style.boxShadow = "0 0 60px rgba(48,209,88,0.6)";
      }

    } catch (error) {
      console.error("Activation error:", error);
      alert(error.message);
    }

  }, 1500);

});

const razorpayBtn = document.getElementById("razorpayBtn");

if (razorpayBtn) {

  razorpayBtn.addEventListener("click", () => {

    const options = {
      key: "rzp_test_SM1CUQQYwkjNAN", // 🔥 Replace with your key
      amount: 1000, // 10 INR (1000 paise)
      currency: "INR",
      name: "Cinefy Premium",
      description: "30 Days Premium Access",
      handler: async function (response) {

        // After successful payment activate subscription

        const now = new Date();
        const expiry = new Date();
        expiry.setDate(now.getDate() + 30);

        await setDoc(
          doc(db, "users", currentUser.uid),
          {
            isSubscribed: true,
            subscribedAt: now,
            expiryDate: expiry,
            paymentId: response.razorpay_payment_id
          },
          { merge: true }
        );

        successModal.style.display = "flex";
      },
      theme: {
        color: "#111"
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();
  });

}
/* ===============================
   3D TILT EFFECT
================================ */

document.addEventListener("mousemove", (e) => {

  if (!card) return;

  const x = (window.innerWidth / 2 - e.pageX) / 30;
  const y = (window.innerHeight / 2 - e.pageY) / 30;

  card.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
});

document.addEventListener("mouseleave", () => {
  if (card) {
    card.style.transform = "rotateY(0deg) rotateX(0deg)";
  }
});


/* ===============================
   CLOSE MODAL
================================ */

if (successModal) {
  successModal.addEventListener("click", () => {
    successModal.style.display = "none";
  });
}