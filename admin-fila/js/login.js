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

  // Impede o envio padrão (que recarrega a página) enquanto o Firebase carrega
  form.addEventListener("submit", (ev) => ev.preventDefault());

  if (A.MODO_DEMO) {
    $("demoNote").hidden = false;
    form.addEventListener("submit", () => { location.href = "perfil.html"; });
    return;
  }

  btn.disabled = true; btn.textContent = "Carregando…";
  let fb;
  try { fb = await getFirebase(); }
  catch (e) { console.error(e); erro.textContent = "Não foi possível carregar o Firebase. Verifique a conexão."; return; }
  btn.disabled = false; btn.textContent = "Entrar";

  // Já logado? Vai direto para a escolha do barbeiro.
  fb.onAuthStateChanged(fb.auth, (user) => { if (user && !user.isAnonymous) location.href = "perfil.html"; });

  form.addEventListener("submit", async (ev) => {
    erro.textContent = ""; btn.disabled = true; btn.textContent = "Entrando…";
    try {
      await fb.setPersistence(fb.auth, fb.browserLocalPersistence);
      await fb.signInWithEmailAndPassword(fb.auth, $("email").value.trim(), $("senha").value);
      // o onAuthStateChanged acima redireciona para perfil.html
    } catch (e) {
      erro.textContent = MSG_AUTH[e.code] || "Não foi possível entrar. Tente de novo.";
      btn.disabled = false; btn.textContent = "Entrar";
    }
  });
})();