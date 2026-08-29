const express = require('express');
const app = express();

app.use((req, res, next) => {
  const contentType = String(req.headers['content-type'] || '');
  if (req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'PATCH') return next();
  if (!contentType.includes('text/plain')) return next();

  let rawBody = '';
  req.setEncoding('utf8');
  req.on('data', (chunk) => {
    rawBody += chunk;
  });
  req.on('end', () => {
    try {
      req.body = rawBody ? JSON.parse(rawBody) : {};
    } catch (error) {
      req.body = rawBody ? { raw: rawBody } : {};
    }
    next();
  });
});

app.use(express.json());
app.post('/test', (req, res) => {
  res.status(200).json({ ok: true, body: req.body });
});

const server = app.listen(0, async () => {
  const port = server.address().port;
  const response = await fetch(`http://localhost:${port}/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain; charset=UTF-8' },
    body: JSON.stringify({
      title: 'kxkxk',
      address: 'xxxkxk',
      city: 'kxkxkkx',
      description: 'xkxkxkkx',
      rent: 22233,
      bedrooms: 1,
      bathrooms: 1,
      amenities: ['xxxxxxx'],
      available_from: '2026-08-29',
      image_url: 'data:image/png;base64,abc'
    })
  });

  console.log('status=' + response.status);
  console.log(await response.text());
  server.close();
});
