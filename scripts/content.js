// Filler - Content Script
// This script runs on all web pages and handles form detection and autofilling

// Field mappings: maps our stored data keys to common form field identifiers
const fieldMappings = {
    firstName: {
        names: ['firstname', 'first_name', 'first-name', 'fname', 'givenname', 'given_name', 'given-name'],
        autocomplete: ['given-name'],
        labels: ['first name', 'given name', 'nombre'],
        placeholders: ['first name', 'john']
    },
    lastName: {
        names: ['lastname', 'last_name', 'last-name', 'lname', 'surname', 'familyname', 'family_name', 'family-name'],
        autocomplete: ['family-name'],
        labels: ['last name', 'surname', 'family name', 'apellido'],
        placeholders: ['last name', 'doe']
    },
    fullName: {
        names: ['fullname', 'full_name', 'full-name', 'name', 'yourname', 'your_name', 'your-name', 'applicantname'],
        autocomplete: ['name'],
        labels: ['full name', 'your name', 'name', 'legal name'],
        placeholders: ['full name', 'your name', 'john doe']
    },
    email: {
        names: ['email', 'e-mail', 'emailaddress', 'email_address', 'email-address', 'useremail', 'mail'],
        autocomplete: ['email'],
        labels: ['email', 'e-mail', 'email address'],
        placeholders: ['email', 'you@example.com', 'your email']
    },
    phone: {
        names: ['phone', 'telephone', 'tel', 'phonenumber', 'phone_number', 'phone-number', 'mobile', 'cell', 'cellphone', 'primaryphone'],
        autocomplete: ['tel', 'tel-national'],
        labels: ['phone', 'telephone', 'mobile', 'cell', 'phone number', 'contact number'],
        placeholders: ['phone', '555', 'xxx-xxx']
    },
    address: {
        names: ['address', 'streetaddress', 'street_address', 'street-address', 'address1', 'address_1', 'addressline1', 'street'],
        autocomplete: ['street-address', 'address-line1'],
        labels: ['address', 'street address', 'street', 'address line 1'],
        placeholders: ['address', 'street', '123 main']
    },
    city: {
        names: ['city', 'locality', 'town', 'addresscity', 'address_city'],
        autocomplete: ['address-level2'],
        labels: ['city', 'town', 'locality'],
        placeholders: ['city', 'san francisco', 'new york']
    },
    state: {
        names: ['state', 'province', 'region', 'addressstate', 'address_state', 'stateprovince'],
        autocomplete: ['address-level1'],
        labels: ['state', 'province', 'region', 'state/province'],
        placeholders: ['state', 'california', 'province']
    },
    zip: {
        names: ['zip', 'zipcode', 'zip_code', 'zip-code', 'postalcode', 'postal_code', 'postal-code', 'postcode'],
        autocomplete: ['postal-code'],
        labels: ['zip', 'zip code', 'postal code', 'postcode'],
        placeholders: ['zip', 'postal', '12345', '94102']
    },
    country: {
        names: ['country', 'countryname', 'country_name', 'country-name', 'nation'],
        autocomplete: ['country-name', 'country'],
        labels: ['country', 'nation'],
        placeholders: ['country', 'united states']
    },
    linkedin: {
        names: ['linkedin', 'linkedinurl', 'linkedin_url', 'linkedin-url', 'linkedinprofile'],
        autocomplete: [],
        labels: ['linkedin', 'linkedin url', 'linkedin profile'],
        placeholders: ['linkedin', 'linkedin.com']
    },
    portfolio: {
        names: ['portfolio', 'website', 'personalwebsite', 'personal_website', 'portfoliourl', 'homepage', 'url'],
        autocomplete: ['url'],
        labels: ['portfolio', 'website', 'personal website', 'your website', 'homepage'],
        placeholders: ['portfolio', 'website', 'https://']
    },
    github: {
        names: ['github', 'githuburl', 'github_url', 'github-url', 'githubprofile'],
        autocomplete: [],
        labels: ['github', 'github url', 'github profile'],
        placeholders: ['github', 'github.com']
    },
    jobTitle: {
        names: ['jobtitle', 'job_title', 'job-title', 'currenttitle', 'current_title', 'title', 'position', 'currentposition'],
        autocomplete: ['organization-title'],
        labels: ['job title', 'current title', 'title', 'position', 'current position', 'role'],
        placeholders: ['job title', 'software engineer', 'your title']
    },
    company: {
        names: ['company', 'companyname', 'company_name', 'company-name', 'employer', 'currentemployer', 'current_employer', 'organization', 'currentcompany'],
        autocomplete: ['organization'],
        labels: ['company', 'employer', 'current employer', 'organization', 'current company', 'company name'],
        placeholders: ['company', 'acme', 'your company']
    },
    school: {
        names: ['school', 'university', 'college', 'schoolname', 'school_name', 'institution', 'educationinstitution', 'alma_mater'],
        autocomplete: [],
        labels: ['school', 'university', 'college', 'institution', 'school name'],
        placeholders: ['school', 'university', 'stanford']
    },
    degree: {
        names: ['degree', 'degreetype', 'degree_type', 'education', 'educationlevel', 'education_level', 'qualification'],
        autocomplete: [],
        labels: ['degree', 'education', 'qualification', 'degree type'],
        placeholders: ['degree', 'bachelor', 'master']
    },
    field: {
        names: ['field', 'fieldofstudy', 'field_of_study', 'major', 'concentration', 'specialization', 'studyfield'],
        autocomplete: [],
        labels: ['field of study', 'major', 'concentration', 'specialization', 'area of study'],
        placeholders: ['field', 'computer science', 'major']
    },
    gradYear: {
        names: ['gradyear', 'grad_year', 'graduationyear', 'graduation_year', 'graduation-year', 'yearofgraduation', 'endyear'],
        autocomplete: [],
        labels: ['graduation year', 'year of graduation', 'grad year', 'year graduated'],
        placeholders: ['year', '2020', '2024']
    },
    gpa: {
        names: ['gpa', 'grade', 'gradepoint', 'grade_point', 'gradepointaverage'],
        autocomplete: [],
        labels: ['gpa', 'grade point average', 'cumulative gpa'],
        placeholders: ['gpa', '3.5', '4.0']
    },
    skills: {
        names: ['skills', 'skill', 'skillset', 'skill_set', 'competencies', 'expertise', 'technicalskills'],
        autocomplete: [],
        labels: ['skills', 'skill set', 'competencies', 'technical skills', 'key skills'],
        placeholders: ['skills', 'javascript', 'python']
    },
    coverLetter: {
        names: ['coverletter', 'cover_letter', 'cover-letter', 'coverlettertext', 'letter', 'applicationletter'],
        autocomplete: [],
        labels: ['cover letter', 'application letter', 'letter of interest'],
        placeholders: ['cover letter', 'dear hiring', 'i am writing']
    },
    salary: {
        names: ['salary', 'salaryexpectation', 'salary_expectation', 'expectedsalary', 'expected_salary', 'compensation', 'desiredsalary'],
        autocomplete: [],
        labels: ['salary', 'expected salary', 'desired salary', 'salary expectation', 'compensation'],
        placeholders: ['salary', '$', '100000']
    },
    availability: {
        names: ['availability', 'startdate', 'start_date', 'availabledate', 'available_date', 'noticePeriod', 'notice_period'],
        autocomplete: [],
        labels: ['availability', 'start date', 'available from', 'notice period', 'when can you start'],
        placeholders: ['availability', 'immediately', '2 weeks']
    },
    authorization: {
        names: ['authorization', 'workauthorization', 'work_authorization', 'workpermit', 'work_permit', 'eligibility'],
        autocomplete: [],
        labels: ['work authorization', 'authorized to work', 'work permit', 'work eligibility', 'legally authorized'],
        placeholders: ['authorization', 'authorized', 'visa']
    },
    experience: {
        names: ['experience', 'yearsofexperience', 'years_of_experience', 'yearsexperience', 'totalexperience', 'workexperience'],
        autocomplete: [],
        labels: ['years of experience', 'experience', 'total experience', 'work experience', 'how many years'],
        placeholders: ['experience', 'years', '5']
    }
};

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'autofill') {
        const result = autofillPage(request.data);
        sendResponse(result);
    }
    return true; // Keep the message channel open for async response
});

// Main autofill function
function autofillPage(userData) {
    const inputs = document.querySelectorAll('input, textarea, select');
    let filledCount = 0;
    const filledFields = [];

    inputs.forEach(input => {
        // Skip hidden, disabled, readonly, or already filled fields
        if (input.type === 'hidden' || 
            input.type === 'submit' || 
            input.type === 'button' ||
            input.type === 'file' ||
            input.type === 'checkbox' ||
            input.type === 'radio' ||
            input.disabled || 
            input.readOnly) {
            return;
        }

        // Try to match this input to our stored data
        const match = findBestMatch(input, userData);
        
        if (match && userData[match]) {
            fillField(input, userData[match]);
            filledCount++;
            filledFields.push(match);
        }
    });

    // Also try to fill custom dropdown components (React Select, Material UI, etc.)
    const customFilled = fillCustomDropdowns(userData);
    filledCount += customFilled;

    return {
        success: filledCount > 0,
        filledCount: filledCount,
        filledFields: filledFields,
        message: filledCount > 0 ? `Filled ${filledCount} fields` : 'No matching fields found'
    };
}

// Find the best matching data key for an input
function findBestMatch(input, userData) {
    const inputName = (input.name || '').toLowerCase().replace(/[\s_-]/g, '');
    const inputId = (input.id || '').toLowerCase().replace(/[\s_-]/g, '');
    const inputAutocomplete = (input.autocomplete || '').toLowerCase();
    const inputPlaceholder = (input.placeholder || '').toLowerCase();
    const inputAriaLabel = (input.getAttribute('aria-label') || '').toLowerCase();
    
    // Get associated label text
    const labelText = getAssociatedLabel(input).toLowerCase();

    // Score each possible field
    let bestMatch = null;
    let bestScore = 0;

    for (const [fieldKey, mapping] of Object.entries(fieldMappings)) {
        // Skip if we don't have data for this field
        if (!userData[fieldKey]) continue;

        let score = 0;

        // Check name attribute (highest priority)
        if (mapping.names.some(n => inputName.includes(n.replace(/[\s_-]/g, '')))) {
            score += 100;
        }

        // Check id attribute
        if (mapping.names.some(n => inputId.includes(n.replace(/[\s_-]/g, '')))) {
            score += 90;
        }

        // Check autocomplete attribute (very reliable)
        if (mapping.autocomplete.some(ac => inputAutocomplete === ac || inputAutocomplete.includes(ac))) {
            score += 95;
        }

        // Check label text
        if (mapping.labels.some(l => labelText.includes(l))) {
            score += 80;
        }

        // Check aria-label
        if (mapping.labels.some(l => inputAriaLabel.includes(l))) {
            score += 75;
        }

        // Check placeholder
        if (mapping.placeholders.some(p => inputPlaceholder.includes(p))) {
            score += 60;
        }

        // Update best match if this score is higher
        if (score > bestScore) {
            bestScore = score;
            bestMatch = fieldKey;
        }
    }

    // Only return a match if we have a confident score
    return bestScore >= 60 ? bestMatch : null;
}

// Get the associated label text for an input
function getAssociatedLabel(input) {
    // Check for explicit label via 'for' attribute
    if (input.id) {
        const label = document.querySelector(`label[for="${input.id}"]`);
        if (label) return label.textContent || '';
    }

    // Check for wrapping label
    const parentLabel = input.closest('label');
    if (parentLabel) {
        return parentLabel.textContent || '';
    }

    // Check for nearby label (sibling or parent's children)
    const parent = input.parentElement;
    if (parent) {
        const nearbyLabel = parent.querySelector('label');
        if (nearbyLabel) return nearbyLabel.textContent || '';
        
        // Check for spans or divs that might act as labels
        const labelLike = parent.querySelector('span, div');
        if (labelLike && labelLike.textContent.length < 50) {
            return labelLike.textContent || '';
        }
    }

    // Check previous sibling
    const prevSibling = input.previousElementSibling;
    if (prevSibling && prevSibling.tagName === 'LABEL') {
        return prevSibling.textContent || '';
    }

    return '';
}

// Common abbreviation mappings for states/countries
const stateAbbreviations = {
    'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
    'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
    'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
    'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
    'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
    'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
    'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH',
    'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
    'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
    'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY',
    'district of columbia': 'DC'
};

const countryAbbreviations = {
    'united states': ['US', 'USA', 'United States of America'],
    'united kingdom': ['UK', 'GB', 'Great Britain'],
    'canada': ['CA', 'CAN'],
    'australia': ['AU', 'AUS'],
    'germany': ['DE', 'DEU'],
    'france': ['FR', 'FRA'],
    'india': ['IN', 'IND'],
    'china': ['CN', 'CHN'],
    'japan': ['JP', 'JPN']
};

// Degree/education level mappings
const degreeAbbreviations = {
    // High School variations
    'high school': ['hs', 'high school diploma', 'ged', 'secondary', 'high school graduate'],
    'high school diploma': ['hs', 'high school', 'ged', 'secondary'],
    
    // Associate variations
    'associate': ['aa', 'as', 'aas', "associate's", "associate's degree", 'associates', 'associates degree', '2 year', '2-year'],
    "associate's degree": ['aa', 'as', 'associate', 'associates'],
    
    // Bachelor variations
    'bachelor': ['ba', 'bs', 'bsc', 'bfa', 'bba', "bachelor's", "bachelor's degree", 'bachelors', 'bachelors degree', 'undergraduate', '4 year', '4-year', 'bachelor of science', 'bachelor of arts'],
    "bachelor's degree": ['ba', 'bs', 'bachelor', 'bachelors', 'bsc', 'undergraduate'],
    'bachelor of science': ['bs', 'bsc', 'bachelor', "bachelor's"],
    'bachelor of arts': ['ba', 'bachelor', "bachelor's"],
    
    // Master variations
    'master': ['ma', 'ms', 'msc', 'mba', 'mfa', "master's", "master's degree", 'masters', 'masters degree', 'graduate', 'master of science', 'master of arts', 'master of business'],
    "master's degree": ['ma', 'ms', 'master', 'masters', 'msc', 'mba', 'graduate'],
    'master of science': ['ms', 'msc', 'master', "master's"],
    'master of arts': ['ma', 'master', "master's"],
    'mba': ['master of business', 'master', "master's", 'masters'],
    
    // Doctorate variations
    'doctorate': ['phd', 'ph.d', 'ph.d.', 'doctoral', 'doctor', 'md', 'jd', 'edd', 'doctor of philosophy'],
    'phd': ['doctorate', 'doctoral', 'ph.d', 'ph.d.', 'doctor of philosophy'],
    'doctor of philosophy': ['phd', 'ph.d', 'doctorate', 'doctoral']
};

// Find best matching option in a select element
function findBestSelectOption(options, value) {
    const valueLower = value.toLowerCase().trim();
    
    // Priority 1: Exact match on value or text
    let match = options.find(opt => 
        opt.value.toLowerCase().trim() === valueLower ||
        opt.text.toLowerCase().trim() === valueLower
    );
    if (match) return match;
    
    // Priority 2: Check state abbreviations
    const stateAbbr = stateAbbreviations[valueLower];
    if (stateAbbr) {
        match = options.find(opt => 
            opt.value.toUpperCase() === stateAbbr ||
            opt.text.toUpperCase() === stateAbbr
        );
        if (match) return match;
    }
    
    // Priority 2b: Reverse lookup - value is an abbreviation
    const fullStateName = Object.entries(stateAbbreviations).find(([name, abbr]) => 
        abbr.toLowerCase() === valueLower
    );
    if (fullStateName) {
        match = options.find(opt => 
            opt.text.toLowerCase().includes(fullStateName[0]) ||
            opt.value.toLowerCase().includes(fullStateName[0])
        );
        if (match) return match;
    }
    
    // Priority 3: Check country abbreviations
    for (const [country, abbrs] of Object.entries(countryAbbreviations)) {
        if (country === valueLower || abbrs.some(a => a.toLowerCase() === valueLower)) {
            match = options.find(opt => {
                const optVal = opt.value.toLowerCase();
                const optText = opt.text.toLowerCase();
                return optVal === country || optText === country ||
                       abbrs.some(a => optVal === a.toLowerCase() || optText === a.toLowerCase());
            });
            if (match) return match;
        }
    }
    
    // Priority 3b: Check degree/education abbreviations
    for (const [degree, variations] of Object.entries(degreeAbbreviations)) {
        // Check if our value matches this degree or any of its variations
        if (degree === valueLower || variations.some(v => v.toLowerCase() === valueLower)) {
            // Try to find an option that matches the degree or any variation
            match = options.find(opt => {
                const optVal = opt.value.toLowerCase();
                const optText = opt.text.toLowerCase();
                // Check if option matches the canonical degree name
                if (optVal.includes(degree) || optText.includes(degree)) return true;
                // Check if option matches any variation
                return variations.some(v => optVal.includes(v.toLowerCase()) || optText.includes(v.toLowerCase()));
            });
            if (match) return match;
        }
    }
    
    // Priority 4: Partial match (text contains value or value contains text)
    match = options.find(opt => {
        const optText = opt.text.toLowerCase().trim();
        const optValue = opt.value.toLowerCase().trim();
        return (optText.includes(valueLower) || valueLower.includes(optText)) ||
               (optValue.includes(valueLower) || valueLower.includes(optValue));
    });
    if (match) return match;
    
    // Priority 5: Word-based matching (any word matches)
    const valueWords = valueLower.split(/\s+/);
    match = options.find(opt => {
        const optText = opt.text.toLowerCase();
        return valueWords.some(word => word.length > 2 && optText.includes(word));
    });
    
    return match;
}

// Fill a field with value
function fillField(input, value) {
    // Focus the input
    input.focus();

    if (input.tagName === 'SELECT') {
        // For select elements, try to find matching option
        const options = Array.from(input.options);
        const match = findBestSelectOption(options, value);
        
        if (match) {
            // Set the selected index for better compatibility
            input.selectedIndex = match.index;
            input.value = match.value;
            
            // Trigger select-specific events
            triggerSelectEvents(input);
        }
    } else {
        // For regular inputs and textareas
        input.value = value;
        // Trigger events to notify frameworks (React, Angular, Vue, etc.)
        triggerInputEvents(input);
    }

    // Blur to trigger validation
    input.blur();
}

// Trigger events specifically for select elements
function triggerSelectEvents(select) {
    // Dispatch change event (most important for selects)
    const changeEvent = new Event('change', { bubbles: true, cancelable: true });
    select.dispatchEvent(changeEvent);
    
    // Also dispatch input event for some frameworks
    const inputEvent = new Event('input', { bubbles: true, cancelable: true });
    select.dispatchEvent(inputEvent);
    
    // For React synthetic events
    const nativeSelectValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLSelectElement.prototype,
        'value'
    )?.set;
    
    if (nativeSelectValueSetter) {
        nativeSelectValueSetter.call(select, select.value);
        select.dispatchEvent(new Event('change', { bubbles: true }));
    }
}

// Trigger input events for framework compatibility
function triggerInputEvents(input) {
    // Create and dispatch events
    const events = ['input', 'change', 'blur'];
    
    events.forEach(eventType => {
        const event = new Event(eventType, { bubbles: true, cancelable: true });
        input.dispatchEvent(event);
    });

    // For React specifically
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
    )?.set;
    
    const nativeTextareaValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value'
    )?.set;

    if (input.tagName === 'INPUT' && nativeInputValueSetter) {
        nativeInputValueSetter.call(input, input.value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (input.tagName === 'TEXTAREA' && nativeTextareaValueSetter) {
        nativeTextareaValueSetter.call(input, input.value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }
}

// Handle custom dropdown components (React Select, Material UI, Ant Design, etc.)
function fillCustomDropdowns(userData) {
    let filledCount = 0;
    
    // Common custom dropdown selectors
    const customDropdownSelectors = [
        // React Select
        '[class*="react-select"]',
        '[class*="Select__control"]',
        // Material UI
        '[class*="MuiSelect"]',
        '[class*="MuiAutocomplete"]',
        // Ant Design
        '[class*="ant-select"]',
        // Headless UI / Tailwind
        '[role="listbox"]',
        '[role="combobox"]',
        // Generic patterns
        '[class*="dropdown"]',
        '[class*="Dropdown"]',
        '[class*="select-container"]'
    ];
    
    customDropdownSelectors.forEach(selector => {
        try {
            document.querySelectorAll(selector).forEach(dropdown => {
                // Try to find associated label or identify the field
                const match = identifyCustomDropdown(dropdown, userData);
                if (match && userData[match]) {
                    fillCustomDropdown(dropdown, userData[match]);
                    filledCount++;
                }
            });
        } catch (e) {
            // Ignore errors for selectors that don't match
        }
    });
    
    return filledCount;
}

// Identify what field a custom dropdown corresponds to
function identifyCustomDropdown(dropdown, userData) {
    // Check aria-label, data attributes, nearby labels
    const ariaLabel = (dropdown.getAttribute('aria-label') || '').toLowerCase();
    const id = (dropdown.id || '').toLowerCase();
    const name = (dropdown.getAttribute('name') || '').toLowerCase();
    
    // Check for associated label
    const container = dropdown.closest('div[class*="form"], div[class*="field"], label');
    const labelText = container ? container.textContent.toLowerCase() : '';
    
    for (const [fieldKey, mapping] of Object.entries(fieldMappings)) {
        if (!userData[fieldKey]) continue;
        
        // Check various attributes
        if (mapping.names.some(n => id.includes(n) || name.includes(n) || ariaLabel.includes(n))) {
            return fieldKey;
        }
        
        if (mapping.labels.some(l => labelText.includes(l))) {
            return fieldKey;
        }
    }
    
    return null;
}

// Fill a custom dropdown component
function fillCustomDropdown(dropdown, value) {
    // Try clicking to open the dropdown
    const clickable = dropdown.querySelector('input, [class*="control"], [class*="trigger"], button') || dropdown;
    
    // Simulate click to open
    clickable.click();
    clickable.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    
    // Wait a bit for dropdown to open, then try to find and click the matching option
    setTimeout(() => {
        // Look for options in various locations
        const optionSelectors = [
            '[class*="option"]',
            '[class*="Option"]',
            '[role="option"]',
            '[class*="menu-item"]',
            '[class*="MenuItem"]',
            'li'
        ];
        
        // Check in dropdown itself and in document (some dropdowns portal to body)
        const searchAreas = [dropdown, document.body];
        const valueLower = value.toLowerCase();
        
        for (const area of searchAreas) {
            for (const selector of optionSelectors) {
                const options = area.querySelectorAll(selector);
                for (const option of options) {
                    const optionText = option.textContent.toLowerCase().trim();
                    if (optionText === valueLower || 
                        optionText.includes(valueLower) || 
                        valueLower.includes(optionText)) {
                        option.click();
                        return;
                    }
                }
            }
        }
        
        // If we have an input, try typing the value
        const input = dropdown.querySelector('input');
        if (input) {
            input.value = value;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }, 100);
}

// Log that content script is loaded (for debugging)
console.log('Filler content script loaded');

