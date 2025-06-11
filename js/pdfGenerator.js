// File: js/pdfGenerator.js

window.generatePDF = function(config, actions) {
  const { templateImageUrl, textPosition } = config;
  const x          = textPosition.x        || 40;
  const y          = textPosition.y        || 100;
  const lineHeight = textPosition.lineHeight || 20;
  const fontSize   = textPosition.fontSize   || 12;
  const urlRegex   = /(https?:\/\/[^\s]+)/g;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'px', format: 'a4' });

  // Set up black text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(fontSize);
  doc.setTextColor(0, 0, 0);

  // Load background and then overlay text
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = function() {
    // Draw full-page template
    doc.addImage(img, 'PNG',
      0, 0,
      doc.internal.pageSize.getWidth(),
      doc.internal.pageSize.getHeight()
    );

    // Overlay each action, preserving links
    let cursorY = y;
    actions.forEach(text => {
      let cursorX = x;
      let lastIndex = 0, match;
      urlRegex.lastIndex = 0;
      while ((match = urlRegex.exec(text)) !== null) {
        // prefix
        if (match.index > lastIndex) {
          const chunk = text.slice(lastIndex, match.index);
          doc.text(chunk, cursorX, cursorY);
          cursorX += doc.getTextWidth(chunk);
        }
        // link
        const url = match[0];
        doc.text(url, cursorX, cursorY);
        doc.link(
          cursorX,
          cursorY - fontSize + 2,
          doc.getTextWidth(url),
          fontSize,
          { url }
        );
        cursorX += doc.getTextWidth(url);
        lastIndex = match.index + url.length;
      }
      // suffix
      if (lastIndex < text.length) {
        const suffix = text.slice(lastIndex);
        doc.text(suffix, cursorX, cursorY);
      }
      cursorY += lineHeight;
    });

    // Finally save
    doc.save('action-plan.pdf');
  };
  img.onerror = function() {
    alert('Unable to load PDF background image.');
  };
  img.src = templateImageUrl;
};
