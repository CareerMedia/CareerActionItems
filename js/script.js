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

  // INITIAL VISIBILITY
  formContainer.style.display    = 'block';
  loadingContainer.style.display = 'none';
  resultsContainer.style.display = 'none';

  // BUILD FORM
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

  // GENERATE ACTION ITEMS
  submitBtn.addEventListener('click', function() {
    // Collect actions
    currentActions = [];
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

    // After brief delay, show results
    setTimeout(() => {
      loadingContainer.style.display = 'none';
      // Populate HTML list
      resultsList.innerHTML = '';
      currentActions.forEach(item => {
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
        // remaining text
        if (lastIndex < item.length) {
          li.appendChild(document.createTextNode(item.slice(lastIndex)));
        }
        resultsList.appendChild(li);
      });
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
      // Draw background template
      doc.addImage(img, 'PNG', 0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight());

      // Overlay each action with clickable PDF link
      let yPos = pos.y;
      currentActions.forEach(text => {
        let xPos = pos.x;
        let lastIndex = 0, match;
        urlRegex.lastIndex = 0;
        while ((match = urlRegex.exec(text)) !== null) {
          // prefix
          if (match.index > lastIndex) {
            const chunk = text.slice(lastIndex, match.index);
            doc.text(chunk, xPos, yPos);
            xPos += doc.getTextWidth(chunk);
          }
          // link
          const url = match[0];
          doc.text(url, xPos, yPos);
          doc.link(xPos, yPos - pos.fontSize + 2, doc.getTextWidth(url), pos.fontSize, { url });
          xPos += doc.getTextWidth(url);
          lastIndex = match.index + url.length;
        }
        // suffix
        if (lastIndex < text.length) {
          const chunk = text.slice(lastIndex);
          doc.text(chunk, xPos, yPos);
        }
        yPos += pos.lineHeight;
      });

      doc.save('action-plan.pdf');
    };
    img.onerror = function() {
      alert('Failed to load PDF background.');
    };
    img.src = templateImageUrl;
  });

  // RESTART
  restartBtn.addEventListener('click', function(e) {
    e.preventDefault();
    window.location.reload();
  });
});
