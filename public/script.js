document.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById('video');
  if (!video) {
    alert("video 要素が見つかりません！");
    return;
  }

  navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user' },
    audio: false
  }).then(stream => {
    video.srcObject = stream;
  }).catch(err => {
    alert("カメラの起動に失敗しました: " + err);
  });
});
const video = document.getElementById('video');
const capturedImg = document.getElementById('captured-img');
const canvas = document.getElementById('canvas');
const captureBtn = document.getElementById('capture-btn');
const yesBtn = document.getElementById('yes-btn');
const noBtn = document.getElementById('no-btn');
const confirmButtons = document.getElementById('confirm-buttons');
const pointOverlay = document.getElementById('point-overlay');

let currentImage = "";
let currentPoint = "";

// カメラ起動
navigator.mediaDevices.getUserMedia({
  video: { facingMode: 'user' },
  audio: false
}).then(stream => {
  video.srcObject = stream;
}).catch(err => {
  alert("カメラの起動に失敗しました: " + err);
});

// 撮影処理
captureBtn.addEventListener('click', () => {
  triggerFlashEffect();  // ←ここを追加！
  const ctx = canvas.getContext('2d');
  const size = Math.min(video.videoWidth, video.videoHeight);
  canvas.width = size;
  canvas.height = size;

  const sx = (video.videoWidth - size) / 2;
  const sy = (video.videoHeight - size) / 2;
  ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);

  // 白飛びグレー加工
  let imageData = ctx.getImageData(0, 0, size, size);
  let data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    let brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
    let overexposed = Math.min(255, brightness + 100);
    data[i] = data[i + 1] = data[i + 2] = overexposed;
  }
  ctx.putImageData(imageData, 0, 0);

  const digits = Math.floor(Math.random() * 5) + 1;
  const min = 10 ** (digits - 1);
  const max = 10 ** digits - 1;
  const point = `+${Math.floor(Math.random() * (max - min + 1) + min)}pt`;

  currentImage = canvas.toDataURL('image/png');
  currentPoint = point;

  capturedImg.src = currentImage;
  capturedImg.classList.remove('hidden');
  video.classList.add('hidden');
  captureBtn.classList.add('hidden');
  confirmButtons.classList.remove('hidden');
applyWhiteoutToImage();
  pointOverlay.textContent = point;
  pointOverlay.classList.remove('hidden');
});

// Yesで保存
yesBtn.addEventListener('click', async () => {


  await fetch('/increment', { method: 'POST' });


  const response = await fetch('/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: currentImage, point: currentPoint })
  });

  if (response.ok) {
    loadGallery();
  }

  returnToCamera();
});

// Noでキャンセル
noBtn.addEventListener('click', () => {
  returnToCamera();
});

// 撮影状態に戻す
function returnToCamera() {
  capturedImg.classList.add('hidden');
  video.classList.remove('hidden');
  captureBtn.classList.remove('hidden');
  confirmButtons.classList.add('hidden');
  pointOverlay.classList.add('hidden');
}

// ギャラリー表示
async function loadGallery() {
  const response = await fetch('/gallery');
  const data = await response.json();

  const galleryGrid = document.getElementById('gallery-grid');
  galleryGrid.innerHTML = '';

  data.forEach(item => {
    const div = document.createElement('div');
    div.className = 'gallery-item';
    div.innerHTML = `
    <div style="position: relative;">
      <img src="${item.image}" />
      <button class="delete-btn">×</button>
    </div>
    <p class="score">${item.point}</p>
  `;
    div.querySelector('.delete-btn').addEventListener('click', () => {
      deleteImage(item.image);
    });
    galleryGrid.appendChild(div);
  });
}







// ✅ 人数表示の読み込み関数
async function loadVisitorCount() {
  const res = await fetch('/count');
  const data = await res.json();

  const marquee = document.getElementById('visitor-marquee');
  marquee.innerHTML = '';

  const line = document.createElement('div');
  line.className = 'visitor-line';
  line.textContent = `　　　　　　// log("${data.count}People=>left their faces there.");`;
  marquee.appendChild(line);
}

// 削除処理
async function deleteImage(image) {
  const response = await fetch('/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image })
  });

  if (response.ok) {
    loadGallery();
  }
}
// 初期読み込み
window.addEventListener('DOMContentLoaded', () => {
  loadGallery();
  loadVisitorCount(); // ← これで人数表示が動き出す！
});
// フェイク通知
const fakeMessages = [
  "你 張 相 傳 咗 一 陣.",
  "그제부터 당신을 주목하고 있었어요",
  "数字の中に加えられました。",
  "我由前日開始一直留意緊你.",
  "あなたの形が一瞬流通しました。",
  "53人が記憶しています。",
  "一昨日からあなたに注目しています。",
  "流れに統合されました。",
  "短い間 視線が割り当てられました。",
  "識別されないまま通過しました。",
  "Unidentified and passed away long ago,",
"The momentary focus of the gaze creates rigid thinking.,",
"我由前日開始就留意住你."

];
const iconFiles = ["1.png", "2.png", "3.png", "4.png", "6.png"];

function showFakeNotification() {
  const notification = document.getElementById('fake-notification');
  const sound = document.getElementById('notification-sound');

  const message = fakeMessages[Math.floor(Math.random() * fakeMessages.length)];
  const iconURL = `assets/${iconFiles[Math.floor(Math.random() * iconFiles.length)]}`;

  const now = new Date();
  const timeString = now.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  notification.innerHTML = `
  <div style="display: flex; align-items: flex-start; gap: 10px;">
    <img src="${iconURL}" class="icon" />
    <div style="flex: 1;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span class="message-title">FAKE FACE</span>
        <span class="message-time">${timeString}</span>
      </div>
      <span class="message-text">${message}</span>
    </div>
  </div>
`;

  notification.classList.remove('hidden');
  notification.classList.add('show');
  sound.play();

  setTimeout(() => {
    notification.classList.remove('show');
    notification.classList.add('hidden');
  }, 3800);

  setTimeout(showFakeNotification, Math.random() * 20000 + 10000);
}

setTimeout(showFakeNotification, 5000);
async function applyWhiteoutToImage() {
  if (!window.faceDetector) return;

  const ctx = canvas.getContext('2d');
  const img = new Image();
  img.src = currentImage;

  img.onload = async () => {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const detections = await window.faceDetector.detect(canvas);
    if (!detections || detections.detections.length === 0) return;

    const face = detections.detections[0].boundingBox;
    const centerX = face.originX + face.width / 2;
    const centerY = face.originY + face.height / 2;

    ctx.fillStyle = "white";

    // 左目
    ctx.beginPath();
    ctx.arc(centerX - face.width * 0.2, centerY - face.height * 0.15, face.width * 0.08, 0, 2 * Math.PI);
    ctx.fill();

    // 右目
    ctx.beginPath();
    ctx.arc(centerX + face.width * 0.2, centerY - face.height * 0.15, face.width * 0.08, 0, 2 * Math.PI);
    ctx.fill();

    // 鼻
    ctx.beginPath();
    ctx.arc(centerX, centerY, face.width * 0.06, 0, 2 * Math.PI);
    ctx.fill();

    // 口
    ctx.beginPath();
    ctx.arc(centerX, centerY + face.height * 0.25, face.width * 0.15, 0, 2 * Math.PI);
    ctx.fill();

    currentImage = canvas.toDataURL('image/png');
    capturedImg.src = currentImage;
  };
}
function triggerFlashEffect() {
  const flash = document.getElementById('flash');
  const sound = document.getElementById('shutter-sound');
  const camera = document.getElementById('camera-container');

  // ミュート解除と初期化をまず
  sound.muted = false;
  sound.currentTime = 0;

  // 安全な再生（catchで失敗も検出）
  sound.play().catch((e) => {
    console.warn("🔇 撮影音が再生できません:", e);
  });

  // フラッシュ表示
  flash.style.opacity = '1';
  setTimeout(() => {
    flash.style.opacity = '0';
  }, 100);

  // 軽く揺れる
  camera.classList.add('shake-effect');
  setTimeout(() => {
    camera.classList.remove('shake-effect');
  }, 150);
}

// 初回クリックで audio 再生許可を得る（iOS対策）
document.addEventListener('DOMContentLoaded', () => {
  const shutter = document.getElementById('shutter-sound');
  document.body.addEventListener('click', () => {
    shutter.muted = false;
    shutter.play().catch(() => {});
    shutter.pause();
    shutter.currentTime = 0;
  }, { once: true });
});