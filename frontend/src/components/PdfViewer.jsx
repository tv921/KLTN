import React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css'; // Thêm TextLayer.css
import './PdfViewer.css'; // Nhập CSS tùy chỉnh
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

const PdfViewer = ({ fileUrl }) => {
  const [numPages, setNumPages] = React.useState(null);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  return (
    <div className="pdf-viewer-container">
      <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
        {Array.from(new Array(numPages), (el, index) => (
          <Page
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            width={800}
            className="pdf-page"
          />
        ))}
      </Document>
    </div>
  );
};

export default PdfViewer;