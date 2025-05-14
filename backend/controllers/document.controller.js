const { client } = require('../services/elasticsearch.service');

async function getDocument(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Thiếu ID tài liệu.' });
    }

    // Thử tìm trong index 'documents'
    try {
      const response = await client.get({
        index: 'documents',
        id
      });
      return res.json(response);
    } catch (err1) {
      if (err1.meta?.statusCode !== 404) {
        throw err1; // Nếu là lỗi khác ngoài 404 thì throw luôn
      }
    }

    // Thử tìm trong index 'smart_documents'
    try {
      const response = await client.get({
        index: 'smart_documents',
        id
      });
      return res.json(response);
    } catch (err2) {
      if (err2.meta?.statusCode !== 404) {
        throw err2;
      }
    }

    // Nếu không tìm thấy ở cả hai index
    return res.status(404).json({ error: 'Tài liệu không tìm thấy ở cả hai index.' });

  } catch (error) {
    console.error('Lỗi khi lấy tài liệu:', error);
    res.status(500).json({ error: 'Lỗi server.', details: error.message });
  }
}

module.exports = { getDocument };
