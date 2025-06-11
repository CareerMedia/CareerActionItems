// File: js/script.js

document.addEventListener('DOMContentLoaded', function() {
  const { questions } = window.CONFIG;
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  // State
  let currentActions = [];

  // Element refs
  const formContainer    = document.getElementById('form-container');
  const loadingContainer = document.getElementById('loading-container');
  const resultsContainer = document.getElementById('results-container');
  const formEl           = document.getElementById('career-form');
  const submitBtn        = document.getElementById('submit-btn');
  const resultsList      = document.getElementById('results-list');
  const downloadBtn      = document.getElementById('download-btn');
  const restartBtn       = document.getElementById('restart-btn');

  // INITIAL VIEW
  formContainer.style.display    = 'block';
  loadingContainer.style.display = 'none';
  resultsContainer.style.display = 'none';

  // Build form
  questions.forEach(q => {
    let container;
    if (q.type === 'text') {
      container = document.createElement('div');
      container.innerHTML = `
        <label for="${q.id}">${q.label}</label>
        <input type="text" id="${q.id}" name="${q.id}" required />
      `;
    } else {
      container = document.createElement('fieldset');
      let html = `<legend>${q.label}</legend>`;
      q.options.forEach(opt => {
        html += `
          <label>
            <input type="radio" name="${q.id}" value="${opt.value}" required />
            ${opt.label}
          </label>
        `;
      });
      container.innerHTML = html;
    }
    formEl.appendChild(container);
  });

  // Generate action items
  submitBtn.onclick = function() {
    currentActions = [];
    questions.forEach(q => {
      if (q.type === 'radio') {
        const sel = formEl.querySelector(`input[name="${q.id}"]:checked`);
        if (sel) {
          const opt = q.options.find(o => o.value === sel.value);
          if (opt.actions) currentActions.push(...opt.actions);
        }
      }
    });

    // show spinner
    formContainer.style.display    = 'none';
    resultsContainer.style.display = 'none';
    loadingContainer.style.display = 'flex';

    setTimeout(() => {
      loadingContainer.style.display = 'none';
      resultsList.innerHTML = '';
      currentActions.forEach(text => {
        const li = document.createElement('li');
        li.className = 'action-item';
        let last = 0, m;
        urlRegex.lastIndex = 0;
        while ((m = urlRegex.exec(text)) !== null) {
          if (m.index > last) {
            li.appendChild(document.createTextNode(text.slice(last, m.index)));
          }
          const a = document.createElement('a');
          a.href = m[0];
          a.target = '_blank';
          a.textContent = m[0];
          li.appendChild(a);
          last = m.index + m[0].length;
        }
        if (last < text.length) {
          li.appendChild(document.createTextNode(text.slice(last)));
        }
        resultsList.appendChild(li);
      });
      resultsContainer.style.display = 'block';
    }, 800);
  };

  // Download PDF
  downloadBtn.onclick = function() {
    if (typeof window.generatePDF === 'function') {
      window.generatePDF(window.CONFIG, currentActions);
    } else {
      console.error('generatePDF not available');
    }
  };

  // Restart
  restartBtn.onclick = function(e) {
    e.preventDefault();
    window.location.reload();
  };
});
