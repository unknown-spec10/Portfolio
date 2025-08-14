# Overview

A Flask-based personal portfolio management system for an AI/ML engineer. The application combines a public portfolio website showcasing projects, skills, and experience with an admin panel for content management. The system allows for dynamic content updates through a web interface while maintaining a professional portfolio presence.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Multi-page Structure**: Separate templates for public portfolio (`index.html`) and admin panel (`admin.html`)
- **Responsive Design**: Bootstrap-based responsive layout with dark theme for professional appearance
- **Interactive Elements**: JavaScript-driven smooth scrolling, animations, and dynamic content management
- **CSS Framework**: Bootstrap with custom CSS for styling and theming
- **Code Highlighting**: Prism.js integration for displaying code snippets in projects

## Backend Architecture
- **Framework**: Flask web framework with Python
- **Routing**: RESTful API endpoints for project management alongside template rendering routes
- **File Upload**: Secure file handling for project images with allowed file type validation
- **Session Management**: Flask session handling with configurable secret key
- **CORS Support**: Cross-Origin Resource Sharing enabled for API accessibility

## Data Storage
- **File-based JSON Storage**: Portfolio and project data stored in JSON files (`portfolio.json`, `projects.json`)
- **Static File Management**: Image uploads stored in `static/uploads` directory
- **Data Structure**: Structured JSON format for personal info, education, skills, and projects
- **CRUD Operations**: Full create, read, update, delete functionality for project management

## Content Management
- **Admin Panel**: Comprehensive web-based interface for managing all portfolio content including projects, personal info, education, skills, and certifications
- **Tabbed Interface**: Organized admin panel with separate tabs for different content types
- **Dynamic Portfolio Management**: Full CRUD operations for personal information, education details, skills categorization, and certifications
- **Image Upload**: Support for multiple image formats (PNG, JPG, JPEG, GIF, WebP)
- **Real-time Updates**: Instant content updates with auto-save functionality for certifications
- **Data Validation**: Server-side validation for uploaded files and form data

## Security Features
- **File Security**: Werkzeug secure filename handling for uploads
- **Input Validation**: Server-side validation for file types and form inputs
- **Environment Configuration**: Environment variable support for sensitive configuration

# External Dependencies

## Frontend Libraries
- **Bootstrap**: CSS framework for responsive design and UI components
- **Font Awesome**: Icon library for visual elements
- **Prism.js**: Syntax highlighting for code snippets
- **Axios**: HTTP client for API requests in admin panel

## Python Packages
- **Flask**: Web framework for application structure
- **Flask-CORS**: Cross-origin resource sharing support
- **Werkzeug**: WSGI utilities for secure file handling

## CDN Resources
- Bootstrap CSS from Replit CDN with dark theme
- Font Awesome icons from Cloudflare CDN
- Prism.js from Cloudflare CDN for code highlighting

## File System Dependencies
- Local file system for JSON data storage
- Static file serving for uploaded images
- Directory structure with `data/`, `static/uploads/`, and `templates/` folders