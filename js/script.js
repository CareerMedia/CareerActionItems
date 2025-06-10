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

  // INITIAL STATE: show form, hide spinner/results
  formCont.classList.remove('hidden');
  loadCont.classList.add('hidden');
  resCont.classList.add('hidden');

  // BUILD FORM FIELDS
  questions.forEach(q => {
    let wrapper;
    if (q.type === 'text') {
      wrapper = document.createElement('div');
      wrapper.innerHTML = `<label for="${q.id}">${q.label}</label><input type="text" id="${q.id}" name="${q.id}" required/>`;
    } else if (q.type === 'radio') {
      wrapper = document.createElement('fieldset');
      wrapper.innerHTML = `<legend>${q.label}</legend>` +
        q.options.map(opt => `<label><input type="radio" name="${q.id}" value="${opt.value}" required/> ${opt.label}</label>`).join('');
    }
    formEl.appendChild(wrapper);
  });

  // GENERATE ACTION ITEMS
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

    // SHOW SPINNER
    formCont.classList.add('hidden');
    resCont.classList.add('hidden');
    loadCont.classList.remove('hidden');

    setTimeout(() => {
      // HIDE SPINNER, DISPLAY RESULTS
      loadCont.classList.add('hidden');
      resList.innerHTML = actions.map(a => `<li>${a.replace(urlRegex, url => `<a href="${url}" target="_blank">${url}</a>`)}</li>`).join('');
      resCont.classList.remove('hidden');
    }, 800);
  });

  // DOWNLOAD PDF
  downloadBtn.addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'px', format: 'a4' });

    fetch(templateImageUrl)
      .then(res => { if (!res.ok) throw new Error(`Template fetch failed: ${res.status}`); return res.blob(); })
      .then(blob => new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result);
        reader.onerror = e => rej(e);
        reader.readAsDataURL(blob);
      }))
      .then(dataUrl => {
        doc.addImage(dataUrl, 'PNG', 0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight());
        Array.from(resList.querySelectorAll('li')).forEach((li, idx) => {
          const txt = li.textContent;
          doc.text(txt, xOffset, yOffset + idx * lineHeight, { link: urlRegex.test(txt) ? txt.match(urlRegex)[0] : undefined });
        });
        doc.save('action-plan.pdf');
      })
      .catch(err => { console.error('PDF error:', err); alert('Error generating PDF.'); });
  });

  // RESTART FORM
  if (restartBtn) {
    restartBtn.addEventListener('click', e => {
      e.preventDefault();
      window.location.reload();
    });
  }
});
