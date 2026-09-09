const http = require('http');

const data = JSON.stringify({
  email: "admin@courtify.com",
  password: "password123!"
});

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/api/v1/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => console.log('Status:', res.statusCode, 'Response:', body));
});

req.on('error', (e) => console.error(e));
req.write(data);
req.end();
