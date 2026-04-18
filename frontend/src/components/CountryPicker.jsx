import { useState, useEffect, useRef } from 'react';
import '../App.css';

const countries = [
  { code: '+251', name: 'Ethiopia', flag: '🇪🇹', dialCode: '+251' },
  { code: '+1', name: 'United States', flag: '🇺🇸', dialCode: '+1' },
  { code: '+44', name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44' },
  { code: '+91', name: 'India', flag: '🇮🇳', dialCode: '+91' },
  { code: '+86', name: 'China', flag: '🇨🇳', dialCode: '+86' },
  { code: '+81', name: 'Japan', flag: '🇯🇵', dialCode: '+81' },
  { code: '+49', name: 'Germany', flag: '🇩🇪', dialCode: '+49' },
  { code: '+33', name: 'France', flag: '🇫🇷', dialCode: '+33' },
  { code: '+39', name: 'Italy', flag: '🇮🇹', dialCode: '+39' },
  { code: '+61', name: 'Australia', flag: '🇦🇺', dialCode: '+61' },
  { code: '+55', name: 'Brazil', flag: '🇧🇷', dialCode: '+55' },
  { code: '+52', name: 'Mexico', flag: '🇲🇽', dialCode: '+52' },
  { code: '+82', name: 'South Korea', flag: '🇰🇷', dialCode: '+82' },
  { code: '+7', name: 'Russia', flag: '🇷🇺', dialCode: '+7' },
  { code: '+27', name: 'South Africa', flag: '🇿🇦', dialCode: '+27' },
  { code: '+20', name: 'Egypt', flag: '🇪🇬', dialCode: '+20' },
  { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦', dialCode: '+966' },
  { code: '+971', name: 'UAE', flag: '🇦🇪', dialCode: '+971' },
];

export default function CountryPicker({ selectedCode, onSelect, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  const selectedCountry = countries.find(c => c.code === selectedCode) || countries[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(search.toLowerCase()) ||
    country.dialCode.includes(search)
  );

  return (
    <div className={`country-picker ${className}`} ref={dropdownRef}>
      <div className="country-picker-trigger" onClick={() => setIsOpen(!isOpen)}>
        <span className="country-flag">{selectedCountry.flag}</span>
        <span className="country-dial">{selectedCountry.dialCode}</span>
        <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
      </div>
      
      {isOpen && (
        <div className="country-dropdown">
          <input
            type="text"
            placeholder="Search country..."
            className="country-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="country-list">
            {filteredCountries.map(country => (
              <div
                key={country.code}
                className={`country-item ${selectedCode === country.code ? 'selected' : ''}`}
                onClick={() => {
                  onSelect(country.code);
                  setIsOpen(false);
                  setSearch('');
                }}
              >
                <span className="country-flag">{country.flag}</span>
                <span className="country-name">{country.name}</span>
                <span className="country-dial">{country.dialCode}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}