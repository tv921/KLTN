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

async function searchDocuments(query, type = 'keyword') {
    let body;
    if (type === 'semantic') {
        const queryVector = await getQueryVector(query);
        body = {
            query: {
                script_score: {
                    query: { match_all: {} },
                    script: {
                        source: "cosineSimilarity(params.query_vector, 'vector') + 1.0",
                        params: { query_vector: queryVector }
                    }
                }
            },
            size: 50
        };
    } else {
        body = {
            query: {
                multi_match: {
                    query,
                    fields: ['title^2', 'text'],
                    fuzziness: 'AUTO'
                }
            },
            size: 50
        };
    }
    return client.search({ index: 'documents', body });
}

module.exports = { client, searchDocuments };