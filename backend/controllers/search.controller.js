
const { searchDocuments } = require('../services/elasticsearch.service');

async function search(req, res) {
  try {
    const { query, type = 'keyword', page = 1, size = 10, field = 'all' } = req.query;
    const response = await searchDocuments(query, type, parseInt(page), parseInt(size), field);
    res.json({
      total: response.hits.total?.value || 0,
      results: response.hits.hits
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


module.exports = { search };
