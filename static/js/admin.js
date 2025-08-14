// Admin panel JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize admin functionality
    initProjectManagement();
    initPortfolioManagement();
    setupResumePreview();
    loadProjects();
    loadPortfolioData();
});

let currentProjectId = null;
let projectsData = [];
let portfolioData = {};

// Initialize project management functionality
function initProjectManagement() {
    // Add project button
    document.getElementById('saveProject').addEventListener('click', saveProject);
    
    // Form reset when modal is closed
    document.getElementById('addProjectModal').addEventListener('hidden.bs.modal', resetForm);
    
    // File upload preview
    document.getElementById('projectImage').addEventListener('change', previewImage);
}

// Load and display projects
async function loadProjects() {
    try {
        const response = await axios.get('/api/projects');
        projectsData = response.data.projects;
        displayProjects();
    } catch (error) {
        showAlert('Error loading projects: ' + error.message, 'danger');
    }
}

// Display projects in the table
function displayProjects() {
    const tbody = document.getElementById('projectsTableBody');
    tbody.innerHTML = '';
    
    projectsData.forEach(project => {
        const row = createProjectRow(project);
        tbody.appendChild(row);
    });
    
    // Add event listeners for edit and delete buttons
    addProjectEventListeners();
}

// Create a table row for a project
function createProjectRow(project) {
    const row = document.createElement('tr');
    row.setAttribute('data-project-id', project.id);
    
    // Truncate description for display
    const shortDescription = project.description.length > 100 
        ? project.description.substring(0, 100) + '...'
        : project.description;
    
    // Create technology badges
    const techBadges = project.technologies.map(tech => 
        `<span class="badge bg-secondary me-1">${tech}</span>`
    ).join('');
    
    // Create link buttons
    let linkButtons = '';
    if (project.github_link) {
        linkButtons += `<a href="${project.github_link}" target="_blank" class="btn btn-sm btn-outline-secondary me-1">
            <i class="fab fa-github"></i>
        </a>`;
    }
    if (project.demo_link) {
        linkButtons += `<a href="${project.demo_link}" target="_blank" class="btn btn-sm btn-outline-info">
            <i class="fas fa-external-link-alt"></i>
        </a>`;
    }
    
    row.innerHTML = `
        <td>
            <strong>${project.title}</strong>
            ${project.image ? '<br><small class="text-muted">Has image</small>' : ''}
        </td>
        <td>
            <span class="description-preview">${shortDescription}</span>
        </td>
        <td>${techBadges}</td>
        <td>${linkButtons}</td>
        <td>
            <button class="btn btn-sm btn-outline-warning edit-project me-1" data-project-id="${project.id}">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger delete-project" data-project-id="${project.id}">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    return row;
}

// Add event listeners for project actions
function addProjectEventListeners() {
    // Edit project buttons
    document.querySelectorAll('.edit-project').forEach(btn => {
        btn.addEventListener('click', function() {
            const projectId = this.getAttribute('data-project-id');
            editProject(projectId);
        });
    });
    
    // Delete project buttons
    document.querySelectorAll('.delete-project').forEach(btn => {
        btn.addEventListener('click', function() {
            const projectId = this.getAttribute('data-project-id');
            confirmDeleteProject(projectId);
        });
    });
}

// Edit project
function editProject(projectId) {
    const project = projectsData.find(p => p.id === projectId);
    if (!project) {
        showAlert('Project not found', 'danger');
        return;
    }
    
    currentProjectId = projectId;
    
    // Populate form
    document.getElementById('projectId').value = project.id;
    document.getElementById('projectTitle').value = project.title;
    document.getElementById('projectDescription').value = project.description;
    document.getElementById('projectTechnologies').value = project.technologies.join(', ');
    document.getElementById('projectGithub').value = project.github_link || '';
    document.getElementById('projectDemo').value = project.demo_link || '';
    
    // Show current image if exists
    if (project.image) {
        const currentImageDiv = document.getElementById('currentImage');
        const currentImagePreview = document.getElementById('currentImagePreview');
        currentImagePreview.src = `/static/uploads/${project.image}`;
        currentImageDiv.style.display = 'block';
    }
    
    // Update modal title
    document.getElementById('modalTitle').textContent = 'Edit Project';
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('addProjectModal'));
    modal.show();
}

// Confirm delete project
function confirmDeleteProject(projectId) {
    const project = projectsData.find(p => p.id === projectId);
    if (!project) {
        showAlert('Project not found', 'danger');
        return;
    }
    
    currentProjectId = projectId;
    document.getElementById('deleteProjectTitle').textContent = project.title;
    
    // Show delete confirmation modal
    const modal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    modal.show();
    
    // Add confirm delete listener
    document.getElementById('confirmDelete').onclick = function() {
        deleteProject(projectId);
        modal.hide();
    };
}

// Save project (create or update)
async function saveProject() {
    const form = document.getElementById('projectForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const saveBtn = document.getElementById('saveProject');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    saveBtn.disabled = true;
    
    try {
        // Prepare form data
        const formData = new FormData();
        const projectData = {
            title: document.getElementById('projectTitle').value,
            description: document.getElementById('projectDescription').value,
            technologies: document.getElementById('projectTechnologies').value
                .split(',').map(t => t.trim()).filter(t => t),
            github_link: document.getElementById('projectGithub').value,
            demo_link: document.getElementById('projectDemo').value
        };
        
        // Handle image upload if new image is selected
        const imageFile = document.getElementById('projectImage').files[0];
        if (imageFile) {
            const uploadFormData = new FormData();
            uploadFormData.append('file', imageFile);
            
            const uploadResponse = await axios.post('/api/upload', uploadFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (uploadResponse.data.success) {
                projectData.image = uploadResponse.data.filename;
            }
        } else if (currentProjectId) {
            // Keep existing image for updates
            const existingProject = projectsData.find(p => p.id === currentProjectId);
            if (existingProject && existingProject.image) {
                projectData.image = existingProject.image;
            }
        }
        
        let response;
        if (currentProjectId) {
            // Update existing project
            response = await axios.put(`/api/projects/${currentProjectId}`, projectData);
        } else {
            // Create new project
            response = await axios.post('/api/projects', projectData);
        }
        
        if (response.data.success) {
            showAlert(
                currentProjectId ? 'Project updated successfully!' : 'Project created successfully!', 
                'success'
            );
            
            // Close modal and reload projects
            bootstrap.Modal.getInstance(document.getElementById('addProjectModal')).hide();
            await loadProjects();
        } else {
            showAlert('Error saving project: ' + response.data.error, 'danger');
        }
        
    } catch (error) {
        showAlert('Error saving project: ' + error.message, 'danger');
    } finally {
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
    }
}

// Delete project
async function deleteProject(projectId) {
    try {
        const response = await axios.delete(`/api/projects/${projectId}`);
        
        if (response.data.success) {
            showAlert('Project deleted successfully!', 'success');
            await loadProjects();
        } else {
            showAlert('Error deleting project: ' + response.data.error, 'danger');
        }
        
    } catch (error) {
        showAlert('Error deleting project: ' + error.message, 'danger');
    }
}

// Reset form
function resetForm() {
    document.getElementById('projectForm').reset();
    document.getElementById('projectId').value = '';
    document.getElementById('currentImage').style.display = 'none';
    document.getElementById('modalTitle').textContent = 'Add New Project';
    currentProjectId = null;
}

// Preview uploaded image
function previewImage() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // Could add image preview functionality here
            console.log('Image selected:', file.name);
        };
        reader.readAsDataURL(file);
    }
}

// Show alert messages
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    alertContainer.appendChild(alert);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
    
    // Scroll to top to show alert
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Utility function to format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Validate form inputs
function validateProjectForm() {
    const form = document.getElementById('projectForm');
    const title = document.getElementById('projectTitle').value.trim();
    const description = document.getElementById('projectDescription').value.trim();
    const technologies = document.getElementById('projectTechnologies').value.trim();
    
    if (!title) {
        showAlert('Project title is required', 'warning');
        return false;
    }
    
    if (!description) {
        showAlert('Project description is required', 'warning');
        return false;
    }
    
    if (!technologies) {
        showAlert('At least one technology is required', 'warning');
        return false;
    }
    
    return true;
}

// Export data functionality
function exportProjects() {
    const dataStr = JSON.stringify(projectsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'portfolio-projects.json';
    link.click();
    
    showAlert('Projects exported successfully!', 'success');
}

// Import data functionality
function importProjects(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (importedData.projects && Array.isArray(importedData.projects)) {
                projectsData = importedData.projects;
                displayProjects();
                showAlert('Projects imported successfully!', 'success');
            } else {
                showAlert('Invalid file format', 'danger');
            }
        } catch (error) {
            showAlert('Error parsing file: ' + error.message, 'danger');
        }
    };
    reader.readAsText(file);
}

// Bulk operations
function selectAllProjects() {
    const checkboxes = document.querySelectorAll('.project-checkbox');
    checkboxes.forEach(cb => cb.checked = true);
}

function deselectAllProjects() {
    const checkboxes = document.querySelectorAll('.project-checkbox');
    checkboxes.forEach(cb => cb.checked = false);
}

function deleteSelectedProjects() {
    const selectedCheckboxes = document.querySelectorAll('.project-checkbox:checked');
    const selectedIds = Array.from(selectedCheckboxes).map(cb => cb.value);
    
    if (selectedIds.length === 0) {
        showAlert('No projects selected', 'warning');
        return;
    }
    
    if (confirm(`Delete ${selectedIds.length} selected projects?`)) {
        selectedIds.forEach(async (id) => {
            await deleteProject(id);
        });
    }
}

// Search and filter functionality
function initSearchAndFilter() {
    const searchInput = document.getElementById('projectSearch');
    const filterSelect = document.getElementById('technologyFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterProjects);
    }
    
    if (filterSelect) {
        filterSelect.addEventListener('change', filterProjects);
    }
}

function filterProjects() {
    const searchTerm = document.getElementById('projectSearch')?.value.toLowerCase() || '';
    const techFilter = document.getElementById('technologyFilter')?.value || '';
    
    const filteredProjects = projectsData.filter(project => {
        const matchesSearch = project.title.toLowerCase().includes(searchTerm) ||
                             project.description.toLowerCase().includes(searchTerm);
        
        const matchesTech = !techFilter || project.technologies.includes(techFilter);
        
        return matchesSearch && matchesTech;
    });
    
    displayFilteredProjects(filteredProjects);
}

// Portfolio Management Functions
function initPortfolioManagement() {
    // Initialize portfolio data loading for each tab
    const tabs = document.querySelectorAll('#adminTabs button[data-bs-toggle="tab"]');
    tabs.forEach(tab => {
        tab.addEventListener('shown.bs.tab', function(event) {
            const target = event.target.getAttribute('data-bs-target');
            if (target === '#personal' || target === '#education' || target === '#skills' || target === '#certifications') {
                loadPortfolioData();
            }
        });
    });
}

// Load portfolio data
async function loadPortfolioData() {
    try {
        const response = await axios.get('/api/portfolio');
        portfolioData = response.data;
        populatePortfolioForms();
    } catch (error) {
        showAlert('Error loading portfolio data: ' + error.message, 'danger');
    }
}

// Populate portfolio forms with current data
function populatePortfolioForms() {
    // Personal Information
    if (portfolioData.personal) {
        document.getElementById('personalName').value = portfolioData.personal.name || '';
        document.getElementById('personalTitle').value = portfolioData.personal.title || '';
        document.getElementById('personalEmail').value = portfolioData.personal.email || '';
        document.getElementById('personalPhone').value = portfolioData.personal.phone || '';
        document.getElementById('personalLocation').value = portfolioData.personal.location || '';
        document.getElementById('personalLinkedin').value = portfolioData.personal.linkedin || '';
        document.getElementById('personalGithub').value = portfolioData.personal.github || '';
        document.getElementById('personalObjective').value = portfolioData.personal.objective || '';
    }
    
    // Education Information
    if (portfolioData.education) {
        document.getElementById('educationDegree').value = portfolioData.education.degree || '';
        document.getElementById('educationInstitution').value = portfolioData.education.institution || '';
        document.getElementById('educationYear').value = portfolioData.education.graduation_year || '';
        document.getElementById('educationStatus').value = portfolioData.education.status || 'Expected Graduation';
    }
    
    // Skills Information
    if (portfolioData.skills) {
        document.getElementById('programmingSkills').value = portfolioData.skills.programming ? portfolioData.skills.programming.join(', ') : '';
        document.getElementById('dataScienceSkills').value = portfolioData.skills.data_science ? portfolioData.skills.data_science.join(', ') : '';
        document.getElementById('toolsFrameworks').value = portfolioData.skills.tools_frameworks ? portfolioData.skills.tools_frameworks.join(', ') : '';
        document.getElementById('databaseSkills').value = portfolioData.skills.database ? portfolioData.skills.database.join(', ') : '';
    }
    
    // Certifications
    populateCertifications();
}

// Save personal information
async function savePersonalInfo() {
    const personalData = {
        personal: {
            name: document.getElementById('personalName').value,
            title: document.getElementById('personalTitle').value,
            email: document.getElementById('personalEmail').value,
            phone: document.getElementById('personalPhone').value,
            location: document.getElementById('personalLocation').value,
            linkedin: document.getElementById('personalLinkedin').value,
            github: document.getElementById('personalGithub').value,
            objective: document.getElementById('personalObjective').value
        }
    };
    
    try {
        const response = await axios.put('/api/portfolio', personalData);
        if (response.data.success) {
            showAlert('Personal information updated successfully!', 'success');
            portfolioData.personal = response.data.portfolio.personal;
        } else {
            showAlert('Error updating personal information: ' + response.data.error, 'danger');
        }
    } catch (error) {
        showAlert('Error updating personal information: ' + error.message, 'danger');
    }
}

// Save education information
async function saveEducationInfo() {
    const educationData = {
        education: {
            degree: document.getElementById('educationDegree').value,
            institution: document.getElementById('educationInstitution').value,
            graduation_year: document.getElementById('educationYear').value,
            status: document.getElementById('educationStatus').value
        }
    };
    
    try {
        const response = await axios.put('/api/portfolio', educationData);
        if (response.data.success) {
            showAlert('Education information updated successfully!', 'success');
            portfolioData.education = response.data.portfolio.education;
        } else {
            showAlert('Error updating education information: ' + response.data.error, 'danger');
        }
    } catch (error) {
        showAlert('Error updating education information: ' + error.message, 'danger');
    }
}

// Save skills information
async function saveSkillsInfo() {
    const skillsData = {
        skills: {
            programming: document.getElementById('programmingSkills').value.split(',').map(s => s.trim()).filter(s => s),
            data_science: document.getElementById('dataScienceSkills').value.split(',').map(s => s.trim()).filter(s => s),
            tools_frameworks: document.getElementById('toolsFrameworks').value.split(',').map(s => s.trim()).filter(s => s),
            database: document.getElementById('databaseSkills').value.split(',').map(s => s.trim()).filter(s => s)
        }
    };
    
    try {
        const response = await axios.put('/api/portfolio', skillsData);
        if (response.data.success) {
            showAlert('Skills information updated successfully!', 'success');
            portfolioData.skills = response.data.portfolio.skills;
        } else {
            showAlert('Error updating skills information: ' + response.data.error, 'danger');
        }
    } catch (error) {
        showAlert('Error updating skills information: ' + error.message, 'danger');
    }
}

// Populate certifications
function populateCertifications() {
    const container = document.getElementById('certificationsContainer');
    container.innerHTML = '';
    
    if (portfolioData.certifications && portfolioData.certifications.length > 0) {
        portfolioData.certifications.forEach((cert, index) => {
            const certDiv = createCertificationElement(cert, index);
            container.appendChild(certDiv);
        });
    } else {
        container.innerHTML = '<p class="text-muted">No certifications added yet.</p>';
    }
}

// Create certification element
function createCertificationElement(certification, index) {
    const div = document.createElement('div');
    div.className = 'card mb-3';
    div.innerHTML = `
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                    <input type="text" class="form-control certification-input" value="${certification}" data-index="${index}">
                </div>
                <div class="ms-2">
                    <button class="btn btn-sm btn-outline-danger" onclick="removeCertification(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    return div;
}

// Add new certification
function addCertification() {
    if (!portfolioData.certifications) {
        portfolioData.certifications = [];
    }
    portfolioData.certifications.push('New Certification');
    populateCertifications();
    saveCertifications();
}

// Remove certification
function removeCertification(index) {
    if (portfolioData.certifications && index >= 0 && index < portfolioData.certifications.length) {
        portfolioData.certifications.splice(index, 1);
        populateCertifications();
        saveCertifications();
    }
}

// Save certifications
async function saveCertifications() {
    // Collect all certification inputs
    const certInputs = document.querySelectorAll('.certification-input');
    const certifications = Array.from(certInputs).map(input => input.value.trim()).filter(cert => cert);
    
    const certData = {
        certifications: certifications
    };
    
    try {
        const response = await axios.put('/api/portfolio', certData);
        if (response.data.success) {
            portfolioData.certifications = response.data.portfolio.certifications;
            // Don't show alert for auto-save, but update success
        } else {
            showAlert('Error updating certifications: ' + response.data.error, 'danger');
        }
    } catch (error) {
        showAlert('Error updating certifications: ' + error.message, 'danger');
    }
}

// Auto-save certifications when inputs change
document.addEventListener('input', function(e) {
    if (e.target.classList.contains('certification-input')) {
        // Debounce the save operation
        clearTimeout(window.certSaveTimeout);
        window.certSaveTimeout = setTimeout(saveCertifications, 1000);
    }
});

// Global save all portfolio data
async function saveAllPortfolioData() {
    try {
        await savePersonalInfo();
        await saveEducationInfo();
        await saveSkillsInfo();
        await saveCertifications();
        showAlert('All portfolio data saved successfully!', 'success');
    } catch (error) {
        showAlert('Error saving portfolio data: ' + error.message, 'danger');
    }
}

// Export portfolio data
function exportPortfolioData() {
    const dataStr = JSON.stringify(portfolioData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'portfolio-data.json';
    link.click();
    
    showAlert('Portfolio data exported successfully!', 'success');
}

function displayFilteredProjects(projects) {
    const tbody = document.getElementById('projectsTableBody');
    tbody.innerHTML = '';
    
    projects.forEach(project => {
        const row = createProjectRow(project);
        tbody.appendChild(row);
    });
    
    addProjectEventListeners();
}

// Resume preview functionality
function setupResumePreview() {
    const previewBtn = document.getElementById('previewResumeBtn');
    if (previewBtn) {
        previewBtn.addEventListener('click', previewResumeContent);
    }
}

async function previewResumeContent() {
    try {
        const previewBtn = document.getElementById('previewResumeBtn');
        const originalText = previewBtn.innerHTML;
        
        // Show loading state
        previewBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        previewBtn.disabled = true;
        
        const response = await axios.get('/api/resume/preview');
        
        if (response.data.success) {
            displayResumePreview(response.data.resume_data);
        } else {
            showAlert('Error loading resume preview: ' + response.data.error, 'danger');
        }
    } catch (error) {
        showAlert('Error loading resume preview: ' + error.message, 'danger');
    } finally {
        // Reset button state
        const previewBtn = document.getElementById('previewResumeBtn');
        previewBtn.innerHTML = '<i class="fas fa-eye"></i> Preview Resume Content';
        previewBtn.disabled = false;
    }
}

function displayResumePreview(resumeData) {
    const previewContainer = document.getElementById('resumePreview');
    const placeholder = document.getElementById('resumePreviewPlaceholder');
    const contentDiv = document.getElementById('resumeContent');
    
    let html = '';
    
    // Personal Information
    if (resumeData.personal) {
        const personal = resumeData.personal;
        html += `<div class="resume-section mb-4">
            <h5 class="text-info border-bottom pb-2">${personal.name || 'Name'}</h5>
            <p class="mb-1"><strong>${personal.title || 'Title'}</strong></p>
            <p class="mb-1">Email: ${personal.email || 'Not provided'}</p>
            <p class="mb-1">Phone: ${personal.phone || 'Not provided'}</p>
            <p class="mb-1">Location: ${personal.location || 'Not provided'}</p>
            ${personal.linkedin ? `<p class="mb-1">LinkedIn: ${personal.linkedin}</p>` : ''}
            ${personal.github ? `<p class="mb-1">GitHub: ${personal.github}</p>` : ''}
            ${personal.objective ? `<p class="mt-2"><em>${personal.objective}</em></p>` : ''}
        </div>`;
    }
    
    // Education
    if (resumeData.education) {
        const education = resumeData.education;
        html += `<div class="resume-section mb-4">
            <h6 class="text-info border-bottom pb-1">EDUCATION</h6>
            <p class="mb-1"><strong>${education.degree || 'Degree'}</strong></p>
            <p class="mb-1">${education.institution || 'Institution'}</p>
            <p class="mb-1">${education.status || 'Status'}: ${education.graduation_year || 'Year'}</p>
        </div>`;
    }
    
    // Skills
    if (resumeData.skills) {
        html += `<div class="resume-section mb-4">
            <h6 class="text-info border-bottom pb-1">TECHNICAL SKILLS</h6>`;
        
        Object.entries(resumeData.skills).forEach(([category, skills]) => {
            if (skills && skills.length > 0) {
                const categoryName = category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                html += `<p class="mb-1"><strong>${categoryName}:</strong> ${skills.join(', ')}</p>`;
            }
        });
        
        html += `</div>`;
    }
    
    // Projects
    if (resumeData.projects && resumeData.projects.length > 0) {
        html += `<div class="resume-section mb-4">
            <h6 class="text-info border-bottom pb-1">PROJECTS</h6>`;
        
        resumeData.projects.forEach(project => {
            html += `<div class="mb-3">
                <p class="mb-1"><strong>${project.title || 'Project Title'}</strong></p>
                <p class="mb-1">${project.description || 'Description'}</p>
                ${project.technologies ? `<p class="mb-1"><strong>Technologies:</strong> ${project.technologies.join(', ')}</p>` : ''}
                <div class="small text-muted">
                    ${project.github_link ? `GitHub: ${project.github_link}` : ''}
                    ${project.demo_link ? ` | Demo: ${project.demo_link}` : ''}
                </div>
            </div>`;
        });
        
        html += `</div>`;
    }
    
    // Certifications
    if (resumeData.certifications && resumeData.certifications.length > 0) {
        html += `<div class="resume-section mb-4">
            <h6 class="text-info border-bottom pb-1">CERTIFICATIONS</h6>
            <ul class="mb-0">`;
        
        resumeData.certifications.forEach(cert => {
            html += `<li>${cert}</li>`;
        });
        
        html += `</ul></div>`;
    }
    
    contentDiv.innerHTML = html;
    
    // Show preview and hide placeholder
    placeholder.style.display = 'none';
    previewContainer.style.display = 'block';
    
    showAlert('Resume preview loaded successfully!', 'success');
}
