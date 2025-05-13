const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_PATH = path.join(__dirname, 'gallery.json');

app.use(express.static('public'));
app.use(express.json({ limit: '10mb' }));

console.log("✅ server.js is starting...");

// トップページ
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// ギャラリー取得
app.get('/gallery', (req, res) => {
  const data = fs.existsSync(DATA_PATH) ? fs.readFileSync(DATA_PATH, 'utf-8') : '[]';
  res.json(JSON.parse(data));
});

// ギャラリーに追加保存（ログ付き！）
app.post('/save', (req, res) => {
  const { image, point } = req.body;

  console.log("📥 POST /save called");
  console.log("🖼️ image received:", image ? image.slice(0, 30) + "..." : "undefined");
  console.log("📊 point received:", point);

  if (!image || !point) {
    console.log("❌ Invalid data");
    return res.status(400).send('Invalid data');
  }

  const data = fs.existsSync(DATA_PATH) ? JSON.parse(fs.readFileSync(DATA_PATH)) : [];
  data.unshift({ image, point });
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
  console.log("✅ Saved to gallery.json");

  res.sendStatus(200);
});


// 人数カウント取得
app.get('/count', (req, res) => {
  const data = fs.existsSync('count.json') ? JSON.parse(fs.readFileSync('count.json')) : { count: 1 };
  res.json({ count: data.count });
});

// 人数カウント加算
app.post('/increment', (req, res) => {
  const filePath = 'count.json';
  const data = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath)) : { count: 1 };
  data.count += 1;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  res.sendStatus(200);
});



// ギャラリーから削除（先頭一致）
app.post('/delete', (req, res) => {
  const { image } = req.body;

  console.log("❌ Delete request received");
  if (!image) return res.status(400).send('No image specified');

  const data = fs.existsSync(DATA_PATH) ? JSON.parse(fs.readFileSync(DATA_PATH)) : [];
  const filtered = data.filter(item => !item.image.startsWith(image));
  fs.writeFileSync(DATA_PATH, JSON.stringify(filtered, null, 2));
  console.log("✅ Image deleted");

  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});