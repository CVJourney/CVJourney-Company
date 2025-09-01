let id
let ed
let u
function apanha(id){
    return document.getElementById(id)
}
document.addEventListener("obrigado",async function(){
    document.querySelectorAll(".ids_").forEach((s)=>{
        ed=s.id
    })
    document.querySelectorAll(".novas").forEach((h)=>{
        u=h.id
    })

    document.querySelectorAll(".apareca").forEach((e) => {
        id=e.id
        mostra(id)
        
    });
})

function mostra(id){
    let ch=["estadia","taxi"]
    let ap=apanha("disponivel_2")
    if(ch.includes(id)){
        console.log("deu",ed)
    }
    else{
        ap.style.display="none"
    }
}

apanha("troca").addEventListener("change",async function(){
    let valor=this.value
    console.log(valor)
    let comando
    if(valor!=""){
        if(confirm("Deseja seguir em frente?")){
            if(id=="estadia"){
                valor=valor=="true"?false:true
                comando=`update estadia set reserva=${valor} where id=${ed}`
                console.log(comando)
                await tirar("id_estadia")
            }
            else{
                comando=`update taxi set disponivel=${valor} where id=${ed}`
                console.log(comando)
                await tirar("id_taxi")
            }

            await fetch("https://cvpiramide.vercel.app/data_troca",{
                method:"post",
                headers:{
                    "content-type":"application/json"
                },
                body:JSON.stringify({comando:comando})
            })
            alert("Estamos a trabalhar nesta página e, para concluir, vamos levá-lo para a página inicial.")
            location.href="home.html"

        }
    }
})

async function tirar(campo){
    console.log(u)
    await elemina(u,ed,campo)

}

async function elemina(nome, ed, campo) {
  ed = Number(ed); // garante que ed seja número

  try {
    // --- Função para deletar registro na store "inner" pelo valores.id ---
    async function deletarInnerPorValoresId() {
      const dbDiv = await new Promise((resolve, reject) => {
        const request = indexedDB.open("div");
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      return new Promise((resolve, reject) => {
        const tx = dbDiv.transaction("inner", "readwrite");
        const store = tx.objectStore("inner");

        let encontrado = false;

        const cursorReq = store.openCursor();
        cursorReq.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            // verifica se o campo valores.id é igual ao nome
            if (cursor.value.valores && cursor.value.id == nome) {
              cursor.delete(); // deleta o registro
              console.log("Registro removido da store 'inner':", cursor.value);
              encontrado = true;
            }
            cursor.continue();
          } else {
            resolve(encontrado);
          }
        };

        cursorReq.onerror = () => reject(cursorReq.error);
        tx.onerror = () => reject(tx.error);
      });
    }

    // --- Função para remover valor do array na store "ids_" ---
    async function removerIds() {
      const dbIds = await new Promise((resolve, reject) => {
        const request = indexedDB.open("ids");
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      return new Promise((resolve, reject) => {
        const tx = dbIds.transaction("ids_", "readwrite");
        const store = tx.objectStore("ids_");

        const getReq = store.get(1);
        getReq.onsuccess = () => {
          const idsObj = getReq.result;

          if (!idsObj) {
            console.log("Objeto 'ids_' não encontrado!");
            resolve(false);
            return;
          }

          if (!Array.isArray(idsObj[campo])) {
            console.log("Campo não é um array ou não existe:", campo);
            resolve(false);
            return;
          }

          const originalLength = idsObj[campo].length;
          idsObj[campo] = idsObj[campo].filter(v => v != ed);

          if (idsObj[campo].length === originalLength) {
            console.log("Valor não encontrado no array:", ed);
            resolve(false);
            return;
          }

          const putReq = store.put(idsObj, 1);
          putReq.onsuccess = () => {
            console.log(`Removido ${ed} de ${campo} no banco ids`);
            resolve(true);
          };
          putReq.onerror = () => reject(putReq.error);
        };

        getReq.onerror = () => reject(getReq.error);
        tx.onerror = () => reject(tx.error);
      });
    }

    // --- Executar as duas funções ---
    const innerRemovido = await deletarInnerPorValoresId();
    const idsRemovido = await removerIds();

    console.log("Resumo:", {
      inner: innerRemovido ? "Removido" : "Não encontrado",
      ids: idsRemovido ? "Removido" : "Não encontrado"
    });

  } catch (err) {
    console.error("Erro na função elemina:", err);
  }
}


