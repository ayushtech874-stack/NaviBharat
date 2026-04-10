const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/signup/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const regex = /data:image\/jpeg;base64,[a-zA-Z0-9+/=]+/g;
content = content.replace(regex, 'https://media.istockphoto.com/id/2223818400/photo/an-isolated-ancient-temple-stands-against-the-backdrop-of-a-moody-storm-lit-sky-at-dusk-in.jpg?s=612x612&w=0&k=20&c=sVlTRYPzHwoCv-uWqRh3vUMrc3DKf2NjA5tqcZnLKpA=');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Chittorgarh image updated.');
