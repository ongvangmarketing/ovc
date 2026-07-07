const http = require('http');
const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/workspace/hotel-booking/hotels',
  method: 'GET',
  headers: {
    // We need a valid session to bypass requireAuth.
    // Let's just catch the exact HTTP error code and body.
  }
}, res => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    console.log("Status:", res.statusCode);
    const titleMatch = data.match(/<title>(.*?)<\/title>/);
    if (titleMatch) console.log("Title:", titleMatch[1]);
    const errMatch = data.match(/<h1[^>]*>([a-zA-Z\s]+Error.*?)<\/h1>/);
    if (errMatch) console.log("Error:", errMatch[1]);
    const descMatch = data.match(/<p[^>]*>(.*?)<\/p>/);
    if (descMatch) console.log("Desc:", descMatch[1]);
  });
});
req.end();
