function apanha(id){
    return document.getElementById(id)
}

async function trabalhar(){
    let data=await getdata()
    return data
}
setInterval(() => {
  let pri=apanha("pri_campo")
  pri.innerHTML=""
  document.dispatchEvent(new Event("DOMContentLoaded"))
  console.log("vr12")
}, 120*1000);
let aler=1
document.addEventListener("DOMContentLoaded",async function(){
  console.log("vr13")
    document.dispatchEvent(new Event("checkin"))
    let data_= await trabalhar()
    if(aler==1){
      alert("Visualize aqui todas as solicitações enviadas à sua empresa ou perfil.")
    }
    aler=2
    let data=data_.reverse()
    let div=apanha("pri_campo")
    let date=new Date()
    const ano = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, '0'); // mês começa em 0
    const dia = String(date.getDate()).padStart(2, '0');
    let vira=null
    
    data.map((e,i)=>{
      if(e.resposta!=null){
        let ress=e.resposta.split("-")
        let fim=`${ress[2]}-${ress[1]}-${ress[0]}`
        let limite=new Date(fim)
        console.log(limite,date)
        if(limite>=date){
          vira=true
        }
        else{
          vira=false
        }

      }
      let html = `
        <h5>${e.autor}</h5>
        <h5>${e.telefone}</h5>
        <h5>O pedido: ${e.lugar}</h5>
        <h5>${e.data}</h5>
        <h5>${e.preco} ECV</h5>
        ${
          e.vista == true
            ? `<button class="act">Aceitado</button>`
            : e.vista == false
            ? `<button class="ngt">Negado</button>`
            : `
              <button class="act_2" onclick="alter(true, '${e.id}','${e.autor}','${e.lugar}')">Aceito</button>
              <button class="ngt_2" onclick="alter(false, '${e.id}','${e.autor}','${e.lugar}')">Negar</button>
            `
        }
        ${
          e.compra == true
            ? `<h6>Reserva concluída (${e.preco}$ECV)</h6>
            <h6><a href='${e.link}' id="link" download>Ver o Recibo de pagamento</a></h6>`
            : e.compra == false
            ? `<h6>Reserva adiada</h6>`
            : vira == true && e.resposta!=null
            ? `<h6 class="limite-s">Ainda a tempo ${e.resposta}</h6>`
            : vira == false && e.resposta!=null && e.vista==true
            ?`<h6 class="limite-n">Data ULTRAPASSADA (${e.resposta})</h6>`
            : e.vista!=false?`<label for="data_ss" >
                Selecione a data limite para resposta
              </label>
            <input type="date" class="data_2" class="data_ss" id="${e.id}_data" min=${ano}-${mes}-${dia}>`:""
        }
        ${
          (e.compra == false || e.compra == null) &&  e.vista!=false
            ? `<h1 class="cancela" onclick="alter(false, '${e.id}')">Cancelar</h1>`
            : ""
        }
      `;
        let sup=document.createElement("div")
        sup.className="campos"
        sup.innerHTML=html
        div.appendChild(sup)
    })
})


async function getdata(){
    let empresa=await lerPosts()
    let fim=empresa[empresa.length-1].empresa

    let response=await fetch("https://cvpiramide.vercel.app/data_msg",{
        method:"post",
        headers:{
            "content-type":"application/json"
        },
        body:JSON.stringify({empresa:fim})
    })
    let res=await response.json()
    return res
}
let db=null

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

async function alter(vista,id,name,lugar){
  let data=apanha(`${id}_data`).value

  console.log("er",data)

  if(!data && vista==true){
    alert("Digite por favor a data de expiração da proposta")
  }
  else{
    name=name.replace(" ","_")
    let dd=data.split("-")
    let ano=`${dd[2]}-${dd[1]}-${dd[0]}`
    if(confirm("Deseja realizar o pedido?")){
      await fetch("https://cvpiramide.vercel.app/data_vista",{
        method:"post",
        headers:{
          "content-type":"application/json"
        },
        body:JSON.stringify({vista:vista,id:id,ano:ano})
      })
      console.log("feito")

      await fetch("https://apiprisma.vercel.app/sendPush",{
        method:"post",
        headers:{"content-type":"application/json"},
        body:JSON.stringify({
          usuario: name,
          titulo: "CVJourney News",
          mensagem: `Resposta sobre o seu pedido "${lugar}"`
        })
      })
      window.location.reload()

    }
  }

}
//http:localhost:4000/