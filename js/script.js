// File: js/script.js

document.addEventListener('DOMContentLoaded', function() {
  const { questions } = window.CONFIG;

  // … [form-building code unchanged above] …

  // GENERATE ACTION ITEMS
  submitBtn.addEventListener('click', function() {
    // [build currentActions and render <li class="action-item">…] – unchanged

    // Show spinner, then results…
  });

  // DOWNLOAD PDF
  downloadBtn.addEventListener('click', function() {
    // Gather actions from the rendered list
    const actions = Array.from(document.querySelectorAll('li.action-item'))
      .map(li => li.textContent.trim());

    // Delegate to pdfGenerator
    if (typeof window.generatePDF === 'function') {
      window.generatePDF(window.CONFIG, actions);
    }
  });

  // RESTART
  restartBtn.addEventListener('click', function(e) {
    e.preventDefault();
    window.location.reload();
  });
});
