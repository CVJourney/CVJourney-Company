
let db = null;
let db2 = null;

async function initDB_ids() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("ids", 1); // base 'ids'

    request.onupgradeneeded = function(event) {
      const db2 = event.target.result;
      // Cria a store 'ids_' se não existir
      if (!db2.objectStoreNames.contains("ids_")) {
        db2.createObjectStore("ids_");
      }
    };

    request.onsuccess = function(event) {
      db2 = event.target.result;
      console.log("Banco 'ids' pronto com store 'ids_'");
      resolve(db2);
    };

    request.onerror = function(event) {
      console.error("Erro ao abrir IndexedDB:", event.target.error);
      reject(event.target.error);
    };
  });
}

// Inicializa o IndexedDB
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

function apanha(id){
    return document.getElementById(id)
}

document.getElementById("adicionar").addEventListener("click",async function(){
    let escolha=apanha("escolha").value
    if(escolha!="nada"){
        await processo()
    }
})

async function processo(){
    if(confirm("Clique em 'OK' se todos os campos estiverem preenchidos; caso contrário, 'Cancelar'.")){
        let troca=apanha("escolha").value
        
        let data=dados_enviar(troca)
        if(data){
            alert("Os seus dados estão em análise. Dentro de 4 dias enviaremos a resposta, que poderá ser consultada no ícone do e-mail preto")
            alert("Mantenha-se no site por 2 minutos para que seus dados sejam processados corretamente.")
            await discord(data)
        }
        console.log(data)
    }
}

function dados_enviar(valor){
    let chave=""
    let img=""
    switch (valor) {
        case "guias":
            chave=["escolha","categoria_guia","nome_guia","estrela_guia","ilha_guia","local_guia","info_guia","estrela_guia","preco_guia"]
            img=["img_1","img_2","img_3","img_4"]
            break;
    
        case "restaurante":
            chave=["escolha","nome_restaurante","info_restaurante","estrela_restaurante","prato_1","prato_preco_1","prato_pais_1","prato_estrela_1","prato_2","prato_preco_2","prato_pais_2","prato_estrela_2","prato_3","prato_preco_3","prato_pais_3","prato_estrela_3","prato_4","prato_preco_4","prato_pais_4","prato_estrela_4","prato_5","prato_preco_5","prato_pais_5","prato_estrela_5","ilha_restaurante"]
            img=["rest_img_1","rest_img_2","rest_img_3","rest_img_4","prato_img_1","prato_img_2","prato_img_3","prato_img_4","prato_img_5"]
            break
        
        case "estadia":
            chave=["escolha","nome_estadia","local_estadia","ilha_estadia","preco_estadia","info_estadia","reserva_estadia","estrela_estadia"]
            img=["estadia_img_1","estadia_img_2","estadia_img_3","estadia_img_4"]

            break

        case "taxi":
            chave=["escolha","nome_taxi","ilha_taxi","matricula_taxi","marca_taxi","modelo_taxi","preco_taxi","telefone_taxi","guia_taxi","estrela_taxi","disponivel_taxi"]
            img=["taxi_img_perfil","taxi_img_1","taxi_img_2","taxi_img_3","taxi_img_4"]
            break
    }

    return pega(chave,img)
}

function pega(chaves,img){
    let obj={}
    let obj_img={}
    let feito=true
    let img_default=["x__3ccaro.jpg","x__add__x.jpeg","x__perfil_23x.png","pratos___892__telx.avif"]
    chaves.map((e)=>{
        if(String(apanha(e).value).length>0){
            obj[e]=apanha(e).value
            apanha(e).style.borderColor="black"
        }
        else{
            feito=false
            apanha(e).style.borderColor="red"
            return
        }

    })

    function base64ParaBlob(base64) {
        const parts = base64.split(",");
        const mime = parts[0].match(/:(.*?);/)[1]; // pega o tipo: image/png, image/jpeg, etc.
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }

    img.map((e) => {
        let fim = String(apanha(e).src).split("/");
        let fim_ = fim[fim.length - 1];
        let ver = img_default.includes(fim_);
        console.log("rr", fim_, "ee", img_default);

        if (ver == false) {
            const src = apanha(e).src;

            if (src.startsWith("data:image")) {
                // converte para Blob antes de colocar no obj
                obj_img[e] = base64ParaBlob(src);
            } else {
                obj_img[e] = src; // se já for URL normal, mantém
            }

            apanha(e).style.borderColor = "black";
        } else {
            feito = false;
            apanha(e).style.border = "solid 1px red";
            console.log("vermelha");
        }
    });


    if(feito){
        return [obj,obj_img]
    }
    else{
        alert("Verefique se todos os campos estão bem preenchidos")
        return false
    }
}

async function discord(mensagem) {
    let url="https://discord.com/api/webhooks/1405541230187643011/kqBB3UNVF8NuzcHZIqBR2fPamBg6rHr8ITve3YO2wqsbYM8hMbXE2xM1xV61oguS0jdl"
    await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            content: `@everyone ${await cria_cmd(mensagem)}`,
            embeds:[await embed(mensagem)]
        })
    });

    await fetch(url,{
        method:"post",
        body:anexo(mensagem)
    })
}

//criar comandos
//novo
async function cria_cmd(data) {
  let d1 = data[0];
  let escolha = d1.escolha;
  console.log("/***jú***/",data, escolha);

  let comando = "";
  let user = await lerPosts();

  // Supondo que d1.files seja o objeto com todas as imagens que você quer enviar
  // Ex.: { img1: File, img2: File, img3: File, ... }
  let imagens = await enviarImagensImgBB(data[1]); // retorna array de URLs
  // Agora imagens[0] = img1, imagens[1] = img2, etc.

  switch (escolha) {
    case "guias":
      comando = `insert into empresas (nome,estrela,tipo,categoria,imagem,localizacao,ilha,plano,info,empresa,custo) values('${d1.nome_guia}',${d1.estrela_guia},'${d1.categoria_guia}','${d1.categoria_guia}','${imagens.join("||")}','${d1.local_guia}','${d1.ilha_guia}',3,'${d1.info_guia}','${user[user.length-1].empresa}',${d1.preco_guia})`;
      break;

    case "estadia":
      comando = `insert into estadia (nome,fotos,local,ilha,custo,plano,reserva,empresa,estrela,info) values('${d1.nome_estadia}','${imagens.join("||")}','${d1.local_estadia}','${d1.ilha_estadia}',${d1.preco_estadia},3,${d1.reserva_estadia},'${user[user.length-1].empresa}',${d1.estrela_estadia},'${d1.info_estadia}')`;
      break;

    case "restaurante":
      // aqui você pode mapear os pratos e trocar img5..img9 pelas URLs corretas do array
      console.log(d1.pratos)
      comando = `insert into restaurante (fotos,nome,plano,info,estrela,pratos,ilha,empresa) values('${imagens.slice(0,4).join("{}")}','${d1.nome_restaurante}',3,'${d1.info_restaurante}',${d1.estrela_restaurante},'${d1.prato_1}{}${d1.prato_estrela_1}{}${imagens[4]}{}${d1.prato_pais_1}{}${d1.prato_preco_1}[]${d1.prato_2}{}${d1.prato_estrela_2}{}${imagens[5]}{}${d1.prato_pais_2}{}${d1.prato_preco_2}[]${d1.prato_3}{}${d1.prato_estrela_3}{}${imagens[6]}{}${d1.prato_pais_3}{}${d1.prato_preco_3}[]${d1.prato_4}{}${d1.prato_estrela_4}{}${imagens[7]}{}${d1.prato_pais_4}{}${d1.prato_preco_4}[]${d1.prato_5}{}${d1.prato_estrela_5}{}${imagens[8]}{}${d1.prato_pais_5}{}${d1.prato_preco_5}[]','${d1.ilha_restaurante}','${user[user.length-1].empresa}')`;
      //${d1.pratos.map((p,i)=> p+"{}"+imagens[4+i]+"{}"+d1.preco[i]).join("[]")}
      break;

    case "taxi":
      comando = `insert into taxi(nome,perfil,chapa,marca,modelo,estrela,preco_dia,plano,telefone,disponivel,guia,ilha,empresa,carro) values('${d1.nome_taxi}','${imagens[0]}','${d1.matricula_taxi}','${d1.marca_taxi}','${d1.modelo_taxi}',${d1.estrela_taxi},${d1.preco_taxi},3,${d1.telefone_taxi},${d1.disponivel_taxi},${d1.guia_taxi},'${d1.ilha_taxi}','${user[user.length-1].empresa}','${imagens.slice(1,5).join("[]")}')`;
      break;
  }

  return comando;
}


//fim de criar comandos

async function embed(data){
    let ob1=data[0]
    console.log(ob1)
    let obj={
        title:`Categoria: ${ob1.escolha}`,
        fields:[]
    }
    let valor=""
    let key_1=Object.keys(ob1)

    let user=await lerPosts()
    let len=user.length
    let veja_em=user[len-1].empresa
    let veja_usu=user[len-1].username
    let veja_pas=user[len-1].password
    
    key_1.map((ch,i)=>{
      if(i==0){
        obj.fields.push({name:"empresa",value:`${veja_em}|${veja_usu}|${veja_pas}|inserir|${ob1[ch]}`, inline:false})
      }
      else{
        valor={name:ch,value:ob1[ch],inline:i>2?true:false}
        obj.fields.push(valor)
      }
    })
    
    return obj
}

function anexo(data){
    let ob2=data[1]
    const formdata=new FormData()

    let key=Object.keys(ob2)
    key.map((ch,i)=>{
        formdata.append(`file${i+1}`,ob2[ch],`img${i+1}.png`)
        formdata.append("payload_json",JSON.stringify({content:"Imagens"}))
    })
    return formdata
}



const apiKey = "d5d509ea35944f0fd6bb90ef35c22033"; // substitua aqui

async function enviarImagensImgBB(ob2) {
  const urls = [];
  const keys = Object.keys(ob2);

  for (let i = 0; i < keys.length; i++) {
    const file = ob2[keys[i]];
    const base64 = await fileToBase64(file);

    if (!base64) {
      console.error("Arquivo inválido:", file);
      urls.push(null);
      continue;
    }

    const formData = new FormData();
    formData.append("key", apiKey);
    formData.append("image", base64); // apenas base64 puro

    try {
      const res = await fetch("https://api.imgbb.com/1/upload", {
        method: "POST",
        body: formData
      });

      const json = await res.json();

      if (!json.success) {
        console.error("Erro na API ImgBB:", json);
        urls.push(null);
      } else {
        urls.push(json.data.display_url);
      }
    } catch (err) {
      console.error("Erro ao enviar imagem:", err);
      urls.push(null);
    }
  }

  return urls;
}

// File → base64 puro
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result;
      // Verifica se é string válida
      if (typeof result === "string" && result.includes(",")) {
        resolve(result.split(",")[1]); // remove data:image/png;base64,
      } else {
        resolve(null);
      }
    };
    reader.onerror = reject;
  });
}















async function salvarDados(dados) {
  // Exemplo: dados = ["valor1", "valor2"]

  const request = indexedDB.open("div", 1);

  request.onupgradeneeded = function(e) {
    const db = e.target.result;
    if (!db.objectStoreNames.contains("inner")) {
      db.createObjectStore("inner", { keyPath: "id", autoIncrement: true });
    }
  };

  request.onsuccess = async function(e) {
    const db = e.target.result;
    const tx = db.transaction("inner", "readwrite");
    const store = tx.objectStore("inner");

    // Salvar a lista como um objeto
    store.add({ valores: dados });
    tx.oncomplete = async () => {
      console.log("Dados salvos com sucesso:", dados);
      db.close();
    };
  };

  request.onerror = function(e) {
    console.error("Erro ao abrir o IndexedDB:", e.target.error);
  };
}


// Salvar dados na store 'ids_'


// Ler todos os dados da store 'ids_'
async function lerids() {
  if (!db2) {
    db2 = await initDB_ids();
  }

  return new Promise((resolve, reject) => {
    const tx = db2.transaction("ids_", "readonly");
    const store = tx.objectStore("ids_");

    const request = store.getAll();

    request.onsuccess = function (event) {
      const dados = event.target.result;
      console.log("Dados lidos:", dados);
      resolve(dados);
    };

    request.onerror = function (event) {
      console.error("Erro ao ler dados:", event.target.error);
      reject(event.target.error);
    };
  });
}

async function get_post(){

  let ler=await lerids()
  let len=ler.length
  let valor=[]
  console.log("--",ler)
  if(len<=0){
    valor.push({id_empresa:[0,0]})
    valor.push({id_estadia:[0,0]})
    valor.push({id_taxi:[0,0]})
    valor.push({id_restaurante:[0,0]})
  }
  else{
    ler.map((e) => {
      valor.push({
        id_empresa: e.id_empresa.length!=0 ? [e.id_empresa, 0, 0] : [0, 0, 0]
      });
      valor.push({
        id_estadia: e.id_estadia.length!=0 ? [e.id_estadia, 0, 0] : [0, 0, 0]
      });
      valor.push({
        id_taxi: e.id_taxi.length!=0 ? [e.id_taxi, 0, 0] : [0, 0, 0]
      });
      valor.push({
        id_restaurante: e.id_restaurante.length!=0 ? [e.id_restaurante, 0, 0] : [0, 0, 0]
      });
    });
  }
  console.log("++",valor)

  let post=await lerPosts()
  let len_=post.length
  let empresa=post[len_-1].empresa

  let response=await fetch("https://cvpiramide.vercel.app/data_encontra",{
    method:"post",
    headers:{
      "content-type":"application/json"
    },
    body:JSON.stringify({ids:valor,empresa:empresa})
  })

  let res=await response.json()
  console.log(res)
  await configura(res)

  let key=Object.keys(res)
  key.map(async (e)=>{
    if(res[e].length>0){
      res[e].map(async (e2)=>{
        let html_red=html_pronto(e,e2)
        await salvarDados([e,e2.nome,html_red,e2.id])
        console.log("*/*",html_red)
      })
    }
  })
  

}
/*aqui estamos trabalhando os dados para entregar os posts para os empresarios--inicio*/

async function configura(data){
  let empresa=data.empresa
  let estadia=data.estadia
  let restaurante=data.restaurante
  let taxi=data.taxi

  let id_e1=[]
  let id_e2=[]
  let id_e3=[]
  let id_e4=[]

  empresa.map((e)=>{
    id_e1.push(e.id)
  })
  estadia.map((e)=>{
    id_e2.push(e.id)
  })
  restaurante.map((e)=>{
    id_e3.push(e.id)
  })
  taxi.map((e)=>{
    id_e4.push(e.id)
  })

  await salvarids(id_e1,id_e2,id_e3,id_e4)
}


function html_pronto(esc,data){
  let html=""
  switch(esc){
    case "empresa":
      let img=String(data.imagem).split("||")
      html=`            
      <div id="guias" class="apareca">
                

                <input type="text" name="" id="nome_guia" placeholder="Digite o nome do lugar ou espaço" class="dados_inseridos" value='${data.nome}'>
                
                <select name="" id="categoria_guia" class="dados_inseridos">
                    <option value="${data.tipo}">${data.tipo}</option>
                    <option value="praias" class="catego">Praias</option>
                    <option value="cultura" class="catego">Cultura</option>
                    <option value="trilhas" class="catego">Trilhas</option>
                    <option value="aquaticos" class="catego">Aquáticos</option>
                    <option value="fauna_marinha" class="catego">Fauna</option>
                    <option value="gastronomia" class="catego">Gastronomia</option>
                    <option value="historico" class="catego">Histórico</option>
                    <option value="artesanato" class="catego">Artesanato</option>
                    <option value="vulcao" class="catego">Vulcão</option>
                </select>


                <div id="imagens_guia_">
                    <img src="${img[0]}" alt="" id="img_1" class="img_troca">
                    
                    <img src="${img[1]}" alt="" id="img_2" class="img_troca">
                    
                    <img src="${img[2]}" alt="" id="img_3" class="img_troca">
                    
                    <img src="${img[3]}" alt="" id="img_4" class="img_troca">
                    
                </div>
                <select name="" id="ilha_guia" class="dados_inseridos">
                    <option value="">Selecione a ilha da propriedade</option>
                    <option value="${data.ilha}">${data.ilha}</option>
                    <option value="são vicente">São vicente</option>
                    <option value="sal">Sal</option>
                    <option value="maio">Maio</option>
                    <option value="boa vista">Boa vista</option>
                    <option value="santo antão">Santo Antão</option>
                    <option value="são nicolau">São Nicolau</option>
                    <option value="brava">Brava</option>
                    <option value="fogo">Fogo</option>
                </select>
                <input type="text" id="local_guia" placeholder="Digite a cidade onde esta situado" class="dados_inseridos" value='${data.localizacao}'>
                <input type="number" class="dados_inseridos" placeholder="Digite o preço" id="preco_guia" value='${data.custo}'>
                <input type="number" class="dados_inseridos" placeholder="Digite o nomero de estrela da localidade" id="estrela_guia" value='${data.estrela}'>
                <textarea name="" id="info_guia" placeholder="Digite alguma informação sobre" rows="10" maxlength="200">${data.info}
                </textarea>
                <h6 class="numero_">0/200</h6>
    
            </div>`
      break

    case "estadia":
      let foto=String(data.fotos).split("||")
      html=`            
      <div id="estadia" class="apareca">
                <input type="text" id="nome_estadia" placeholder="Digite o nome do lugar" class="dados_inseridos" value='${data.nome}'>
                <input type="number" id="estrela_estadia" placeholder="Digite o numero de estrela" class="dados_inseridos" value='${data.estrela}'>
    
                <div id="imagens_estadia_">
                    <img src="${foto[0]}" alt="" id="estadia_img_1" class="img_troca">
                    
                    <img src="${foto[1]}" alt="" id="estadia_img_2" class="img_troca">
                    
                    <img src="${foto[2]}" alt="" id="estadia_img_3" class="img_troca">
                    
                    <img src="${foto[3]}" alt="" id="estadia_img_4" class="img_troca">
                    
                </div>
    
                <input type="text" id="local_estadia" placeholder="Digite a localização" class="dados_inseridos" value='${data.local}'>
    
                <select id="ilha_estadia" class="dados_inseridos">
                    <option value="${data.ilha}">${data.ilha}</option>
                    <option value="santiago">Santiago</option>
                    <option value="sao_vicente">São Vicente</option>
                    <option value="sal">Sal</option>
                    <option value="maio">Maio</option>
                    <option value="boa_vista">Boa Vista</option>
                    <option value="santo_antao">Santo Antão</option>
                    <option value="sao_nicolau">São Nicolau</option>
                    <option value="brava">Brava</option>
                    <option value="fogo">Fogo</option>
                </select>

                <select name="" id="reserva_estadia" class="dados_inseridos">
                ${data.reserva==true?`
                  <option value="true">Reservado</option>
                  <option value="false">Disponivel</option>
                  `
                  :`
                  <option value="false">Disponivel</option>
                  <option value="true">Reservado</option>
                  `}
                </select>
    
                <input type="number" id="preco_estadia" placeholder="Preço da reserva por mês (ECV)" class="dados_inseridos" value='${data.custo}'>
    
                <textarea id="info_estadia" placeholder="Digite informações sobre a estadia" rows="6" maxlength="200">${data.info}</textarea>
                <h6 class="numero_">0/200</h6>
            </div>`
      break

    case "restaurante":
      let fotos=String(data.fotos).split("{}")
      let pr=String(data.pratos).split("[]")
      let pr1=pr[0].split("{}")
      let pr2=pr[1].split("{}")
      let pr3=pr[2].split("{}")
      let pr4=pr[3].split("{}")
      let pr5=pr[4].split("{}")
      html=`            
      <div id="restaurante" class="apareca">
                <input type="text" id="nome_restaurante" placeholder="Digite o nome do restaurante" class="dados_inseridos" value='${data.nome}'> 

                <div id="imagens_restaurante_">
                    <img src="${fotos[0]}" alt="" id="rest_img_1" class="img_troca">
                    
                    <img src="${fotos[1]}" alt="" id="rest_img_2" class="img_troca">
                    
                    <img src="${fotos[2]}" alt="" id="rest_img_3" class="img_troca">
                    
                    <img src="${fotos[3]}" alt="" id="rest_img_4" class="img_troca">
                    
                </div>
    

                <input type="number" name="" id="estrela_restaurante" class="dados_inseridos" placeholder="Estrelas do restaurante 0-5" max="5" min="0" value='${data.estrela}'>
    
                <textarea id="info_restaurante" placeholder="Digite informações sobre o restaurante" rows="6" maxlength="200">${data.info}</textarea>
                <h6 class="numero_">0/200</h6>
    
    
                <div id="p_1" class="pratos_info">
                    <input type="text" id="prato_1" placeholder="Nome do prato" value='${pr1[0]}'>
                    <input type="number" id="prato_preco_1" placeholder="Preço do prato" value='${pr1[1]}'>
                    <input type="text" id="prato_pais_1" placeholder="País do prato" value='${pr1[3]}'>
                    <input type="number" id="prato_estrela_1" placeholder="Estrela (0-5)" value='${pr1[4]}'>
                </div>
    
                <div id="p_2" class="pratos_info">
                    <input type="text" id="prato_2" placeholder="Nome do prato" value='${pr2[0]}'>
                    <input type="number" id="prato_preco_2" placeholder="Preço do prato" value='${pr2[1]}'>
                    <input type="text" id="prato_pais_2" placeholder="País do prato" value='${pr2[3]}'>
                    <input type="number" id="prato_estrela_2" placeholder="Estrela (0-5)" value='${pr2[4]}'>
                </div>
    
                <div id="p_3" class="pratos_info">
                    <input type="text" id="prato_3" placeholder="Nome do prato" value='${pr3[0]}'>
                    <input type="number" id="prato_preco_3" placeholder="Preço do prato" value='${pr3[1]}'>
                    <input type="text" id="prato_pais_3" placeholder="País do prato" value='${pr3[3]}'>
                    <input type="number" id="prato_estrela_3" placeholder="Estrela (0-5)" value='${pr3[4]}'>
                </div>
    
                <div id="p_4" class="pratos_info">
                    <input type="text" id="prato_4" placeholder="Nome do prato" value='${pr4[0]}'>
                    <input type="number" id="prato_preco_4" placeholder="Preço do prato" value='${pr4[1]}'>
                    <input type="text" id="prato_pais_4" placeholder="País do prato" value='${pr4[3]}'>
                    <input type="number" id="prato_estrela_4" placeholder="Estrela (0-5)" value='${pr4[4]}'>
                </div>
    
                <div id="p_5" class="pratos_info">
                    <input type="text" id="prato_5" placeholder="Nome do prato" value='${pr5[0]}'>
                    <input type="number" id="prato_preco_5" placeholder="Preço do prato" value='${pr5[1]}'>
                    <input type="text" id="prato_pais_5" placeholder="País do prato" value='${pr5[3]}'>
                    <input type="number" id="prato_estrela_5" placeholder="Estrela (0-5)" value='${pr5[4]}'>
                </div>
                
                <div id="prato_imagem_">
                    <h3 id="titulo_prato">Inclua a foto dos 5 pratos típicos para encantar os turistas.</h3>
                    <img src="${pr1[2]}" alt="" id="prato_img_1" class="pratos img_troca">
                    <img src="${pr2[2]}" alt="" id="prato_img_2" class="pratos img_troca">
                    <img src="${pr3[2]}" alt="" id="prato_img_3" class="pratos img_troca">
                    <img src="${pr4[2]}" alt="" id="prato_img_4" class="pratos img_troca">
                    <img src="${pr5[2]}" alt="" id="prato_img_5" class="pratos img_troca">
                    
                </div>
    
                <select id="ilha_restaurante" class="dados_inseridos">
                    <option value="${data.ilha}">${data.ilha}</option>
                    <option value="santiago">Santiago</option>
                    <option value="sao_vicente">São Vicente</option>
                    <option value="sal">Sal</option>
                    <option value="maio">Maio</option>
                    <option value="boa_vista">Boa Vista</option>
                    <option value="santo_antao">Santo Antão</option>
                    <option value="sao_nicolau">São Nicolau</option>
                    <option value="brava">Brava</option>
                    <option value="fogo">Fogo</option>
                </select>
            </div>`
      break

    case "taxi":
      let carro=String(data.carro).split("[]")
      html=`            
      <div id="taxi" class="apareca">
                <select id="ilha_taxi" class="dados_inseridos">
                    <option value="${data.ilha}">${data.ilha}</option>
                    <option value="santiago">Santiago</option>
                    <option value="sao_vicente">São Vicente</option>
                    <option value="sal">Sal</option>
                    <option value="maio">Maio</option>
                    <option value="boa_vista">Boa Vista</option>
                    <option value="santo_antao">Santo Antão</option>
                    <option value="sao_nicolau">São Nicolau</option>
                    <option value="brava">Brava</option>
                    <option value="fogo">Fogo</option>
                </select>

                <input type="text" id="nome_taxi" placeholder="Nome do motorista" class="dados_inseridos" value='${data.nome}'>  

                <div id="foto_perfil_taxi_">
                    <img src="${data.perfil}" alt="" id="taxi_img_perfil" style="border: none;" class="img_troca">
                    
                </div>
    
                <input type="text" id="matricula_taxi" placeholder="Chapa do carro" class="dados_inseridos" value='${data.chapa}'>
                <input type="text" id="marca_taxi" placeholder="Marca do carro" class="dados_inseridos" value='${data.marca}'>
                <input type="text" id="modelo_taxi" placeholder="Modelo do carro" class="dados_inseridos" value='${data.modelo}'>
    
                <div id="imagens_taxi_">
                    <h4 style="display: block;">4 lados diferentes</h4>
                    <img src="${carro[0]}" alt="" id="taxi_img_1" class="img_troca">
                    
                    <img src="${carro[1]}" alt="" id="taxi_img_2" class="img_troca">
                    
                    <img src="${carro[2]}" alt="" id="taxi_img_3" class="img_troca">
                    
                    <img src="${carro[3]}" alt="" id="taxi_img_4" class="img_troca">
                    
                </div>
    
                <input type="number" id="preco_taxi" placeholder="(Preço) para fazer uma guia turistica" class="dados_inseridos" value='${data.preco_dia}'>
                <input type="tel" id="telefone_taxi" placeholder="Telefone" class="dados_inseridos" value='${data.telefone}'>
                <input type="text" id="estrela_taxi" class="dados_inseridos" placeholder="Auto avaliação 0-5" value='${data.estrela}'>
                
                <select name="" id="disponivel_taxi" class="dados_inseridos">
                    ${data.disponivel==true?`                 <option value="true">Estou disponivel</option>
                    <option value="false">Não estou disponivel</option>
                    `:`                    
                    <option value="false">Não estou disponivel</option>
                    <option value="true">Estou disponivel</option>
                    `}
                </select>

                <select id="guia_taxi" class="dados_inseridos">
                      ${data.guia==true?`                   <option value="true">Com guia</option>
                    <option value="false">Sem guia</option>`:`                    
                    <option value="false">Sem guia</option>
                    <option value="true">Com guia</option>
                    `}

                </select>
            </div>`
      break
  }
  return html
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

async function salvarids(v_empresa, v_estadia, v_restaurante, v_taxi) {
  if (!db2) {
    db2 = await initDB_ids();
  }

  return new Promise((resolve, reject) => {
    const tx = db2.transaction("ids_", "readwrite");
    const store = tx.objectStore("ids_");

    // chave fixa, sempre o mesmo registro
    const chave = 1;

    const getRequest = store.get(chave);

    getRequest.onsuccess = function () {
      let antigo = getRequest.result;

      let dado;
      if (antigo) {
        dado = {
          id: chave,
          id_empresa: [...new Set([...(antigo.id_empresa || []), ...v_empresa])],
          id_estadia: [...new Set([...(antigo.id_estadia || []), ...v_estadia])],
          id_restaurante: [...new Set([...(antigo.id_restaurante || []), ...v_restaurante])],
          id_taxi: [...new Set([...(antigo.id_taxi || []), ...v_taxi])]
        };
      } else {
        dado = {
          id: chave,
          id_empresa: v_empresa,
          id_estadia: v_estadia,
          id_restaurante: v_restaurante,
          id_taxi: v_taxi
        };
      }

      let requestUpdate;

      // ⚡ Se a store foi criada com keyPath
      if (store.keyPath) {
        requestUpdate = store.put(dado);
      } else {
        // ⚡ Se a store não tem keyPath, passa a chave separada
        requestUpdate = store.put(dado, chave);
      }

      requestUpdate.onsuccess = function () {
        console.log("Registro único atualizado com sucesso:", dado);
        resolve(dado);
      };

      requestUpdate.onerror = function (event) {
        console.error("Erro ao salvar dado:", event.target.error);
        reject(event.target.error);
      };
    };
  });
}

document.addEventListener("DOMContentLoaded",async function(){
  document.dispatchEvent(new Event("checkin"))
  document.dispatchEvent(new Event("msg"))
  await get_post()
  await cout()
})

let tipo_x=0

async function Ver_perfil(){
  let ler=await lerPosts()
  let inverte=ler.reverse()
  let close=document.createElement("button")

  close.classList.add("material-icons")
  close.innerText="close"
  close.id="close_x"
  
  let div_=document.createElement("div")
  div_.id="div_elemina"
  div_.appendChild(close)
  
  let nav=apanha("div_acount")
  nav.style.display="block"
  nav.innerHTML=""
  nav.appendChild(div_)

  close.onclick=async ()=>{
    await desapareca("div_acount")
  }

  inverte.map((e)=>{
    let html=`
    <section class="delete_x" id="elemina_${e.id}" onclick="Eleminar_x('user_post','post',${e.id},1,event)"><p  class="material-icons">delete</p></section>
    <h4><label class="post_empresa">Nme:</label> ${e.username}</h4>
    <h4><label class="post_empresa">Empresa:</label> ${e.empresa}</h4>
    <h4><label class="post_empresa">Senha:</label> <span>${e.password}</span>`
    let div=document.createElement("div")
    div.innerHTML=html
    div.onclick=async ()=>{
      if(confirm("Pronto para mudar de conta?")){
        let obj={username:e.username,password:e.password,empresa:e.empresa}
        indexedDB.deleteDatabase("div")
        indexedDB.deleteDatabase("ids")
        await addPost(obj)
        await Eleminar_x('user_post','post',e.id,2)
        console.log(e.id)
      }
    }
    nav.appendChild(div)
  })

  let btn=document.createElement("button")
  btn.id="criar_conta"
  btn.innerText="Adicionar uma nova conta"
  btn.onclick=async ()=>{
    await novaconta()
  }
  nav.appendChild(btn)

  document.body.appendChild(nav)


  nav.classList.add("perfil_x_div")
  
}

async function desapareca(id){
  let v=apanha(id)
  v.style.display="none"
  console.log(v)
}

async function novaconta(){
  if(confirm("Pronto para adicionar uma nova conta?")){
    indexedDB.deleteDatabase("div")
    indexedDB.deleteDatabase("ids")
    localStorage.setItem("restaura","renova")
    window.location.href="index.html"
  }
}

function Eleminar_x(dbName, storeName, id,dec,event) {
  if (event) event.stopPropagation();
  let veri=dec==1?confirm("Tem certeza de que deseja remover esta conta deste dispositivo?"):true

  if(veri){
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName);
  
      request.onerror = (event) => reject(event.target.error);
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
  
        const deleteRequest = store.delete(id);
  
        deleteRequest.onsuccess = () => {
          resolve(`Registro com id ${id} deletado!`);
          window.location.reload()
        };
  
        deleteRequest.onerror = (event) => {
          reject(event.target.error);
        };
      };
    });
  }
}

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

apanha("perfil_x").addEventListener("click",async function(){
  await Ver_perfil()
})

async function cout(){
  let data=await lerPosts()
  let empresa=data[data.length-1].empresa
  let response=await fetch("https://cvpiramide.vercel.app/data_count",{
    method:"post",
    headers:{
      "content-type":"application/json"
    },
    body:JSON.stringify({empresa:empresa})
  })

  let res=await response.json()
  let count=res[0].count
  console.log(count)

  let pega=localStorage.getItem("count")
  let ap=apanha("msg_")

  if(Number(pega)>=count){
    console.log(918)
  }
  else{
    let num=count-pega
    alert(`Novas(${num}) solicitações`)
    let cr=document.createElement("h6")
    cr.id="msg_2"
    cr.innerText=`Novas solicitações(${num})`
    ap.appendChild(cr)
    localStorage.setItem("count",count)
  }
}

document.addEventListener("msg",async function(){
    await msg()
})

async function msg(){
    let ler=await lerPosts()
    let len=ler.length
    let empresa=ler[len-1].empresa
    let response=await fetch("https://cvpiramide.vercel.app/data_conta_2",{
        method:"post",
        headers:{
            "content-type":"application/json"
        },
        body:JSON.stringify({empresa:empresa})
    })
    let res=await response.json()
    console.log("iiii ",res)
    let count=res[0].count
    console.log(count)
    let lc=localStorage.getItem("notifx")
    console.log(lc)
    let num=Number(lc)
    if(lc==null){
      alert(`Oi! Você tem ${count} nova(s) mensagen(s) sobre os seus últimos posts. Confira agora no ícone do e-mail preto 📩.`)
      localStorage.setItem("notifx",count)
    }
    else if(lc<count){
      alert(`Oi! Você tem ${count-lc} novas mensagens sobre os seus últimos posts. Confira agora no ícone do e-mail preto 📩.`)
      localStorage.setItem("notifx",count)
    }
}


//__3ccaro.jpg
//https://cvpiramide.vercel.app
//domloa