import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import jwtDecode from "jwt-decode";
import axios from "axios";

import SearchPage from './page/SearchPage';

function App() {
  return(
    <Router>
      <Routes>
        <Route path="/" element={<SearchPage />} />
      </Routes>
    </Router>
  );
}

export default App
