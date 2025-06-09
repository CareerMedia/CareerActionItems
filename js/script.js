document.addEventListener('DOMContentLoaded', () => {
  const formEl       = document.getElementById('career-form');
  const submitBtn    = document.getElementById('submit-btn');
  const loadingEl    = document.getElementById('loading-container');
  const formContainer= document.getElementById('form-container');
  const resultsEl    = document.getElementById('results-container');
  const resultsList  = document.getElementById('results-list');

  // Load config and build the form
  fetch('./js/config.json')
    .then(res => {
      if (!res.ok) throw new Error(`Couldn't load config.json: ${res.status} ${res.statusText}`);
      return res.json();
    })
    .then(config => {
      config.questions.forEach(q => {
        let wrapper = document.createElement('div');
        if (q.type === 'text') {
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
    })
    .catch(err => {
      console.error(err);
      formContainer.innerHTML = `<p style="color:red">Error loading form. Check console.</p>`;
    });

  submitBtn.addEventListener('click', () => {
    // Gather actions
    fetch('./js/config.json')
      .then(res => res.json())
      .then(config => {
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

        // Show loading, then results
        formContainer.classList.add('hidden');
        loadingEl.classList.remove('hidden');

        setTimeout(() => {
          loadingEl.classList.add('hidden');
          resultsList.innerHTML = allActions.map(a => `<li>${a}</li>`).join('');
          resultsEl.classList.remove('hidden');
        }, 800);
      });
  });

  // PDF download remains the same; you only trigger after results are shown
  document.getElementById('download-btn').addEventListener('click', () => {
    import('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js')
      .then(js => {
        const { jsPDF } = js.jspdf;
        fetch('./js/config.json')
          .then(res => res.json())
          .then(config => {
            const doc   = new jsPDF({ unit: 'px', format: 'a4' });
            const img   = new Image();
            img.crossOrigin = 'anonymous';
            img.src = config.templateImageUrl;
            img.onload = () => {
              doc.addImage(img, 'PNG', 0, 0,
                doc.internal.pageSize.getWidth(),
                doc.internal.pageSize.getHeight());
              const items = Array.from(resultsList.querySelectorAll('li'))
                                 .map(li => li.textContent);
              items.forEach((txt, i) => doc.text(txt, 40, 100 + i * 20));
              doc.save('action-plan.pdf');
            };
          });
      });
  });
});
