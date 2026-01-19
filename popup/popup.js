// Field configuration
const fields = {
    personal: [
        { id: 'firstName', label: 'First Name' },
        { id: 'lastName', label: 'Last Name' },
        { id: 'fullName', label: 'Full Name' },
        { id: 'email', label: 'Email' },
        { id: 'phone', label: 'Phone' },
        { id: 'address', label: 'Address' },
        { id: 'city', label: 'City' },
        { id: 'state', label: 'State' },
        { id: 'zip', label: 'ZIP Code' },
        { id: 'country', label: 'Country' },
    ],
    links: [
        { id: 'linkedin', label: 'LinkedIn' },
        { id: 'portfolio', label: 'Portfolio' },
        { id: 'github', label: 'GitHub' },
        { id: 'otherLink', label: 'Other Link' },
    ],
    work: [
        { id: 'jobTitle', label: 'Job Title' },
        { id: 'company', label: 'Company' },
        { id: 'startDate', label: 'Start Date' },
        { id: 'endDate', label: 'End Date' },
        { id: 'jobDescription', label: 'Job Description', multiline: true },
    ],
    education: [
        { id: 'school', label: 'School' },
        { id: 'degree', label: 'Degree' },
        { id: 'field', label: 'Field of Study' },
        { id: 'gradYear', label: 'Grad Year' },
        { id: 'gpa', label: 'GPA' },
    ],
    additional: [
        { id: 'skills', label: 'Skills', multiline: true },
        { id: 'coverLetter', label: 'Cover Letter', multiline: true },
        { id: 'salary', label: 'Salary' },
        { id: 'availability', label: 'Availability' },
        { id: 'authorization', label: 'Work Auth' },
        { id: 'experience', label: 'Experience' },
    ]
};

const categoryNames = {
    personal: '👤 Personal',
    links: '🔗 Links',
    work: '💼 Work',
    education: '🎓 Education',
    additional: '⭐ Additional'
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEventListeners();
});

function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(`${tab.dataset.tab}-section`).classList.add('active');
        });
    });

    // Save button
    document.getElementById('saveBtn').addEventListener('click', saveData);

    // Autofill button
    document.getElementById('autofillBtn').addEventListener('click', triggerAutofill);

    // Auto-save on input
    document.querySelectorAll('input, textarea').forEach(el => {
        el.addEventListener('input', () => {
            clearTimeout(el.saveTimeout);
            el.saveTimeout = setTimeout(() => {
                saveData();
            }, 1000);
        });
    });
}

// Load saved data from Chrome storage
function loadData() {
    chrome.storage.sync.get('fillerData', (result) => {
        const data = result.fillerData || {};
        Object.keys(data).forEach(key => {
            const el = document.getElementById(key);
            if (el) el.value = data[key];
        });
        renderCopySection();
    });
}

// Save data to Chrome storage
function saveData() {
    const data = {};
    Object.values(fields).flat().forEach(field => {
        const el = document.getElementById(field.id);
        if (el) data[field.id] = el.value;
    });
    
    chrome.storage.sync.set({ fillerData: data }, () => {
        showToast('Saved successfully!');
        renderCopySection();
    });
}

// Trigger autofill on current page
async function triggerAutofill() {
    const btn = document.getElementById('autofillBtn');
    const status = document.getElementById('autofillStatus');
    
    btn.classList.add('loading');
    btn.querySelector('.autofill-text').textContent = 'Filling...';
    status.textContent = '';
    status.className = 'autofill-status';

    try {
        // Get the current active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab) {
            throw new Error('No active tab found');
        }

        // Get stored data
        const result = await chrome.storage.sync.get('fillerData');
        const data = result.fillerData || {};

        // Send message to content script
        const response = await chrome.tabs.sendMessage(tab.id, {
            action: 'autofill',
            data: data
        });

        if (response && response.success) {
            status.textContent = `✓ Filled ${response.filledCount} field${response.filledCount !== 1 ? 's' : ''}`;
            status.className = 'autofill-status success';
        } else {
            status.textContent = response?.message || 'No fields found to fill';
            status.className = 'autofill-status';
        }
    } catch (error) {
        console.error('Autofill error:', error);
        status.textContent = 'Could not access this page';
        status.className = 'autofill-status error';
    }

    btn.classList.remove('loading');
    btn.querySelector('.autofill-text').textContent = 'Autofill This Page';
}

// Render copy section
function renderCopySection() {
    chrome.storage.sync.get('fillerData', (result) => {
        const data = result.fillerData || {};
        const container = document.getElementById('copy-content');
        
        // Check if any data exists
        const hasData = Object.values(data).some(v => v && v.trim());
        
        if (!hasData) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📝</div>
                    <h3>No information saved yet</h3>
                    <p>Switch to "Edit Info" to add your details</p>
                </div>
            `;
            return;
        }

        let html = '';
        
        Object.entries(fields).forEach(([category, categoryFields]) => {
            const filledFields = categoryFields.filter(f => data[f.id]?.trim());
            if (filledFields.length === 0) return;

            html += `<div class="copy-category">${categoryNames[category]}</div>`;
            html += '<div class="copy-grid">';
            
            filledFields.forEach(field => {
                const value = data[field.id];
                html += `
                    <div class="copy-item">
                        <span class="copy-label">${field.label}</span>
                        <span class="copy-value ${field.multiline ? 'multiline' : ''}">${escapeHtml(value)}</span>
                        <button class="copy-btn" data-field="${field.id}">
                            <span>📋</span> Copy
                        </button>
                    </div>
                `;
            });
            
            html += '</div>';
        });

        container.innerHTML = html;

        // Add click handlers for copy buttons
        container.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', () => copyToClipboard(btn.dataset.field, btn));
        });
    });
}

// Copy to clipboard
async function copyToClipboard(fieldId, btn) {
    const result = await chrome.storage.sync.get('fillerData');
    const data = result.fillerData || {};
    const value = data[fieldId];
    
    try {
        await navigator.clipboard.writeText(value);
        btn.classList.add('copied');
        btn.innerHTML = '<span>✓</span> Copied!';
        
        setTimeout(() => {
            btn.classList.remove('copied');
            btn.innerHTML = '<span>📋</span> Copy';
        }, 1500);
    } catch (err) {
        showToast('Failed to copy');
    }
}

// Show toast notification
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

