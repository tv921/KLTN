
const { searchDocuments } = require('../services/elasticsearch1.service');

async function search(req, res) {
  try {
      const { query, type } = req.query; // type: 'keyword' hoặc 'semantic'
      const response = await searchDocuments(query, type);
      res.json(response.hits.hits);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
}

module.exports = { search };
