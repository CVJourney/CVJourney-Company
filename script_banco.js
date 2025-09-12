document.addEventListener("DOMContentLoaded",async function(){
    let vg=await data()
    let data_=vg[0]
    let {nome,nib,banco}=data_
    apanha("data_conta").value=nome
    apanha("data_nib").value=nib
    apanha("data_banco").value=banco

})

async function data(){
    let dd=await getPosts()
    let lei=dd.length
    let empresa=dd[lei-1].empresa
    let response=await fetch("https://cvpiramide.vercel.app/data_banco",{
        method:"post",
        headers:{
            "content-type":"application/json"
        },
        body:JSON.stringify({empresa:empresa})
    })

    let res=await response.json()
    return res
}


function apanha(id){
    return document.getElementById(id)
}

apanha("update").addEventListener("click",async function(){
    apanha("atuali").style.display="block"
})

apanha("fecha2").addEventListener("click",async function(){
    apanha("atuali").style.display="none"
})

apanha("enviar").addEventListener("click",async function(){
    let senha=apanha("senha_up").value
    let dd=await getPosts()
    let lei=dd.length
    let empresa=dd[lei-1].empresa
    let obj={
        senha:senha,
        empresa:empresa,
        nome:apanha("data_conta").value,
        nib:apanha("data_nib").value,
        banco:apanha("data_banco").value
    }

    let response=await fetch("https://cvpiramide.vercel.app/data_veriBC",
        {
            method:"post",
            headers:{
                "content-type":"application/json"
            },
            body:JSON.stringify(obj)
        })

    let res=await response.json()
    let {ver}=res
    if(ver==false){
        alert("A senha esta incorreta🤨")
    }
    else{
        alert("Os dados foram alterados com sucesso")
        window.location.reload()
    }

    

})

async function getPosts() {
  return new Promise((resolve, reject) => {
    // Abrir a base de dados use_post
    const request = indexedDB.open("user_post", 1);

    request.onerror = () => {
      reject("Erro ao abrir a base de dados.");
    };

    request.onsuccess = () => {
      const db = request.result;

      // Abrir transação somente leitura na store "post"
      const transaction = db.transaction("post", "readonly");
      const store = transaction.objectStore("post");

      // Pegar todos os dados
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result); // Retorna os dados
      };

      getAllRequest.onerror = () => {
        reject("Erro ao ler os dados.");
      };
    };

    // Caso seja necessário criar a store na primeira vez
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("post")) {
        db.createObjectStore("post", { keyPath: "id", autoIncrement: true });
      }
    };
  });
}
