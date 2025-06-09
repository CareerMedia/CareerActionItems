document.addEventListener('DOMContentLoaded', () => {
  const config       = window.CONFIG;
  const formEl       = document.getElementById('career-form');
  const submitBtn    = document.getElementById('submit-btn');
  const formContainer= document.getElementById('form-container');
  const loadingEl    = document.getElementById('loading-container');
  const resultsEl    = document.getElementById('results-container');
  const resultsList  = document.getElementById('results-list');
  const downloadBtn  = document.getElementById('download-btn');

  // 1) Build the form from config
  config.questions.forEach(q => {
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

  // 2) On submit, collect actions, show spinner, then results
  submitBtn.addEventListener('click', () => {
    const allActions = [];
    config.questions.forEach(q => {
      if (q.type === 'radio') {
        const chosen = document.querySelector(`input[name="${q.id}"]:checked`);
        if (chosen) {
          const opt = q.options.find(o => o.value === chosen.value);
          allActions.push(...opt.actions);
        }
      }
    });

    // flip containers
    formContainer.classList.add('hidden');
    loadingEl.classList.remove('hidden');

    setTimeout(() => {
      loadingEl.classList.add('hidden');
      resultsList.innerHTML = allActions.map(a => `<li>${a}</li>`).join('');
      resultsEl.classList.remove('hidden');
    }, 800);
  });

  // 3) PDF download using jsPDF + your WP-hosted template
  downloadBtn.addEventListener('click', () => {
    import('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js')
      .then(js => {
        const { jsPDF } = js.jspdf;
        const doc = new jsPDF({ unit: 'px', format: 'a4' });
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = config.templateImageUrl;
        img.onload = () => {
          doc.addImage(
            img, 'PNG', 0, 0,
            doc.internal.pageSize.getWidth(),
            doc.internal.pageSize.getHeight()
          );
          const items = Array.from(resultsList.querySelectorAll('li'))
                             .map(li => li.textContent);
          items.forEach((txt, i) => doc.text(txt, 40, 100 + i * 20));
          doc.save('action-plan.pdf');
        };
      });
  });
});
