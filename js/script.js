// File: js/script.js

document.addEventListener('DOMContentLoaded', function() {
  const { questions } = window.CONFIG;
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

    // Show spinner
    formContainer.style.display    = 'none';
    resultsContainer.style.display = 'none';
    showLoading();

    setTimeout(() => {
      hideLoading();
      resultsList.innerHTML = '';
      actions.forEach(item => {
        const li = document.createElement('li');
        li.className = 'action-item';
        // Simplified rendering; textContent is sufficient for the PDF generator
        li.textContent = item;
        resultsList.appendChild(li);
      });
      resultsContainer.style.display = 'block';
    }, 800);
  });

  // 3) Download PDF
  downloadBtn.addEventListener('click', function() {
    showLoading(); // Show spinner before starting PDF generation

    const actions = Array.from(document.querySelectorAll('li.action-item'))
      .map(li => li.textContent.trim());

    if (typeof window.generatePDF === 'function') {
      window.generatePDF(window.CONFIG, actions);
    } else {
      console.error('generatePDF not defined');
      alert('PDF generator not available.');
      hideLoading(); // Hide spinner if function is missing
    }
  });

  // 4) Restart
  restartBtn.addEventListener('click', function(e) {
    e.preventDefault();
    window.location.reload();
  });
});
