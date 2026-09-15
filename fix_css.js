const fs = require('fs');
let css = fs.readFileSync('frontend/src/index.css', 'utf8');

const rootRegex = /:root\s*\{[\s\S]*?\}\n\n/m;

const newRoot = `:root {
  /* Professional Brand Palette - Teal & Deep Neutral */
  --color-primary: #0f766e;
  --color-primary-dark: #0f766e;
  --color-primary-light: #f0fdfa;
  --color-primary-hover: #115e59;

  --color-secondary: #0ea5e9;
  --color-secondary-dark: #0369a1;
  --color-secondary-light: #e0f2fe;

  --color-accent: #f59e0b;
  --color-accent-light: #fefce8;

  --color-ink: #111827;
  --color-ink-soft: #4b5563;

  --color-bg-base: #f9fafb;
  --color-bg-surface: #ffffff;
  --color-bg-muted: #f3f4f6;
  --color-bg-tinted: #f0fdfa;

  --color-text-main: #111827;
  --color-text-muted: #4b5563;
  --color-text-subtle: #9ca3af;

  --color-border: #e5e7eb;
  --color-border-strong: #d1d5db;

  --color-success: #16a34a;
  --color-success-light: #dcfce7;
  --color-warning: #f59e0b;
  --color-warning-light: #fef3c7;
  --color-error: #dc2626;
  --color-error-light: #fee2e2;
  --color-info: #0284c7;
  --color-info-light: #e0f2fe;

  /* Legacy aliases overridden to new palette */
  --color-forest-dark: #111827;
  --color-forest-deep: #1f2937;
  --color-forest-primary: #0f766e;
  --color-forest-hover: #115e59;
  --color-sage-light: #f0fdfa;
  --color-sage-border: #ccfbf1;
  --color-sage-text: #0f766e;
  --color-amber-primary: #f59e0b;
  --color-amber-bg: #fffbeb;
  --color-blue-primary: #0f766e;
  --color-blue-bg: #f0fdfa;

  /* Typography */
  --font-family-base: 'Inter', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-family-tamil: 'Noto Sans Tamil', 'Latha', 'Nirmala UI', sans-serif;
  --font-family-hindi: 'Noto Sans Devanagari', 'Nirmala UI', 'Mangal', sans-serif;

  /* Restrained Border Radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-pill: 9999px;

  /* Subtle Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-indigo: var(--shadow-sm); 

  /* Transitions */
  --transition-fast: 0.15s ease-out;
  --transition-normal: 0.25s ease-out;
}

`;

css = css.replace(rootRegex, newRoot);

// Remove glassmorphism and excessive gradients globally
css = css.replace(/backdrop-filter:[^;]+;/g, '/* removed glass */');
css = css.replace(/background:\s*linear-gradient[^;]+;/g, 'background: var(--color-primary);');
css = css.replace(/box-shadow:\s*0\s+20px[^;]+;/g, 'box-shadow: var(--shadow-md);');
css = css.replace(/box-shadow:\s*0\s+30px[^;]+;/g, 'box-shadow: var(--shadow-lg);');
css = css.replace(/background-image:\s*linear-gradient[^;]+;/g, 'background: var(--color-primary);');

// Clean up buttons turning pills into normal borders, except if they explicitly need pill
css = css.replace(/border-radius:\s*var\(--radius-pill\);/g, 'border-radius: var(--radius-sm);');

fs.writeFileSync('frontend/src/index.css', css);
