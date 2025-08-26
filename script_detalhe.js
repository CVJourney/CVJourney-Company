let img_tag = null; // imagem atualmente clicada

document.addEventListener("DOMContentLoaded", async function(){
    document.dispatchEvent(new Event("checkin"))
    await getid();
});

// ===================== IndexedDB =====================
async function getid(){
    const params = new URLSearchParams(window.location.search);
    const id = params.get("link");
    listarDados(function(dados) {
        mostrar(dados, id);
    });
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
                callback(dados);
            }
        };
    };

    request.onerror = function(e) {
        console.error("Erro ao abrir o IndexedDB:", e.target.error);
    };
}

// ===================== Mostrar e listeners =====================
async function mostrar(data, id){
    let valores = data[id].valores[0]; // HTML com imagens
    let chaves = data[id].valores[1];

    let criado = document.getElementById("criado");
    criado.innerHTML = valores;

    // adiciona listeners para imagens recém-criadas
    setupImageListeners();

    document.dispatchEvent(new Event("desaparece"));
    chaves_(chaves);
}

function setupImageListeners() {
    const imgs = document.querySelectorAll("#criado img"); 
    imgs.forEach((im) => {
        im.addEventListener("click", function() {
            img_tag = this; // guarda imagem clicada
            document.getElementById("mudar").value = null; // limpa input
            document.getElementById("mudar").click(); // abre seletor
        });
    });
}

// ===================== Input file =====================
document.getElementById("mudar").addEventListener("change", async function(event){
    const file = event.target.files[0];
    if (file && img_tag) {
        const blobURL = URL.createObjectURL(file);
        img_tag.src = blobURL; // troca a imagem clicada
        img_tag.dataset.file = file.name; // opcional: armazena o nome do arquivo
        img_tag._file = file; // armazena o File real para enviar no FormData
    }
});

// ===================== Ocultar elementos =====================
document.addEventListener("desaparece", function(){
    let ids = ["titulo_estadia","titulo_restaurante"];
    ids.forEach((e) => {
        const el = document.getElementById(e);
        if (el) el.style.display = "none";
    });
});

// ===================== Atualizar campos =====================
function chaves_(key){
    let chave = Object.keys(key);
    chave.forEach((dt) => {
        let tag = document.getElementById(dt);
        if(tag){
            tag.classList.add("data_apanhar"); // mantém classes antigas
            tag.value = key[dt];
        } 
    });
}

// ===================== Botões =====================
document.getElementById("folder_sai").addEventListener("click", () => {
    window.location.href = "home.html";
});

document.getElementById("atualiza").addEventListener("click", async function(){
    await discord_set("atualiza", ".data_apanhar", "value", "data_local");
    await anexo(".img_troca");
});

// ===================== Discord set =====================
async function discord_set(tema, classe, tipo){
    let campos = document.getElementById("criado");
    let every = campos.querySelectorAll(classe);
    let data = {
        title: tema,
        fields: []
    };

    data.fields.push({name: "codigo", value: tema, inline: false});

    every.forEach((e, i) => {
        let valor = {name: e.id, value: e[tipo], inline: i>2};
        data.fields.push(valor);
    });

    console.log("Discord payload:", data);
    await discord(data)

}

// ===================== Anexos =====================
async function anexo(classe){
    let campos = document.getElementById("criado");
    let every = campos.querySelectorAll(classe);
    const formdata = new FormData();

    for(let i=0; i<every.length; i++){
        const img = every[i];
        // pega o File real armazenado no clique, ou converte o Blob URL
        let file = img._file;
        if(!file) {
            // converte Blob URL para File
            file = await fetch(img.src)
                .then(res => res.blob())
                .then(blob => new File([blob], `img${i+1}.png`, {type: blob.type}));
        }
        formdata.append(`file${i+1}`, file);
    }

    formdata.append("payload_json", JSON.stringify({content:"Imagens"}));

    console.log("FormData pronto para envio:", formdata);
    await anexo_(formdata)
}


let url="https://discord.com/api/webhooks/1405541230187643011/kqBB3UNVF8NuzcHZIqBR2fPamBg6rHr8ITve3YO2wqsbYM8hMbXE2xM1xV61oguS0jdl"

async function discord(mensagem) {
    await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            content: "@everyone empresa fazendo atualizações!!",
            embeds:[mensagem]
        })
    });
}

async function anexo_(mensagem) {
    await fetch(url,{
        method:"post",
        body:mensagem
    })
}
//folder
//http://localhost:7000/