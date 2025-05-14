const { client } = require('../services/elasticsearch1.service');

async function getDocument(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Thiếu ID tài liệu.' });
    }

    const indicesToCheck = ['new_documents'];
    for (const index of indicesToCheck) {
      try {
        const response = await client.get({ index, id });
        return res.json(response);
      } catch (err) {
        if (err.meta?.statusCode !== 404) throw err;
      }
    }

    return res.status(404).json({ error: 'Tài liệu không tìm thấy ở bất kỳ index nào.' });

  } catch (error) {
    console.error('Lỗi khi lấy tài liệu:', error);
    res.status(500).json({ error: 'Lỗi server.', details: error.message });
  }
}


module.exports = { getDocument };