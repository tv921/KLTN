import React from 'react';
import { useParams } from 'react-router-dom';
import PdfViewer from './PdfViewer';

const PdfViewerWrapper = () => {
  const { filename } = useParams();
  const fileUrl = `http://localhost:5000/documents/${filename}`;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Xem tài liệu PDF</h2>
      <PdfViewer fileUrl={fileUrl} />
    </div>
  );
};

export default PdfViewerWrapper;
