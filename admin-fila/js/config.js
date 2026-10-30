/* ========= CONFIGURAÇÃO (ajuste aqui) ========= */
window.APP = {
  // true = login aceita qualquer coisa e a fila usa dados de exemplo (sem Firebase)
  // Para usar de verdade, troque para false.
  MODO_DEMO: false,

  firebaseConfig: {
    apiKey: "AIzaSyBk9djTdycFXxIv2U_xzGZEoNMW9LG3RMI",
    authDomain: "ezcut-c63a5.firebaseapp.com",
    projectId: "ezcut-c63a5",
    appId: "1:209876055963:web:80b2e381f1ccf271bc133e",

  },

  // Nomes usados pelo site do cliente no Firestore
  COLECAO: "fila",
  COLECAO_PUBLICA: "posicoes",
  CAMPO_ORDEM: "criadoEm",     // timestamp de chegada (define a ordem da fila)
  CAMPO_NOME: "nome",
  CAMPO_TELEFONE: "telefone",
  CAMPO_BARBEIRO: "filaEscolhida",   // opcional
  CAMPO_STATUS: "status",       // criado pelo adm: "chamado" | "pulado"
  ORDEM_LISTA: "asc", 

  demo: [
    { id: "d1", nome: "Carlos Silva",    telefone: "21987654321", barbeiro: "Barbeiro 1", status: "chamado" },
    { id: "d2", nome: "João Pereira",    telefone: "21991234567", barbeiro: "Barbeiro 2" },
    { id: "d3", nome: "Marcos Oliveira", telefone: "21988887777", barbeiro: "Barbeiro 1" },
    { id: "d4", nome: "Rafael Costa",    telefone: "21977776666", barbeiro: "Barbeiro 2" },
    { id: "d5", nome: "Lucas Almeida",   telefone: "21966665555", barbeiro: "Barbeiro 1" }
  ]
};
