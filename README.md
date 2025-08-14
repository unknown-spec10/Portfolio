# Deep Podder - AI/ML Engineer Portfolio

A dynamic Flask-based portfolio website showcasing projects, skills, and experience in data science and artificial intelligence.

## Features

- **Responsive Design**: Modern, mobile-friendly interface with Bootstrap dark theme
- **Dynamic Content Management**: Complete admin panel for managing all portfolio content
- **Project Showcase**: Interactive project cards with technology tags and links
- **Admin Panel**: Comprehensive management interface with tabs for:
  - Personal Information
  - Education Details
  - Skills Management
  - Certifications
  - Project Management

## Tech Stack

- **Backend**: Python Flask
- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap 5
- **Data Storage**: JSON files for lightweight data management
- **File Uploads**: Secure image handling for project images
- **API**: RESTful endpoints for dynamic content updates

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/unknown-spec10/portfolio-website.git
cd portfolio-website
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set environment variables:
```bash
export SESSION_SECRET="your-secret-key-here"
```

4. Run the application:
```bash
python main.py
```

5. Access the website:
- Portfolio: http://localhost:5000
- Admin Panel: http://localhost:5000/admin

## Deployment

This application is designed to work on any Python hosting platform including:
- Replit
- Heroku
- PythonAnywhere
- DigitalOcean App Platform

## Project Structure

```
portfolio-website/
├── app.py                 # Main Flask application
├── main.py               # Application entry point
├── data/                 # JSON data files
│   ├── portfolio.json    # Personal and professional information
│   └── projects.json     # Project data
├── static/               # Static assets
│   ├── css/             # Stylesheets
│   ├── js/              # JavaScript files
│   └── uploads/         # Uploaded project images
├── templates/           # HTML templates
│   ├── index.html       # Main portfolio page
│   └── admin.html       # Admin panel
└── requirements.txt     # Python dependencies
```

## Admin Panel Features

The admin panel provides comprehensive content management:

- **Personal Info**: Update name, title, contact information, and professional objective
- **Education**: Manage degree information and academic details
- **Skills**: Organize skills by category (Programming, Data Science, Tools, Database)
- **Certifications**: Add, edit, and remove certifications with auto-save
- **Projects**: Full CRUD operations for project management with image uploads

## API Endpoints

- `GET /` - Portfolio homepage
- `GET /admin` - Admin panel
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/<id>` - Update project
- `DELETE /api/projects/<id>` - Delete project
- `GET /api/portfolio` - Get portfolio data
- `PUT /api/portfolio` - Update portfolio data
- `POST /api/upload` - Upload project images

## Contributing

This is a personal portfolio project. Feel free to fork and adapt for your own use.

## License

This project is open source and available under the [MIT License](LICENSE).

## Contact

- **Name**: Deep Podder
- **Email**: deeppodder57@gmail.com
- **LinkedIn**: [linkedin.com/in/deeppodder2005](https://www.linkedin.com/in/deeppodder2005)
- **GitHub**: [github.com/unknown-spec10](https://github.com/unknown-spec10)