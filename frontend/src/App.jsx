import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import jwtDecode from "jwt-decode";
import axios from "axios";

import SearchPage from './page/SearchPage';
import ResultPage from './page/ResultPage';
import UploadPage from './page/UploadPage';

function App() {
  return(
    <Router>
      <Routes>
        <Route path="/search" element={<SearchPage />} />
        <Route path="/" element={<SearchPage />} />
        <Route path="/result/:id" element={<ResultPage />} />
        <Route path="/upload" element={<UploadPage />} />

      </Routes>
    </Router>
  );
}

export default App
