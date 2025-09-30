import { useState, useEffect, useRef } from 'react';
import CommentModal from './CommentModal';
import './EmployeeSpotlight.css';

const EmployeeSpotlight = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comments, setComments] = useState([
    { id: 1, text: "We're so proud of you!", color: '#A855F7', font: 'Inter', pattern: 'solid' },
    { id: 2, text: "You're amazing!", color: '#EA580C', font: 'Inter', pattern: 'solid' },
    { id: 4, text: "Awesome job!", color: '#059669', font: 'Inter', pattern: 'solid' }
  ]);
  const commentListRef = useRef<HTMLDivElement>(null);

  const handleAddComment = (newComment: { text: string; color: string; font: string; pattern: string }) => {
    const comment = {
      id: Date.now(), // Simple ID generation
      text: newComment.text,
      color: newComment.color,
      font: newComment.font,
      pattern: newComment.pattern
    };
    setComments(prevComments => [...prevComments, comment]);
  };

  // Auto-scroll to bottom when comments change
  useEffect(() => {
    if (commentListRef.current) {
      const scrollToBottom = () => {
        commentListRef.current?.scrollTo({
          top: commentListRef.current.scrollHeight,
          behavior: 'smooth'
        });
      };
      
      // Small delay to ensure the DOM has updated with the new comment
      const timeoutId = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [comments]);

  const isGifUrl = (text: string) => {
    return text.startsWith('https://media.giphy.com/') || 
           text.startsWith('https://giphy.com/') || 
           text.includes('.gif') ||
           text.includes('giphy.com');
  };

  const parseCommentContent = (text: string) => {
    // Split by spaces and newlines to find GIF URLs
    const words = text.split(/[\s\n]+/);
    const gifUrls = words.filter(word => isGifUrl(word.trim()));
    
    // Remove GIF URLs from the original text to get clean text content
    let textContent = text;
    gifUrls.forEach(gifUrl => {
      textContent = textContent.replace(gifUrl, '').trim();
    });
    
    return {
      hasText: textContent.length > 0,
      hasGif: gifUrls.length > 0,
      textContent: textContent,
      gifUrl: gifUrls[0] || '', // Take the first GIF URL if multiple
      isGifOnly: gifUrls.length > 0 && textContent.length === 0
    };
  };

  const getCommentBackgroundStyle = (color: string, pattern: string) => {
    const adjustColor = (color: string, amount: number) => {
      const num = parseInt(color.replace("#", ""), 16);
      const amt = Math.round(2.55 * amount);
      const R = (num >> 16) + amt;
      const G = (num >> 8 & 0x00FF) + amt;
      const B = (num & 0x0000FF) + amt;
      return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    };

    switch (pattern) {
      case 'gradient-diagonal':
        return { 
          background: `linear-gradient(135deg, ${color}, ${adjustColor(color, -30)})` 
        };
      case 'gradient-radial':
        return { 
          background: `radial-gradient(circle, ${color}, ${adjustColor(color, -40)})` 
        };
      case 'gradient-vertical':
        return { 
          background: `linear-gradient(to bottom, ${color}, ${adjustColor(color, -30)})` 
        };
      case 'dots':
        return { 
          backgroundColor: color,
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        };
      case 'stripes':
        return { 
          backgroundColor: color,
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)`
        };
      case 'waves':
        return { 
          backgroundColor: color,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        };
      case 'geometric':
        return { 
          backgroundColor: color,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpolygon points='20 0 40 20 20 40 0 20'/%3E%3C/g%3E%3C/svg%3E")`
        };
      case 'marble':
        return { 
          backgroundColor: color,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-opacity='0.1'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z' fill='%23ffffff'/%3E%3C/g%3E%3C/svg%3E")`
        };
      case 'noise':
        return { 
          backgroundColor: color,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.1'/%3E%3C/svg%3E")`
        };
      default:
        return { backgroundColor: color };
    }
  };

  return (
    <div className="employee-spotlight">
      <div className="main-content">
        <h1 className="title">Survey Says, She's 5 Stars!</h1>
        
        <div className="employee-card">
          <div className="employee-image">
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=1200&fit=crop&crop=face&auto=format&q=90" 
              alt="Camille Davis" 
              onError={(e) => {
                e.currentTarget.src = "https://via.placeholder.com/600x800/4338ca/ffffff?text=Camille+Davis";
              }}
            />
          </div>
          
          <div className="employee-info">
            <h2 className="employee-name">Camille Davis</h2>
            <p className="employee-title">Customer Support Representative</p>
          </div>
        </div>

        <div className="description">
          <p>
            We're thrilled to celebrate Camille for achieving an average five-star 
            rating on customer surveys over the past three months! Camille is known 
            for her warm personality, patience, and genuine care for every guest. 
            She consistently goes above and beyond to find solutions, ensuring each 
            caller feels valued and respected.
          </p>
        </div>
      </div>

      <div className="comments-sidebar">
        <h3 className="comments-title">COMMENTS</h3>
        <div className="comment-list" ref={commentListRef}>
          <div className="comment-images">
            <img 
              src="https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif" 
              alt="Team celebration" 
              className="comment-image"
            />
            <img 
              src="https://media.giphy.com/media/g9582DNuQppxC/giphy.gif" 
              alt="Congratulations" 
              className="comment-image"
            />
          </div>
          
          {comments.map((comment) => {
            const content = parseCommentContent(comment.text);
            return (
              <div 
                key={comment.id} 
                className={`comment-item ${content.hasGif ? 'comment-gif' : ''} ${content.hasText && content.hasGif ? 'comment-mixed' : ''}`}
                style={{ 
                  ...getCommentBackgroundStyle(comment.color, comment.pattern),
                  fontFamily: comment.font 
                }}
              >
                {content.hasText && (
                  <span className="comment-text">{content.textContent}</span>
                )}
                {content.hasGif && (
                  <img 
                    src={content.gifUrl} 
                    alt="Celebration GIF" 
                    className="comment-gif-image"
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="action-buttons">
          <button className="action-btn heart">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
          
          <button 
            className="action-btn comment"
            onClick={() => setIsModalOpen(true)}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"/>
            </svg>
          </button>
          
          <button className="action-btn medal">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="6"/>
              <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
            </svg>
          </button>
        </div>
      </div>

      <CommentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onAddComment={handleAddComment}
      />
    </div>
  );
};

export default EmployeeSpotlight;
