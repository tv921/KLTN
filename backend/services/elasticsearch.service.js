const { Client } = require('@elastic/elasticsearch');
const { getQueryVector } = require('./nlp.service');
require('dotenv').config();

const client = new Client({
  node: process.env.ELASTICSEARCH_URL,
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME,
    password: process.env.ELASTICSEARCH_PASSWORD
  }
});

// Kiểm tra kết nối Elasticsearch
client.ping()
  .then(() => console.log('Kết nối Elasticsearch thành công'))
  .catch(err => console.error('Lỗi kết nối Elasticsearch:', err));

async function searchDocuments(query, type = 'keyword', page = 1, size = 10, field = 'all', fromDate, toDate){
  const from = (page - 1) * size;
  let body;

  if (type === 'semantic') {
    const queryVector = await getQueryVector(query);
    body = {
      from,
      size,
      query: {
        script_score: {
          query: { match_all: {} },
          script: {
            source: "cosineSimilarity(params.query_vector, 'vector') + 1.0",
            params: { query_vector: queryVector }
          }
        }
      }
    };
  } else {
    // Xác định field cần tìm
      let fields = ['title', 'content'];
      if (field === 'title') fields = ['title'];
      else if (field === 'content') fields = ['content'];

      const must = [{
        multi_match: {
          query,
          fields,
          fuzziness: 'AUTO'
        }
      }];


      const filter = [];

      if (fromDate || toDate) {
        const range = {};
        if (fromDate) range.gte = fromDate;
        if (toDate) range.lte = toDate;
        filter.push({ range: { ngay_ban_hanh: range } });
      }

      body = {
        from,
        size,
        query: {
          bool: {
            must,
            filter
          }
        }
      };
  }

  return client.search({ index: 'pdf_documents1', body });
}


module.exports = { client, searchDocuments};