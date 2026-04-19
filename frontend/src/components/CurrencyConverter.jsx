import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AnimatedGraphics from './AnimatedGraphics';

export default function CurrencyConverter() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [amount, setAmount] = useState(1);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('ETB');
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [activeTab, setActiveTab] = useState('converter');

  const rates = {
    USD: 1, ETB: 155.50, EUR: 0.92, GBP: 0.79, JPY: 151.20,
    CNY: 7.23, INR: 83.45, CAD: 1.36, AUD: 1.52, CHF: 0.89,
    RUB: 92.50, BRL: 5.05, ZAR: 18.90, SAR: 3.75, AED: 3.67,
    KES: 132.50, TZS: 2550.00, UGX: 3850.00,
  };

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
    { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br', flag: '🇪🇹' },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: '$', flag: '🇨🇦' },
    { code: 'AUD', name: 'Australian Dollar', symbol: '$', flag: '🇦🇺' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', flag: '🇨🇭' },
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽', flag: '🇷🇺' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
    { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', flag: '🇸🇦' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
    { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', flag: '🇰🇪' },
    { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', flag: '🇹🇿' },
    { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', flag: '🇺🇬' },
  ];

  // Check authentication
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (rates[fromCurrency] && rates[toCurrency]) {
      const result = (amount / rates[fromCurrency]) * rates[toCurrency];
      setConvertedAmount(result.toFixed(2));
    }
  }, [amount, fromCurrency, toCurrency]);

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const getCurrencyInfo = (code) => currencies.find(c => c.code === code) || { name: code, symbol: '', flag: '🏳️' };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="currency-page">
        <AnimatedGraphics />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="currency-page">
      <AnimatedGraphics />
      
      <nav className="currency-navbar">
        <div className="nav-brand">
          <span className="brand-icon">💰</span>
          <span className="brand-name">Ethiopia Travel Guide</span>
        </div>
        <div className="nav-links">
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/tourist" className="nav-link">Destinations</Link>
          <Link to="/wishlist" className="nav-link">❤️ Wishlist</Link>
          <Link to="/translator" className="nav-link">🗣️ Translator</Link>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="currency-hero">
        <h1 className="currency-title">💱 Currency Converter</h1>
        <p className="currency-subtitle">Convert any currency to Ethiopian Birr</p>
      </div>

      <div className="currency-container">
        <div className="currency-tabs">
          <button className={`tab-btn ${activeTab === 'converter' ? 'active' : ''}`} onClick={() => setActiveTab('converter')}>
            🔄 Converter
          </button>
          <button className={`tab-btn ${activeTab === 'rates' ? 'active' : ''}`} onClick={() => setActiveTab('rates')}>
            📊 Exchange Rates
          </button>
          <button className={`tab-btn ${activeTab === 'budget' ? 'active' : ''}`} onClick={() => setActiveTab('budget')}>
            💰 Budget Guide
          </button>
        </div>

        {activeTab === 'converter' && (
          <div className="converter-card">
            <div className="amount-group">
              <label>Amount</label>
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} 
                className="amount-input" 
              />
            </div>

            <div className="currency-pair">
              <div className="currency-select">
                <label>From</label>
                <div className="select-box">
                  <span className="currency-flag">{getCurrencyInfo(fromCurrency).flag}</span>
                  <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)}>
                    {currencies.map(c => (
                      <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button onClick={swapCurrencies} className="swap-btn">⇄</button>

              <div className="currency-select">
                <label>To</label>
                <div className="select-box">
                  <span className="currency-flag">{getCurrencyInfo(toCurrency).flag}</span>
                  <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)}>
                    {currencies.map(c => (
                      <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="result-card">
              <div className="result-label">Converted Amount</div>
              <div className="result-amount">
                {convertedAmount} {getCurrencyInfo(toCurrency).symbol} {toCurrency}
              </div>
              <div className="result-rate">
                1 {fromCurrency} = {(rates[toCurrency] / rates[fromCurrency]).toFixed(4)} {toCurrency}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rates' && (
          <div className="rates-card">
            <div className="rates-header">
              <span>Flag</span>
              <span>Currency</span>
              <span>Code</span>
              <span>Rate (1 USD)</span>
            </div>
            {currencies.map(currency => (
              <div 
                key={currency.code} 
                className="rate-row" 
                onClick={() => { 
                  setFromCurrency('USD'); 
                  setToCurrency(currency.code); 
                  setActiveTab('converter'); 
                }}
              >
                <span className="rate-flag">{currency.flag}</span>
                <span className="rate-name">{currency.name}</span>
                <span className="rate-code">{currency.code}</span>
                <span className="rate-value">{rates[currency.code]?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'budget' && (
          <div className="budget-card">
            <h3 className="budget-title">💰 Estimated Travel Budget for Ethiopia</h3>
            <div className="budget-grid">
              <div className="budget-item">
                <div className="budget-icon">🏨</div>
                <div>
                  <strong>Accommodation</strong>
                  <p>Budget: 500-1000 ETB/night</p>
                  <p>Mid: 1500-3000 ETB/night</p>
                </div>
              </div>
              <div className="budget-item">
                <div className="budget-icon">🍽️</div>
                <div>
                  <strong>Food</strong>
                  <p>Local: 100-200 ETB</p>
                  <p>Restaurant: 300-600 ETB</p>
                </div>
              </div>
              <div className="budget-item">
                <div className="budget-icon">🚗</div>
                <div>
                  <strong>Transport</strong>
                  <p>Local bus: 20-50 ETB</p>
                  <p>Taxi: 100-300 ETB</p>
                </div>
              </div>
              <div className="budget-item">
                <div className="budget-icon">🎟️</div>
                <div>
                  <strong>Attractions</strong>
                  <p>Lalibela: 1000 ETB</p>
                  <p>Museums: 100-200 ETB</p>
                </div>
              </div>
            </div>
            <div className="budget-tip">
              💡 Daily budget: 1,500 - 3,000 ETB (approx $30-60 USD)
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .currency-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a2a 0%, #1a1a3a 50%, #2a1a4a 100%);
          position: relative;
          overflow-x: hidden;
        }
        
        .currency-navbar {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          padding: 15px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 100;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .nav-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 20px;
          font-weight: bold;
          color: white;
        }
        
        .brand-icon {
          font-size: 28px;
        }
        
        .brand-name {
          background: linear-gradient(135deg, #fff, #a8b2ff, #667eea);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .nav-links {
          display: flex;
          gap: 20px;
          align-items: center;
          flex-wrap: wrap;
        }
        
        .nav-link {
          text-decoration: none;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
          transition: color 0.3s;
          padding: 8px 16px;
          border-radius: 8px;
        }
        
        .nav-link:hover {
          color: white;
          background: rgba(255, 255, 255, 0.1);
        }
        
        .logout-btn {
          padding: 8px 20px;
          background: rgba(244, 67, 54, 0.8);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .logout-btn:hover {
          background: #f44336;
          transform: translateY(-2px);
        }
        
        .currency-hero {
          text-align: center;
          padding: 60px 20px 30px;
          position: relative;
          z-index: 10;
        }
        
        .currency-title {
          font-size: 48px;
          font-weight: 800;
          background: linear-gradient(135deg, #fff, #a8b2ff, #667eea);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 15px;
        }
        
        .currency-subtitle {
          font-size: 18px;
          color: rgba(255, 255, 255, 0.7);
        }
        
        .currency-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
          position: relative;
          z-index: 10;
        }
        
        .currency-tabs {
          display: flex;
          justify-content: center;
          gap: 15px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }
        
        .tab-btn {
          padding: 12px 30px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50px;
          color: white;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .tab-btn.active {
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-color: transparent;
        }
        
        .tab-btn:hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.2);
        }
        
        .converter-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border-radius: 32px;
          padding: 40px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .amount-group {
          margin-bottom: 25px;
        }
        
        .amount-group label {
          display: block;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 10px;
          font-size: 14px;
        }
        
        .amount-input {
          width: 100%;
          padding: 15px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          font-size: 24px;
          font-weight: 600;
          text-align: center;
          color: white;
        }
        
        .amount-input:focus {
          outline: none;
          border-color: #667eea;
        }
        
        .currency-pair {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }
        
        .currency-select {
          flex: 1;
        }
        
        .currency-select label {
          display: block;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 10px;
          font-size: 14px;
        }
        
        .select-box {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
        }
        
        .currency-flag {
          font-size: 28px;
        }
        
        .select-box select {
          flex: 1;
          background: transparent;
          border: none;
          color: white;
          font-size: 16px;
          outline: none;
          cursor: pointer;
        }
        
        .swap-btn {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border: none;
          border-radius: 50%;
          color: white;
          font-size: 20px;
          cursor: pointer;
          transition: all 0.3s;
          margin-top: 20px;
        }
        
        .swap-btn:hover {
          transform: scale(1.1);
        }
        
        .result-card {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
          border-radius: 20px;
          padding: 25px;
          text-align: center;
        }
        
        .result-label {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 10px;
        }
        
        .result-amount {
          font-size: 32px;
          font-weight: 700;
          color: white;
          margin-bottom: 10px;
        }
        
        .result-rate {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.6);
        }
        
        .rates-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border-radius: 32px;
          padding: 30px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .rates-header {
          display: grid;
          grid-template-columns: 60px 1fr 80px 100px;
          padding: 15px;
          background: rgba(102, 126, 234, 0.3);
          border-radius: 16px;
          color: white;
          font-weight: 600;
          margin-bottom: 10px;
        }
        
        .rate-row {
          display: grid;
          grid-template-columns: 60px 1fr 80px 100px;
          padding: 12px 15px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
          transition: all 0.2s;
          color: rgba(255, 255, 255, 0.8);
        }
        
        .rate-row:hover {
          background: rgba(255, 255, 255, 0.05);
          transform: translateX(5px);
        }
        
        .budget-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border-radius: 32px;
          padding: 30px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .budget-title {
          color: white;
          margin-bottom: 20px;
          text-align: center;
          font-size: 24px;
        }
        
        .budget-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .budget-item {
          display: flex;
          gap: 15px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
        }
        
        .budget-icon {
          font-size: 40px;
        }
        
        .budget-item strong {
          color: white;
          display: block;
          margin-bottom: 8px;
        }
        
        .budget-item p {
          color: rgba(255, 255, 255, 0.7);
          font-size: 13px;
          margin: 3px 0;
        }
        
        .budget-tip {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
          border-radius: 16px;
          padding: 15px;
          text-align: center;
          color: white;
        }
        
        .loading-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 20px;
        }
        
        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        .loading-text {
          color: white;
          font-size: 16px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .currency-navbar {
            flex-direction: column;
            padding: 15px 20px;
          }
          
          .nav-links {
            justify-content: center;
          }
          
          .currency-title {
            font-size: 32px;
          }
          
          .currency-pair {
            flex-direction: column;
          }
          
          .swap-btn {
            margin: 10px auto;
            transform: rotate(90deg);
          }
          
          .swap-btn:hover {
            transform: rotate(90deg) scale(1.1);
          }
          
          .converter-card {
            padding: 30px 25px;
          }
          
          .result-amount {
            font-size: 24px;
          }
          
          .rates-header, .rate-row {
            grid-template-columns: 50px 1fr 70px 80px;
            font-size: 12px;
          }
          
          .currency-tabs {
            flex-wrap: wrap;
          }
          
          .tab-btn {
            padding: 10px 20px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}