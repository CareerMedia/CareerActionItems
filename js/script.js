document.addEventListener('DOMContentLoaded', () => {
  const { questions, templateImageUrl, textPosition } = window.CONFIG;
  // Default text coordinates (override in js/config.js using textPosition: { x: ___, y: ___ })
  const xOffset = (textPosition && textPosition.x) || 40;
  const yOffset = (textPosition && textPosition.y) || 100;
  const lineHeight = (textPosition && textPosition.lineHeight) || 20;

  const formEl      = document.getElementById('career-form');
  const submitBtn   = document.getElementById('submit-btn');
  const formCont    = document.getElementById('form-container');
  const loadCont    = document.getElementById('loading-container');
  const resCont     = document.getElementById('results-container');
  const resList     = document.getElementById('results-list');
  const downloadBtn = document.getElementById('download-btn');

  // Ensure correct initial visibility
  formCont.classList.remove('hidden');
  loadCont.classList.add('hidden');
  resCont.classList.add('hidden');

  // Build form fields
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
          `<label><input type="radio" name="${q.id}" value="${opt.value}" required> ${opt.label}</label>`
        ).join('');
    }
    formEl.appendChild(wrapper);
  });

  // Handle form submission
  submitBtn.addEventListener('click', () => {
    // Collect action items
    const actions = [];
    questions.forEach(q => {
      if (q.type === 'radio') {
        const sel = document.querySelector(`input[name="${q.id}"]:checked`);
        if (sel) {
          const opt = q.options.find(o => o.value === sel.value);
          actions.push(...opt.actions);
        }
      }
    });

    // Toggle views: form -> spinner
    formCont.classList.add('hidden');
    resCont.classList.add('hidden');
    loadCont.classList.remove('hidden');

    // After delay, show results
    setTimeout(() => {
      loadCont.classList.add('hidden');
      resList.innerHTML = actions.map(a => `<li>${a}</li>`).join('');
      resCont.classList.remove('hidden');
    }, 800);
  });

  // Handle PDF download
  downloadBtn.addEventListener('click', () => {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ unit: 'px', format: 'a4' });
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = templateImageUrl;
      img.onload = () => {
        // Draw PDF background
        doc.addImage(
          img, 'PNG',
          0, 0,
          doc.internal.pageSize.getWidth(),
          doc.internal.pageSize.getHeight()
        );
        // Overlay action items at configured coordinates
        const items = Array.from(resList.querySelectorAll('li')).map(li => li.textContent);
        items.forEach((txt, i) => {
          doc.text(txt, xOffset, yOffset + (i * lineHeight));
        });
        doc.save('action-plan.pdf');
      };
      img.onerror = e => { throw new Error('Background image load failed'); };
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Error generating PDF. See console for details.');
    }
  });
});
