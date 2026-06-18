import https from 'https';
import fs from 'fs';

const url = 'https://upload.wikimedia.org/wikipedia/commons/transcoded/d/d4/Merhaba.ogg/Merhaba.ogg.mp3';
const dest = 'c:/Users/user/Desktop/moni/public/merhaba.mp3';

const file = fs.createWriteStream(dest);

const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'audio/ogg,audio/*;q=0.9,*/*;q=0.8',
    'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
    'Referer': 'https://commons.wikimedia.org/'
  }
};

https.get(url, options, function(response) {
  if (response.statusCode !== 200) {
    console.error('Download failed, status code:', response.statusCode);
    file.close();
    fs.unlink(dest, () => {});
    return;
  }
  response.pipe(file);
  file.on('finish', function() {
    file.close();
    console.log('Download complete!');
  });
}).on('error', function(err) {
  file.close();
  fs.unlink(dest, () => {});
  console.error('Error downloading file:', err.message);
});
