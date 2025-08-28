
let db = null;
let db2 = null;

async function initDB_ids() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("ids", 1); // base 'ids'

    request.onupgradeneeded = function(event) {
      const db2 = event.target.result;
      // Cria a store 'ids_' se não existir
      if (!db2.objectStoreNames.contains("ids_")) {
        db2.createObjectStore("ids_", { keyPath: "ids", autoIncrement: true });
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
            alert("Os seus dados estão em processo de analise, iremos mandar uma resposta daqui 4 dias")
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
        apanhar(obj)
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
async function cria_cmd(data){
  let d1=data[0]
  let escolha=d1.escolha
  console.log(data,escolha)
  let comando=""
  let user=await lerPosts()
  switch(escolha){
    case "guias":
      comando=`insert into empresas (nome,estrela,tipo,categoria,imagem,localizacao,ilha,plano,info,empresa,custo) values('${d1.nome_guia}',${d1.estrela_guia},'${d1.categoria_guia}','${d1.categoria_guia}',img1\\|\\|img2\\|\\|img3\\|\\|img4,'${d1.local_guia}','${d1.ilha_guia}',3,'${d1.info_guia}','${user[user.length-1].empresa}',${d1.preco_guia})`
      break
    case "estadia":
      comando=`insert into estadia (nome,fotos,local,ilha,custo,plano,reserva,empresa,estrela,info) values('${d1.nome_estadia}','img1\\|\\|img2\\|\\|img3\\|\\|img4','${d1.local_estadia}','${d1.ilha_estadia}',${d1.preco_estadia},3,${d1.reserva_estadia},'${user[user.length-1].empresa}',${d1.estrela_estadia},'${d1.info_estadia}')`
      break
    case "restaurante":
      comando=`insert into restaurante (fotos,nome,plano,info,estrela,pratos,ilha,empresa) values('img1{}img2{}img3{}img4','${d1.nome_restaurante}',3,'${d1.info_restaurante}',${d1.estrela_restaurante},'${d1.prato_1}{}${d1.prato_estrela_1}{}img5{}${d1.prato_pais_1}{}${d1.prato_preco_1}[]${d1.prato_2}{}${d1.prato_estrela_2}{}img6{}${d1.prato_pais_2}{}${d1.prato_preco_2}[]${d1.prato_3}{}${d1.prato_estrela_3}{}img7{}${d1.prato_pais_3}{}${d1.prato_preco_3}[]${d1.prato_4}{}${d1.prato_estrela_4}{}img8{}${d1.prato_pais_4}{}${d1.prato_preco_4}[]${d1.prato_5}{}${d1.prato_estrela_5}{}img9{}${d1.prato_pais_5}{}${d1.prato_preco_5}[]','${d1.ilha_restaurante}','${user[user.length-1].empresa}')`
      break
    case "taxi":
      comando=`insert into (nome,perfil,chapa,marca,modelo,estrela,preco_dia,plano,telefone,disponivel,guia,ilha,empresa,carro) values('${d1.nome_taxi}',img1,'${d1.matricula_taxi}','${d1.marca_taxi}','${d1.modelo_taxi}',${d1.estrela_taxi},${d1.preco_taxi},3,'${d1.telefone_taxi}',${d1.disponivel_taxi},${d1.guia_taxi},'${d1.ilha_taxi}','${user[user.length-1].empresa}','img2[]img3[]img4[]img5')`
      break
  }

  return comando
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

async function apanhar(valores){
    let escolha=apanha("escolha").value
    let div=apanha(escolha).innerHTML
    console.log(div,valores)

    await go_post([div,valores])
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
    valor.push(0)
  }
  else{
    ler.map((e)=>{
      valor.push(e.valor)
    })
  }
  console.log("++",valor)

  let post=await lerPosts()
  let len_=post.length
  let empresa=post[len_-1].empresa

  let response=await fetch("https://cvpiramide.vercel.app/data_get",{
    method:"post",
    headers:{
      "content-type":"application/json"
    },
    body:JSON.stringify({ids:valor,empresa:empresa})
  })

  let res=await response.json()
  console.log(res)
  if(res.length>0){
    let id=[]
    res.map((e,i)=>{
      id.push(e.id)
      res[i].valor=transformar(e.valor)
    })

    console.log(id)
    id.map(async (e)=>{
      await salvarids(e)
    })
    console.log(res)

    await Promise.all(
      res.map(async (e) => {
        return await criador_009(e.html, e.valor);
      })
    );
  }
}

function transformar(valor){
  let sep=String(valor).split("[]")
  let obj={}
  sep.map((e)=>{
    let sep2=e.split("{}")
    obj[sep2[0]]=sep2[1]
  })

  return obj
}

async function criador_009(html,valor){
  let obj=[html,valor]
  await salvarDados(obj)

}




async function go_post(data){
  let post=await lerPosts()
  let len_=post.length
  let empresa=post[len_-1].empresa

  let response=await fetch("https://cvpiramide.vercel.app/data_post",{
    method:"post",
    headers:{
      "content-type":"application/json"
    },
    body:JSON.stringify({data:data,empresa:empresa})
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

async function salvarids(valor) {
  if (!db2) {
    db2 = await initDB_ids();
  }

  return new Promise((resolve, reject) => {
    const tx = db2.transaction("ids_", "readwrite");
    const store = tx.objectStore("ids_");

    const dado = { valor: valor }; // o campo 'ids' é a chave, 'valor' é o conteúdo
    const request = store.add(dado);

    request.onsuccess = function () {
      console.log("Dado salvo com sucesso:", dado);
      resolve(dado);
    };

    request.onerror = function (event) {
      console.error("Erro ao salvar dado:", event.target.error);
      reject(event.target.error);
    };
  });
}

document.addEventListener("DOMContentLoaded",async function(){
  document.dispatchEvent(new Event("checkin"))
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




//__3ccaro.jpg