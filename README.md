<div align="center">
  <img src="front/public/logo512.png" width="120" alt="Juan Lara Logo" />
  <h1>Juan Lara - Portfolio & Blog</h1>
  <p>
    <strong>Personal website, portfolio, and integrated blog for mathematical research and computational notes.</strong>
  </p>
  <p>
    <a href="https://juanlara18.github.io/Portfolio">Live Site</a> • 
    <a href="https://www.linkedin.com/in/julara/">LinkedIn</a> •
    <a href="mailto:larajuand@outlook.com">Contact</a>
  </p>
</div>

<br />

## Overview

This repository contains the source code for my personal portfolio and blog. As a Computer Scientist and Applied Mathematician, I designed this platform not just as a static resume, but as a functional space to share academic research, algorithmic analysis, and mathematical proofs.

The platform integrates a custom Markdown-based blogging engine with robust $\LaTeX$ support, enabling the seamless publication of technical and mathematical content.

## Architecture & Technical Stack

The project is built as a single-page application prioritizing performance and maintainability.

- **Frontend Core**: React 18, React Router 6.
- **Styling & UI**: Tailwind CSS for responsive utility-based design, Framer Motion for precise interaction animations.
- **Content Engine**: Custom Markdown parser utilizing `react-markdown` and `remark-math` with KaTeX integration for rendering complex mathematical notations.
- **Infrastructure**: CI/CD pipeline via GitHub Actions, deployed continuously to GitHub Pages.

### Directory Structure

```text
Portfolio/
├── front/
│   ├── public/blog/       # Markdown posts (curiosities & research) and generated manifest
│   ├── src/
│   │   ├── components/    # Reusable modular UI components
│   │   ├── pages/         # Core route views
│   │   └── utils/         # Helper functions and business logic
│   └── scripts/           # Build automation for indexing blog posts
└── README.md
```

## Local Development

To run this project locally:

1. Clone the repository and navigate to the frontend directory:
   ```bash
   git clone https://github.com/JuanLara18/Portfolio.git
   cd Portfolio/front
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Generate the blog post manifest (required for the blog index to function):
   ```bash
   npm run generate-manifest
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## Content Management Workflow

The blog operates statically. To publish a new post:

1. Create a `.md` file in `front/public/blog/posts/curiosities/` or `front/public/blog/posts/research/`.
2. Include the required YAML frontmatter (title, date, excerpt, tags, headerImage).
3. Run `npm run generate-manifest` to update the application's content index.
4. Commit and push. GitHub Actions will handle the build and deployment process automatically.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---
*Juan Lara © 2026*
