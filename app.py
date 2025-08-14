import os
import json
import logging
from flask import Flask, render_template, request, jsonify, redirect, url_for, flash, send_file, make_response
from flask_cors import CORS
from werkzeug.utils import secure_filename
import uuid
from datetime import datetime
from io import BytesIO
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY

# Configure logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key-change-in-production")
CORS(app)

# Configuration
UPLOAD_FOLDER = 'static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs('data', exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def load_json_data(filename):
    """Load data from JSON file"""
    try:
        with open(f'data/{filename}', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}
    except json.JSONDecodeError:
        return {}

def save_json_data(filename, data):
    """Save data to JSON file"""
    with open(f'data/{filename}', 'w') as f:
        json.dump(data, f, indent=2)

# Initialize portfolio data
def init_portfolio_data():
    portfolio_data = {
        "personal": {
            "name": "Deep Podder",
            "title": "AI/ML Engineer",
            "location": "Kolkata, India",
            "phone": "+91 6289622872",
            "email": "deeppodder57@gmail.com",
            "linkedin": "https://www.linkedin.com/in/deeppodder2005",
            "github": "https://github.com/unknown-spec10",
            "objective": "BCA graduate (2026) with a solid foundation in computer science and a strong passion for data science and AI. Skilled in Python, C, C++, Java, and DSA, with hands-on experience in machine learning, deep learning (PyTorch), NLP, and Generative AI. Seeking a data science internship where I can apply my skills to build impactful, data-driven solutions."
        },
        "education": {
            "degree": "Bachelor of Computer Applications (BCA)",
            "institution": "Institute of Engineering and Management, Kolkata",
            "graduation_year": "2026",
            "status": "Expected Graduation"
        },
        "skills": {
            "programming": ["Python", "C", "C++", "Java", "Data Structures and Algorithms (DSA)"],
            "database": ["RDBMS"],
            "data_science": [
                "Machine Learning (Regression, Classification, Clustering)",
                "Deep Learning (PyTorch, CNNs, RNNs, LSTMs, Transformers)",
                "Natural Language Processing (NLP)",
                "Generative AI",
                "NumPy", "Pandas", "Scikit-learn", "Matplotlib", "Seaborn"
            ],
            "tools_frameworks": [
                "TensorFlow", "PyTorch", "Git", "FastAPI", "Streamlit",
                "LangGraph", "Ollama", "HuggingFace Transformers"
            ]
        },
        "certifications": [
            "Azure DevOps for Beginners – LinkedIn, Aug 2024",
            "Becoming an AI-First Product Leader – LinkedIn, Dec 2023",
            "Introduction to Artificial Intelligence – LinkedIn, Dec 2023"
        ]
    }
    
    if not os.path.exists('data/portfolio.json'):
        save_json_data('portfolio.json', portfolio_data)
    
    return portfolio_data

def init_projects_data():
    projects_data = {
        "projects": [
            {
                "id": "1",
                "title": "Twitter Sentiment Analysis",
                "description": "Analyzed tweet sentiments using BERT, PyTorch, and HuggingFace transformers. Used TensorDataset, DataLoader, AdamW optimizer, and learning rate scheduler for model training.",
                "technologies": ["Python", "PyTorch", "BERT", "HuggingFace", "NLP"],
                "github_link": "",
                "demo_link": "",
                "image": "",
                "code_snippet": "# Sentiment analysis with BERT\nfrom transformers import BertTokenizer, BertForSequenceClassification\nimport torch\n\n# Load pre-trained model and tokenizer\ntokenizer = BertTokenizer.from_pretrained('bert-base-uncased')\nmodel = BertForSequenceClassification.from_pretrained('bert-base-uncased')\n\n# Tokenize and predict\ninputs = tokenizer(text, return_tensors='pt', padding=True, truncation=True)\nwith torch.no_grad():\n    outputs = model(**inputs)\n    predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)"
            },
            {
                "id": "2",
                "title": "RAG Application with Ollama and Streamlit",
                "description": "Built a Retrieval-Augmented Generation (RAG) app using LLaMA models and Ollama. Developed a Streamlit-based UI for user-friendly query answering from custom datasets.",
                "technologies": ["Python", "Streamlit", "Ollama", "LLaMA", "RAG"],
                "github_link": "",
                "demo_link": "",
                "image": "",
                "code_snippet": "# RAG implementation with Ollama\nimport streamlit as st\nimport ollama\nfrom langchain.embeddings import OllamaEmbeddings\nfrom langchain.vectorstores import Chroma\n\n# Initialize embeddings and vector store\nembeddings = OllamaEmbeddings(model='llama2')\nvectorstore = Chroma(embedding_function=embeddings)\n\n# Query processing\nquery = st.text_input('Ask a question:')\nif query:\n    docs = vectorstore.similarity_search(query, k=3)\n    context = '\\n'.join([doc.page_content for doc in docs])\n    response = ollama.generate(model='llama2', prompt=f'Context: {context}\\nQuestion: {query}')\n    st.write(response['response'])"
            },
            {
                "id": "3",
                "title": "Stock Recommender using Agentic AI",
                "description": "Created a stock recommendation engine using real-time data from Phi Data. Integrated ML models and intelligent agentic flows to generate actionable financial insights.",
                "technologies": ["Python", "Agentic AI", "Phi Data", "Machine Learning", "Financial Analysis"],
                "github_link": "",
                "demo_link": "",
                "image": "",
                "code_snippet": "# Stock recommendation with Agentic AI\nfrom phi.agent import Agent\nfrom phi.model.openai import OpenAIChat\nfrom phi.tools.yfinance import YFinanceTools\n\n# Create stock analysis agent\nstock_agent = Agent(\n    model=OpenAIChat(id='gpt-4'),\n    tools=[YFinanceTools(stock_price=True, analyst_recommendations=True)],\n    instructions=['Analyze stock performance and provide investment recommendations']\n)\n\n# Get stock recommendation\nresponse = stock_agent.run('Analyze AAPL stock and provide investment advice')\nprint(response.content)"
            },
            {
                "id": "4",
                "title": "Skill Gap Analyzer using Agentic AI",
                "description": "Designed a tool to identify employee skill gaps using Agentic AI, LangGraph, and Streamlit. Utilized tools like PDFPlumber, pdf2image, Tesseract, and GLM4 for document parsing and skill assessment.",
                "technologies": ["Python", "Agentic AI", "LangGraph", "Streamlit", "OCR", "NLP"],
                "github_link": "",
                "demo_link": "",
                "image": "",
                "code_snippet": "# Skill gap analysis with LangGraph\nfrom langgraph.graph import StateGraph\nfrom langchain.schema import BaseMessage\nimport pdfplumber\nfrom PIL import Image\nimport pytesseract\n\n# Define skill extraction workflow\ndef extract_text_from_pdf(file_path):\n    with pdfplumber.open(file_path) as pdf:\n        text = ''\n        for page in pdf.pages:\n            text += page.extract_text()\n    return text\n\n# Skill gap analysis agent\ndef analyze_skills(resume_text, job_requirements):\n    # AI-powered skill matching logic here\n    pass"
            },
            {
                "id": "5",
                "title": "PI/PHI Detector (Rally Ticket Integration)",
                "description": "Designed and implemented a data privacy detection tool for identifying Personally Identifiable (PI) and Protected Health Information (PHI) within Rally ticket data. Automated data extraction from Rally using pyrally, streamlining ticket ingestion workflows.",
                "technologies": ["FastAPI", "Pydantic", "pyrally", "Agentic AI", "Ollama", "LLMs", "NLP"],
                "github_link": "",
                "demo_link": "",
                "image": "",
                "code_snippet": "# PI/PHI Detection with FastAPI\nfrom fastapi import FastAPI, HTTPException\nfrom pydantic import BaseModel\nimport ollama\nimport re\n\napp = FastAPI()\n\nclass TicketData(BaseModel):\n    ticket_id: str\n    content: str\n    title: str\n\n@app.post('/analyze-privacy')\nasync def analyze_privacy_data(ticket: TicketData):\n    # Use Ollama LLM for PI/PHI detection\n    prompt = f'Analyze this text for PI/PHI data: {ticket.content}'\n    response = ollama.generate(model='llama2', prompt=prompt)\n    \n    # Regex patterns for common PI/PHI\n    email_pattern = r'\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b'\n    phone_pattern = r'\\b\\d{3}-\\d{3}-\\d{4}\\b'\n    \n    findings = {\n        'emails': re.findall(email_pattern, ticket.content),\n        'phones': re.findall(phone_pattern, ticket.content),\n        'ai_analysis': response['response']\n    }\n    \n    return findings"
            }
        ]
    }
    
    if not os.path.exists('data/projects.json'):
        save_json_data('projects.json', projects_data)
    
    return projects_data

# Initialize data
init_portfolio_data()
init_projects_data()

@app.route('/')
def index():
    """Main portfolio page"""
    portfolio = load_json_data('portfolio.json')
    projects = load_json_data('projects.json')
    return render_template('index.html', portfolio=portfolio, projects=projects['projects'])


@app.route('/api/projects', methods=['GET'])
def get_projects():
    """Get all projects"""
    projects = load_json_data('projects.json')
    return jsonify(projects)

@app.route('/api/projects', methods=['POST'])
def create_project():
    """Create a new project"""
    try:
        data = request.get_json()
        projects = load_json_data('projects.json')
        
        # Generate unique ID
        new_id = str(uuid.uuid4())
        
        new_project = {
            'id': new_id,
            'title': data.get('title', ''),
            'description': data.get('description', ''),
            'technologies': data.get('technologies', []),
            'github_link': data.get('github_link', ''),
            'demo_link': data.get('demo_link', ''),
            'image': data.get('image', '')
        }
        
        projects['projects'].append(new_project)
        save_json_data('projects.json', projects)
        
        return jsonify({'success': True, 'project': new_project})
    except Exception as e:
        app.logger.error(f"Error creating project: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/projects/<project_id>', methods=['PUT'])
def update_project(project_id):
    """Update an existing project"""
    try:
        data = request.get_json()
        projects = load_json_data('projects.json')
        
        # Find and update project
        for i, project in enumerate(projects['projects']):
            if project['id'] == project_id:
                projects['projects'][i].update({
                    'title': data.get('title', project['title']),
                    'description': data.get('description', project['description']),
                    'technologies': data.get('technologies', project['technologies']),
                    'github_link': data.get('github_link', project['github_link']),
                    'demo_link': data.get('demo_link', project['demo_link']),
                    'image': data.get('image', project['image'])
                })
                save_json_data('projects.json', projects)
                return jsonify({'success': True, 'project': projects['projects'][i]})
        
        return jsonify({'success': False, 'error': 'Project not found'}), 404
    except Exception as e:
        app.logger.error(f"Error updating project: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/projects/<project_id>', methods=['DELETE'])
def delete_project(project_id):
    """Delete a project"""
    try:
        projects = load_json_data('projects.json')
        
        # Find and remove project
        for i, project in enumerate(projects['projects']):
            if project['id'] == project_id:
                deleted_project = projects['projects'].pop(i)
                save_json_data('projects.json', projects)
                return jsonify({'success': True, 'deleted': deleted_project})
        
        return jsonify({'success': False, 'error': 'Project not found'}), 404
    except Exception as e:
        app.logger.error(f"Error deleting project: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/portfolio', methods=['GET'])
def get_portfolio():
    """Get portfolio data"""
    portfolio = load_json_data('portfolio.json')
    return jsonify(portfolio)

@app.route('/api/portfolio', methods=['PUT'])
def update_portfolio():
    """Update portfolio data"""
    try:
        data = request.get_json()
        portfolio = load_json_data('portfolio.json')
        
        # Update personal information
        if 'personal' in data:
            portfolio['personal'].update(data['personal'])
        
        # Update education
        if 'education' in data:
            portfolio['education'].update(data['education'])
        
        # Update skills
        if 'skills' in data:
            portfolio['skills'].update(data['skills'])
        
        # Update certifications
        if 'certifications' in data:
            portfolio['certifications'] = data['certifications']
        
        save_json_data('portfolio.json', portfolio)
        return jsonify({'success': True, 'portfolio': portfolio})
    except Exception as e:
        app.logger.error(f"Error updating portfolio: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Handle file uploads for project images"""
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            # Add timestamp to avoid conflicts
            filename = f"{uuid.uuid4()}_{filename}"
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            
            return jsonify({
                'success': True, 
                'filename': filename,
                'url': url_for('static', filename=f'uploads/{filename}')
            })
        
        return jsonify({'success': False, 'error': 'Invalid file type'}), 400
    except Exception as e:
        app.logger.error(f"Error uploading file: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

def generate_pdf_resume():
    """Generate PDF resume from portfolio data"""
    portfolio = load_json_data('portfolio.json')
    projects = load_json_data('projects.json')
    
    # Create PDF buffer
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
    
    # Get styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=12,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#17a2b8')
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        spaceAfter=6,
        spaceBefore=12,
        textColor=colors.HexColor('#17a2b8'),
        borderWidth=1,
        borderColor=colors.HexColor('#17a2b8'),
        borderPadding=3,
        leftIndent=0,
        rightIndent=0
    )
    
    subheading_style = ParagraphStyle(
        'CustomSubHeading',
        parent=styles['Heading3'],
        fontSize=12,
        spaceAfter=3,
        spaceBefore=6,
        textColor=colors.black
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=10,
        spaceAfter=3,
        alignment=TA_JUSTIFY
    )
    
    # Build PDF content
    story = []
    
    # Header
    if portfolio.get('personal'):
        personal = portfolio['personal']
        story.append(Paragraph(personal.get('name', ''), title_style))
        story.append(Paragraph(personal.get('title', ''), styles['Heading3']))
        
        # Contact information
        contact_info = []
        if personal.get('email'):
            contact_info.append(f"Email: {personal['email']}")
        if personal.get('phone'):
            contact_info.append(f"Phone: {personal['phone']}")
        if personal.get('location'):
            contact_info.append(f"Location: {personal['location']}")
        
        if contact_info:
            story.append(Paragraph(" | ".join(contact_info), normal_style))
            
        # Links
        links = []
        if personal.get('linkedin'):
            links.append(f"LinkedIn: {personal['linkedin']}")
        if personal.get('github'):
            links.append(f"GitHub: {personal['github']}")
            
        if links:
            story.append(Paragraph(" | ".join(links), normal_style))
        
        story.append(Spacer(1, 12))
        
        # Professional Objective
        if personal.get('objective'):
            story.append(Paragraph("PROFESSIONAL OBJECTIVE", heading_style))
            story.append(Paragraph(personal['objective'], normal_style))
            story.append(Spacer(1, 12))
    
    # Education
    if portfolio.get('education'):
        education = portfolio['education']
        story.append(Paragraph("EDUCATION", heading_style))
        
        edu_content = f"<b>{education.get('degree', '')}</b><br/>"
        edu_content += f"{education.get('institution', '')}<br/>"
        edu_content += f"{education.get('status', '')}: {education.get('graduation_year', '')}"
        
        story.append(Paragraph(edu_content, normal_style))
        story.append(Spacer(1, 12))
    
    # Skills
    if portfolio.get('skills'):
        skills = portfolio['skills']
        story.append(Paragraph("TECHNICAL SKILLS", heading_style))
        
        for skill_category, skill_list in skills.items():
            if skill_list:
                category_name = skill_category.replace('_', ' ').title()
                story.append(Paragraph(f"<b>{category_name}:</b> {', '.join(skill_list)}", normal_style))
        
        story.append(Spacer(1, 12))
    
    # Projects
    if projects.get('projects'):
        story.append(Paragraph("PROJECTS", heading_style))
        
        for project in projects['projects']:
            story.append(Paragraph(f"<b>{project.get('title', '')}</b>", subheading_style))
            
            if project.get('description'):
                story.append(Paragraph(project['description'], normal_style))
            
            if project.get('technologies'):
                tech_text = f"<b>Technologies:</b> {', '.join(project['technologies'])}"
                story.append(Paragraph(tech_text, normal_style))
            
            # Links
            project_links = []
            if project.get('github_link'):
                project_links.append(f"GitHub: {project['github_link']}")
            if project.get('demo_link'):
                project_links.append(f"Demo: {project['demo_link']}")
            
            if project_links:
                story.append(Paragraph(" | ".join(project_links), normal_style))
            
            story.append(Spacer(1, 8))
    
    # Certifications
    if portfolio.get('certifications') and portfolio['certifications']:
        story.append(Paragraph("CERTIFICATIONS", heading_style))
        
        for cert in portfolio['certifications']:
            story.append(Paragraph(f"• {cert}", normal_style))
        
        story.append(Spacer(1, 12))
    
    # Build PDF
    doc.build(story)
    buffer.seek(0)
    return buffer

@app.route('/download-resume')
def download_resume():
    """Generate and download PDF resume"""
    try:
        portfolio = load_json_data('portfolio.json')
        personal_name = portfolio.get('personal', {}).get('name', 'Resume')
        
        # Generate PDF
        pdf_buffer = generate_pdf_resume()
        
        # Create filename
        timestamp = datetime.now().strftime("%Y%m%d")
        filename = f"{personal_name.replace(' ', '_')}_Resume_{timestamp}.pdf"
        
        return send_file(
            pdf_buffer,
            as_attachment=True,
            download_name=filename,
            mimetype='application/pdf'
        )
        
    except Exception as e:
        app.logger.error(f"Error generating resume: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/resume/preview')
def preview_resume():
    """Preview resume content as JSON"""
    try:
        portfolio = load_json_data('portfolio.json')
        projects = load_json_data('projects.json')
        
        # Structure the resume data for preview
        resume_data = {
            'personal': portfolio.get('personal', {}),
            'education': portfolio.get('education', {}),
            'skills': portfolio.get('skills', {}),
            'projects': projects.get('projects', []),
            'certifications': portfolio.get('certifications', [])
        }
        
        return jsonify({'success': True, 'resume_data': resume_data})
        
    except Exception as e:
        app.logger.error(f"Error previewing resume: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
