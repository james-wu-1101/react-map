import React, { useState, useEffect, useRef } from 'react';
import type { Station } from '../types';
import './SearchBox.css';

interface SearchBoxProps {
  stations: Station[];
  onSelectStation: (station: Station) => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({ stations, onSelectStation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Station[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  // 點擊外部關閉搜尋結果
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 搜尋邏輯
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }

    const results = stations.filter(station => 
      station.sna.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.ar.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5); // 限制顯示前5個結果

    setSearchResults(results);
    setIsOpen(true);
  }, [searchTerm, stations]);

  const handleSelect = (station: Station) => {
    onSelectStation(station);
    setSearchTerm(station.sna);
    setIsOpen(false);
  };

  return (
    <div className="search-box-container" ref={searchBoxRef}>
      <input
        type="text"
        className="search-input"
        placeholder="搜尋站點名稱或地址..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => searchTerm.trim() !== '' && setIsOpen(true)}
      />
      {isOpen && searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map((station) => (
            <div
              key={station.sno}
              className="search-result-item"
              onClick={() => handleSelect(station)}
            >
              <div className="station-name">{station.sna}</div>
              <div className="station-address">{station.ar}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBox; 