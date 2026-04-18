import { useNavigate } from 'react-router-dom';
import '../App.css';

export default function BackButton({ fallbackPath = '/tourist' }) {
  const navigate = useNavigate();

  const goBack = () => {
    // Check if there's a previous page in history
    if (window.history.length > 2) {
      navigate(-1); // Go back one page
    } else {
      navigate(fallbackPath); // Go to fallback path if no history
    }
  };

  return (
    <button onClick={goBack} className="back-button" title="Go back">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
      <span>Back</span>
    </button>
  );
}