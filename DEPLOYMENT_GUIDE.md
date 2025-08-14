# GitHub Deployment Guide

## Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in to your account
2. Click the "+" icon in the top right corner and select "New repository"
3. Name your repository (e.g., "portfolio-website" or "deep-podder-portfolio")
4. Add a description: "Dynamic Flask portfolio website for AI/ML Engineer"
5. Make it Public (so others can see your portfolio)
6. Don't initialize with README (we already have one)
7. Click "Create repository"

## Step 2: Prepare Your Files

Your portfolio is already set up with:
- ✅ README.md - Project documentation
- ✅ LICENSE - MIT License
- ✅ .gitignore - Git ignore file
- ✅ All source code and assets

## Step 3: Upload to GitHub

### Option A: Using Git Command Line (if available)
```bash
git add .
git commit -m "Initial commit: Dynamic Flask portfolio website"
git branch -M main
git remote add origin https://github.com/unknown-spec10/your-repo-name.git
git push -u origin main
```

### Option B: Using GitHub Web Interface
1. In your new GitHub repository, click "uploading an existing file"
2. Drag and drop all files from your project folder, or click "choose your files"
3. Select all files EXCEPT:
   - .replit (Replit specific)
   - replit.nix (Replit specific) 
   - uv.lock (Replit specific)
4. Add commit message: "Initial commit: Dynamic Flask portfolio website"
5. Click "Commit changes"

## Step 4: Deploy to GitHub Pages (Optional - for static sites)

Since this is a Flask application, GitHub Pages won't work directly. Instead, consider these deployment options:

### Recommended Deployment Platforms:

1. **Replit** (Current) - Already deployed!
   - Your site is live at: https://your-repl-name.your-username.repl.co

2. **Heroku** (Free tier available)
   - Create Procfile: `web: gunicorn main:app`
   - Connect GitHub repository
   - Deploy automatically

3. **PythonAnywhere** (Free tier available)
   - Upload files to your account
   - Configure WSGI file
   - Set up web app

4. **Railway** (Modern alternative)
   - Connect GitHub repository
   - Automatic deployment from git pushes

5. **DigitalOcean App Platform**
   - Professional deployment option
   - Connect GitHub repository

## Step 5: Keep Repository Updated

After uploading to GitHub:

1. Make changes to your portfolio in Replit
2. Download updated files
3. Upload to GitHub repository
4. Or use git commands to sync changes

## Environment Variables for Deployment

Make sure to set these on your deployment platform:
- `SESSION_SECRET`: A secure random string for Flask sessions

## File Structure for GitHub

```
your-portfolio-repo/
├── README.md              # Project documentation
├── LICENSE               # MIT License
├── .gitignore           # Git ignore rules
├── app.py               # Main Flask application
├── main.py              # Application entry point
├── data/                # JSON data files
│   ├── portfolio.json   # Your personal information
│   └── projects.json    # Your projects
├── static/              # Static assets
│   ├── css/
│   ├── js/
│   └── uploads/
├── templates/           # HTML templates
│   ├── index.html
│   └── admin.html
└── DEPLOYMENT_GUIDE.md  # This guide
```

## Next Steps After GitHub Upload

1. Update your GitHub profile to feature this repository
2. Add the repository link to your portfolio's personal info
3. Share your GitHub repository with potential employers
4. Keep your portfolio updated through the admin panel
5. Consider setting up automatic deployment from GitHub to your hosting platform

Your dynamic portfolio website is now ready for GitHub! 🚀