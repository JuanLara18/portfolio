import { memo, useState, useEffect, useRef, useId, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import mermaid from 'mermaid';
import { ChevronDown, ChevronRight, Copy, Check, AlertCircle, Maximize2, X } from 'lucide-react';
import 'katex/dist/katex.min.css';

// Mermaid configuration helper
const getMermaidConfig = (isDark) => ({
  startOnLoad: false,
  theme: isDark ? 'dark' : 'default',
  securityLevel: 'loose',
  fontFamily: 'Inter, system-ui, sans-serif',
  themeVariables: isDark ? {
    // Dark theme customizations
    primaryColor: '#3b82f6',
    primaryTextColor: '#f3f4f6',
    primaryBorderColor: '#4b5563',
    lineColor: '#6b7280',
    secondaryColor: '#1f2937',
    tertiaryColor: '#374151',
    background: '#111827',
    mainBkg: '#1f2937',
    nodeBorder: '#4b5563',
    clusterBkg: '#1f2937',
    clusterBorder: '#4b5563',
    titleColor: '#f9fafb',
    edgeLabelBackground: '#374151',
    nodeTextColor: '#f3f4f6',
  } : {
    // Light theme customizations
    primaryColor: '#3b82f6',
    primaryTextColor: '#1f2937',
    primaryBorderColor: '#d1d5db',
    lineColor: '#6b7280',
    secondaryColor: '#f3f4f6',
    tertiaryColor: '#e5e7eb',
    background: '#ffffff',
    mainBkg: '#f9fafb',
    nodeBorder: '#d1d5db',
    clusterBkg: '#f3f4f6',
    clusterBorder: '#d1d5db',
    titleColor: '#111827',
    edgeLabelBackground: '#f3f4f6',
    nodeTextColor: '#1f2937',
  }
});

// Enhanced Toggle Component
const ToggleSection = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="my-6 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50 transition-all duration-200 flex items-center justify-between text-left font-semibold text-gray-900 dark:text-gray-100"
      >
        <span className="flex items-center">
          {isOpen ? (
            <ChevronDown size={18} className="mr-2 text-blue-600 dark:text-blue-400" />
          ) : (
            <ChevronRight size={18} className="mr-2 text-blue-600 dark:text-blue-400" />
          )}
          {title}
        </span>
        <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400"></div>
      </button>
      {isOpen && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          {children}
        </div>
      )}
    </div>
  );
};

// Custom hook for dark mode detection
const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);
  
  return isDarkMode;
};

// Mermaid Diagram Component with full theme support
const MermaidDiagram = ({ chart }) => {
  const uniqueId = useId();
  const containerRef = useRef(null);
  const [svg, setSvg] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isDarkMode = useDarkMode();
  
  // Generate a safe ID for mermaid (no colons allowed)
  const mermaidId = `mermaid-${uniqueId.replace(/:/g, '-')}-${Math.random().toString(36).substr(2, 9)}`;
  
  const renderDiagram = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Reinitialize mermaid with current theme
      mermaid.initialize(getMermaidConfig(isDarkMode));
      
      const { svg: renderedSvg } = await mermaid.render(mermaidId, chart);
      setSvg(renderedSvg);
    } catch (err) {
      console.error('Mermaid rendering error:', err);
      setError(err.message || 'Failed to render diagram');
    } finally {
      setIsLoading(false);
    }
  }, [chart, isDarkMode, mermaidId]);
  
  useEffect(() => {
    renderDiagram();
  }, [renderDiagram]);
  
  // Fullscreen modal
  const FullscreenModal = () => (
    <div 
      className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
      onClick={() => setIsFullscreen(false)}
    >
      <button
        onClick={() => setIsFullscreen(false)}
        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
        aria-label="Close fullscreen"
      >
        <X size={24} />
      </button>
      <div 
        className="max-w-full max-h-full overflow-auto bg-white dark:bg-gray-900 rounded-xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="mermaid-diagram-fullscreen [&_svg]:max-w-none [&_svg]:w-auto [&_svg]:h-auto"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
    </div>
  );
  
  // Loading state
  if (isLoading) {
    return (
      <div className="my-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center gap-3 text-gray-500 dark:text-gray-400">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Rendering diagram...</span>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="my-8 p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              Failed to render diagram
            </p>
            <p className="text-xs text-red-600 dark:text-red-300 mt-1 font-mono">
              {error}
            </p>
            <details className="mt-3">
              <summary className="text-xs text-red-500 dark:text-red-400 cursor-pointer hover:underline">
                Show diagram code
              </summary>
              <pre className="mt-2 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg text-xs overflow-x-auto text-red-800 dark:text-red-200">
                {chart}
              </pre>
            </details>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <>
      {isFullscreen && <FullscreenModal />}
      <div 
        ref={containerRef}
        className="my-8 group relative bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600"
      >
        {/* Fullscreen button */}
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
          aria-label="View fullscreen"
          title="View fullscreen"
        >
          <Maximize2 size={16} />
        </button>
        
        {/* Diagram container */}
        <div className="p-4 sm:p-6 overflow-x-auto">
          <div 
            className="mermaid-diagram flex justify-center min-w-fit [&_svg]:max-w-full [&_svg]:h-auto [&_.node_rect]:transition-all [&_.node_rect]:duration-200"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </div>
      </div>
    </>
  );
};

// Enhanced Code Block with Copy Button
const CodeBlock = ({ language, value, ...props }) => {
  const [copied, setCopied] = useState(false);
  const isDarkMode = useDarkMode();
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Check if it's a Mermaid diagram
  if (language === 'mermaid') {
    return <MermaidDiagram chart={value} />;
  }
  
  // Check if it's a toggle section
  if (language === 'toggle') {
    const lines = value.split('\n');
    const title = lines[0] || 'Toggle Section';
    const content = lines.slice(1).join('\n');
    return (
      <ToggleSection title={title}>
        <ReactMarkdown>{content}</ReactMarkdown>
      </ToggleSection>
    );
  }
  
  // Select theme based on dark mode
  const codeTheme = isDarkMode ? oneDark : oneLight;
  const headerBg = isDarkMode ? 'bg-gray-800' : 'bg-gray-200';
  const headerText = isDarkMode ? 'text-gray-300' : 'text-gray-700';
  const borderColor = isDarkMode ? 'border-gray-600' : 'border-gray-300';
  
  return (
    <div className="relative my-6 group">
      <div className={`flex items-center justify-between ${headerBg} ${headerText} px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-t-lg border-b ${borderColor}`}>
        <span className="font-medium">{language || 'code'}</span>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-xs sm:text-sm"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <SyntaxHighlighter
        style={codeTheme}
        language={language || 'text'}
        customStyle={{
          margin: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: '0.5rem',
          borderBottomRightRadius: '0.5rem',
          fontSize: '0.875rem',
          lineHeight: '1.5',
          padding: '1rem',
          overflowX: 'auto',
        }}
        {...props}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

const BlogMarkdownRenderer = memo(({ content, className = "", baseImagePath = "" }) => {
	// Safely extract plain text from React children trees
	const extractText = (node) => {
		if (node == null) return '';
		if (typeof node === 'string' || typeof node === 'number') return String(node);
		if (Array.isArray(node)) return node.map(extractText).join('');
		if (typeof node === 'object' && 'props' in node) return extractText(node.props?.children);
		return '';
	};

	const withPublicUrl = (p) => {
		if (!p) return '';
		const base = process.env.PUBLIC_URL || '';
		if (p.startsWith('http')) return p;
		if (p.startsWith('/')) return `${base}${p}`;
		return `${base}/${p}`;
	};
	// Custom components for markdown elements
	const components = {
		// Enhanced headings with IDs for linking
	h1: ({ children, ...props }) => (
			<h1 
		id={slugify(extractText(children))}
				className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 mt-8 sm:mt-12 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-4 leading-tight tracking-tight"
				{...props}
			>
				{children}
			</h1>
		),
	h2: ({ children, ...props }) => (
			<h2 
		id={slugify(extractText(children))}
				className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 mt-10 sm:mt-14 text-gray-900 dark:text-gray-100 leading-snug tracking-tight"
				{...props}
			>
				{children}
			</h2>
		),
	h3: ({ children, ...props }) => (
			<h3 
		id={slugify(extractText(children))}
				className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4 mt-8 sm:mt-10 text-gray-900 dark:text-gray-100 leading-snug"
				{...props}
			>
				{children}
			</h3>
		),
	h4: ({ children, ...props }) => (
			<h4 
		id={slugify(extractText(children))}
				className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3 mt-6 sm:mt-8 text-gray-900 dark:text-gray-100"
				{...props}
			>
				{children}
			</h4>
		),
	h5: ({ children, ...props }) => (
			<h5 
		id={slugify(extractText(children))}
				className="text-base md:text-lg font-semibold mb-2 mt-4 text-gray-900 dark:text-gray-100"
				{...props}
			>
				{children}
			</h5>
		),
	h6: ({ children, ...props }) => (
			<h6 
		id={slugify(extractText(children))}
				className="text-sm md:text-base font-semibold mb-2 mt-4 text-gray-700 dark:text-gray-300"
				{...props}
			>
				{children}
			</h6>
		),
    
		// Enhanced paragraphs
		p: ({ children, ...props }) => (
			<p className="mb-6 leading-7 sm:leading-8 text-gray-700 dark:text-gray-300 text-base sm:text-lg font-normal" {...props}>
				{children}
			</p>
		),
    
		// Enhanced images with responsive design and error handling
		img: ({ src = '', alt, title, ...props }) => {
			let imageSrc = '';
			if (src.startsWith('http')) {
				imageSrc = src;
			} else if (src.startsWith('/')) {
				imageSrc = withPublicUrl(src);
			} else if (src.startsWith('figures/')) {
				// Allow markdown to reference `figures/...` from blog root
				imageSrc = withPublicUrl(`/blog/${src}`);
			} else {
				// Default: relative to provided baseImagePath
				const base = baseImagePath?.endsWith('/') ? baseImagePath.slice(0, -1) : baseImagePath;
				imageSrc = withPublicUrl(`${base}/${src}`.replace(/\/+/, '/'));
			}
      
			return (
				<div className="my-8">
					<img
						src={imageSrc}
						alt={alt || ''}
						title={title}
						className="w-full h-auto rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
						loading="lazy"
						onError={(e) => {
							// Fallback to a default placeholder image instead of disappearing
							const fallback = withPublicUrl('/blog/headers/default.jpg');
							if (e.target.src !== fallback) {
								e.target.src = fallback;
							} else {
								e.target.style.display = 'none';
							}
						}}
						{...props}
					/>
					{(alt || title) && (
						<div className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center italic">
							{title || alt}
						</div>
					)}
				</div>
			);
		},
    
		// Enhanced links with external link detection
		a: ({ href, children, ...props }) => {
			const isExternal = href && (href.startsWith('http') || href.startsWith('mailto:'));
			const linkClass = "text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline decoration-2 underline-offset-2 transition-colors";
      
			if (isExternal) {
				return (
					<a 
						href={href} 
						className={linkClass}
						target="_blank" 
						rel="noopener noreferrer"
						{...props}
					>
						{children}
						<svg 
							className="inline ml-1 w-3 h-3" 
							fill="none" 
							viewBox="0 0 24 24" 
							stroke="currentColor"
						>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
						</svg>
					</a>
				);
			}
      
			return <a href={href} className={linkClass} {...props}>{children}</a>;
		},
    
	// Enhanced code blocks
	code: ({ className, children, ...props }) => {
		// Detect if it's a code block or inline code
		// In react-markdown v8+, the 'inline' prop is no longer passed
		// Code blocks have a className with language-* or contain newlines
		const hasLanguageClass = /language-(\w+)/.exec(className || '');
		const content = String(children);
		const hasNewlines = content.includes('\n');
		
		// It's inline if: no language class AND no newlines AND content is short
		const isInline = !hasLanguageClass && !hasNewlines;
		
		// Handle inline code
		if (isInline) {
			return (
				<code 
					className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded text-sm font-mono border border-gray-300 dark:border-gray-600"
					{...props}
				>
					{children}
				</code>
			);
		}
		
		// Handle code blocks with syntax highlighting
		const language = hasLanguageClass ? hasLanguageClass[1] : '';
		const value = content.replace(/\n$/, '');
		
		// Use CodeBlock component for syntax highlighting
		return <CodeBlock language={language} value={value} {...props} />;
	},
    
	// Enhanced pre blocks - just pass through children without extra styling
	pre: ({ children, ...props }) => {
		// Simply return children without wrapper - CodeBlock handles all styling
		return <>{children}</>;
	},
    
		// Enhanced lists
		ul: ({ children, ...props }) => (
			<ul className="mb-4 ml-6 space-y-2 list-disc text-gray-700 dark:text-gray-300" {...props}>
				{children}
			</ul>
		),
		ol: ({ children, ...props }) => (
			<ol className="mb-4 ml-6 space-y-2 list-decimal text-gray-700 dark:text-gray-300" {...props}>
				{children}
			</ol>
		),
		li: ({ children, ...props }) => (
			<li className="leading-relaxed" {...props}>
				{children}
			</li>
		),
    
		// Enhanced blockquotes
		blockquote: ({ children, ...props }) => (
			<blockquote 
				className="my-8 pl-6 border-l-4 border-blue-500 dark:border-blue-400 py-2 italic text-lg sm:text-xl text-gray-700 dark:text-gray-300 font-serif leading-relaxed"
				{...props}
			>
				{children}
			</blockquote>
		),
    
		// Enhanced tables
		table: ({ children, ...props }) => (
			<div className="my-6 overflow-x-auto">
				<table className="w-full border-collapse border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden" {...props}>
					{children}
				</table>
			</div>
		),
		thead: ({ children, ...props }) => (
			<thead className="bg-gray-100 dark:bg-gray-800" {...props}>
				{children}
			</thead>
		),
		th: ({ children, ...props }) => (
			<th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600" {...props}>
				{children}
			</th>
		),
		td: ({ children, ...props }) => (
			<td className="px-4 py-3 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600" {...props}>
				{children}
			</td>
		),
    
		// Horizontal rule
		hr: ({ ...props }) => (
			<hr className="my-8 border-gray-300 dark:border-gray-600" {...props} />
		),
	};

	return (
		<div className={`prose prose-lg max-w-none dark:prose-invert ${className}`}>
			<ReactMarkdown
				components={components}
				remarkPlugins={[remarkMath, remarkGfm, remarkFrontmatter]}
				rehypePlugins={[rehypeKatex]}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
});

// Helper function for creating URL-friendly slugs
function slugify(text) {
	return text
		.toString()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.trim()
		.replace(/\s+/g, '-')
		.replace(/[^\w\-]+/g, '')
		.replace(/\-\-+/g, '-');
}

export default BlogMarkdownRenderer;
