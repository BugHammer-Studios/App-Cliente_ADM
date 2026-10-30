(async function () {
  const A = window.APP;
  const $ = (id) => document.getElementById(id);
  const form = $("formLogin"), btn = $("btnEntrar"), erro = $("erroLogin");

  const MSG_AUTH = {
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/invalid-email": "Digite um e-mail válido.",
    "auth/too-many-requests": "Muitas tentativas. Aguarde um pouco e tente de novo.",
    "auth/network-request-failed": "Sem internet. Verifique a conexão."
  };

  if (A.MODO_DEMO) {
    $("demoNote").hidden = false;
    form.addEventListener("submit", (ev) => { ev.preventDefault(); location.href = "fila.html"; });
    return;
  }

  let fb;
  try { fb = await getFirebase(); }
  catch (e) { console.error(e); erro.textContent = "Não foi possível carregar o Firebase. Verifique a conexão."; return; }

  // Já logado? Vai direto para a fila.
  fb.onAuthStateChanged(fb.auth, (user) => { if (user && !user.isAnonymous) location.href = "fila.html"; });

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    erro.textContent = ""; btn.disabled = true; btn.textContent = "Entrando…";
    try {
      //persister no login dps de rala
      await fb.setPersistence(fb.auth, fb.browserLocalPersistence);
      await fb.signInWithEmailAndPassword(fb.auth, $("email").value.trim(), $("senha").value);
    } catch (e) {
      erro.textContent = MSG_AUTH[e.code] || "Não foi possível entrar. Tente de novo.";
      btn.disabled = false; btn.textContent = "Entrar";
    }
  });
})();
