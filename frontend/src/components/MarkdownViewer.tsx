import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

interface MarkdownViewerProps {
  content: string;
  onLinkClick: (href: string) => void;
}

// Copy button for code blocks
const CopyButton: React.FC<{ code: string }> = ({ code }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleCopy}
      title="Copy"
      style={{
        display: 'flex', alignItems: 'center', gap: '4px',
        padding: '3px 10px', borderRadius: '6px', border: 'none',
        background: copied ? '#22c55e22' : '#ffffff14',
        color: copied ? '#4ade80' : '#8b949e',
        cursor: 'pointer', fontSize: '11px',
        fontFamily: 'var(--font-mono)', fontWeight: 500,
        transition: 'all .15s', letterSpacing: '0.03em',
      }}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
};

const generateId = (children: any): string =>
  String(children).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content, onLinkClick }) => {
  return (
    <div className="md-prose max-w-4xl mx-auto px-2 py-8 animate-fade-in">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{

          // ── Paragraphs ──────────────────────────────────────────────────
          p: ({ children }) => (
            <p style={{ marginBottom: '1.1rem', lineHeight: 1.75 }}>{children}</p>
          ),

          // ── Headings ────────────────────────────────────────────────────
          h1: ({ children }) => (
            <h1 id={generateId(children)} className="md-prose">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 id={generateId(children)} className="md-prose">{children}</h2>
          ),
          h3: ({ children }) => {
            const id = generateId(children);
            if (String(children).toLowerCase().includes('sektor')) {
              return (
                <div id={id} className="md-sektor-block">
                  <h3>{String(children).replace(/sektor:?\s*/i, '')}</h3>
                </div>
              );
            }
            return <h3 id={id} className="md-prose">{children}</h3>;
          },
          h4: ({ children }) => (
            <h4 id={generateId(children)} className="md-prose">{children}</h4>
          ),

          // ── Lists ────────────────────────────────────────────────────────
          ul: ({ children }) => <ul className="md-prose">{children}</ul>,
          ol: ({ children }) => <ol className="md-prose">{children}</ol>,
          li: ({ children }) => <li>{children}</li>,

          // ── Code ─────────────────────────────────────────────────────────
          code({ node, inline, className, children }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');
            const isInline = inline !== false && !codeString.includes('\n');

            if (!isInline) {
              const lang = match?.[1] || 'text';
              return (
                <div className="md-prose-code-block">
                  <div className="md-prose-code-block-header">
                    <span className="md-prose-code-block-lang">{lang}</span>
                    <CopyButton code={codeString} />
                  </div>
                  <SyntaxHighlighter
                    style={oneDark}
                    language={lang}
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      padding: '1.25rem',
                      background: '#0d1117',
                      fontSize: '13.5px',
                      lineHeight: '1.65',
                    }}
                    codeTagProps={{ style: { fontFamily: 'var(--font-mono)' } }}
                  >
                    {codeString}
                  </SyntaxHighlighter>
                </div>
              );
            }
            return <code className="md-prose-code-inline">{children}</code>;
          },

          // ── Links ────────────────────────────────────────────────────────
          a: ({ children, href }) => (
            <a
              href={href}
              style={{
                color: 'var(--accent)', textDecoration: 'none', fontWeight: 500,
                borderBottom: '1px solid var(--accent-muted)', transition: 'all .15s',
                cursor: 'pointer',
              }}
              onClick={(e) => { e.preventDefault(); if (href) onLinkClick(href); }}
            >
              {children}
            </a>
          ),

          // ── Blockquote ───────────────────────────────────────────────────
          blockquote: ({ children }) => (
            <blockquote className="md-prose">{children}</blockquote>
          ),

          // ── Tables ───────────────────────────────────────────────────────
          table: ({ children }) => (
            <div className="md-prose-table-wrap">
              <table className="md-prose">{children}</table>
            </div>
          ),
          th: ({ children }) => <th className="md-prose">{children}</th>,
          td: ({ children }) => <td className="md-prose">{children}</td>,

          // ── Horizontal Rule ───────────────────────────────────────────────
          hr: () => <hr className="md-prose" />,

          // ── Images ───────────────────────────────────────────────────────
          img: ({ src, alt }) => (
            <span style={{
              display: 'block',
              margin: '2rem 0',
              textAlign: 'center',
            }}>
              <img
                src={src}
                alt={alt}
                style={{
                  maxWidth: '100%', height: 'auto',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-md)',
                  border: '1px solid var(--border)',
                  display: 'inline-block',
                }}
              />
              {alt && (
                <span style={{
                  display: 'block',
                  marginTop: '0.6rem',
                  fontSize: '0.82rem',
                  color: 'var(--text-tertiary)',
                  fontStyle: 'italic',
                }}>
                  {alt}
                </span>
              )}
            </span>
          ),

          // ── Strong / Em ──────────────────────────────────────────────────
          strong: ({ children }) => (
            <strong style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{children}</strong>
          ),
          em: ({ children }) => (
            <em style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>{children}</em>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownViewer;