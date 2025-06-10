// File: js/script.js

document.addEventListener('DOMContentLoaded', function() {
  const { questions, templateImageUrl, textPosition } = window.CONFIG;
  const xOffset    = textPosition.x;
  const yOffset    = textPosition.y;
  const lineHeight = textPosition.lineHeight;
  const fontSize   = textPosition.fontSize;
  const urlRegex   = /(https?:\/\/[^\s]+)/g;

  // Element references
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
    } else {
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
    const actions = [];
    questions.forEach(q => {
      if (q.type === 'radio') {
        const sel = formEl.querySelector(`input[name="${q.id}"]:checked`);
        if (sel) {
          const opt = q.options.find(o => o.value === sel.value);
          actions.push(...opt.actions);
        }
      }
    });

    // SHOW SPINNER
    formContainer.style.display    = 'none';
    resultsContainer.style.display = 'none';
    loadingContainer.style.display = 'flex';

    setTimeout(function() {
      // HIDE SPINNER, SHOW RESULTS
      loadingContainer.style.display = 'none';
      resultsList.innerHTML = actions.map(a => {
        return `<li>${a.replace(urlRegex, url => `<a href="${url}" target="_blank">${url}</a>`)}</li>`;
      }).join('');
      resultsContainer.style.display = 'block';
    }, 800);
  });

  // DOWNLOAD PDF
  downloadBtn.addEventListener('click', function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'px', format: 'a4' });

    // Apply configured font size
    doc.setFontSize(fontSize);

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
        // Draw background
        doc.addImage(
          dataUrl, 'PNG',
          0, 0,
          doc.internal.pageSize.getWidth(),
          doc.internal.pageSize.getHeight()
        );
        // Overlay items with clickable PDF links
        Array.from(resultsList.querySelectorAll('li')).forEach((li, idx) => {
          const text = li.textContent;
          const yPos = yOffset + idx * lineHeight;
          const match = text.match(urlRegex);
          if (match) {
            doc.text(text, xOffset, yPos, { link: match[0] });
          } else {
            doc.text(text, xOffset, yPos);
          }
        });
        doc.save('action-plan.pdf');
      })
      .catch(err => {
        console.error('PDF generation error:', err);
        alert('Error generating PDF. Check console for details.');
      });
  });

  // RESTART
  restartBtn.addEventListener('click', function(e) {
    e.preventDefault();
    window.location.reload();
  });
});
