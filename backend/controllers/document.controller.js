const { client } = require('../services/elasticsearch.service');

async function getDocument(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Thiếu ID tài liệu.' });
    }
    const response = await client.get({
      index: 'documents',
      id
    });
    res.json(response);
  } catch (error) {
    console.error('Lỗi khi lấy tài liệu:', error);
    res.status(404).json({ error: 'Tài liệu không tìm thấy.', details: error.message });
  }
}

module.exports = { getDocument };