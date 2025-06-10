// File: js/script.js

document.addEventListener('DOMContentLoaded', () => {
  const { questions, templateImageUrl, textPosition } = window.CONFIG;
  const xOffset    = textPosition?.x ?? 40;
  const yOffset    = textPosition?.y ?? 100;
  const lineHeight = textPosition?.lineHeight ?? 20;
  const urlRegex   = /(https?:\/\/[^\s]+)/g;

  const formCont    = document.getElementById('form-container');
  const loadCont    = document.getElementById('loading-container');
  const resCont     = document.getElementById('results-container');
  const formEl      = document.getElementById('career-form');
  const submitBtn   = document.getElementById('submit-btn');
  const resList     = document.getElementById('results-list');
  const downloadBtn = document.getElementById('download-btn');
  const restartBtn  = document.getElementById('restart-btn');

  // Initial visibility
  formCont.style.display = 'block';
  loadCont.style.display = 'none';
  resCont.style.display  = 'none';

  // Build the form
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

  // Generate Action Items
  submitBtn.addEventListener('click', () => {
    const actions = [];
    questions.forEach(q => {
      if (q.type === 'radio') {
        const sel = document.querySelector(`input[name="${q.id}"]:checked`);
        if (sel) {
          const opt = q.options.find(o => o.value === sel.value);
          if (opt?.actions) actions.push(...opt.actions);
        }
      }
    });

    // Show spinner
    formCont.style.display = 'none';
    resCont.style.display  = 'none';
    loadCont.style.display = 'flex';

    setTimeout(() => {
      // Hide spinner, show list
      loadCont.style.display = 'none';
      resList.innerHTML = actions.map(a => {
        // wrap URLs in <a>
        return `<li>${a.replace(urlRegex, '<a href="$1" target="_blank">$1</a>')}</li>`;
      }).join('');
      resCont.style.display = 'block';
    }, 800);
  });

  // Download PDF
  downloadBtn.addEventListener('click', () => {
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
        // Draw background
        doc.addImage(
          dataUrl, 'PNG',
          0, 0,
          doc.internal.pageSize.getWidth(),
          doc.internal.pageSize.getHeight()
        );

        // Overlay links & text
        Array.from(resList.querySelectorAll('li')).forEach((li, idx) => {
          let txt = li.textContent;
          const y = yOffset + idx * lineHeight;
          let lastX = xOffset;
          let match;

          urlRegex.lastIndex = 0;
          while ((match = urlRegex.exec(txt)) !== null) {
            const [url] = match;
            const before = txt.substring(0, match.index);
            if (before) {
              doc.text(before, lastX, y);
              lastX += doc.getTextWidth(before);
            }
            // draw clickable link
            if (doc.textWithLink) {
              doc.textWithLink(url, lastX, y, { url });
            } else {
              doc.text(url, lastX, y, { link: url });
            }
            lastX += doc.getTextWidth(url);
            txt = txt.substring(match.index + url.length);
            urlRegex.lastIndex = 0;
          }
          if (txt) {
            doc.text(txt, lastX, y);
          }
        });

        doc.save('action-plan.pdf');
      })
      .catch(err => {
        console.error('PDF error:', err);
        alert('Error generating PDF. See console.');
      });
  });

  // Restart button
  restartBtn.addEventListener('click', () => {
    location.reload();
  });
});
