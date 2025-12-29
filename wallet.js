let currentUser;

auth.onAuthStateChanged(user => {
  if (!user) {
    alert("Please log in");
    window.location.href = "https://lihzoh7.github.io/";
    return;
  }
  currentUser = user;
  loadWallet();
  loadWinnings();
});

function loadWallet() {
  db.ref(`players/${currentUser.uid}`).on("value", snap => {
    const data = snap.val() || {};
    document.getElementById("balance").innerText = "R" + (data.wallet || 0).toFixed(2);
    document.getElementById("lives").innerText = data.lives || 0;
  });
}

function topUp(amount) {
  const links = {
    5: "https://payf.st/pviof",
    10: "https://payf.st/7d4zb",
    15: "https://payf.st/7yw30",
    20: "https://payf.st/2564l"
  };
  window.location.href = links[amount];
}

function buyLife() {
  const ref = db.ref(`players/${currentUser.uid}`);
  ref.transaction(player => {
    if (!player) return player;
    if ((player.lives || 0) >= 5) return player;
    if ((player.wallet || 0) < 0.5) return player;

    player.wallet -= 0.5;
    player.lives = (player.lives || 0) + 1;
    return player;
  });
}

function loadWinnings() {
  db.ref(`winnings/${currentUser.uid}`).on("value", snap => {
    const box = document.getElementById("claimBox");
    box.innerHTML = "";
    snap.forEach(child => {
      const w = child.val();
      if (w.claimed) return;

      const btn = document.createElement("button");
      btn.innerText = `CLAIM R${w.amount}`;
      btn.onclick = () => claimPrize(child.key, w.amount);
      box.appendChild(btn);
    });
  });
}

function claimPrize(gameId, amount) {
  const uid = currentUser.uid;
  const updates = {};
  updates[`winnings/${uid}/${gameId}/claimed`] = true;
  updates[`claims/${uid}/${gameId}`] = {
    amount,
    claimedAt: Date.now()
  };
  updates[`players/${uid}/wallet`] = firebase.database.ServerValue.increment(amount);

  db.ref().update(updates);
}
