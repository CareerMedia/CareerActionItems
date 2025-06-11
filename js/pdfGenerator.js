// File: js/pdfGenerator.js

window.generatePDF = function(config, actions) {
  const { templateImageUrl, textPosition } = config;
  const x = textPosition.x, y = textPosition.y;
  const lineHeight = textPosition.lineHeight, fontSize = textPosition.fontSize;
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'px', format: 'a4' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(fontSize);
  doc.setTextColor(0, 0, 0);

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = function() {
    doc.addImage(img, 'PNG', 0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight());

    let cursorY = y;
    actions.forEach(text => {
      let cursorX = x;
      let last = 0, m;
      urlRegex.lastIndex = 0;
      while ((m = urlRegex.exec(text)) !== null) {
        if (m.index > last) {
          const chunk = text.slice(last, m.index);
          doc.text(chunk, cursorX, cursorY);
          cursorX += doc.getTextWidth(chunk);
        }
        const url = m[0];
        doc.text(url, cursorX, cursorY);
        doc.link(cursorX, cursorY - fontSize + 2, doc.getTextWidth(url), fontSize, { url });
        cursorX += doc.getTextWidth(url);
        last = m.index + url.length;
      }
      if (last < text.length) {
        const suffix = text.slice(last);
        doc.text(suffix, cursorX, cursorY);
      }
      cursorY += lineHeight;
    });

    doc.save('action-plan.pdf');
  };
  img.onerror = function() {
    alert('Failed to load PDF background.');
  };
  img.src = templateImageUrl;
};
