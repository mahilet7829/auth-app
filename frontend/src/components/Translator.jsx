import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AnimatedGraphics from './AnimatedGraphics';

export default function Translator() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('am');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('translator');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const translateText = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(inputText)}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data && data[0]) setTranslatedText(data[0].map(item => item[0]).join(''));
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputText(translatedText);
    setTranslatedText(inputText);
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'am', name: 'አማርኛ (Amharic)', flag: '🇪🇹' },
    { code: 'om', name: 'Oromiffa (Oromo)', flag: '🇪🇹' },
    { code: 'ti', name: 'ትግርኛ (Tigrinya)', flag: '🇪🇹' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  ];

  const commonPhrases = [
    { english: "Hello", amharic: "ሰላም (Selam)" },
    { english: "Thank you", amharic: "አመሰግናለሁ (Ameseginalehu)" },
    { english: "How are you?", amharic: "እንዴት ነህ? (Endet neh?)" },
    { english: "Goodbye", amharic: "ቻው (Chao)" },
    { english: "Yes", amharic: "አዎ (Awo)" },
    { english: "No", amharic: "አይ (Ay)" },
    { english: "How much?", amharic: "ስንት ነው? (Sint new?)" },
    { english: "Delicious", amharic: "ጣፋጭ (Tafach)" },
    { english: "Beautiful", amharic: "ቆንጆ (Konjo)" },
    { english: "I love Ethiopia", amharic: "ኢትዮጵያን እወዳለሁ" },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="translator-page">
        <AnimatedGraphics />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading Translator...</div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="translator-page">
      <AnimatedGraphics />
      
      <nav className="translator-navbar">
        <div className="nav-brand">
          <span className="brand-icon">🗣️</span>
          <span className="brand-name">Ethiopia Travel Guide</span>
        </div>
        <div className="nav-links">
          <Link to="/dashboard" className="nav-link">📊 Dashboard</Link>
          <Link to="/tourist" className="nav-link">🏔️ Destinations</Link>
          <Link to="/wishlist" className="nav-link">❤️ Wishlist</Link>
          <Link to="/currency" className="nav-link">💰 Currency</Link>
          <button onClick={handleLogout} className="logout-btn">🚪 Logout</button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="translator-hero">
        <h1 className="hero-title">🗣️ Language Translator</h1>
        <p className="hero-subtitle">Translate between English and Ethiopian languages instantly</p>
      </div>

      {/* Main Content */}
      <div className="translator-container">
        {/* Tabs */}
        <div className="tabs-container">
          <button
            className={`tab-btn ${activeTab === 'translator' ? 'active' : ''}`}
            onClick={() => setActiveTab('translator')}
          >
            🔄 Translator
          </button>
          <button
            className={`tab-btn ${activeTab === 'phrases' ? 'active' : ''}`}
            onClick={() => setActiveTab('phrases')}
          >
            📚 Common Phrases
          </button>
        </div>

        {/* Translator Tab */}
        {activeTab === 'translator' && (
          <div className="translator-card">
            {/* Language Selection */}
            <div className="language-section">
              <div className="language-box">
                <label>From</label>
                <div className="language-select">
                  <span className="lang-flag">{languages.find(l => l.code === sourceLang)?.flag}</span>
                  <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)}>
                    {languages.map(l => (
                      <option key={l.code} value={l.code}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button onClick={swapLanguages} className="swap-btn" title="Swap Languages">
                ⇄
              </button>

              <div className="language-box">
                <label>To</label>
                <div className="language-select">
                  <span className="lang-flag">{languages.find(l => l.code === targetLang)?.flag}</span>
                  <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)}>
                    {languages.map(l => (
                      <option key={l.code} value={l.code}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Translation Area */}
            <div className="translation-area">
              <div className="input-area">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter text to translate..."
                  className="input-textarea"
                  rows={5}
                />
                <div className="char-count">
                  {inputText.length} characters
                </div>
              </div>

              <div className="output-area">
                {isLoading ? (
                  <div className="loading-dots">
                    <span></span><span></span><span></span>
                  </div>
                ) : (
                  <div className="output-text">
                    {translatedText || "Translation will appear here..."}
                  </div>
                )}
              </div>
            </div>

            {/* Translate Button */}
            <button onClick={translateText} className="translate-btn">
              ✨ Translate Now
            </button>
          </div>
        )}

        {/* Phrases Tab */}
        {activeTab === 'phrases' && (
          <div className="phrases-card">
            <div className="phrases-grid">
              {commonPhrases.map((phrase, idx) => (
                <div
                  key={idx}
                  className="phrase-card"
                  onClick={() => {
                    setInputText(phrase.english);
                    setTargetLang('am');
                    setTimeout(() => {
                      setActiveTab('translator');
                      translateText();
                    }, 100);
                  }}
                >
                  <div className="phrase-english">{phrase.english}</div>
                  <div className="phrase-amharic">🇪🇹 {phrase.amharic}</div>
                  <div className="phrase-hint">Click to translate →</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .translator-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a2a 0%, #1a1a3a 50%, #2a1a4a 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        }

        /* Navbar */
        .translator-navbar {
          background: rgba(255, 255, 255, 0.08);
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
          font-weight: 600;
          color: white;
        }

        .brand-icon { font-size: 28px; }
        .brand-name {
          background: linear-gradient(135deg, #fff, #a8b2ff, #667eea);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .nav-links {
          display: flex;
          gap: 15px;
          align-items: center;
          flex-wrap: wrap;
        }

        .nav-link {
          text-decoration: none;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
          padding: 8px 16px;
          border-radius: 8px;
          transition: all 0.3s;
        }

        .nav-link:hover {
          color: white;
          background: rgba(255, 255, 255, 0.15);
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

        /* Hero Section */
        .translator-hero {
          text-align: center;
          padding: 60px 20px 40px;
        }

        .hero-title {
          font-size: 48px;
          font-weight: 800;
          background: linear-gradient(135deg, #fff, #a8b2ff, #667eea);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 16px;
        }

        .hero-subtitle {
          font-size: 18px;
          color: rgba(255, 255, 255, 0.7);
        }

        /* Container */
        .translator-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px 20px 60px;
        }

        /* Tabs */
        .tabs-container {
          display: flex;
          justify-content: center;
          gap: 15px;
          margin-bottom: 30px;
        }

        .tab-btn {
          padding: 12px 32px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 50px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
        }

        .tab-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          color: white;
          transform: translateY(-2px);
        }

        .tab-btn.active {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border-color: transparent;
        }

        /* Translator Card */
        .translator-card {
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(15px);
          border-radius: 32px;
          padding: 40px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Language Selection */
        .language-section {
          display: flex;
          align-items: flex-end;
          gap: 20px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }

        .language-box {
          flex: 1;
        }

        .language-box label {
          display: block;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 10px;
          font-size: 14px;
          font-weight: 500;
        }

        .language-select {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 16px;
          transition: all 0.3s;
        }

        .language-select:hover {
          border-color: rgba(102, 126, 234, 0.5);
        }

        .lang-flag {
          font-size: 28px;
        }

        .language-select select {
          flex: 1;
          background: transparent;
          border: none;
          color: white;
          font-size: 16px;
          outline: none;
          cursor: pointer;
        }

        .swap-btn {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border: none;
          border-radius: 50%;
          color: white;
          font-size: 20px;
          cursor: pointer;
          transition: all 0.3s;
          margin-bottom: 5px;
        }

        .swap-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        /* Translation Area */
        .translation-area {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 25px;
        }

        .input-area, .output-area {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          padding: 5px;
        }

        .input-textarea {
          width: 100%;
          padding: 18px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 16px;
          color: white;
          font-size: 16px;
          resize: vertical;
          font-family: inherit;
        }

        .input-textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .input-textarea::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .char-count {
          text-align: right;
          padding: 8px 12px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.4);
        }

        .output-text {
          padding: 18px;
          min-height: 150px;
          color: rgba(255, 255, 255, 0.9);
          font-size: 16px;
          line-height: 1.5;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 16px;
        }

        .loading-dots {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          height: 150px;
        }

        .loading-dots span {
          width: 12px;
          height: 12px;
          background: #667eea;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out;
        }

        .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
        .loading-dots span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }

        /* Translate Button */
        .translate-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border: none;
          border-radius: 50px;
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .translate-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
        }

        /* Phrases Card */
        .phrases-card {
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(15px);
          border-radius: 32px;
          padding: 40px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .phrases-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }

        .phrase-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .phrase-card:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-3px);
          border-color: rgba(102, 126, 234, 0.4);
        }

        .phrase-english {
          font-size: 18px;
          font-weight: 700;
          color: white;
          margin-bottom: 8px;
        }

        .phrase-amharic {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 8px;
        }

        .phrase-hint {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.4);
          text-align: right;
        }

        /* Loading State */
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

        /* Responsive */
        @media (max-width: 768px) {
          .translator-navbar {
            flex-direction: column;
            padding: 15px 20px;
            gap: 15px;
          }

          .nav-links {
            justify-content: center;
          }

          .hero-title {
            font-size: 32px;
          }

          .hero-subtitle {
            font-size: 14px;
          }

          .translator-card {
            padding: 25px;
          }

          .language-section {
            flex-direction: column;
            align-items: stretch;
          }

          .swap-btn {
            width: 40px;
            height: 40px;
            margin: 10px auto;
            transform: rotate(90deg);
          }

          .swap-btn:hover {
            transform: rotate(90deg) scale(1.1);
          }

          .translation-area {
            grid-template-columns: 1fr;
          }

          .phrases-grid {
            grid-template-columns: 1fr;
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