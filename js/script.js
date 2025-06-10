// File: js/script.js

document.addEventListener('DOMContentLoaded', function() {
  const { questions, templateImageUrl, textPosition } = window.CONFIG;
  const pos = {
    x: textPosition.x || 40,
    y: textPosition.y || 100,
    lineHeight: textPosition.lineHeight || 20,
    fontSize: textPosition.fontSize || 12
  };
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  // Element references
  const formContainer    = document.getElementById('form-container');
  const loadingContainer = document.getElementById('loading-container');
  const resultsContainer = document.getElementById('results-container');
  const formEl           = document.getElementById('career-form');
  const submitBtn        = document.getElementById('submit-btn');
  const resultsList      = document.getElementById('results-list');
  const downloadBtn      = document.getElementById('download-btn');
  const restartBtn       = document.getElementById('restart-btn');

  // Ensure view on load
  formContainer.style.display    = 'block';
  loadingContainer.style.display = 'none';
  resultsContainer.style.display = 'none';

  // Build the form dynamically
  questions.forEach(q => {
    let container = document.createElement('div');
    if (q.type === 'text') {
      container.innerHTML = `
        <label for="${q.id}">${q.label}</label>
        <input type="text" id="${q.id}" name="${q.id}" required />
      `;
    } else { // radio
      container = document.createElement('fieldset');
      let optionsHtml = `<legend>${q.label}</legend>`;
      q.options.forEach(opt => {
        optionsHtml += `
          <label>
            <input type="radio" name="${q.id}" value="${opt.value}" required />
            ${opt.label}
          </label>
        `;
      });
      container.innerHTML = optionsHtml;
    }
    formEl.appendChild(container);
  });

  // Generate Action Items
  submitBtn.addEventListener('click', function() {
    const actions = [];
    questions.forEach(q => {
      if (q.type === 'radio') {
        const sel = formEl.querySelector(`input[name="${q.id}"]:checked`);
        if (sel) {
          const opt = q.options.find(o => o.value === sel.value);
          if (opt && opt.actions) actions.push(...opt.actions);
        }
      }
    });

    // Toggle to spinner
    formContainer.style.display    = 'none';
    resultsContainer.style.display = 'none';
    loadingContainer.style.display = 'flex';

    setTimeout(function() {
      // Populate and show results
      loadingContainer.style.display = 'none';
      resultsList.innerHTML = actions.map(item => {
        return `<li>${item.replace(urlRegex, url => `<a href="${url}" target="_blank">${url}</a>`)}</li>`;
      }).join('');
      resultsContainer.style.display = 'block';
    }, 800);
  });

  // Download PDF
  downloadBtn.addEventListener('click', function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'px', format: 'a4' });
    doc.setFontSize(pos.fontSize);

    fetch(templateImageUrl)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to fetch template: ${res.status}`);
        return res.blob();
      })
      .then(blob => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = e => reject(e);
        reader.readAsDataURL(blob);
      }))
      .then(dataUrl => {
        // Draw background
        doc.addImage(dataUrl, 'PNG', 0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight());
        // Overlay each action, with clickable links in PDF
        Array.from(resultsList.querySelectorAll('li')).forEach((li, idx) => {
          const text = li.textContent.trim();
          const yPos = pos.y + idx * pos.lineHeight;
          const match = text.match(urlRegex);
          if (match) {
            doc.text(text, pos.x, yPos, { link: match[0] });
          } else {
            doc.text(text, pos.x, yPos);
          }
        });
        doc.save('action-plan.pdf');
      })
      .catch(err => {
        console.error('PDF generation error:', err);
        alert('Error generating PDF. See console for details.');
      });
  });

  // Restart form
  restartBtn.addEventListener('click', function(e) {
    e.preventDefault();
    window.location.reload();
  });
});
