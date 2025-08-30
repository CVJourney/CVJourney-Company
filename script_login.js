let db = null;

// Abrir ou criar a base de dados
function initDB() {
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
      console.log("Banco de dados pronto!");
      resolve(db);
    };

    request.onerror = function(event) {
      console.error("Erro ao abrir o banco:", event.target.error);
      reject(event.target.error);
    };
  });
}

function apanha(id){
    return document.getElementById(id)
}

let tipo="t_login"

document.querySelectorAll(".entrada").forEach((tag)=>{
    tag.addEventListener("click",function(){
        tipo=this.id
        tag.classList.add("pri")
        if(tipo=="t_login"){
            apanha("t_registrar").classList.remove("pri")
        }
        else{
            apanha("t_login").classList.remove("pri")
        }
        console.log(tipo)
    })
})

apanha("next").addEventListener("click",async function(){
    console.log(tipo)
    let obj={}
    let usuario=String(apanha("login-username").value).toLowerCase()
    let password=apanha("login-password").value
    let registro=String(apanha("login-empresa").value).toLowerCase()
    if(usuario.length>0 && password.length>7){
        obj.username=usuario
        obj.password=password
        obj.tipo=tipo
        obj.empresa=registro
        if(tipo=="t_registrar"){
            if(registro.length>0){
                let req= await fetch_(obj)
                validar(req)
                console.log("ex")
            }
            else{
                alert("Todos os campos não estão bem preenchidos")
            }
            
        }
        else{
            let req= await fetch_(obj)
            validar(req)
            console.log("ex")
        }
        console.log(obj)

    }
    else{
        alert("Todos os campos não estão bem preenchidos\nobs: a senha tem de ter mais de 8 digitos")
    }
})

function pegar_post(){
    console.log("pegar os posts")
}

async function fetch_(data){
    let res=await fetch("https://cvpiramide.vercel.app/data_login",{
        method:"post",
        headers:{
            "content-type":"application/json"
        },
        body:JSON.stringify(data)
    })

    let response=await res.json()

    console.log(response)
    let {valida,tipo,empresa}=response
    console.log(valida,tipo,empresa)

    return {valida,tipo,empresa}

}

async function validar(obj){
    let {valida,tipo}=obj
    let username=String(apanha("login-username").value).toLowerCase()
    let password=apanha("login-password").value
    let empresa=String(apanha("login-empresa").value).toLowerCase()
    let dados={
        username:username,
        password:password,
        empresa:empresa
    }

    if(valida==true && tipo=="registro"){
        console.log("Entramos")
        await addPost(dados)
        window.location.href="home.html"
        //usar função de inserir dados no indexDDB
    }
    else if(valida==false && tipo=="registro"){
      if(obj.empresa==false){
        alert("Ja existe uma empresa com esse nome")
      }
      else{
        alert("Este nome já está em uso.\nEscolha outro mais criativo.")
      }
    }
    else if(valida==false && tipo=="login"){
        alert("Os dados estão incorretos")
    }
    else if(valida==true && tipo=="login"){
        alert("Bem vindo de volta")
        await addPost(dados)
        window.location.href="home.html"
    }
}

//Função para adicionar um objeto
async function addPost(obj) {
  if (!db) {
    // espera o banco abrir se ainda não estiver pronto
    await initDB();
  }

  const tx = db.transaction("post", "readwrite");
  const store = tx.objectStore("post");

  return new Promise((resolve, reject) => {
    const requestAdd = store.add(obj);

    requestAdd.onsuccess = function() {
      console.log("Objeto armazenado com sucesso:", obj);
      resolve(obj);
    };

    requestAdd.onerror = function(event) {
      console.error("Erro ao armazenar objeto:", event.target.error);
      reject(event.target.error);
    };
  });
}


document.addEventListener("DOMContentLoaded",async function(){
  document.dispatchEvent(new Event("checkin"))
})

// Exemplo de uso:

//dados em analise


//https://cvpiramide.vercel.app/

