# Claude Code Release Notes Viewer

A modern, static web application that displays release notes for Claude Code by fetching and parsing the CHANGELOG.md from the official repository.

## Features

- **Automatic Updates**: Fetches the latest CHANGELOG.md from GitHub on every page load
- **Smart Categorization**: Automatically categorizes changes into:
  - NEW FEATURES (green)
  - IMPROVEMENTS (yellow)
  - BUG FIXES (blue)
  - BREAKING CHANGES (red)
- **Search Functionality**: Search across all versions and changes
- **Version Navigation**: Sidebar with quick links to each version
- **Copy to Clipboard**: Easy copying of version numbers
- **Dark Theme**: Modern, comfortable dark UI
- **Responsive Design**: Works on desktop and mobile devices

## Setup

### Option 1: GitHub Pages (Recommended)

1. Create a new GitHub repository
2. Push these files to the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Claude Code release notes viewer"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

3. Enable GitHub Pages:
   - Go to repository Settings
   - Navigate to Pages section
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Click Save

4. Your site will be live at: `https://<username>.github.io/<repository-name>/`

### Option 2: Local Development

Simply open `index.html` in a web browser. Note that some browsers may block the GitHub API request due to CORS when opening files directly. For best results, use a local server:

```bash
# Python 3
python -m http.server 8000

# Node.js (if you have http-server installed)
npx http-server

# Then open http://localhost:8000
```

## How It Works

1. **Fetching**: The app fetches the CHANGELOG.md from the anthropics/claude-code repository via GitHub's raw content URL
2. **Parsing**: Markdown is parsed to extract version numbers (## X.Y.Z format) and their associated changes (bullet points)
3. **Categorization**: Each change is automatically categorized based on keywords:
   - "Added", "New", "Introduced" → NEW FEATURES
   - "Fixed", "Resolved" → BUG FIXES
   - "Breaking", "Removed", "Deprecated" → BREAKING CHANGES
   - "Improved", "Enhanced", "Changed", "Updated" → IMPROVEMENTS
   - Uncategorized changes default to IMPROVEMENTS
4. **Rendering**: The UI is dynamically generated with proper styling and interactivity

## Files

- `index.html` - Main HTML structure
- `style.css` - Dark theme styling and responsive layout
- `app.js` - Core functionality (fetching, parsing, rendering, search)
- `README.md` - This file

## Customization

### Changing Category Colors

Edit the category color classes in `style.css`:

```css
.category-title.new-features { color: #3fb950; }    /* Green */
.category-title.improvements { color: #d29922; }     /* Yellow */
.category-title.bug-fixes { color: #58a6ff; }        /* Blue */
.category-title.breaking-changes { color: #f85149; } /* Red */
```

### Adjusting Categorization Rules

Modify the `CATEGORY_KEYWORDS` object in `app.js` to change how changes are categorized.

### Styling

All colors and layout can be customized in `style.css`. The design uses CSS variables for easy theming if needed.

## Browser Support

Works in all modern browsers that support:
- ES6+ JavaScript
- CSS Grid and Flexbox
- Fetch API

## License

This project is provided as-is for displaying Claude Code release notes.
