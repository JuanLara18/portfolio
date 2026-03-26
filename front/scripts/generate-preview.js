#!/usr/bin/env node
/**
 * Project Preview Generator
 *
 * Generates 1200×630 preview images for portfolio projects using a headless
 * Chromium browser (puppeteer). The template uses the portfolio's dark design
 * language with a category-specific accent color.
 *
 * Usage:
 *   node scripts/generate-preview.js           # Generate all missing images
 *   node scripts/generate-preview.js all        # Regenerate ALL images (overwrite)
 *   node scripts/generate-preview.js voxscribe  # One project by id
 *
 * After generation, run:
 *   npm run optimize-images --general           # Create WebP versions
 *
 * First run installs ~170 MB of Chromium (puppeteer dependency).
 */

const path = require('path');
const fs   = require('fs');

// ─── Project data ─────────────────────────────────────────────────────────────
// Keep this in sync with front/src/pages/ProjectsPage.jsx
// When adding a new project: add it here AND in the page, then run this script.

const PROJECTS = [
  // AI & ML
  { id: 'voxscribe',        name: 'VoxScribe',          category: 'ml',        tags: ['Python', 'Whisper', 'PyAnnote', 'NLP'],               description: 'Local transcription & speaker diarization — no cloud, no data leaving your machine.' },
  { id: 'classifai',        name: 'ClassifAI',          category: 'ml',        tags: ['Python', 'NLP', 'OpenAI', 'UMAP'],                    description: 'Classify any text dataset with one config file. Guaranteed structured outputs.' },
  { id: 'ai-video-gen',     name: 'AI Video Gen',       category: 'ml',        tags: ['Python', 'FFmpeg', 'AI', 'CLI'],                      description: 'Batch AI video generation from JSON prompts. Multi-provider, production-ready.' },
  { id: 'textinsight',      name: 'TextInsight',        category: 'ml',        tags: ['Python', 'BERT', 'NLP', 'NetworkX'],                  description: 'NLP library for sentiment analysis, embeddings, and graph visualization.' },
  // Tools
  { id: 'pdf-optimizer',    name: 'PDF Optimizer',      category: 'tools',     tags: ['Python', 'PyMuPDF', 'Streamlit', 'CLI'],              description: 'Smart PDF compression via CLI and web UI. Structural and raster optimization.' },
  { id: 'notebook-converter', name: 'Notebook Converter', category: 'tools',  tags: ['Python', 'Jupyter', 'Streamlit'],                     description: 'Convert Jupyter Notebooks into organized Python packages in one ZIP.' },
  // Web & Apps
  { id: 'whiteboard',       name: 'Whiteboard',         category: 'web',       tags: ['TypeScript', 'React', 'Konva'],                       description: 'Local-first browser whiteboard with freehand drawing and sticky notes.' },
  { id: 'quizapp',          name: 'QuizApp',            category: 'web',       tags: ['React', 'Flask', 'SQLite'],                           description: 'Full-stack learning platform for educators to create and manage quizzes.' },
  // Games
  { id: 'pixel-valentine',  name: 'Pixel Valentine',    category: 'games',     tags: ['TypeScript', 'Phaser 3', 'Pixel Art'],                description: 'Retro pixel-art platformer that ends with your personal love letter.' },
  { id: 'tetris',           name: 'Tetris',             category: 'games',     tags: ['JavaScript', 'p5.js', 'OOP'],                        description: 'Classic Tetris with piece rotation, line clearing, and progressive difficulty.' },
  { id: 'brickbreaker',     name: 'BrickBreaker',       category: 'games',     tags: ['JavaScript', 'Canvas', 'OOP'],                       description: 'Arcade brick breaker with physics, power-ups, and progressive difficulty.' },
  // Resources
  { id: 'awesome-ai-roadmap', name: 'Awesome AI Roadmap', category: 'resources', tags: ['ML', 'LLMs', 'AI Agents'],                       description: 'Open-source roadmap to mastering AI & ML from foundations to production.' },
];

// ─── Category color palette ───────────────────────────────────────────────────

const COLORS = {
  ml:        { primary: '#7c3aed', secondary: '#a855f7', light: '#c4b5fd', label: 'AI & ML'    },
  tools:     { primary: '#2563eb', secondary: '#3b82f6', light: '#93c5fd', label: 'Tools'      },
  web:       { primary: '#4f46e5', secondary: '#6366f1', light: '#a5b4fc', label: 'Web & Apps' },
  games:     { primary: '#e11d48', secondary: '#f43f5e', light: '#fda4af', label: 'Games'      },
  resources: { primary: '#059669', secondary: '#10b981', light: '#6ee7b7', label: 'Resources'  },
};

// Category SVG icons (inline, Lucide-style paths)
const ICONS = {
  ml: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24A2.5 2.5 0 0 0 14.5 2Z"/>
  </svg>`,
  tools: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>`,
  web: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 1 0 20 14.5 14.5 0 0 1 0-20"/>
    <path d="M2 12h20"/>
  </svg>`,
  games: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/>
    <line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/>
    <rect width="20" height="12" x="2" y="6" rx="2"/>
  </svg>`,
  resources: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>`,
};

// ─── HTML template ────────────────────────────────────────────────────────────

function buildHTML(project) {
  const col  = COLORS[project.category] ?? COLORS.tools;
  const icon = ICONS[project.category]  ?? ICONS.tools;

  // Escape HTML entities
  const esc  = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const tagPills = project.tags.slice(0, 4).map(t =>
    `<span class="tag">${esc(t)}</span>`
  ).join('');

  return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      width: 1200px; height: 630px; overflow: hidden;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1a2744 50%, #1e293b 100%);
      color: #fff;
    }

    /* ── Decorative layers ───────────────────────── */
    .accent-bar {
      position: absolute; top: 0; left: 0; width: 100%; height: 5px;
      background: linear-gradient(90deg, ${col.primary}, ${col.secondary}, transparent);
    }
    .dot-pattern {
      position: absolute; inset: 0;
      background-image: radial-gradient(circle, rgba(255,255,255,0.035) 1.5px, transparent 1.5px);
      background-size: 36px 36px;
    }
    .glow {
      position: absolute; top: -160px; right: -160px;
      width: 520px; height: 520px; border-radius: 50%;
      background: radial-gradient(circle, ${col.primary}30 0%, transparent 68%);
    }
    .glow-bottom {
      position: absolute; bottom: -200px; left: -80px;
      width: 400px; height: 400px; border-radius: 50%;
      background: radial-gradient(circle, ${col.secondary}18 0%, transparent 65%);
    }
    /* Large watermark icon */
    .watermark {
      position: absolute; bottom: 30px; right: 56px;
      opacity: 0.07; color: ${col.light};
      transform: scale(7); transform-origin: bottom right;
    }

    /* ── Content ─────────────────────────────────── */
    .content {
      position: absolute; inset: 0;
      padding: 56px 72px 52px;
      display: flex; flex-direction: column; justify-content: space-between;
    }

    .top { display: flex; flex-direction: column; gap: 20px; }

    .badge {
      display: inline-flex; align-items: center; gap: 10px;
      padding: 7px 18px; border-radius: 24px; width: fit-content;
      background: ${col.primary}28;
      border: 1px solid ${col.primary}55;
      color: ${col.light};
      font-size: 15px; font-weight: 500;
    }
    .badge svg { flex-shrink: 0; }

    .project-name {
      font-size: 72px; font-weight: 800; line-height: 1.05;
      color: #f8fafc;
      max-width: 860px;
      /* Prevent very long names overflowing */
      word-break: break-word;
    }

    .description {
      font-size: 22px; font-weight: 400; line-height: 1.55;
      color: #94a3b8;
      max-width: 800px;
      /* Two-line clamp via max-height hack (Chromium supports -webkit-box) */
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* ── Footer ─────────────────────────────────── */
    .footer {
      display: flex; align-items: center; justify-content: space-between;
    }
    .tags { display: flex; gap: 10px; flex-wrap: wrap; }
    .tag {
      padding: 7px 16px; border-radius: 8px;
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.11);
      font-size: 15px; font-weight: 500; color: #cbd5e1;
    }
    .branding {
      font-size: 16px; font-weight: 500;
      color: rgba(255,255,255,0.25);
      letter-spacing: 0.02em;
    }
  </style>
</head>
<body>
  <div class="accent-bar"></div>
  <div class="dot-pattern"></div>
  <div class="glow"></div>
  <div class="glow-bottom"></div>

  <!-- Watermark icon -->
  <div class="watermark" style="color:${col.light}">${icon}</div>

  <div class="content">
    <div class="top">
      <div class="badge">
        ${icon}
        ${esc(col.label)}
      </div>
      <div class="project-name">${esc(project.name)}</div>
      <div class="description">${esc(project.description)}</div>
    </div>

    <div class="footer">
      <div class="tags">${tagPills}</div>
      <div class="branding">juanlara.dev</div>
    </div>
  </div>
</body>
</html>`;
}

// ─── Generator ────────────────────────────────────────────────────────────────

const OUTPUT_DIR = path.join(__dirname, '../public/images/project-previews');

async function generate(project, overwrite = false) {
  let puppeteer;
  try {
    puppeteer = require('puppeteer');
  } catch {
    console.error('\n  ✗ puppeteer not found. Run: npm install --save-dev puppeteer\n');
    process.exit(1);
  }

  const outPath = path.join(OUTPUT_DIR, `${project.id}.png`);

  if (!overwrite && fs.existsSync(outPath)) {
    console.log(`  ↳ skip  ${project.id}.png  (already exists — use "all" to overwrite)`);
    return;
  }

  console.log(`  ↳ gen   ${project.id}.png`);

  const html = buildHTML(project);
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: outPath, type: 'png' });
  } finally {
    await browser.close();
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const arg       = process.argv[2] ?? '';
  const overwrite = arg === 'all';

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('\n━━━ Project Preview Generator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let targets;
  if (!arg || overwrite) {
    targets = PROJECTS;
    console.log(`  Mode: ${overwrite ? 'regenerate all' : 'generate missing'}`);
    console.log(`  Projects: ${targets.length}\n`);
  } else {
    const found = PROJECTS.find(p => p.id === arg);
    if (!found) {
      console.error(`  ✗ Unknown project id "${arg}"\n  Valid ids: ${PROJECTS.map(p => p.id).join(', ')}\n`);
      process.exit(1);
    }
    targets = [found];
    console.log(`  Mode: single project  →  ${found.name}\n`);
  }

  for (const project of targets) {
    await generate(project, overwrite);
  }

  console.log('\n  Done. Run "npm run optimize-images -- --general" to create WebP versions.\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(err => {
  console.error('\n  ✗ Fatal:', err.message, '\n');
  process.exit(1);
});
