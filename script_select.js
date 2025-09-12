document.addEventListener("planos",async function(){
    console.log("ggg",await name_company())
    await inspeciona()
})

async function inspeciona(){
    let company=await name_company()
    let response=await fetch("https://cvpiramide.vercel.app/data_plano_master",{
        method:"post",
        headers:{"content-type":"application/json"},
        body:JSON.stringify({empresa:company})
    })
    let res=await response.json()
    console.log("/222",res)
    await envia(res)
}

async function name_company(){
    let data=await lerPosts()
    let len=data.length
    let dd=data[len-1]
    let empresa=dd.empresa
    return empresa
}

// Função assíncrona para ler todos os posts
async function lerPosts() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("user_post");

    request.onerror = function(event) {
      reject("Erro ao abrir o banco de dados: " + event.target.error);
    };

    request.onsuccess = function(event) {
      const db = event.target.result;
      const transaction = db.transaction("post", "readonly");
      const store = transaction.objectStore("post");

      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = function() {
        resolve(getAllRequest.result);
      };

      getAllRequest.onerror = function(event) {
        reject("Erro ao ler os posts: " + event.target.error);
      };
    };
  });
}

async function envia(pl){
    let plano=1
    if(pl==""){
        console.log("45")
    }
    else{
        console.log(pl)
        plano=pl[0].plano
    }
    let ler=await lerPosts()
    let len=ler.length
    let data=ler[len-1]
    data.plano=plano
    console.log("console.log")
    console.log("/3336",data)
    await apagarUltimoEAdicionarNovo(data)
}

// Função para substituir o último registro pelo novo valor
// Função que apaga o último registro e adiciona um novo
async function apagarUltimoEAdicionarNovo(novoValor) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("user_post");

    request.onerror = function(event) {
      reject("Erro ao abrir o banco de dados: " + event.target.error);
    };

    request.onsuccess = function(event) {
      const db = event.target.result;
      const transaction = db.transaction("post", "readwrite");
      const store = transaction.objectStore("post");

      // Pega todos os registros
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = function() {
        const registros = getAllRequest.result;

        if (registros.length === 0) {
          // Se não há nada, só adiciona o novo
          const addRequest = store.add(novoValor);
          addRequest.onsuccess = () => resolve("Novo valor adicionado (não havia registros antes).");
          addRequest.onerror = (e) => reject("Erro ao adicionar novo valor: " + e.target.error);
        } else {
          // Descobre o último pelo id mais alto
          const ultimo = registros.reduce((a, b) => (a.id > b.id ? a : b));
          const chaveUltimo = ultimo.id;

          // Apaga o último
          const deleteRequest = store.delete(chaveUltimo);

          deleteRequest.onsuccess = function() {
            // Adiciona o novo valor (IndexedDB vai gerar novo id > anterior)
            const addRequest = store.add(novoValor);
            addRequest.onsuccess = () => resolve("Último removido e novo valor adicionado.");
            addRequest.onerror = (e) => reject("Erro ao adicionar novo valor: " + e.target.error);
          };

          deleteRequest.onerror = (e) => reject("Erro ao apagar último valor: " + e.target.error);
        }
      };

      getAllRequest.onerror = function(event) {
        reject("Erro ao buscar registros: " + event.target.error);
      };
    };
  });
}
