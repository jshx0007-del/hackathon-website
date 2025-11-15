// script.js — single frontend driver for all forms
console.log("SCRIPT LOADED");

const API_BASE_URL = "http://127.0.0.1:5000/api"; // make sure backend is running here

document.addEventListener("DOMContentLoaded", () => {
  const forms = document.querySelectorAll("form");
  forms.forEach(f => f.addEventListener("submit", handleFormSubmission));
});

async function handleFormSubmission(e) {
  e.preventDefault();
  const form = e.target;

  // identify track form if it contains an input with id complaintid
  const isTrackForm = !!form.querySelector("#complaintid");

  // gather required inputs and validate
  const requiredInputs = form.querySelectorAll("[required]");
  let valid = true;
  requiredInputs.forEach(i => {
    if (!i.value.trim()) {
      i.style.border = "2px solid red";
      valid = false;
    } else {
      i.style.border = "2px solid #e5e7eb";
    }
  });
  if (!valid) {
    alert("Please fill all required fields.");
    return;
  }

  // UI - disable button
  const btn = form.querySelector("button[type='submit']");
  if (btn) { btn.disabled = true; btn.dataset.origText = btn.innerText; btn.innerText = "Processing..."; }

  try {
    if (isTrackForm) {
      // tracking form
      const id = form.querySelector("#complaintid").value.trim();
      const resp = await fetch(`${API_BASE_URL}/complaints/${encodeURIComponent(id)}`);
      if (!resp.ok) {
        alert("Complaint not found.");
      } else {
        const data = await resp.json();
        // show status in a friendly alert or write to .note element if present
        const note = form.querySelector(".note") || document.querySelector(".note");
        const statusText = `Status: ${data.status || 'N/A'}\nMessage: ${data.text || '(no message)'}`;
        if (note) {
          note.innerHTML = `<p style="color:#2563eb;font-weight:600">${statusText.replace(/\n/g, "<br>")}</p>`;
        } else {
          alert(statusText);
        }
      }
    } else {
      // submission form — build payload from fields
      const payload = {};
      const fdata = new FormData(form);
      fdata.forEach((v,k) => payload[k] = v);

      // legacy mapping: if front-end uses "complaint" field, map to text
      if (payload['complaint'] && !payload['text']) {
        payload['text'] = payload['complaint'];
        delete payload['complaint'];
      }

      // send to API
      const resp = await fetch(`${API_BASE_URL}/complaints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const body = await resp.json().catch(()=>null);
      if (!resp.ok) {
        alert("Error: " + (body && body.error ? body.error : resp.status));
      } else {
        // show success UI — replace the form container with success message
        showSuccessUI(form, body.tracking_id || "(no-id)");
      }
    }

  } catch (err) {
    console.error("Network or server error:", err);
    alert("Could not reach the server. Is the backend running (http://127.0.0.1:5000)?");
  } finally {
    if (btn) {
      setTimeout(() => {
        btn.disabled = false;
        btn.innerText = btn.dataset.origText || "Submit";
      }, 800);
    }
  }
}

function showSuccessUI(form, trackingId) {
  const container = form.closest(".container") || form.parentElement;
  if (!container) {
    alert("Complaint submitted. ID: " + trackingId);
    return;
  }
  container.innerHTML = `
    <h2>✅ Submission Successful!</h2>
    <p class="note" style="color:#10b981;font-size:1.05em">Thank you — your complaint was received.</p>
    <div style="background:#e0f2f1;padding:18px;border-radius:10px;margin-top:14px;text-align:center;">
      <p style="font-weight:600;color:#0f766e;margin:0">Your Tracking ID:</p>
      <p style="font-size:1.6em;font-weight:700;color:#047857;margin:6px 0">${trackingId}</p>
      <p style="font-size:0.9em;color:#0d9488">Save this ID to track your complaint.</p>
    </div>
    <a class="Return" href="index.html" style="display:inline-block;margin-top:16px">&larr; Return to Home Page</a>
  `;
}
