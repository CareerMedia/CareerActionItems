document.addEventListener('DOMContentLoaded', () => {
  const { questions, templateImageUrl } = window.CONFIG;
  const formEl      = document.getElementById('career-form');
  const submitBtn   = document.getElementById('submit-btn');
  const formCont    = document.getElementById('form-container');
  const loadCont    = document.getElementById('loading-container');
  const resCont     = document.getElementById('results-container');
  const resList     = document.getElementById('results-list');
  const downloadBtn = document.getElementById('download-btn');

  // Build form fields (unchanged)
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

  // On submit: gather actions, show spinner, show results
  submitBtn.addEventListener('click', () => {
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

    formCont.classList.add('hidden');
    loadCont.classList.remove('hidden');

    setTimeout(() => {
      loadCont.classList.add('hidden');
      resList.innerHTML = actions.map(a => `<li>${a}</li>`).join('');
      resCont.classList.remove('hidden');
    }, 800);
  });

  // PDF download: fetch + FileReader → DataURL → addImage
  downloadBtn.addEventListener('click', async () => {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ unit: 'px', format: 'a4' });

      // Fetch the template
      console.log('Fetching PDF template:', templateImageUrl);
      const resp = await fetch(templateImageUrl);
      if (!resp.ok) throw new Error(`Template fetch failed: ${resp.status}`);
      const blob = await resp.blob();

      // Convert to DataURL
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload    = () => resolve(reader.result);
        reader.onerror   = e => reject(e);
        reader.readAsDataURL(blob);
      });

      // Draw background
      doc.addImage(
        dataUrl, 'PNG', 
        0, 0,
        doc.internal.pageSize.getWidth(),
        doc.internal.pageSize.getHeight()
      );

      // Draw action items
      const items = Array.from(resList.querySelectorAll('li')).map(li => li.textContent);
      items.forEach((txt, i) => {
        doc.text(txt, 40, 100 + i * 20);
      });

      // Save
      doc.save('action-plan.pdf');
      console.log('PDF generated successfully');
    } catch (err) {
      console.error('🛑 PDF generation error:', err);
      alert('Error generating PDF. See console for details.');
    }
  });
});
