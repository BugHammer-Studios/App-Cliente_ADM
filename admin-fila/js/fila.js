(async function () {
  const A = window.APP;
  const $ = (id) => document.getElementById(id);
  const lista = $("lista"), contagem = $("contagem"), aviso = $("aviso");
  const LABEL_FILA = { barbeiro1: "Barbeiro 1", barbeiro2: "Barbeiro 2", geral: "Fila geral" };

  let fb = null;
  let parar = null;
  let itens = [];
  const abertos = new Set();

  /* ---------- helpers ---------- */
  function el(tag, props = {}, ...filhos) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (k === "class") n.className = v;
      else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v);
    }
    for (const f of filhos) n.append(f);
    return n;
  }
  function svgUse(id, cls) {
    const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("class", cls); s.setAttribute("viewBox", "0 0 40 40"); s.setAttribute("aria-hidden", "true");
    const u = document.createElementNS("http://www.w3.org/2000/svg", "use");
    u.setAttribute("href", "#" + id); s.append(u); return s;
  }
  function formatarTel(t = "") {
    const d = String(t).replace(/\D/g, "");
    if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
    if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
    return t || "Sem telefone";
  }
  function mostrarAviso(msg) { aviso.textContent = msg; aviso.hidden = !msg; }
  
  /* ---------- ações ---------- */
  async function executar(fn, msgErro) {
    try { mostrarAviso(""); await fn(); }
    catch (e) { console.error(e); mostrarAviso(`${msgErro} (${e.code || e.message})`); }
  }
  const ref = (id) => fb.doc(fb.db, A.COLECAO, id);
  const refPub = (id) => fb.doc(fb.db, A.COLECAO_PUBLICA || "posicoes", id);

  /* O site do cliente lê "posicoes" (sem dados pessoais). Depois de agir na "fila",
     espelhamos ali para o aparelho do cliente refletir a mudança. */
  async function espelhar(id, acao) {
    try {
      if (acao === "chamado") await fb.updateDoc(refPub(id), { [A.CAMPO_STATUS]: "em_atendimento" });
      else await fb.deleteDoc(refPub(id));
    } catch (e) {
      console.error(e);
      mostrarAviso(`Feito na fila, mas o aparelho do cliente pode não atualizar (${e.code || e.message}).`);
    }
  }

  /* CHAMAR: marca como "chamado" (continua na lista, com a etiqueta verde) */
  function chamar(id) {
    if (A.MODO_DEMO) { const c = itens.find((x) => x.id === id); if (c) c.status = "chamado"; return render(); }
    return executar(async () => {
      await fb.updateDoc(ref(id), { [A.CAMPO_STATUS]: "chamado", chamadoEm: fb.serverTimestamp() });
      await espelhar(id, "chamado");
    }, "Não foi possível chamar o cliente. Tente de novo.");
  }

  /* PULAR: marca como "pulado" (sai da lista; o documento fica guardado) */
  function pular(id, nome) {
    if (!confirm(`Pular ${nome} e tirar da fila?`)) return;
    abertos.delete(id);
    if (A.MODO_DEMO) { itens = itens.filter((x) => x.id !== id); return render(); }
    executar(async () => {
      await fb.updateDoc(ref(id), { [A.CAMPO_STATUS]: "pulado", puladoEm: fb.serverTimestamp() });
      await espelhar(id, "remover");
    }, "Não foi possível pular o cliente. Tente de novo.");
  }

  /* X: apaga o documento de verdade */
  function remover(id, nome) {
    if (!confirm(`Remover ${nome} da fila?`)) return;
    abertos.delete(id);
    if (A.MODO_DEMO) { itens = itens.filter((x) => x.id !== id); return render(); }
    executar(async () => {
      await fb.deleteDoc(ref(id));
      await espelhar(id, "remover");
    }, "Não foi possível remover o cliente. Tente de novo.");
  }

  /* POP (FIFO): remove o cadastro mais antigo, em transação */
  async function chamarProxima() {
    const s = await fb.getDocs(fb.query(fb.collection(fb.db, A.COLECAO), fb.orderBy(A.CAMPO_ORDEM, "asc")));
    const d = s.docs.find((x) => x.data()[A.CAMPO_STATUS] !== "pulado");
    if (!d) { mostrarAviso("Não existem pessoas aguardando na fila."); return; }
    const apagou = await fb.runTransaction(fb.db, async (tx) => {
      if (!(await tx.get(d.ref)).exists()) return false;
      tx.delete(d.ref); return true;
    });
    if (!apagou) { mostrarAviso("A fila mudou durante a operação. Clique de novo."); return; }
    await espelhar(d.id, "remover");
  }

  $("btnProxima").addEventListener("click", () => {
    if (A.MODO_DEMO) { if (!itens.length) return mostrarAviso("Não existem pessoas aguardando na fila."); itens.shift(); return render(); }
    executar(chamarProxima, "Não foi possível chamar a próxima pessoa. Tente de novo.");
  });

  /* ---------- render ---------- */
  function render() {
    lista.replaceChildren();
    contagem.textContent = itens.length === 1 ? "1 cliente na fila" : `${itens.length} clientes na fila`;

    if (!itens.length) {
      lista.append(el("li", { class: "vazio" },
        el("strong", {}, "Ninguém na fila"),
        "Os clientes aparecem aqui assim que entrarem pelo site."));
      return;
    }

    itens.forEach((c, i) => {
      const nome = c.nome || "Sem nome";
      const chamado = c.status === "chamado";
      const aberto = abertos.has(c.id);

      const dados = el("div", { class: "dados" },
        el("div", { class: "nome" }, nome),
        el("div", { class: "tel" }, formatarTel(c.telefone)));
      if (chamado) dados.append(el("span", { class: "tag ok" }, "Chamado"));
      else if (c.barbeiro) dados.append(el("span", { class: "tag" }, LABEL_FILA[c.barbeiro] || c.barbeiro));

      const linha = el("button", {
        class: "linha", type: "button", "aria-expanded": String(aberto),
        onclick: () => { abertos.has(c.id) ? abertos.delete(c.id) : abertos.add(c.id); render(); }
      }, svgUse("pessoa", "avatar"), dados, el("div", { class: "pos" }, `${i + 1}º`));

      const btnChamar = el("button", { class: "acao chamar", type: "button", onclick: () => chamar(c.id) },
        chamado ? "Chamado" : "Chamar");
      if (chamado) btnChamar.disabled = true;
      const btnPular = el("button", { class: "acao pular", type: "button", onclick: () => pular(c.id, nome) }, "Pular");

      lista.append(el("li", { class: "item" + (chamado ? " chamado" : "") + (aberto ? " aberto" : "") },
        linha,
        el("button", { class: "x", type: "button", "aria-label": `Remover ${nome}`, onclick: () => remover(c.id, nome) }, "×"),
        el("div", { class: "acoes" }, btnChamar, btnPular)));
    });
  }

  /* ---------- fila em tempo real ---------- */
  function iniciarFila() {
    const q = fb.query(fb.collection(fb.db, A.COLECAO), fb.orderBy(A.CAMPO_ORDEM, A.ORDEM_LISTA || "asc"));    
    parar = fb.onSnapshot(q, (snap) => {
      mostrarAviso("");
      itens = snap.docs
        .map((d) => { const x = d.data(); return {
          id: d.id,
          nome: x[A.CAMPO_NOME], telefone: x[A.CAMPO_TELEFONE], barbeiro: x[A.CAMPO_BARBEIRO], status: x[A.CAMPO_STATUS]
        }; })
        .filter((c) => c.status !== "pulado");
      render();
    }, (e) => {
      console.error(e);
      mostrarAviso(e.code === "permission-denied"
        ? "Esta conta não tem permissão de administrador."
        : "Sem conexão com a fila. Confira as regras do Firestore e o nome da coleção.");
    });
  }

  /* ---------- início ---------- */
  if (A.MODO_DEMO) {
    $("btnSair").addEventListener("click", () => { location.href = "index.html"; });
    itens = [...A.demo];
    render();
    return;
  }

  try { fb = await getFirebase(); }
  catch (e) { console.error(e); mostrarAviso("Não foi possível carregar o Firebase. Verifique a conexão."); return; }
  
  document.body.hidden = true;
  $("btnSair").addEventListener("click", () => fb.signOut(fb.auth));
  fb.onAuthStateChanged(fb.auth, (user) => {
    if (!user || user.isAnonymous) { if (parar) parar(); location.href = "index.html"; return; }
    document.body.hidden = false;
    iniciarFila();
  });
})();
