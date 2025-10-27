// ---------- IndexedDB: pegar último dado ----------
async function pegarUltimoDado() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('user_post', 1);

    request.onerror = () => reject('❌ Erro ao abrir o banco user_post');

    request.onsuccess = (event) => {
      const db = event.target.result;
      const tx = db.transaction('post', 'readonly');
      const store = tx.objectStore('post');

      // abre o cursor do fim (último registro)
      const cursorRequest = store.openCursor(null, 'prev');

      cursorRequest.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          console.log("✅ Último registro encontrado:", cursor.value);
          resolve(cursor.value);
        } else {
          console.warn("⚠️ Nenhum registro encontrado na store 'post'");
          resolve(null);
        }
      };

      cursorRequest.onerror = () => reject('❌ Erro ao ler store post');
      tx.oncomplete = () => db.close();
    };
  });
}

// ---------- Firebase ----------
const firebaseConfig = {
  databaseURL: "https://subempresa-15073-default-rtdb.firebaseio.com/"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ---------- Pedir permissão ----------
async function pedirPermissaoNotificacao() {
  if (!("Notification" in window)) throw "Navegador não suporta notificações.";
  if (Notification.permission === "granted") return "Permissão já concedida.";
  if (Notification.permission === "denied") throw "Permissão negada anteriormente.";

  const permission = await Notification.requestPermission();
  if (permission === "granted") return "Permissão concedida!";
  throw "Permissão não concedida.";
}

// ---------- Função principal: criar e salvar subscription ----------
async function salvarSubscription(dadosUsuario) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

  const empresa = String(dadosUsuario?.empresa || "Desconhecida").replace(/\s+/g, "_");
  const nomeBase = String(dadosUsuario?.username || "SemNome").replace(/\s+/g, "_");

  const swReg = await navigator.serviceWorker.ready;
  const subscription = await swReg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      "BGp2boq4FE1QyAXEA_SQxBqqXdCdakzpPmOmfo2MpxycWjDSs2LGzi6TSVrTrp4LnkwDvrm8tPqRaCatvKoKTBw"
    )
  });

  const subJSON = subscription.toJSON();
  subJSON.usuario = nomeBase;

  const refEmpresa = db.ref(`subscriptions/${empresa}`);

  // Pega todas as subscriptions existentes na empresa
  const snapshot = await refEmpresa.once("value");
  const data = snapshot.val() || {};

  // Verifica se endpoint já existe
  const endpointExiste = Object.values(data).some(item => item.endpoint === subJSON.endpoint);
  if (endpointExiste) {
    console.log(`⚠️ Endpoint já existe na empresa ${empresa}. Não será criado.`);
    return;
  }

  // Cria numeração para o nome (Jandir1, Jandir2...)
  let numero = 1;
  let nomeFinal = `${nomeBase}${numero}`;
  while (data[nomeFinal]) numero++, nomeFinal = `${nomeBase}${numero}`;

  // Salva no Firebase
  await refEmpresa.child(nomeFinal).set(subJSON);
  console.log(`✅ Subscription salva para ${nomeFinal} em ${empresa}`);
}


// ---------- Converter chave pública ----------
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

// ---------- Execução automática ----------
(async () => {
  try {
    await pedirPermissaoNotificacao();
    if ('serviceWorker' in navigator) {
      await navigator.serviceWorker.register('script_noti.js');
      console.log("✅ Service Worker registrado!");
    }
    const dados = await pegarUltimoDado();
    if (!dados) throw "Nenhum dado encontrado no IndexedDB!";
    await salvarSubscription(dados);
    console.log("🎉 Notificação configurada e salva com sucesso!");
  } catch (err) {
    console.error("⚠️ Erro geral:", err);
  }
})();