import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import ResultList from '../components/ResultList';

const SearchPage = () => {
    const [results, setResults] = useState([]);

    return (
        <div>
            <SearchBar onSearch={setResults} />
            <ResultList results={results} />
        </div>
    );
};

export default SearchPage;