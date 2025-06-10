// File: js/script.js

document.addEventListener('DOMContentLoaded', function() {
  const { questions, templateImageUrl, textPosition } = window.CONFIG;
  const pos = {
    x: textPosition.x,
    y: textPosition.y,
    lineHeight: textPosition.lineHeight,
    fontSize: textPosition.fontSize
  };
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  // Gather element refs
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

  // Build the form fields
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

  // Generate Action Items
  submitBtn.addEventListener('click', function() {
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

    // Show spinner
    formContainer.style.display    = 'none';
    resultsContainer.style.display = 'none';
    loadingContainer.style.display = 'flex';

    setTimeout(function() {
      // Hide spinner, render list
      loadingContainer.style.display = 'none';
      resultsList.innerHTML = ''; // clear old
      actions.forEach(item => {
        const li = document.createElement('li');
        let lastIndex = 0, match;
        while ((match = urlRegex.exec(item)) !== null) {
          // text before link
          if (match.index > lastIndex) {
            li.appendChild(document.createTextNode(item.slice(lastIndex, match.index)));
          }
          // link
          const a = document.createElement('a');
          a.href = match[0];
          a.target = '_blank';
          a.textContent = match[0];
          li.appendChild(a);
          lastIndex = match.index + match[0].length;
        }
        // trailing text
        if (lastIndex < item.length) {
          li.appendChild(document.createTextNode(item.slice(lastIndex)));
        }
        resultsList.appendChild(li);
      });
      resultsContainer.style.display = 'block';
    }, 800);
  });

  // Download PDF
  downloadBtn.addEventListener('click', function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'px', format: 'a4' });
    doc.setFontSize(pos.fontSize);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function() {
      // draw template
      doc.addImage(img, 'PNG', 0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight());
      // overlay text + links
      let y = pos.y;
      Array.from(resultsList.querySelectorAll('li')).forEach(li => {
        const text = li.textContent;
        let x = pos.x;
        let lastIndex = 0, match;
        urlRegex.lastIndex = 0;
        while ((match = urlRegex.exec(text)) !== null) {
          // prefix
          if (match.index > lastIndex) {
            const chunk = text.slice(lastIndex, match.index);
            doc.text(chunk, x, y);
            x += doc.getTextWidth(chunk);
          }
          // link text
          const url = match[0];
          doc.text(url, x, y);
          doc.link(x, y - pos.fontSize + 2, doc.getTextWidth(url), pos.fontSize, { url });
          x += doc.getTextWidth(url);
          lastIndex = match.index + url.length;
        }
        // suffix
        if (lastIndex < text.length) {
          const chunk = text.slice(lastIndex);
          doc.text(chunk, x, y);
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

  // Restart
  restartBtn.addEventListener('click', function(e) {
    e.preventDefault();
    window.location.reload();
  });
});
