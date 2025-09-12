document.addEventListener("adicionaconta",async function(){
    await inserirData()
})

function apanha(id){
    return document.getElementById(id)
}

async function inserirData(){
    let params=new URLSearchParams(window.location.search)
    let tipo=params.get("tipo")
    await tipos(tipo)
}

async function tipos(tipo){
    let preco=0
    if(tipo=="premium"){
        preco=899
    }
    else{
        preco=1299
    }
    await chama(tipo,preco)
}

async function chama(tipo, preco) {
    let data = {
        content:"@everyone",
        embeds: [
            {
                title: "Entrada de Empresa",
                description: "Tome atenção, analise a conta bancária para ver se foi transferido algum dinheiro.",
                color: 3447003,
                fields: [
                    {
                        name: "Tipo",
                        value: String(tipo),
                        inline: true
                    },
                    {
                        name: "Preço",
                        value: String(preco),
                        inline: true
                    },
                    {
                        name: "Conta",
                        value: String(apanha("nomeConta").value),
                        inline: false
                    },
                    {
                        name: "Empresa",
                        value: String(apanha("usuarioApp").value),
                        inline: false
                    }
                ]
            }
        ]
    };

    await fetch("https://discord.com/api/webhooks/1415305627265142814/38SF5hMYGT3a4lIPeE-FpzYKPV5iho79uevj2QMOc3T58G8LSfWtaUZsr96udEH9eQrV", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    mandar()
}

function mandar(){
    alert("Estamos analisando a sua conta e em breve enviaremos uma resposta. Você poderá visualizar a notificação no ícone de mensagens preto.")
    alert("Agora vamos te mandar para a home page onde podes divulgar os seus negocios(posts)")
    location.href="home.html"
}