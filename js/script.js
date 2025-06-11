// File: js/script.js

document.addEventListener('DOMContentLoaded', function() {
  const { questions, templateImageUrl, textPosition } = window.CONFIG;
  const xOffset    = (textPosition && textPosition.x) || 40;
  const yOffset    = (textPosition && textPosition.y) || 100;
  const lineHeight = (textPosition && textPosition.lineHeight) || 20;
  const urlRegex   = /(https?:\/\/[^\s]+)/g;

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

  // BUILD FORM FIELDS
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

    // SHOW SPINNER
    formContainer.style.display    = 'none';
    resultsContainer.style.display = 'none';
    loadingContainer.style.display = 'flex';

    setTimeout(function() {
      // HIDE SPINNER, SHOW RESULTS
      loadingContainer.style.display = 'none';
      resultsList.innerHTML = actions.map(item => {
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
    doc.setFontSize(pos.fontSize);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function() {
      // Draw template
      doc.addImage(img, 'PNG', 0, 0,
        doc.internal.pageSize.getWidth(),
        doc.internal.pageSize.getHeight());

      // Pull items from DOM instead of array
      const items = Array.from(resultsList.querySelectorAll('li')).map(li => li.textContent.trim());
      let y = pos.y;
      items.forEach(text => {
        let x = pos.x;
        let last = 0, m;
        urlRegex.lastIndex = 0;
        while ((m = urlRegex.exec(text)) !== null) {
          // prefix text
          if (m.index > last) {
            const chunk = text.slice(last, m.index);
            doc.text(chunk, x, y);
            x += doc.getTextWidth(chunk);
          }
          // link
          const url = m[0];
          doc.text(url, x, y);
          doc.link(x, y - pos.fontSize + 2,
            doc.getTextWidth(url), pos.fontSize,
            { url }
          );
          x += doc.getTextWidth(url);
          last = m.index + url.length;
        }
        // suffix
        if (last < text.length) {
          const suffix = text.slice(last);
          doc.text(suffix, x, y);
        }
        y += pos.lineHeight;
      });

      doc.save('action-plan.pdf');
    };
    img.onerror = function() {
      alert('Failed to load PDF background.');
    };
    img.src = templateImageUrl;
  });

  // RESTART BUTTON
  restartBtn.addEventListener('click', function(e) {
    e.preventDefault();
    window.location.reload();
  });('click', function(e) {
    e.preventDefault();
    window.location.reload();
  });
});
