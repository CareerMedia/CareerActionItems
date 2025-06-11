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

  // INITIAL VISIBILITY
  formContainer.style.display    = 'block';
  loadingContainer.style.display = 'none';
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
    // Gather actions
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
    loadingContainer.style.display = 'flex';

    // After a moment, render list
    setTimeout(() => {
      loadingContainer.style.display = 'none';
      resultsList.innerHTML = '';
      actions.forEach(item => {
        const li = document.createElement('li');
        li.className = 'action-item';
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

  // 3) Download PDF
  downloadBtn.addEventListener('click', function() {
    // Pull exactly what’s on the page
    const actions = Array.from(document.querySelectorAll('li.action-item'))
      .map(li => li.textContent.trim());

    // Call the PDF generator
    if (typeof window.generatePDF === 'function') {
      window.generatePDF(window.CONFIG, actions);
    } else {
      console.error('generatePDF not defined');
      alert('PDF generator not available.');
    }
  });

  // 4) Restart
  restartBtn.addEventListener('click', function(e) {
    e.preventDefault();
    window.location.reload();
  });
});
