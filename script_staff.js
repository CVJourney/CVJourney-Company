let db=null

document.addEventListener("DOMContentLoaded",async function(){
    alert("Aqui você vê as atualizações sobre os seus posts (mensagens que enviamos para informar o resultado).")
    await pegar()
})

async function pegar(){
    let ler=await lerPosts()
    let len=ler.length
    let empresa=ler[len-1].empresa
    let response=await fetch("https://cvpiramide.vercel.app/data_staff",{
        method:"post",
        headers:{
            "content-type":"application/json"
        },
        body:JSON.stringify({empresa:empresa})
    })
    let res=await response.json()
    console.log(res)
    await trabalhar(res)
}

async function trabalhar(data){
    data=data.reverse()
    data.map((e)=>{
        let html=`${e.tipo==null
          ?
          `Sobre: <strong>${e.nome}</strong>
          <br>Empresa: <strong>${e.empresa}</strong><br>Mensagem: <strong>${e.msg}</strong></p>`
          :
          `${e.tipo==true?'<h2>Aceito ✅</h2>':'<h2>Negado ❌⛔</h2>'}<p class="msg_n">Post: <strong>${e.nome}</strong> <br>Empresa: <strong>${e.empresa}</strong><br>Mensagem: <strong>${e.msg}</strong></p>`}`
        let cria=document.createElement("div")
        cria.classList.add("criado")
        cria.innerHTML=html
        document.body.appendChild(cria)
    })
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
