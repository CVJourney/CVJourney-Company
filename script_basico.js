
function apanha(id){
    return document.getElementById(id)
}

let texto=document.querySelectorAll("textarea")
texto.forEach((e)=>{
    e.addEventListener("input",function(){
        let num=document.querySelectorAll(".numero_")
        console.log(22)
        let valor=this.value
        let len=valor.length
        console.log(valor,len)
        let color=""
        if(Number(len)==200){
            color="red"
        }
        else{
            color="black"
        }
        num.forEach((ef)=>{
            ef.innerHTML=`${len}/200`
            ef.style.color=color
        })
    })
})

let vem=""

let img=document.querySelectorAll(".img_troca")
img.forEach((p)=>{
    p.addEventListener("click",function(){
        let id=p.id
        vem=id
        console.log(id)
        localStorage.setItem("img",id)
        apanha("busca").click()
    })
})

apanha("busca").addEventListener("change",function(event){

    const file = event.target.files[0]; // Pega o primeiro arquivo
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img=apanha(vem)
            img.src = e.target.result; // Define a imagem
        }
        reader.readAsDataURL(file); // Converte para base64
    }

})
let x=1
apanha("vermais").addEventListener("click",function(){
    let info=apanha("info")
    let tamanho=""
    if(x==1){
        tamanho="260px"
        x=2
        this.innerHTML="Ver menos informação"
    }
    else{
        tamanho="90px"
        x=1
        this.innerHTML="Ver mais informação"
    }
    info.style.height=tamanho
})

apanha("folder_sai").addEventListener("click",function(){
    let mai=apanha("mai")
    mai.style.height="0"
    let tt=document.querySelectorAll(".titulos")
    tt.forEach((e)=>{
        e.innerHTML=""
    })
})

//folder
//http://localhost:7000/