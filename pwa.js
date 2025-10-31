// pwa.js

// 1️⃣ Detectar se o site está rodando como PWA
function isRunningAsPWA() {
  return window.matchMedia('(display-mode: standalone)').matches 
      || window.navigator.standalone  // iOS
      || document.referrer.startsWith('android-app://'); // Android
}

// 2️⃣ Pegar o botão
const installBtn = document.getElementById('download');

// 3️⃣ Se o PWA já estiver instalado, esconda o botão
if (isRunningAsPWA() && installBtn) {
  installBtn.style.display = 'none';
  console.log('📱 PWA já instalado, botão escondido.');
}

// 4️⃣ Registrar evento "beforeinstallprompt"
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault(); // previne o banner automático
  deferredPrompt = e;
  console.log('💾 O PWA pode ser instalado.');

  // Mostrar o botão só se não estiver instalado
  if (installBtn) installBtn.style.display = 'inline-block';
});

// 5️⃣ Ligar o botão ao prompt de instalação
if (installBtn) {
  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) {
      alert("⚠️ O PWA não está disponível para instalação neste momento.");
      return;
    }

    if (confirm("Você está prestes a instalar o CVJ.E. no seu dispositivo. Assim, poderá acessá-lo de forma mais rápida e prática.")) {
      deferredPrompt.prompt(); // abre a janela de instalação
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        console.log('✅ PWA instalado pelo usuário.');
        installBtn.style.display = 'none'; // esconde o botão depois de instalar
      } else {
        console.log('❌ Usuário cancelou a instalação.');
      }

      deferredPrompt = null;
    }
  });
}

