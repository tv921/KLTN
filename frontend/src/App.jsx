import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SearchPage from './page/SearchPage';
import ResultPage from './page/ResultPage';
import UploadPage from './page/UploadPage';
import RegisterPage from './page/RegisterPage';
import LoginPage from './page/LoginPage';
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDocumentPage from './page/AdminDocumentPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/result/:id" element={<ResultPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Chỉ admin mới truy cập */}
        <Route
          path="/upload"
          element={
            <ProtectedRoute role="admin">
              <UploadPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/documents"
          element={
          <ProtectedRoute role="admin">
          <AdminDocumentPage />
          </ProtectedRoute>
          }
/>
      </Routes>
    </Router>
  );
}

export default App;

