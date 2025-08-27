async function verefica(){
    let ver=await checkIndexedDBWithData("user_post","post")
    let href=location.href
    let sep=href.split("/")
    let len=sep.length
    let fim=sep[len-1]
    console.log(ver,href,fim)
    let renova=localStorage.getItem("restaura")

    if(renova=="renova"){
        localStorage.setItem("restaura","eleminado")
        return
    }
    else if(ver==false && fim!="index.html"){
        location.href='index.html'
        console.log("eex")
        indexedDB.deleteDatabase("user_post")
    }
    else if(ver==true && fim=="index.html"){
        location.href='home.html'
    }
    else if(fim=="index.html"){
        indexedDB.deleteDatabase("user_post")
    }


}

function checkIndexedDBWithData(dbName, storeName) {
    return new Promise((resolve, reject) => {
        let existed = true;

        const request = indexedDB.open(dbName);

        request.onupgradeneeded = function () {
            // Se caiu aqui, a base não existia
            existed = false;
        };

        request.onsuccess = function () {
            const db = request.result;

            if (!existed) {
                db.close();
                resolve(false);
                return;
            }

            // Verifica se a store existe
            if (!db.objectStoreNames.contains(storeName)) {
                db.close();
                resolve(false);
                return;
            }

            // Agora abre transação e conta os registros
            const tx = db.transaction(storeName, "readonly");
            const store = tx.objectStore(storeName);
            const countReq = store.count();

            countReq.onsuccess = function () {
                db.close();
                resolve(countReq.result > 0); // true se tiver dados
            };

            countReq.onerror = function () {
                db.close();
                resolve(false);
            };
        };

        request.onerror = function () {
            reject(false);
        };
    });
}

document.addEventListener("checkin",async function(){
    await verefica()
})
//http://localhost:7000/