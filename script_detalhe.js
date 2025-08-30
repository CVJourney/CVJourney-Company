// ===================== Variáveis globais =====================
let img_tag = null; // imagem atualmente clicada
let id_t=0
let id_div=0
let company=""

// ===================== Inicialização =====================
document.addEventListener("DOMContentLoaded", async () => {
    document.dispatchEvent(new Event("checkin"));
    await getIdFromURL();
});

// ===================== IndexedDB =====================
async function getIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("link");

    if (!id) {
        console.error("Nenhum ID fornecido na URL!");
        return;
    }

    listarDados((dados) => mostrar(dados, id));
}

function listarDados(callback) {
    const request = indexedDB.open("div", 1);

    request.onsuccess = (e) => {
        const db = e.target.result;
        const tx = db.transaction("inner", "readonly");
        const store = tx.objectStore("inner");

        const dados = [];
        store.openCursor().onsuccess = (event) => {
            const cursor = event.target.result;
    if (cursor) {
        dados.push(cursor.value);
        cursor.continue();
    } 
    else {
        callback(dados);
    }
    };
    };

    request.onerror = (e) => {
        console.error("Erro ao abrir IndexedDB:", e.target.error);
    };
}

// ===================== Mostrar dados =====================
function mostrar(data, id) {
    if (!data[id]) {
        console.error("ID não encontrado nos dados!");
        return;
    }

    let valores = data[id].valores[2] || ""; // HTML com imagens
    id_t=data[id].valores[3]
    id_div=data[id].id
    company=data[id].valores[0]
    const criado = document.getElementById("criado");
    criado.id="criado_2"
    if (!criado) return;

    criado.innerHTML = valores;
}

document.getElementById("folder_sai").addEventListener("click", () => {
    window.location.href = "home.html";
});




document.getElementById("delete").addEventListener("click",async function(){
    if(confirm("Deseja mesmo eleminar esse post?")){
        let dd=await lerPosts()
        let len=dd.length
        let empresa=dd[len-1].empresa
        let nome=dd[len-1].username
        let msg=`@everyone o ${nome} da empresa ${empresa} eleminou o id ${id_t} da bd ${company}`

        enviarMensagemDiscord(msg)
        
        await fetch("https://cvpiramide.vercel.app/data_delete",{
            method:"post",
            headers:{
                "content-type":"application/json"
            },
            body:JSON.stringify({id:id_t,bd:company})
        })

        deletarRegistro(id_div)
        location.href="home.html"
    }
})

function deletarRegistro(id) {
    const request = indexedDB.open("div", 1);

    request.onsuccess = function (e) {
        const db = e.target.result;
        const tx = db.transaction("inner", "readwrite"); // precisa ser readwrite
        const store = tx.objectStore("inner");

        const deleteRequest = store.delete(id);

        deleteRequest.onsuccess = function () {
            console.log(`Registro com id=${id} deletado com sucesso!`);
        };

        deleteRequest.onerror = function (err) {
            console.error("Erro ao deletar registro:", err);
        };
    };

    request.onerror = function (e) {
        console.error("Erro ao abrir IndexedDB:", e.target.error);
    };
}



let db = null;

async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("user_post", 1);

    request.onupgradeneeded = function(event) {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("post")) {
        db.createObjectStore("post", { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = function(event) {
      db = event.target.result;
      resolve(db);
    };

    request.onerror = function(event) {
      reject(event.target.error);
    };
  });
}

async function lerPosts() {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["post"], "readonly");
    const store = transaction.objectStore("post");

    const request = store.getAll();

    request.onsuccess = function(event) {
      resolve(event.target.result); // retorna todos os registros
    };

    request.onerror = function(event) {
      reject(event.target.error);
    };
  });
}

function enviarMensagemDiscord(msg) {
    fetch("https://discordapp.com/api/webhooks/1411394811201589361/FN3rZOY8ISxkJRWDNMWAdZTHz4wJhRo4BJ6sAtUXuslsGX2TOqrD3PzyKuJdIbjS1-gf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: msg })
    })
    .then(() => console.log("Mensagem enviada!"))
    .catch(err => console.error("Erro ao enviar mensagem:", err));
}

//desapareca
//https://cvpiramide.vercel.app