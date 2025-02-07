const express = require('express');
const { getEmbedContent } = require('./headlessEmbed');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files (frontend)
app.use(express.static(path.join(__dirname)));

// Endpoint to get embed content
app.get('/api/render', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send('URL query parameter is required');
  }

  try {
    const embedUrl = await getEmbedContent(url);
    res.json({ embedUrl });
  } catch (err) {
    res.status(500).send('Error fetching embed content');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
