import { useEffect, useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';

export default function DocumentationViewer({ onClose }: { onClose: () => void }) {
  const [fullContent, setFullContent] = useState<string>('');
  const [selectedPhase, setSelectedPhase] = useState<string>('Intro');
  const [loading, setLoading] = useState(true);

  // Split content by phases
  const phases = useMemo(() => {
    if (!fullContent) return {};
    
    // Split using the Phase header as a delimiter
    const parts = fullContent.split(/(?=## Phase \d+:|## ⭐ Phase \d+:)/);
    const map: Record<string, string> = {
      'Intro': parts[0]
    };
    
    parts.slice(1).forEach(part => {
      const match = part.match(/## (?:⭐ )?Phase (\d+):/);
      if (match) {
        map[`Phase ${match[1]}`] = part;
      }
    });
    
    return map;
  }, [fullContent]);

  useEffect(() => {
    fetch('/architecture-docs.md')
      .then(res => res.text())
      .then(text => {
        setFullContent(text);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load documentation:", err);
        setFullContent("Failed to load documentation. Ensure architecture-docs.md is present in the public folder.");
        setLoading(false);
      });
  }, []);

  const phaseKeys = useMemo(() => Object.keys(phases), [phases]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'absolute',
      top: 0,
      left: 0,
      backgroundColor: '#f3f4f6',
      display: 'flex',
      zIndex: 1000,
    }}>
      {/* Sidebar */}
      <div style={{
        width: '280px',
        backgroundColor: '#1f2937',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 0',
        overflowY: 'auto',
        borderRight: '1px solid #374151',
        flexShrink: 0
      }}>
        <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', borderBottom: '1px solid #374151', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Study Guide</h2>
          <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.5rem' }}>10 Phases of Request Flow</p>
        </div>
        
        {phaseKeys.map(key => (
          <button
            key={key}
            onClick={() => setSelectedPhase(key)}
            style={{
              padding: '0.75rem 1.5rem',
              textAlign: 'left',
              backgroundColor: selectedPhase === key ? '#374151' : 'transparent',
              border: 'none',
              color: selectedPhase === key ? '#60a5fa' : '#d1d5db',
              cursor: 'pointer',
              fontSize: '0.95rem',
              transition: 'all 0.2s',
              borderLeft: selectedPhase === key ? '4px solid #60a5fa' : '4px solid transparent'
            }}
          >
            {key}
          </button>
        ))}
        
        <div style={{ marginTop: 'auto', padding: '1.5rem' }}>
          <button 
            onClick={onClose}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Close Docs
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '2rem 3rem',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          backgroundColor: '#ffffff',
          padding: '3rem',
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          minHeight: '100%'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
              Loading Documentation...
            </div>
          ) : (
            <div className="markdown-body" style={{ lineHeight: '1.8', fontSize: '1.05rem', color: '#1f2937' }}>
              <style>
                {`
                  .markdown-body h1 { border-bottom: 2px solid #e5e7eb; padding-bottom: 0.8rem; margin-top: 0; color: #111827; font-size: 2.25rem; }
                  .markdown-body h2 { border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem; margin-top: 2.5rem; color: #111827; font-size: 1.8rem; }
                  .markdown-body h3 { margin-top: 2rem; color: #374151; font-size: 1.4rem; }
                  .markdown-body p { margin-bottom: 1.25rem; }
                  .markdown-body code { background: #fee2e2; padding: 0.2rem 0.4rem; border-radius: 4px; font-family: 'Fira Code', monospace; font-size: 0.9em; color: #dc2626; font-weight: 500; }
                  .markdown-body pre { background: #111827; color: #e5e7eb; padding: 1.5rem; border-radius: 8px; overflow-x: auto; margin: 1.5rem 0; box-shadow: inset 0 2px 4px rgba(0,0,0,0.3); }
                  .markdown-body pre code { background: transparent; padding: 0; color: inherit; font-size: 0.9rem; border: none; }
                  .markdown-body ul, .markdown-body ol { margin-bottom: 1.25rem; padding-left: 1.5rem; }
                  .markdown-body li { margin-bottom: 0.75rem; }
                  .markdown-body blockquote { border-left: 4px solid #3b82f6; padding-left: 1rem; margin-left: 0; color: #4b5563; font-style: italic; background: #eff6ff; padding: 1rem; border-radius: 0 4px 4px 0; }
                  .markdown-body table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; }
                  .markdown-body th, .markdown-body td { border: 1px solid #e5e7eb; padding: 0.75rem; text-align: left; }
                  .markdown-body th { background-color: #f9fafb; font-weight: 600; }
                `}
              </style>
              <ReactMarkdown>{phases[selectedPhase] || 'Select a phase to begin'}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
