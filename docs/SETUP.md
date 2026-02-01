# SwasthyaSetu Setup Guide

Complete guide to setting up and running the SwasthyaSetu platform.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14.0.0 or higher)
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify installation: `node --version`

- **npm** (comes with Node.js)
  - Verify installation: `npm --version`

- **Modern Web Browser**
  - Chrome (recommended)
  - Firefox
  - Safari
  - Edge

## Installation Steps

### 1. Clone or Download the Project

```bash
# If using Git
git clone https://github.com/yourusername/swasthyasetu.git
cd swasthyasetu

# Or download and extract the ZIP file
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- `live-server` - Development server with auto-reload

### 3. Start Development Server

```bash
npm run dev
```

The application will:
- Start a local server on port 3000
- Automatically open in your default browser
- Watch for file changes and auto-reload

### 4. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## Project Structure Overview

```
SwasthyaSetu/
├── assets/          # Static assets (images, icons)
├── components/      # HTML components
├── css/            # Stylesheets
├── js/             # JavaScript modules
├── pages/          # Additional pages
├── data/           # Mock data
├── docs/           # Documentation
└── index.html      # Main entry point
```

## Configuration

### Application Configuration

Edit `js/config/app-config.js` to customize:

- API endpoints
- Feature flags
- Validation rules
- Demo mode settings

```javascript
const AppConfig = {
  demo: {
    enabled: true,  // Set to false for production
    mockDelay: 500  // API simulation delay
  }
  // ... more config
};
```

### Tailwind Configuration

Tailwind CSS is loaded via CDN. The configuration is inline in `index.html`:

```javascript
tailwind.config = {
  theme: {
    extend: {
      colors: {
        primary: "#86efac",
        secondary: "#113841",
        // ... custom colors
      }
    }
  }
};
```

## Development Workflow

### Running in Development Mode

```bash
npm run dev
```

Features:
- Live reload on file changes
- Serves files from project root
- Opens browser automatically

### Making Changes

1. **HTML Changes**: Edit files in `/` or `/pages`
2. **CSS Changes**: Edit files in `/css`
3. **JavaScript Changes**: Edit files in `/js`
4. **Components**: Edit files in `/components`

Changes are automatically reflected in the browser.

### Testing Login

Use these demo credentials:

**Patient Account:**
- ABHA ID: `12345678901234`
- Mobile: `9876543210`
- Password: `demo123`

**Hospital Admin:**
- Email: `admin@hospital.gov.in`
- Password: `admin123`

## Mock Data

The application uses mock data for demonstration:

### Patient Data
Located in `data/mock-data.json`:
- Patient profiles
- Medical records
- Appointments
- Health alerts

### Hospital Data
Located in `data/hospitals.json`:
- Hospital listings
- Resource availability
- Contact information

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:

```bash
# Use a different port
npx live-server --port=8080 --open=/index.html
```

### Dependencies Not Installing

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Browser Not Opening Automatically

Manually navigate to:
```
http://localhost:3000
```

### Live Reload Not Working

1. Check if the server is running
2. Clear browser cache
3. Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

## Building for Production

### Option 1: Static Hosting

Simply upload all files to your web server:

```bash
# Files to upload
- index.html
- assets/
- components/
- css/
- js/
- pages/
- data/
```

### Option 2: Using Build Script

```bash
npm run build
```

This will create a `dist/` folder with optimized files.

## Environment Setup

### For Development

```bash
# Install dev dependencies
npm install --save-dev live-server

# Start dev server
npm run dev
```

### For Production

1. Set `demo.enabled` to `false` in `app-config.js`
2. Replace mock API calls with real endpoints
3. Configure proper authentication
4. Enable HTTPS

## IDE Setup

### VS Code (Recommended)

Install these extensions:
- Live Server
- Tailwind CSS IntelliSense
- JavaScript (ES6) code snippets
- Path Intellisense

### Settings

Create `.vscode/settings.json`:

```json
{
  "liveServer.settings.port": 3000,
  "editor.formatOnSave": true,
  "files.autoSave": "onFocusChange"
}
```

## Next Steps

1. ✅ Complete setup
2. 📖 Read [Component Documentation](COMPONENTS.md)
3. 🔌 Review [API Documentation](API.md)
4. 🎯 Check [Hackathon Guide](HACKATHON.md)

## Support

If you encounter issues:

1. Check this guide
2. Review error messages in browser console
3. Check network tab for failed requests
4. Verify all files are in correct locations

## Additional Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [JavaScript MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [Live Server Documentation](https://www.npmjs.com/package/live-server)

---

**Happy Coding! 🚀**
