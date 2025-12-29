import { auth, db } from "./firebase.js";
import {
  ref,
  onValue,
  runTransaction,
  get
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

let uid = null;

auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "https://lihzoh7.github.io/";
    return;
  }
  uid = user.uid;
  listenWallet();
});

function listenWallet() {
  onValue(ref(db, `players/${uid}/wallet`), snap => {
    document.getElementById("balance").innerText = "R" + (snap.val() || 0).toFixed(2);
  });

  onValue(ref(db, `players/${uid}/lives`), snap => {
    document.getElementById("lives").innerText = snap.val() || 0;
  });
}

window.topUp = function (amount) {
  const links = {
    5: "https://payf.st/pviof",
    10: "https://payf.st/7d4zb",
    15: "https://payf.st/7yw30",
    20: "https://payf.st/2564l"
  };
  window.location.href = links[amount];
};

window.buyLife = async function () {
  const walletRef = ref(db, `players/${uid}/wallet`);
  const livesRef = ref(db, `players/${uid}/lives`);

  const walletSnap = await get(walletRef);
  const livesSnap = await get(livesRef);

  const balance = walletSnap.val() || 0;
  const lives = livesSnap.val() || 0;

  if (balance < 0.5) {
    alert("Insufficient balance");
    return;
  }

  if (lives >= 5) {
    alert("Max 5 lives");
    return;
  }

  await runTransaction(walletRef, val => (val || 0) - 0.5);
  await runTransaction(livesRef, val => (val || 0) + 1);
};
