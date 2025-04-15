import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from './components/Login';
import Register from "./components/Register";
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
            <SearchBar onSearch={handleSearch}/>

            {/* Register Component */}
            <Register/>

            {/* Login Component */}
            <Login/>
            <img className="bottom-image" src="/Pewdiepie-Logo.png" alt="Pewdiepie Logo"/>
        </div>
    );
}
export default App;

