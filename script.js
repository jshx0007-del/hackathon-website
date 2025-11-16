/**
 * script.js
 * Contains client-side functionality for all pages:
 * 1. Form submission handling (simulated success/error)
 * 2. Basic client-side validation
 */

document.addEventListener('DOMContentLoaded', () => {
    // Select the form element on the current page
    const form = document.querySelector('form');

    if (form) {
        form.addEventListener('submit', handleFormSubmission);
    }
});

/**
 * Handles the submission for all forms on the site.
 * It prevents the default submission, validates, and simulates a server response.
 * @param {Event} event - The form submission event.
 */
function handleFormSubmission(event) {
    event.preventDefault();

    const form = event.target;
    // Get the action URL to determine what kind of form it is (submit or track)
    const actionUrl = form.getAttribute('action');
    
    // --- Basic Client-Side Validation ---
    // Check if all required fields have values
    const requiredInputs = form.querySelectorAll('[required]');
    let isValid = true;

    requiredInputs.forEach(input => {
        if (!input.value.trim()) {
            // Simple visual feedback for empty fields
            input.style.border = '2px solid red';
            isValid = false;
        } else {
            input.style.border = '2px solid #e5e7eb'; // Reset to default border
        }
    });

    if (!isValid) {
        alert('Please fill in all required fields before submitting.');
        return;
    }
    // --- End Validation ---

    // Disable the button to prevent multiple submissions
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.textContent = 'Processing...';
        submitButton.disabled = true;
    }

    // --- Simulate Server Response ---
    // In a real application, you would use 'fetch' here to send data to the server.
    // Example: fetch(actionUrl, { method: 'POST', body: new FormData(form) }).then(...)
    
    console.log('Form data being sent:', Object.fromEntries(new FormData(form).entries()));

    // Simulate a network delay
    setTimeout(() => {
        if (actionUrl.includes('submit_complaint.php')) {
            // Logic for Anonymous or User ID Complaint Forms
            const complaintID = generateComplaintID();
            displaySubmissionSuccess(form, complaintID);
            
        } else if (actionUrl.includes('track_complaint.php')) {
            // Logic for Track Complaint Form
            const complaintIdInput = form.querySelector('#complaintid');
            displayTrackingResult(complaintIdInput.value);
        }

        // Re-enable the button after simulation
        if (submitButton) {
            submitButton.textContent = 'Submitted!'; // Temporary text change
            setTimeout(() => {
                 submitButton.textContent = (actionUrl.includes('submit_complaint.php')) ? 'Submit Complaint' : 'Track Complaint';
                 submitButton.disabled = false;
            }, 3000); // Revert button text after 3 seconds
        }

    }, 1500); // 1.5 second delay
}

/**
 * Generates a simple, simulated complaint ID.
 * @returns {string} The generated ID.
 */
function generateComplaintID() {
    return 'C-' + Math.random().toString(36).substring(2, 9).toUpperCase();
}

/**
 * Updates the form UI to show a successful submission message.
 * @param {HTMLElement} formElement - The form that was submitted.
 * @param {string} complaintId - The simulated complaint ID.
 */
function displaySubmissionSuccess(formElement, complaintId) {
    const container = formElement.closest('.container');
    if (!container) return;

    // Clear existing content and display a success message
    container.innerHTML = `
        <h2>✅ Submission Successful!</h2>
        <p class="note" style="color: #10b981; font-size: 1.1em;">
            Thank you for submitting your complaint.
        </p>
        <div style="background: #e0f2f1; padding: 20px; border-radius: 10px; margin-top: 20px; text-align: center;">
            <p style="font-size: 1.2em; font-weight: 600; color: #0f766e; margin-bottom: 5px;">Your Complaint ID is:</p>
            <p style="font-size: 2.2em; font-weight: 700; color: #047857; margin: 0;">${complaintId}</p>
            <p style="font-size: 0.9em; color: #0d9488; margin-top: 5px;">Please save this ID to track the status of your complaint.</p>
        </div>
        <a class="Return" href="index.html" style="margin-top: 30px;">&larr; Return to Home Page</a>
    `;
}

/**
 * Simulates checking the complaint status and displays the result.
 * @param {string} complaintId - The ID entered by the user.
 */
function displayTrackingResult(complaintId) {
    const formElement = document.querySelector('form');
    const noteElement = document.querySelector('.note');
    
    // Simulate lookup based on the ID (simple demo logic)
    const status = (complaintId.toUpperCase().includes('C-')) 
        ? 'In Progress (Review Assigned)' 
        : 'Invalid ID / Not Found';
    const color = (status.includes('In Progress')) ? '#2563eb' : '#ef4444';
    
    // Update the note element to show the status
    if (noteElement) {
        noteElement.innerHTML = `
            <p style="font-size: 1em; color: ${color}; font-weight: 600;">Status for ID ${complaintId}: ${status}</p>
        `;
    }
    
    // Clear the input field for a new check
    const inputField = formElement.querySelector('#complaintid');
    if(inputField) {
        inputField.value = '';
    }
}
