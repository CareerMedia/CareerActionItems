// File: js/script.js

document.addEventListener('DOMContentLoaded', function() {
  const { questions, templateImageUrl, textPosition } = window.CONFIG;
  const xOffset    = (textPosition && textPosition.x) || 40;
  const yOffset    = (textPosition && textPosition.y) || 100;
  const lineHeight = (textPosition && textPosition.lineHeight) || 20;
  const urlRegex   = /(https?:\/\/[^\s]+)/g;

  // Grab all our elements
  const formContainer    = document.getElementById('form-container');
  const loadingContainer = document.getElementById('loading-container');
  const resultsContainer = document.getElementById('results-container');
  const formEl           = document.getElementById('career-form');
  const submitBtn        = document.getElementById('submit-btn');
  const resultsList      = document.getElementById('results-list');
  const downloadBtn      = document.getElementById('download-btn');
  const restartBtn       = document.getElementById('restart-btn');

  // INITIAL STATE
  formContainer.style.display    = 'block';
  loadingContainer.style.display = 'none';
  resultsContainer.style.display = 'none';

  // BUILD FORM
  questions.forEach(q => {
    let wrapper;
    if (q.type === 'text') {
      wrapper = document.createElement('div');
      wrapper.innerHTML = `
        <label for="${q.id}">${q.label}</label>
        <input type="text" id="${q.id}" name="${q.id}" required />
      `;
    } else if (q.type === 'radio') {
      wrapper = document.createElement('fieldset');
      wrapper.innerHTML = `<legend>${q.label}</legend>` +
        q.options.map(opt =>
          `<label><input type="radio" name="${q.id}" value="${opt.value}" required /> ${opt.label}</label>`
        ).join('');
    }
    formEl.appendChild(wrapper);
  });

  // GENERATE ACTION ITEMS
  submitBtn.addEventListener('click', function() {
    // Collect selected actions
    const actions = [];
    questions.forEach(q => {
      if (q.type === 'radio') {
        const sel = formEl.querySelector(`input[name="${q.id}"]:checked`);
        if (sel) {
          const opt = q.options.find(o => o.value === sel.value);
          if (opt.actions) actions.push(...opt.actions);
        }
      }
    });

    // Toggle views: hide form/results, show spinner
    formContainer.style.display    = 'none';
    resultsContainer.style.display = 'none';
    loadingContainer.style.display = 'flex';

    setTimeout(function() {
      // After delay: hide spinner, populate & show results
      loadingContainer.style.display = 'none';
      resultsList.innerHTML = actions.map(item => {
        // Wrap any http(s) URL in <a>
        const html = item.replace(urlRegex, function(url) {
          return `<a href="${url}" target="_blank">${url}</a>`;
        });
        return `<li>${html}</li>`;
      }).join('');
      resultsContainer.style.display = 'block';
    }, 800);
  });

  // DOWNLOAD PDF
  downloadBtn.addEventListener('click', function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'px', format: 'a4' });

    fetch(templateImageUrl)
      .then(res => {
        if (!res.ok) throw new Error(`Template fetch failed: ${res.status}`);
        return res.blob();
      })
      .then(blob => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = e => reject(e);
        reader.readAsDataURL(blob);
      }))
      .then(dataUrl => {
        // Draw the PDF background
        doc.addImage(
          dataUrl, 'PNG',
          0, 0,
          doc.internal.pageSize.getWidth(),
          doc.internal.pageSize.getHeight()
        );
        // Overlay action items with clickable PDF links
        Array.from(resultsList.querySelectorAll('li')).forEach((li, idx) => {
          const text = li.textContent;
          const yPos = yOffset + idx * lineHeight;
          const match = text.match(urlRegex);
          if (match) {
            // Draw text and make URL clickable
            doc.text(text, xOffset, yPos, { link: match[0] });
          } else {
            doc.text(text, xOffset, yPos);
          }
        });
        doc.save('action-plan.pdf');
      })
      .catch(err => {
        console.error('PDF generation error:', err);
        alert('Error generating PDF. See console for details.');
      });
  });

  // RESTART BUTTON
  restartBtn.addEventListener('click', function(e) {
    e.preventDefault();
    window.location.reload();
  });
});
