import express from 'express';

const app = express();
const port = 3000;

app.get('/test', (req, res) => {
  res.send('This is a test endpoint!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
