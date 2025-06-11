// File: js/script.js

document.addEventListener('DOMContentLoaded', function() {
  const { questions } = window.CONFIG;
  // This regex is used to find URLs to make them clickable
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  // Grab our elements
  const formContainer    = document.getElementById('form-container');
  const loadingContainer = document.getElementById('loading-container');
  const resultsContainer = document.getElementById('results-container');
  const careerForm       = document.getElementById('career-form');
  const submitBtn        = document.getElementById('submit-btn');
  const resultsList      = document.getElementById('results-list');
  const downloadBtn      = document.getElementById('download-btn');
  const restartBtn       = document.getElementById('restart-btn');

  // --- Reusable Loading Screen Functions ---
  window.showLoading = function() {
    loadingContainer.style.display = 'flex';
  };
  window.hideLoading = function() {
    loadingContainer.style.display = 'none';
  };

  // INITIAL VISIBILITY
  formContainer.style.display    = 'block';
  hideLoading();
  resultsContainer.style.display = 'none';

  // 1) Build the form
  questions.forEach(q => {
    let wrapper = document.createElement(q.type === 'text' ? 'div' : 'fieldset');
    if (q.type === 'text') {
      wrapper.innerHTML = `
        <label for="${q.id}">${q.label}</label>
        <input type="text" id="${q.id}" name="${q.id}" required />
      `;
    } else {
      let html = `<legend>${q.label}</legend>`;
      q.options.forEach(opt => {
        html += `
          <label>
            <input type="radio" name="${q.id}" value="${opt.value}" required />
            ${opt.label}
          </label>
        `;
      });
      wrapper.innerHTML = html;
    }
    careerForm.appendChild(wrapper);
  });

  // 2) Generate Action Items
  submitBtn.addEventListener('click', function() {
    if (!careerForm.checkValidity()) {
      careerForm.reportValidity();
      return;
    }

    const actions = [];
    questions.forEach(q => {
      if (q.type === 'radio') {
        const sel = careerForm.querySelector(`input[name="${q.id}"]:checked`);
        if (sel) {
          const opt = q.options.find(o => o.value === sel.value);
          if (opt && Array.isArray(opt.actions)) actions.push(...opt.actions);
        }
      }
    });

    formContainer.style.display    = 'none';
    resultsContainer.style.display = 'none';
    showLoading();

    setTimeout(() => {
      hideLoading();
      resultsList.innerHTML = '';
      
      // --- THIS IS THE CORRECTED LOGIC ---
      // It now correctly parses the text and creates clickable <a> tags.
      actions.forEach(item => {
        const li = document.createElement('li');
        li.className = 'action-item';

        // Reset regex index for each item
        urlRegex.lastIndex = 0;
        let lastIndex = 0;
        let match;
        
        // Find all URLs in the string
        while ((match = urlRegex.exec(item)) !== null) {
          // Add any text that came before the link
          if (match.index > lastIndex) {
            li.appendChild(document.createTextNode(item.slice(lastIndex, match.index)));
          }
          // Create the clickable <a> tag
          const a = document.createElement('a');
          a.href = match[0];
          a.target = '_blank'; // Open in new tab
          a.textContent = match[0];
          li.appendChild(a);
          lastIndex = match.index + match[0].length;
        }

        // Add any remaining text after the last link
        if (lastIndex < item.length) {
          li.appendChild(document.createTextNode(item.slice(lastIndex)));
        }

        resultsList.appendChild(li);
      });
      // --- END OF FIX ---

      resultsContainer.style.display = 'block';
    }, 800);
  });

  // 3) Download PDF
  downloadBtn.addEventListener('click', function() {
    showLoading();

    const actions = Array.from(document.querySelectorAll('li.action-item'))
      .map(li => li.textContent.trim());

    if (typeof window.generatePDF === 'function') {
      window.generatePDF(window.CONFIG, actions); 
    } else {
      console.error('generatePDF not defined');
      alert('PDF generator not available.');
      hideLoading();
    }
  });

  // 4) Restart
  restartBtn.addEventListener('click', function(e) {
    e.preventDefault();
    window.location.reload();
  });
});
