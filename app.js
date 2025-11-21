// GitHub API Configuration
const CHANGELOG_URL = 'https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md';

// State
let allReleases = [];
let searchQuery = '';

// Category keywords mapping
const CATEGORY_KEYWORDS = {
    'NEW FEATURES': ['added', 'new', 'introduce', 'released hooks', 'released mcp', 'support for'],
    'BUG FIXES': ['fixed', 'fix', 'resolved', 'resolve', 'bug'],
    'BREAKING CHANGES': ['breaking', 'removed', 'deprecated', 'breaking change'],
    'IMPROVEMENTS': ['improved', 'improve', 'enhanced', 'enhance', 'changed', 'updated', 'update', 'better', 'optimized']
};

// Initialize the app
async function init() {
    try {
        const changelog = await fetchChangelog();
        allReleases = parseChangelog(changelog);
        renderSidebar(allReleases);
        renderReleases(allReleases);
        setupEventListeners();
    } catch (error) {
        console.error('Error initializing app:', error);
        showError('Failed to load release notes. Please try again later.');
    }
}

// Fetch CHANGELOG from GitHub
async function fetchChangelog() {
    const response = await fetch(CHANGELOG_URL);
    if (!response.ok) {
        throw new Error(`Failed to fetch changelog: ${response.statusText}`);
    }
    return await response.text();
}

// Parse CHANGELOG markdown
function parseChangelog(markdown) {
    const lines = markdown.split('\n');
    const releases = [];
    let currentRelease = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Check for version header (## X.Y.Z)
        if (line.startsWith('## ') && /^\d+\.\d+\.\d+/.test(line.substring(3))) {
            // Save previous release
            if (currentRelease) {
                releases.push(currentRelease);
            }

            // Start new release
            const version = line.substring(3).trim();
            currentRelease = {
                version: version,
                changes: []
            };
        }
        // Check for bullet points
        else if (line.startsWith('- ') && currentRelease) {
            const changeText = line.substring(2).trim();
            if (changeText) {
                currentRelease.changes.push(changeText);
            }
        }
    }

    // Add the last release
    if (currentRelease) {
        releases.push(currentRelease);
    }

    // Categorize changes for each release
    releases.forEach(release => {
        release.categorizedChanges = categorizeChanges(release.changes);
    });

    return releases;
}

// Categorize changes based on keywords
function categorizeChanges(changes) {
    const categorized = {
        'NEW FEATURES': [],
        'IMPROVEMENTS': [],
        'BUG FIXES': [],
        'BREAKING CHANGES': []
    };

    changes.forEach(change => {
        const changeLower = change.toLowerCase();
        let categorized_flag = false;

        // Check each category
        for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
            if (keywords.some(keyword => changeLower.includes(keyword))) {
                categorized[category].push(change);
                categorized_flag = true;
                break;
            }
        }

        // If no category matches, put in IMPROVEMENTS as default
        if (!categorized_flag) {
            categorized['IMPROVEMENTS'].push(change);
        }
    });

    // Remove empty categories
    return Object.fromEntries(
        Object.entries(categorized).filter(([_, items]) => items.length > 0)
    );
}

// Render sidebar with version list
function renderSidebar(releases) {
    const versionList = document.getElementById('versionList');

    if (releases.length === 0) {
        versionList.innerHTML = '<div class="loading">No versions found</div>';
        return;
    }

    versionList.innerHTML = releases.map(release => `
        <a href="#${release.version}" class="version-item" data-version="${release.version}">
            ${release.version}
        </a>
    `).join('');

    // Highlight active version on scroll
    updateActiveVersion();
}

// Render release notes
function renderReleases(releases) {
    const container = document.getElementById('releaseNotes');

    if (releases.length === 0) {
        container.innerHTML = '<div class="no-results"><h2>No releases found</h2><p>Try adjusting your search.</p></div>';
        return;
    }

    container.innerHTML = releases.map(release => `
        <div class="release" id="${release.version}" data-version="${release.version}">
            <div class="release-header">
                <div class="version-title">
                    <h2 class="version-number">${release.version}</h2>
                    <button class="copy-button" onclick="copyVersion('${release.version}')" title="Copy version">
                        <svg viewBox="0 0 16 16" fill="currentColor">
                            <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path>
                            <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path>
                        </svg>
                    </button>
                </div>
            </div>
            ${renderCategories(release.categorizedChanges)}
        </div>
    `).join('');
}

// Render categories for a release
function renderCategories(categories) {
    return Object.entries(categories).map(([category, items]) => {
        const categoryClass = category.toLowerCase().replace(/ /g, '-');
        return `
            <div class="category">
                <h3 class="category-title ${categoryClass}">${category}</h3>
                <ul>
                    ${items.map(item => `<li>${formatChangeText(item)}</li>`).join('')}
                </ul>
            </div>
        `;
    }).join('');
}

// Format change text (handle markdown links and code)
function formatChangeText(text) {
    // Convert markdown links [text](url) to HTML
    text = text.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    // Convert inline code `code` to HTML
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Highlight search terms
    if (searchQuery) {
        const regex = new RegExp(`(${escapeRegex(searchQuery)})`, 'gi');
        text = text.replace(regex, '<span class="highlight">$1</span>');
    }

    return text;
}

// Copy version to clipboard
function copyVersion(version) {
    navigator.clipboard.writeText(version).then(() => {
        // Visual feedback could be added here
        console.log('Copied version:', version);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        filterReleases();
    });

    // Update active version on scroll
    window.addEventListener('scroll', updateActiveVersion);

    // Smooth scroll for sidebar links
    document.querySelectorAll('.version-item').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const version = e.target.dataset.version;
            const element = document.getElementById(version);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// Filter releases based on search query
function filterReleases() {
    if (!searchQuery) {
        renderReleases(allReleases);
        renderSidebar(allReleases);
        return;
    }

    const filtered = allReleases.filter(release => {
        // Check version number
        if (release.version.toLowerCase().includes(searchQuery)) {
            return true;
        }

        // Check changes
        return release.changes.some(change =>
            change.toLowerCase().includes(searchQuery)
        );
    });

    renderReleases(filtered);
    renderSidebar(filtered);
}

// Update active version in sidebar based on scroll position
function updateActiveVersion() {
    const releases = document.querySelectorAll('.release');
    const versionItems = document.querySelectorAll('.version-item');

    let currentVersion = null;

    releases.forEach(release => {
        const rect = release.getBoundingClientRect();
        if (rect.top <= 200) {
            currentVersion = release.dataset.version;
        }
    });

    versionItems.forEach(item => {
        if (item.dataset.version === currentVersion) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Show error message
function showError(message) {
    const container = document.getElementById('releaseNotes');
    container.innerHTML = `
        <div class="no-results">
            <h2>Error</h2>
            <p>${message}</p>
        </div>
    `;
}

// Escape regex special characters
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
