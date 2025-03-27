import React from 'react';
import SearchBar from './components/SearchBar/SearchBar';
import './App.css';

function App() {
  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // Add your search logic here
  };

  return (
      <div className="App">
        <h1>Search for a Channel</h1>
        <SearchBar onSearch={handleSearch} />
      </div>
  );
}

export default App;