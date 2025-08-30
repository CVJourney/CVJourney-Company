function apanha(id){
    return document.getElementById(id)
}


function listarDados(callback) {
  const request = indexedDB.open("div", 1);

  request.onsuccess = function(e) {
    const db = e.target.result;
    const tx = db.transaction("inner", "readonly");
    const store = tx.objectStore("inner");

    const dados = [];

    store.openCursor().onsuccess = function(event) {
      const cursor = event.target.result;
      if (cursor) {
        dados.push(cursor.value);
        cursor.continue();
      } else {
        callback(dados); // chama quando terminar
      }
    };
  };

  request.onerror = function(e) {
    console.error("Erro ao abrir o IndexedDB:", e.target.error);
  };
}

// Uso:
apanha("folder").addEventListener("click",async function() {
  console.log(await chekindDB("div"))
  if(await chekindDB("div")==true){
    let mai = apanha("mai");
    mai.style.height = "100vh";
    alert("Aqui estarão os seus posts.")
    listarDados(async function(dados) {
      ler(dados,mai)
      console.log(dados)
    });
  }
  else{
    alert("Ainda não há posts aqui. Se acabou de publicar, aguarde alguns minutos enquanto nossos sistemas analisam e validam seu conteúdo. Obrigado pela paciência!")
    window.location.reload()
  }
});


 function ler(dados,mai){
    let len=dados.length-1
    let div=document.createElement("div")
    div.className="titulos"
    
    while(len>=0){
      let nome=dados[len].valores[1]
      let h3=document.createElement("h3")
      h3.innerText=`${nome}`
      h3.className="titulo_file"
      h3.id=len
      h3.onclick=()=>{
        next(h3.id)
      }
      div.appendChild(h3)
      len--
    }
    mai.appendChild(div)
}


function next(id){
  console.log(id)
  window.location.href=`post.html?link=${id}`
  console.log("ei")
}

function chekindDB(dbName) {
    return new Promise((resolve, reject) => {
        let existed = true;

        const request = indexedDB.open(dbName);

        request.onupgradeneeded = function() {
            // Se entra aqui, a base não existia
            const deleteRequest = indexedDB.deleteDatabase("div");
            existed = false;
        };

        request.onsuccess = function() {
            request.result.close(); // fecha a conexão
            resolve(existed);
        };

        request.onerror = function() {
            reject(false);
        };
    });
}

