(async function () {
  const A = window.APP;
  if (A.MODO_DEMO) {
    document.getElementById("btnSair").addEventListener("click", () => { location.href = "index.html"; });
    return;
  }
  let fb;
  try { fb = await getFirebase(); }
  catch (e) { console.error(e); return; }

  document.body.hidden = true;
  document.getElementById("btnSair").addEventListener("click", () => fb.signOut(fb.auth));
  fb.onAuthStateChanged(fb.auth, (user) => {
    if (!user || user.isAnonymous) { location.href = "index.html"; return; }
    document.body.hidden = false;
  });
})();