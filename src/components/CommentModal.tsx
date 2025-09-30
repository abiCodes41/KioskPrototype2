import { useEffect, useState, useRef } from 'react';
import './CommentModal.css';

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddComment: (comment: { text: string; color: string; font: string; pattern: string }) => void;
}

const CommentModal = ({ isOpen, onClose, onAddComment }: CommentModalProps) => {
  const [commentText, setCommentText] = useState('');
  const [commentBackgroundColor, setCommentBackgroundColor] = useState('rgba(255, 255, 255, 0.05)');
  const [selectedReactionColor, setSelectedReactionColor] = useState('#ffffff');
  const [selectedGif, setSelectedGif] = useState<string | null>(null);
  const [showQuickReactions, setShowQuickReactions] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  
  // New states for other sections
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [isGifAnimatingOut, setIsGifAnimatingOut] = useState(false);
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [isStyleAnimatingOut, setIsStyleAnimatingOut] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [isQRAnimatingOut, setIsQRAnimatingOut] = useState(false);
  
  // GIF search states
  const [gifSearchTerm, setGifSearchTerm] = useState('');
  const [gifs, setGifs] = useState([]);
  const [isLoadingGifs, setIsLoadingGifs] = useState(false);
  const searchTimeoutRef = useRef<number | null>(null);

  const colors = [
    '#1abc9c', '#e74c3c', '#2ecc71', '#3498db', '#f39c12', '#9b59b6',
    '#e91e63', '#ff5722', '#795548', '#607d8b', '#ffc107', '#4caf50',
    '#00bcd4', '#ff9800', '#673ab7', '#8bc34a', '#ffeb3b', '#03a9f4',
    '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3',
    '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b'
  ];





  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300); // Match the animation duration
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = () => {
    if (commentText.trim() || selectedGif) {
      // Combine text and GIF URL for the comment
      let finalText = commentText.trim();
      if (selectedGif) {
        // If there's both text and GIF, combine them; if only GIF, just use the GIF URL
        finalText = finalText ? `${finalText} ${selectedGif}` : selectedGif;
      }
      
      // If no specific color was selected (still default white), assign a random color
      let finalColor = selectedReactionColor;
      if (selectedReactionColor === '#ffffff') {
        // Select a random color from the available colors array
        finalColor = colors[Math.floor(Math.random() * colors.length)];
      }
      
      onAddComment({
        text: finalText,
        color: finalColor,
        font: 'Inter',
        pattern: 'solid'
      });
      
      // Reset form
      setCommentText('');
      setCommentBackgroundColor('rgba(255, 255, 255, 0.05)');
      setSelectedReactionColor('#ffffff');
      setSelectedGif(null);
      setShowQuickReactions(false);
      
      handleClose();
    }
  };

  const handleReactionClick = (reactionText: string, reactionColor: string) => {
    // Set the comment text and background color as preview
    setCommentText(reactionText);
    setCommentBackgroundColor(reactionColor);
    setSelectedReactionColor(reactionColor);
  };

  const handleGifClick = (gifUrl: string) => {
    // Add GIF to the current comment preview
    setSelectedGif(gifUrl);
    // Keep existing text as is, no need to add [GIF] tag
  };

  const handleRemoveGif = () => {
    // Remove the selected GIF from preview
    setSelectedGif(null);
  };

  const handleColorClick = (color: string) => {
    // Update the comment background color and selected reaction color
    setCommentBackgroundColor(color);
    setSelectedReactionColor(color);
  };

  // Helper function to close all sections
  const closeAllSections = () => {
    if (showQuickReactions) {
      setIsAnimatingOut(true);
      setTimeout(() => {
        setShowQuickReactions(false);
        setIsAnimatingOut(false);
      }, 500);
    }
    if (showGifPicker) {
      setIsGifAnimatingOut(true);
      setTimeout(() => {
        setShowGifPicker(false);
        setIsGifAnimatingOut(false);
      }, 500);
    }
    if (showStylePicker) {
      setIsStyleAnimatingOut(true);
      setTimeout(() => {
        setShowStylePicker(false);
        setIsStyleAnimatingOut(false);
      }, 500);
    }
    if (showQRCode) {
      setIsQRAnimatingOut(true);
      setTimeout(() => {
        setShowQRCode(false);
        setIsQRAnimatingOut(false);
      }, 500);
    }
  };

  const handleToggleQuickReactions = () => {
    if (showQuickReactions) {
      // Close this section
      setIsAnimatingOut(true);
      setTimeout(() => {
        setShowQuickReactions(false);
        setIsAnimatingOut(false);
      }, 500);
    } else {
      // Close all other sections first, then open this one
      closeAllSections();
      setShowQuickReactions(true);
    }
  };

  const handleToggleGifPicker = () => {
    if (showGifPicker) {
      // Close this section
      setIsGifAnimatingOut(true);
      setTimeout(() => {
        setShowGifPicker(false);
        setIsGifAnimatingOut(false);
      }, 500);
    } else {
      // Close all other sections first, then open this one
      closeAllSections();
      setShowGifPicker(true);
      // Load default GIFs if none are loaded
      if (gifs.length === 0 && !gifSearchTerm) {
        loadDefaultGifs();
      }
    }
  };

  const handleToggleStylePicker = () => {
    if (showStylePicker) {
      // Close this section
      setIsStyleAnimatingOut(true);
      setTimeout(() => {
        setShowStylePicker(false);
        setIsStyleAnimatingOut(false);
      }, 500);
    } else {
      // Close all other sections first, then open this one
      closeAllSections();
      setShowStylePicker(true);
    }
  };

  const handleToggleQRCode = () => {
    if (showQRCode) {
      // Close this section
      setIsQRAnimatingOut(true);
      setTimeout(() => {
        setShowQRCode(false);
        setIsQRAnimatingOut(false);
      }, 500);
    } else {
      // Close all other sections first, then open this one
      closeAllSections();
      setShowQRCode(true);
    }
  };

  // Function to load default/trending GIFs
  const loadDefaultGifs = async () => {
    setIsLoadingGifs(true);
    try {
      // Load trending GIFs as default
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/trending?api_key=GlVGYHkr3WSBnllca54iNt0yFbjz7L65&limit=50&rating=g`
      );
      const data = await response.json();
      setGifs(data.data || []);
    } catch (error) {
      console.error('Error fetching default GIFs:', error);
      setGifs([]);
    } finally {
      setIsLoadingGifs(false);
    }
  };

  // Function to search GIFs
  const searchGifs = async (searchTerm: string) => {
    console.log('Searching for GIFs:', searchTerm);
    
    if (!searchTerm.trim()) {
      console.log('Empty search term, loading default GIFs');
      loadDefaultGifs();
      return;
    }

    setIsLoadingGifs(true);
    try {
      const url = `https://api.giphy.com/v1/gifs/search?api_key=GlVGYHkr3WSBnllca54iNt0yFbjz7L65&q=${encodeURIComponent(searchTerm)}&limit=50&rating=g`;
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('API Response:', data);
      console.log('Number of GIFs found:', data.data?.length || 0);
      
      setGifs(data.data || []);
    } catch (error) {
      console.error('Error fetching GIFs:', error);
      setGifs([]);
    } finally {
      setIsLoadingGifs(false);
    }
  };

  // Handle GIF search input change
  const handleGifSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGifSearchTerm(value);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      searchGifs(value);
    }, 500);
  };




  const quickReactionButtons = [
    { text: '👍 Awesome!', color: '#1abc9c' },
    { text: '🎊 Congratulations!', color: '#e74c3c' },
    { text: '🌟 Outstanding!', color: '#2ecc71' },
    { text: '🚀 Keep it up!', color: '#3498db' },
    { text: '🔥 On fire!', color: '#f39c12' },
    { text: '💪 Strong work!', color: '#9b59b6' },
    { text: '🎯 Perfect!', color: '#e67e22' },
    { text: '⚡ Amazing!', color: '#f1c40f' },
    { text: '🏆 Champion!', color: '#d4af37' },
    { text: '💎 Brilliant!', color: '#8e44ad' },
    { text: '🎉 Fantastic!', color: '#e91e63' },
    { text: '🌈 Incredible!', color: '#00bcd4' }
  ];

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Your Comment</h2>
          <button className="close-btn" onClick={handleClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        
        <div className="modal-body">
          {/* Quick React Section */}
          {showQuickReactions && (
            <div className={`quick-react-section ${isAnimatingOut ? 'animating-out' : ''}`}>
              <h3>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
                Quick Reactions
              </h3>
              <div className="quick-react-grid">
                {quickReactionButtons.map((reaction, index) => (
                <button 
                    key={index}
                    className="quick-react-btn"
                    style={{ backgroundColor: reaction.color }}
                    onClick={() => handleReactionClick(reaction.text, reaction.color)}
                  >
                    {reaction.text}
                </button>
                ))}
              </div>
                </div>
              )}

          {/* GIF Picker Section */}
          {showGifPicker && (
            <div className={`gif-picker-section ${isGifAnimatingOut ? 'animating-out' : ''}`}>
              <h3>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21,15 16,10 5,21"/>
                </svg>
                Choose a GIF
              </h3>
              <div className="gif-search-container">
                <input 
                  type="text" 
                  placeholder="Search GIFs..." 
                  className="gif-search-input"
                  value={gifSearchTerm}
                  onChange={handleGifSearch}
                />
              </div>
              <div className="gif-grid">
                {isLoadingGifs ? (
                  <div className="gif-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading GIFs...</p>
                  </div>
                ) : gifs.length > 0 ? (
                  gifs.map((gif: any) => (
                    <div 
                      key={gif.id} 
                      className="gif-item"
                      onClick={() => handleGifClick(gif.images.fixed_height.url)}
                    >
                      <img 
                        src={gif.images.fixed_height_small.url} 
                        alt={gif.title}
                        loading="lazy"
                      />
                    </div>
                  ))
                ) : gifSearchTerm ? (
                  <div className="no-gifs">
                    <p>No GIFs found for "{gifSearchTerm}"</p>
                    <p>Try a different search term</p>
                  </div>
                ) : gifs.length === 0 ? (
                  <div className="gif-placeholder-text">
                    <p>🔥 Loading trending GIFs...</p>
                    <p>Or search for something specific above</p>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* Style Picker Section */}
          {showStylePicker && (
            <div className={`style-picker-section ${isStyleAnimatingOut ? 'animating-out' : ''}`}>
              <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="13.5" cy="6.5" r=".5"/>
                  <circle cx="17.5" cy="10.5" r=".5"/>
                  <circle cx="8.5" cy="7.5" r=".5"/>
                  <circle cx="6.5" cy="12.5" r=".5"/>
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
                </svg>
                Choose a Style
              </h3>
              <div className="style-options">
                <div className="color-section">
                  <div className="color-grid">
                    {colors.map((color, index) => (
                      <div 
                        key={index} 
                        className="color-option"
                        style={{ backgroundColor: color }}
                        onClick={() => handleColorClick(color)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* QR Code Section */}
          {showQRCode && (
            <div className={`qr-section ${isQRAnimatingOut ? 'animating-out' : ''}`}>
              <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="6" height="6" rx="1"/>
                  <rect x="15" y="3" width="6" height="6" rx="1"/>
                  <rect x="3" y="15" width="6" height="6" rx="1"/>
                  <path d="M15 15h6v6h-6z"/>
                </svg>
                Scan QR Code to share comment
              </h3>
              <div className="qr-container">
                <div className="qr-code-wrapper">
                  <img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://example.com/comment" 
                    alt="QR Code"
                    className="qr-code-image"
                  />
                </div>
              </div>
            </div>
          )}
              
          {/* Comment Action Buttons */}
          <div className="comment-action-buttons">
            <button 
              className="toggle-reactions-btn"
              onClick={handleToggleQuickReactions}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
              Quick Reactions
            </button>
            
            <button 
              className="action-btn gif-btn"
              onClick={handleToggleGifPicker}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21,15 16,10 5,21"/>
              </svg>
              GIF
            </button>
            
            <button 
              className="action-btn style-btn"
              onClick={handleToggleStylePicker}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="13.5" cy="6.5" r=".5"/>
                <circle cx="17.5" cy="10.5" r=".5"/>
                <circle cx="8.5" cy="7.5" r=".5"/>
                <circle cx="6.5" cy="12.5" r=".5"/>
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
              </svg>
              Style
            </button>
            
            <button 
              className="action-btn qr-btn"
              onClick={handleToggleQRCode}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="6" height="6" rx="1"/>
                <rect x="15" y="3" width="6" height="6" rx="1"/>
                <rect x="3" y="15" width="6" height="6" rx="1"/>
                <path d="M15 15h6v6h-6z"/>
              </svg>
              QR
            </button>
          </div>
          
          {/* Comment Input with Post Button */}
          <div className="comment-input-container">
            <div className="comment-input-wrapper" style={{ backgroundColor: commentBackgroundColor }}>
              <input
                type="text"
                className="comment-input"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Type your comment here..."
              />
              {selectedGif && (
                <div className="gif-preview-inline">
                  <button className="gif-remove-btn" onClick={handleRemoveGif}>
                    ×
                  </button>
                  <img src={selectedGif} alt="Selected GIF" className="gif-preview-image-inline" />
                </div>
              )}
            </div>
            <button className="post-btn" onClick={handleSubmit}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z"/>
              </svg>
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;
