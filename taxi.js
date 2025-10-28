
document.addEventListener("DOMContentLoaded",async function(){
    await captura()
})

async function captura(){

  let ler=await lerPosts()
  console.log("////7",ler)
  let empresa=trabalha_names(ler)
  console.log(empresa)
  let response=await fetch("https://cvpiramide.vercel.app/data_taxista_run",{
    method:"post",
    headers:{
      "content-type":"application/json"
    },
    body:JSON.stringify({empresa:empresa})
  })

  res=await response.json()

  await trabalhando(res)
    
}

async function trabalhando(dd){
  console.log(dd)
  dd=dd.reverse()
  let mai=document.getElementById("solicita")
  dd.map((e,i)=>{
    let cria=document.createElement("section")
    e.hora=String(e.hora).replace("T"," ")
    let intime=cal_tempo(e.hora,e.tempo)
    console.log(intime)
    console.log(e.cliente_name,e.hora, e.tempo)
    let horario=calc_horario(e.hora,e.tempo)
    let html=`
    <div class="caixa_mai">
      <iframe
        style="border:0"
        loading="lazy"
        allowfullscreen
        referrerpolicy="no-referrer-when-downgrade"
        src="https://www.google.com/maps?q=${e.latitude},${e.longitude}&hl=pt&z=15&output=embed">
      </iframe>
      <h4 id="taxista">Taxista: ${e.nome}</h4>
      <h5 id="cliente">${e.cliente_name}</h5>
      <h6 id="tipo">${e.cliente}</h6>
      <h5 id="destino">${e.destino}</h5>
      <h6 id="guia">${e.guia}</h6>
      ${
        intime==true && e.confirmado==null?
        `
          <input type="number" placeholder="Digite o preço" class="resposta" id="resposta_${i}">
          <h4 id="tempo">Horario para chegar nele: ${horario}</h4>
          <div id="btn_div">
            <button id="aceito_${i}" class="aceito" onclick="procura('aceito_${i}',${e.id})">Aceito</button>
            <button id="nego_${i}" class="nego" onclick="procura('nego_${i}','${e.id}')">Rejeitar</button>
          </div>
        `
        :e.confirmado==true && e.aceito==null?`<h5 id="passou">O cliente está analisando sua corrida...</h5>`:e.confirmado==false || e.aceito==false?
        `
          <h5 id="passou">A corrida foi cancelada</h5>
        `:e.confirmado==true && e.aceito==true && intime==true?`<h5 id="passou">Corrida aceitada! ⏱️ Chegue a tempo!</h5>`:
        `
          <h5 id="passou">O tempo ja Passou corrida cancelada</h5>
        `
      }
    </div>
    `
    cria.innerHTML=html
    mai.appendChild(cria)
  })
}

function cal_tempo(dateStr, limiteStr) {
  console.log("🟢 Recebido:", { dateStr, limiteStr });

  if (!dateStr || typeof dateStr !== "string") {
    console.error("❌ Erro: parâmetro 'dateStr' é inválido ->", dateStr);
    return false;
  }
  if (!limiteStr || typeof limiteStr !== "string") {
    console.error("❌ Erro: parâmetro 'limiteStr' é inválido ->", limiteStr);
    return false;
  }

  // Corrigir espaços e formato ISO se faltar o "T"
  dateStr = dateStr.trim().replace(" ", "T");

  const solicitacao = new Date(dateStr);
  if (isNaN(solicitacao.getTime())) {
    console.error("❌ Data inválida após conversão:", dateStr);
    return false;
  }

  const [h, m] = limiteStr.trim().split(":").map(Number);
  if (isNaN(h) || isNaN(m)) {
    console.error("❌ Formato de tempo inválido:", limiteStr);
    return false;
  }

  const tempoMaximoMs = (h * 60 + m) * 60 * 1000;
  const limiteAbsoluto = new Date(solicitacao.getTime() + tempoMaximoMs);
  const agora = new Date()


  console.log("🕒 Solicitacao:", solicitacao.toISOString());
  console.log("⏱️ Limite:", limiteAbsoluto.toISOString());
  console.log("⌛ Agora:", agora);

  return agora <= limiteAbsoluto;
}



function calc_horario(date, time) {
  // date: Date ou string ISO "2025-10-21T12:33:37.402Z"
  // time: string "hh:mm"
  
  const dataSolicitacao = new Date(date);
  
  // separar horas e minutos do tempo de deslocamento
  const [tempoHoras, tempoMinutos] = time.split(":").map(Number);
  
  // criar uma nova data somando o tempo de deslocamento
  const chegada = new Date(dataSolicitacao);
  chegada.setHours(chegada.getHours() + tempoHoras);
  chegada.setMinutes(chegada.getMinutes() + tempoMinutos);
  
  // formatar a data de chegada
  const ano = chegada.getFullYear();
  const mes = String(chegada.getMonth() + 1).padStart(2, "0"); // meses começam do 0
  const dia = String(chegada.getDate()).padStart(2, "0");
  const hora = String(chegada.getHours()).padStart(2, "0");
  const minuto = String(chegada.getMinutes()).padStart(2, "0");
  const segundo = String(chegada.getSeconds()).padStart(2, "0");
  
  return `${ano}-${mes}-${dia} ${hora}:${minuto}:${segundo}`;
}

function trabalha_names(dd){
  let dat=dd.length
  let data=dd[dat-1]
  let name=data.empresa
  return name
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

async function procura(id,esc){
  let separa=String(id).split("_")

  let tipo=separa[0]
  let token=separa[1]

  let resposta_=document.getElementById(`resposta_${token}`)
  let resposta=resposta_.value
  let envia=false
  let msg={}
  msg.id=esc
  if(Number(resposta)<=0 && tipo=="aceito"){
    alert("Por favor digite o preço da corrida")
  }
  else if(Number(resposta)>0 && tipo=="aceito"){
    alert("O processo não deve demorar aguarde um pouquinho...")
    msg.escolha=true
    msg.preco=resposta
    envia=true
  }
  else if(tipo=="nego"){
    msg.escolha=false
    envia=true
  }

  if(envia==true){
    console.log(msg)
    await msg_enviar(msg)
  }
}

async function msg_enviar(msg){
  let taxi=document.getElementById("taxi_loading_")
  taxi.style.display="block"
  let response=await fetch("https://cvpiramide.vercel.app/data_clientetaxi",{
    method:"post",
    headers:{"Content-Type": "application/json"},
    body:JSON.stringify(msg)
  })
  if(response.ok){
    alert("Resposta enviada com sucesso🎉")
    taxi.style.display="none"
    window.location.reload()
  }

  
}





