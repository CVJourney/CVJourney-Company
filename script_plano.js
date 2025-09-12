let plano=document.querySelectorAll(".plano").forEach((e)=>{
    e.addEventListener("click",async function(){
        verefica(e.id)
    })
})

async function verefica(tipo){
    if(tipo=="gratis"){
        alert("Seja bem vindo ao CVJourney Empresas.")
        location.href="home.html"
    }
    else if(tipo=="premium"){
        location.href=`pagamento.html?tipo=premium`
    }
    else if(tipo=="ultimate"){
        location.href=`pagamento.html?tipo=ultimate`
    }
}

document.addEventListener("DOMContentLoaded",async function(){
    document.dispatchEvent(new Event("checkin"))
})