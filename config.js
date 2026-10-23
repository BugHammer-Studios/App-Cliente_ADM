/* ========= CONFIGURAÇÃO (ajuste aqui) ========= */
window.APP = {
  // true = login aceita qualquer coisa e a fila usa dados de exemplo (sem Firebase)
  // Para usar de verdade, troque para false.
  MODO_DEMO: true,

  firebaseConfig: {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    projectId: "SEU_PROJETO",
    appId: "SEU_APP_ID"
  },

  // Nomes usados pelo site do cliente no Firestore
  COLECAO: "fila",
  CAMPO_ORDEM: "createdAt",     // timestamp de chegada (define a ordem da fila)
  CAMPO_NOME: "nome",
  CAMPO_TELEFONE: "telefone",
  CAMPO_BARBEIRO: "barbeiro",   // opcional
  CAMPO_STATUS: "status",       // criado pelo adm: "chamado" | "pulado"

  demo: [
    { id: "d1", nome: "Carlos Silva",    telefone: "21987654321", barbeiro: "Barbeiro 1", status: "chamado" },
    { id: "d2", nome: "João Pereira",    telefone: "21991234567", barbeiro: "Barbeiro 2" },
    { id: "d3", nome: "Marcos Oliveira", telefone: "21988887777", barbeiro: "Barbeiro 1" },
    { id: "d4", nome: "Rafael Costa",    telefone: "21977776666", barbeiro: "Barbeiro 2" },
    { id: "d5", nome: "Lucas Almeida",   telefone: "21966665555", barbeiro: "Barbeiro 1" }
  ]
};
