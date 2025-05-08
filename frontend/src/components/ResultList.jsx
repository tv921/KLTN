import React from 'react';
import { Link } from 'react-router-dom';

const ResultList = ({ results }) => {
  return (
    <div className="max-w-4xl mx-auto p-4">
      {results.length === 0 ? (
        <p className="text-center text-gray-500">Không tìm thấy tài liệu nào.</p>
      ) : (
        <div className="space-y-4">
          {results.map((result) => (
            <div
              key={result._id}
              className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {result._source.title || 'Không có tiêu đề'}
              </h2>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {result._source.text
                  ? result._source.text.slice(0, 150) + '...'
                  : 'Không có nội dung'}
              </p>
              <div className="text-sm text-gray-500 mb-4">
                <span>
                  Ngày xuất bản:{' '}
                  {result._source.publish_date
                    ? new Date(result._source.publish_date).toLocaleDateString()
                    : 'Không rõ'}
                </span>
              </div>
              <Link
                to={`/result/${result._id}`}
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Xem chi tiết
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultList;