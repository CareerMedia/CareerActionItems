// File: js/script.js

document.addEventListener('DOMContentLoaded', function() {
  const { questions } = window.CONFIG;
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  // Grab references
  const formContainer    = document.getElementById('form-container');
  const loadingContainer = document.getElementById('loading-container');
  const resultsContainer = document.getElementById('results-container');
  const formEl           = document.getElementById('career-form');
  const submitBtn        = document.getElementById('submit-btn');
  const resultsList      = document.getElementById('results-list');
  const downloadBtn      = document.getElementById('download-btn');
  const restartBtn       = document.getElementById('restart-btn');

  // INITIAL LAYOUT
  formContainer.style.display    = 'block';
  loadingContainer.style.display = 'none';
  resultsContainer.style.display = 'none';

  // Build the form dynamically from config
  questions.forEach(q => {
    const wrapper = document.createElement(q.type === 'text' ? 'div' : 'fieldset');
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
    formEl.appendChild(wrapper);
  });

  // When user clicks Generate
  submitBtn.addEventListener('click', function() {
    // Gather action strings
    const currentActions = [];
    questions.forEach(q => {
      if (q.type === 'radio') {
        const sel = formEl.querySelector(`input[name="${q.id}"]:checked`);
        if (sel) {
          const opt = q.options.find(o => o.value === sel.value);
          if (opt && Array.isArray(opt.actions)) {
            currentActions.push(...opt.actions);
          }
        }
      }
    });

    // Show spinner
    formContainer.style.display    = 'none';
    resultsContainer.style.display = 'none';
    loadingContainer.style.display = 'flex';

    // After delay, render list
    setTimeout(() => {
      loadingContainer.style.display = 'none';
      resultsList.innerHTML = '';
      currentActions.forEach(item => {
        const li = document.createElement('li');
        li.classList.add('action-item');
        let last = 0, m;
        urlRegex.lastIndex = 0;
        while ((m = urlRegex.exec(item)) !== null) {
          if (m.index > last) {
            li.appendChild(document.createTextNode(item.slice(last, m.index)));
          }
          const a = document.createElement('a');
          a.href = m[0];
          a.target = '_blank';
          a.textContent = m[0];
          li.appendChild(a);
          last = m.index + m[0].length;
        }
        if (last < item.length) {
          li.appendChild(document.createTextNode(item.slice(last)));
        }
        resultsList.appendChild(li);
      });
      resultsContainer.style.display = 'block';
    }, 800);
  });

  // When user clicks Download PDF
  downloadBtn.addEventListener('click', function() {
    // Collect the exact action texts
    const actions = Array.from(document.querySelectorAll('li.action-item'))
      .map(li => li.textContent.trim());

    // Delegate to pdfGenerator
    if (typeof window.generatePDF === 'function') {
      window.generatePDF(window.CONFIG, actions);
    } else {
      alert('PDF generator not found.');
    }
  });

  // Restart button
  restartBtn.addEventListener('click', function(e) {
    e.preventDefault();
    window.location.reload();
  });
});
