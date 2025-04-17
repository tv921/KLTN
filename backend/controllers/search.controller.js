const { Client } = require('@elastic/elasticsearch');

// Debug biến môi trường
console.log('Environment Variables in search.controller.js:', {
  ELASTICSEARCH_URL: process.env.ELASTICSEARCH_URL,
  ELASTICSEARCH_USERNAME: process.env.ELASTICSEARCH_USERNAME,
  ELASTICSEARCH_PASSWORD: process.env.ELASTICSEARCH_PASSWORD
});

const client = new Client({
  node: process.env.ELASTICSEARCH_URL,
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME,
    password: process.env.ELASTICSEARCH_PASSWORD
  }
});

// Kiểm tra kết nối Elasticsearch
client.ping()
  .then(() => console.log('Elasticsearch connection successful'))
  .catch(err => console.error('Elasticsearch connection error:', err));

exports.searchDocuments = async (req, res) => {
  const { query } = req.query;
  try {
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    const result = await client.search({
      index: 'documents',
      body: {
        query: {
          multi_match: {
            query: query,
            fields: ['title', 'content']
          }
        }
      }
    });
    res.json(result.hits.hits.map(hit => ({
      id: hit._id,
      ...hit._source
    })));
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.addDocument = async (req, res) => {
  const { title, content } = req.body;
  try {
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    await client.index({
      index: 'documents',
      body: {
        title,
        content,
        created_at: new Date()
      }
    });
    res.status(201).json({ message: 'Document added' });
  } catch (error) {
    console.error('Add document error:', error);
    res.status(500).json({ error: error.message });
  }
};