
let data = [];
let lastQuestion = "";

function bacaCSV(file) {
  const rawFile = new XMLHttpRequest();
  rawFile.open("GET", file, true);
  rawFile.onreadystatechange = function() {
    if (rawFile.readyState === 4 && rawFile.status === 200) {
      const allText = rawFile.responseText;
      const rows = allText.split('\n');
      for (let i = 1; i < rows.length; i++) {
        const columns = rows[i].split(',');
        data.push({ pertanyaan: columns[0], respon: columns[1] });
      }
    }
  }
  rawFile.send(null);
}

window.onload = function() {
  bacaCSV('data.csv');
}


function cariRespon() {
  const input = document.getElementById('input').value.toLowerCase();
  const trimmedMsg = input.trim()
  function noSpaceOnly() {
  if(trimmedMsg == ""){
     return true
   }else{
     return false 
   }
   
  }
  if (!input || noSpaceOnly()) {
    alert('Pesan gak boleh kosong ')
    const input = document.getElementById('input').value = null; 
  } else {
    let bestMatch = { relevance: 0, response: "Maaf, saya tidak mengerti pertanyaan Anda." };

    if (lastQuestion) {
      for (let i = 0; i < data.length; i++) {
        if (data[i].pertanyaan.toLowerCase() === lastQuestion.toLowerCase()) {
          if (input.toLowerCase() === data[i].respon.toLowerCase()) {
            bestMatch.response = data[i].respon;
            lastQuestion = "";
            break;
          }
        }
      }
    }

    if (bestMatch.response === "Maaf, saya tidak mengerti pertanyaan Anda.") {
      for (let i = 0; i < data.length; i++) {
        const keywords = data[i].pertanyaan.toLowerCase().split(' ');
        let relevance = 0;
        for (const keyword of keywords) {
          if (input.includes(keyword)) {
            relevance++;
          }
        }
        if (relevance > bestMatch.relevance) {
          bestMatch.relevance = relevance;
          bestMatch.response = data[i].respon;
          lastQuestion = data[i].pertanyaan;
        }
      }
    }
    const chatbox = document.getElementById('chatbox');
    chatbox.innerHTML += `<div class="inputs"><strong>Anda:</strong>  ${input}</div>`;
    setTimeout(() => {
      chatbox.innerHTML += `<div class="res"><strong>ZenAI:</strong>  ${bestMatch.response}</div>`;
      document.getElementById('input').value = ''
    }, 1000)
  }
}

function menu(){
  location.href = '/menu.html'
}

const CACHE_NAME = 'Zen AI';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/about.html',
  '/about.css',
  '/about.js',
  '/menu.js',
  '/menu.html',
  '/menu.css',
  'data.csv'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {

      if (response) {
        return response;
      }

      const fetchRequest = event.request.clone();

      return fetch(fetchRequest).then((response) => {

        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});
