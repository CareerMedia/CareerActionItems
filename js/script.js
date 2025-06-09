```js
// Fetch config and build form
fetch('js/config.json')
  .then(res => res.json())
  .then(config => {
    const form = document.getElementById('career-form');
    config.questions.forEach(q => {
      let field;
      if (q.type === 'text') {
        field = document.createElement('div');
        field.innerHTML = `
          <label>${q.label}</label>
          <input type="text" id="${q.id}" required />
        `;
      } else if (q.type === 'radio') {
        field = document.createElement('fieldset');
        field.innerHTML = `<legend>${q.label}</legend>` +
          q.options.map(opt =>
            `<label><input type="radio" name="${q.id}" value="${opt.value}" required /> ${opt.label}</label>`
          ).join('');
      }
      form.appendChild(field);
    });
  });

// Handle submission
document.getElementById('submit-btn').addEventListener('click', () => {
  const formContainer = document.getElementById('form-container');
  const loading = document.getElementById('loading-container');
  const results = document.getElementById('results-container');

  // Collect actions
  fetch('js/config.json')
    .then(res => res.json())
    .then(config => {
      const actions = [];
      config.questions.forEach(q => {
        if (q.type === 'radio') {
          const sel = document.querySelector(`input[name="${q.id}"]:checked`);
          if (sel) {
            const opt = q.options.find(o => o.value === sel.value);
            actions.push(...opt.actions);
          }
        }
      });

      // Show loading
      formContainer.classList.add('hidden');
      loading.classList.remove('hidden');
      setTimeout(() => {
        loading.classList.add('hidden');
        // Show results
        const list = document.getElementById('results-list');
        list.innerHTML = actions.map(a => `<li>${a}</li>`).join('');
        results.classList.remove('hidden');
      }, 1000);
    });
});

// Download PDF
document.getElementById('download-btn').addEventListener('click', () => {
  import('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js')
    .then(js => {
      const { jsPDF } = js.jspdf;
      fetch('js/config.json')
        .then(res => res.json())
        .then(config => {
          const doc = new jsPDF({ unit: 'px', format: 'a4' });
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = config.templateImageUrl;
          img.onload = () => {
            doc.addImage(img, 'PNG', 0, 0,
              doc.internal.pageSize.getWidth(),
              doc.internal.pageSize.getHeight());
            const items = Array.from(document.querySelectorAll('#results-list li'))
              .map(li => li.textContent);
            items.forEach((txt, i) => doc.text(txt, 40, 100 + i * 20));
            doc.save('action-plan.pdf');
          };
        });
    });
});
```
