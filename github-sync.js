/**
 * GitHub Sync Utility
 * 
 * This script provides utility functions to sync files with GitHub repository
 * using the GitHub API instead of git commands to avoid timeout issues.
 * 
 * This approach is particularly useful for large repositories or environments
 * with execution time limits (like Replit) where git commands might time out.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// GitHub repository details
const REPO_OWNER = 'programmeradu';
const REPO_NAME = 'pmiems';
const GITHUB_TOKEN = process.env.GITHUB_PERSONAL_TOKEN || process.env.GITHUB_TOKEN;
const API_BASE_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;

// Validate token
if (!GITHUB_TOKEN) {
  console.error('Error: GitHub token not found in environment variables.');
  console.error('Please set GITHUB_PERSONAL_TOKEN or GITHUB_TOKEN.');
  process.exit(1);
}

// Excluded paths that should not be synced to GitHub
const EXCLUDED_PATHS = [
  'node_modules',
  'dist',
  '.git',
  '.replit',
  'replit.nix',
  '.config',
  '.upm',
  'temp',
];

/**
 * Upload a file to GitHub
 * @param {string} filePath - Path of the file to upload
 * @param {string} message - Commit message
 * @returns {Promise<object>} - API response
 */
async function uploadFile(filePath, message = 'Update file') {
  try {
    // Read the file and encode to base64
    const content = fs.readFileSync(filePath, 'utf8');
    const contentEncoded = Buffer.from(content).toString('base64');
    
    // Relative path for GitHub
    const relativePath = filePath.replace(/^\.\//, '');
    
    // Construct the API URL
    const apiUrl = `${API_BASE_URL}/contents/${relativePath}`;
    
    // Check if file already exists
    let sha;
    try {
      const checkCmd = `curl -s -H "Authorization: token ${GITHUB_TOKEN}" ${apiUrl}`;
      const response = JSON.parse(execSync(checkCmd).toString());
      sha = response.sha;
    } catch (error) {
      // File doesn't exist
    }
    
    // Prepare request body
    const requestBody = {
      message,
      content: contentEncoded,
    };
    
    // Add SHA if file exists
    if (sha) {
      requestBody.sha = sha;
    }
    
    // Make API request
    const cmd = `curl -X PUT -H "Authorization: token ${GITHUB_TOKEN}" -d '${JSON.stringify(requestBody)}' ${apiUrl}`;
    const result = execSync(cmd).toString();
    
    console.log(`Uploaded ${filePath} to GitHub`);
    return JSON.parse(result);
  } catch (error) {
    console.error(`Error uploading ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Check if path should be excluded from sync
 * @param {string} filePath - Path to check
 * @returns {boolean} - True if path should be excluded
 */
function shouldExclude(filePath) {
  return EXCLUDED_PATHS.some(excluded => filePath.includes(excluded));
}

/**
 * Sync a specific file to GitHub
 * @param {string} filePath - Path of the file to sync
 */
function syncFile(filePath) {
  if (shouldExclude(filePath)) {
    console.log(`Skipping excluded path: ${filePath}`);
    return;
  }
  
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    uploadFile(filePath, `Update ${path.basename(filePath)}`);
  } else {
    console.error(`File not found: ${filePath}`);
  }
}

/**
 * Sync an entire directory to GitHub
 * @param {string} dirPath - Path of the directory to sync
 */
function syncDirectory(dirPath = '.') {
  if (shouldExclude(dirPath)) {
    console.log(`Skipping excluded directory: ${dirPath}`);
    return;
  }
  
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      
      if (shouldExclude(filePath)) {
        console.log(`Skipping excluded path: ${filePath}`);
        return;
      }
      
      if (fs.statSync(filePath).isDirectory()) {
        syncDirectory(filePath);
      } else {
        syncFile(filePath);
      }
    });
  } else {
    console.error(`Directory not found: ${dirPath}`);
  }
}

/**
 * Print repository structure recursively
 * @param {string} dirPath - The directory path
 * @param {number} level - Current recursion level
 * @param {string} prefix - Prefix for tree visualization
 */
function printRepoStructure(dirPath = '.', level = 0, prefix = '') {
  if (shouldExclude(dirPath) || level > 3) { // Limit depth to 3 levels
    return;
  }
  
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    const files = fs.readdirSync(dirPath).sort();
    
    files.forEach((file, index) => {
      const filePath = path.join(dirPath, file);
      const isLast = index === files.length - 1;
      
      if (shouldExclude(filePath)) {
        return;
      }
      
      const connector = isLast ? '└── ' : '├── ';
      console.log(`${prefix}${connector}${file}`);
      
      if (fs.statSync(filePath).isDirectory()) {
        const newPrefix = prefix + (isLast ? '    ' : '│   ');
        printRepoStructure(filePath, level + 1, newPrefix);
      }
    });
  }
}

// Command line interface
const args = process.argv.slice(2);
const command = args[0];
const target = args[1];

switch (command) {
  case 'file':
    if (!target) {
      console.error('Please specify a file to sync');
      process.exit(1);
    }
    syncFile(target);
    break;
    
  case 'dir':
    syncDirectory(target || '.');
    break;
    
  case 'structure':
    console.log('Repository Structure:');
    printRepoStructure(target || '.');
    break;
    
  case 'check':
    console.log('GitHub Token Available:', !!GITHUB_TOKEN);
    console.log('Repository:', `${REPO_OWNER}/${REPO_NAME}`);
    console.log('API Base URL:', API_BASE_URL);
    break;
    
  default:
    console.log(`
GitHub Sync Utility
Usage:
  node github-sync.js file <filepath>    - Sync a specific file
  node github-sync.js dir <dirpath>      - Sync an entire directory (defaults to current directory)
  node github-sync.js structure <dirpath> - Print repository structure
  node github-sync.js check              - Check configuration
    `);
}