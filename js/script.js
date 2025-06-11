// File: js/script.js

document.addEventListener('DOMContentLoaded', function() {
  const { questions, templateImageUrl, textPosition } = window.CONFIG;
  const pos = {
    x:         textPosition.x        || 40,
    y:         textPosition.y        || 100,
    lineHeight:textPosition.lineHeight || 20,
    fontSize:  textPosition.fontSize   || 12
  };
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  // References to key DOM elements
  const formContainer    = document.getElementById('form-container');
  const loadingContainer = document.getElementById('loading-container');
  const resultsContainer = document.getElementById('results-container');
  const formEl           = document.getElementById('career-form');
  const submitBtn        = document.getElementById('submit-btn');
  const resultsList      = document.getElementById('results-list');
  const downloadBtn      = document.getElementById('download-btn');
  const restartBtn       = document.getElementById('restart-btn');

  // This array holds exactly what we show on the page.
  let currentActions = [];

  // INITIAL STATE
  formContainer.style.display    = 'block';
  loadingContainer.style.display = 'none';
  resultsContainer.style.display = 'none';

  // BUILD FORM
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

  // GENERATE ACTION ITEMS
  submitBtn.addEventListener('click', function() {
    // Rebuild the array
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

    // After delay, render the HTML list from the same array
    setTimeout(() => {
      loadingContainer.style.display = 'none';
      resultsList.innerHTML = '';
      currentActions.forEach(item => {
        const li = document.createElement('li');
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

  // DOWNLOAD PDF
  downloadBtn.addEventListener('click', function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'px', format: 'a4' });
    doc.setFontSize(pos.fontSize);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function() {
      // Draw the PDF background
      doc.addImage(img, 'PNG', 
        0, 0, 
        doc.internal.pageSize.getWidth(), 
        doc.internal.pageSize.getHeight()
      );

      // Overlay every action from our array
      let y = pos.y;
      currentActions.forEach(text => {
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
          // link text
          const url = m[0];
          doc.text(url, x, y);
          doc.link(
            x, y - pos.fontSize + 2,
            doc.getTextWidth(url),
            pos.fontSize,
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
      alert('Failed to load PDF template. Check your URL.');
    };
    img.src = templateImageUrl;
  });

  // RESTART
  restartBtn.addEventListener('click', function(e) {
    e.preventDefault();
    window.location.reload();
  });
});
