document.addEventListener('DOMContentLoaded', () => {
  const { questions, templateImageUrl, textPosition } = window.CONFIG;
  const xOffset = textPosition && typeof textPosition.x === 'number' ? textPosition.x : 40;
  const yOffset = textPosition && typeof textPosition.y === 'number' ? textPosition.y : 100;
  const lineHeight = textPosition && typeof textPosition.lineHeight === 'number' ? textPosition.lineHeight : 20;

  const formCont = document.getElementById('form-container');
  const loadCont = document.getElementById('loading-container');
  const resCont = document.getElementById('results-container');
  const formEl = document.getElementById('career-form');
  const submitBtn = document.getElementById('submit-btn');
  const resList = document.getElementById('results-list');
  const downloadBtn = document.getElementById('download-btn');

  // Initial visibility: show form, hide spinner & results
  formCont.style.display = 'block';
  loadCont.style.display = 'none';
  resCont.style.display = 'none';

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
          `<label><input type="radio" name="${q.id}" value="${opt.value}" required /> ${opt.label}</label>`
        ).join('');
    }
    formEl.appendChild(wrapper);
  });

  // Handle form submission
  submitBtn.addEventListener('click', () => {
    const actions = [];
    questions.forEach(q => {
      if (q.type === 'radio') {
        const sel = document.querySelector(`input[name="${q.id}"]:checked`);
        if (sel) {
          const opt = q.options.find(o => o.value === sel.value);
          if (opt && Array.isArray(opt.actions)) actions.push(...opt.actions);
        }
      }
    });

    // Show spinner overlay
    formCont.style.display = 'none';
    resCont.style.display = 'none';
    loadCont.style.display = 'flex';

    setTimeout(() => {
      // Hide spinner, show results
      loadCont.style.display = 'none';
      resList.innerHTML = actions.map(a => `<li>${a}</li>`).join('');
      resCont.style.display = 'block';
    }, 800);
  });

  // Handle PDF download
  downloadBtn.addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'px', format: 'a4' });

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
        doc.addImage(
          dataUrl, 'PNG',
          0, 0,
          doc.internal.pageSize.getWidth(),
          doc.internal.pageSize.getHeight()
        );
        const items = Array.from(resList.querySelectorAll('li')).map(li => li.textContent);
        items.forEach((txt, idx) =>
          doc.text(txt, xOffset, yOffset + idx * lineHeight)
        );
        doc.save('action-plan.pdf');
      })
      .catch(err => {
        console.error('PDF generation error:', err);
        alert('Error generating PDF. See console for details.');
      });
  });
});
