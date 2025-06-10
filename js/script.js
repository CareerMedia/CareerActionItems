// File: js/script.js

document.addEventListener('DOMContentLoaded', function() {
  const { questions, templateImageUrl, textPosition } = window.CONFIG;
  // Fallback defaults for position/size
  const pos = {
    x: textPosition.x || 40,
    y: textPosition.y || 100,
    lineHeight: textPosition.lineHeight || 20,
    fontSize: textPosition.fontSize || 12
  };
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  // Element refs
  const formContainer    = document.getElementById('form-container');
  const loadingContainer = document.getElementById('loading-container');
  const resultsContainer = document.getElementById('results-container');
  const formEl           = document.getElementById('career-form');
  const submitBtn        = document.getElementById('submit-btn');
  const resultsList      = document.getElementById('results-list');
  const downloadBtn      = document.getElementById('download-btn');
  const restartBtn       = document.getElementById('restart-btn');

  // Hide spinner + results on load
  loadingContainer.style.display = 'none';
  resultsContainer.style.display = 'none';

  // Dynamically build the form
  questions.forEach(q => {
    let wrapper = document.createElement('div');
    if (q.type === 'text') {
      wrapper.innerHTML = `
        <label for="${q.id}">${q.label}</label>
        <input type="text" id="${q.id}" name="${q.id}" required />
      `;
    } else {
      wrapper = document.createElement('fieldset');
      let html = `<legend>${q.label}</legend>`;
      q.options.forEach(opt => {
        html += `<label><input type="radio" name="${q.id}" value="${opt.value}" required /> ${opt.label}</label>`;
      });
      wrapper.innerHTML = html;
    }
    formEl.appendChild(wrapper);
  });

  // Handle “Generate Action Items”
  submitBtn.onclick = function() {
    // Collect actions
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

    // Show spinner
    formContainer.style.display    = 'none';
    resultsContainer.style.display = 'none';
    loadingContainer.style.display = 'flex';

    setTimeout(() => {
      // Hide spinner, render results
      loadingContainer.style.display = 'none';
      resultsList.innerHTML = actions
        .map(a => `<li>${a.replace(urlRegex, url => `<a href="${url}" target="_blank">${url}</a>`)}</li>`)
        .join('');
      resultsContainer.style.display = 'block';
    }, 800);
  };

  // Handle “Download PDF”
  downloadBtn.onclick = function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'px', format: 'a4' });
    doc.setFontSize(pos.fontSize);

    fetch(templateImageUrl)
      .then(r => {
        if (!r.ok) throw new Error(`Template fetch failed: ${r.status}`);
        return r.blob();
      })
      .then(blob => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = e => reject(e);
        reader.readAsDataURL(blob);
      }))
      .then(dataUrl => {
        // Draw background
        doc.addImage(
          dataUrl, 'PNG',
          0, 0,
          doc.internal.pageSize.getWidth(),
          doc.internal.pageSize.getHeight()
        );
        // Overlay action items with PDF links
        const items = Array.from(resultsList.querySelectorAll('li')).map(li => li.textContent.trim());
        items.forEach((text, idx) => {
          const y = pos.y + idx * pos.lineHeight;
          const match = text.match(urlRegex);
          if (match) {
            doc.text(text, pos.x, y, { link: match[0] });
          } else {
            doc.text(text, pos.x, y);
          }
        });
        doc.save('action-plan.pdf');
      })
      .catch(err => {
        console.error('PDF error:', err);
        alert('Error generating PDF. See console for details.');
      });
  };

  // Handle “Restart”
  restartBtn.onclick = function(e) {
    e.preventDefault();
    window.location.reload();
  };
});
