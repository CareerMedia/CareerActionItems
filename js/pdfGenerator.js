// File: js/pdfGenerator.js

window.generatePDF = function(config, actions) {
  // Ensure config and its properties are defined
  const safeConfig = config || {};
  const textPosition = safeConfig.textPosition || {};
  const templateImageUrl = safeConfig.templateImageUrl;

  if (!templateImageUrl) {
    console.error("PDF generation failed: templateImageUrl is missing.");
    alert("Sorry, the PDF can't be generated because the template image is missing.");
    return;
  }

  const x = textPosition.x || 40;
  const y = textPosition.y || 100;
  const lineHeight = textPosition.lineHeight || 20;
  const fontSize = textPosition.fontSize || 12;
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'px', format: 'a4' });

  // Load background image
  const img = new Image();
  img.crossOrigin = 'anonymous';

  // This function will run AFTER the image has loaded
  img.onload = function() {
    // Draw the background image to fit the page
    doc.addImage(img, 'PNG', 0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight());

    // Set font style for the text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fontSize);
    doc.setTextColor(0, 0, 0); // Black text

    // Add each action item as a new line of text
    let currentY = y;
    actions.forEach(text => {
      // The `splitTextToSize` function handles line breaks automatically
      const lines = doc.splitTextToSize(text, doc.internal.pageSize.getWidth() - (x * 2));
      
      // Add text and links line by line
      doc.text(lines, x, currentY);
      
      // A simplified approach to adding links to the whole text block
      // Note: This creates a single link box around the entire text block if a URL is present.
      // For multiple, distinct links within one action item, the original regex approach is better,
      // but this is a simpler, more robust starting point.
      const match = text.match(urlRegex);
      if (match) {
          match.forEach(url => {
              // This is a simplified linking; for precise link placement, more complex logic is needed.
              doc.link(x, currentY - fontSize, doc.internal.pageSize.getWidth() - (x*2), lines.length * lineHeight, { url });
          });
      }

      currentY += (lines.length * lineHeight);
    });

    // Save the PDF only after everything has been added
    doc.save('action-plan.pdf');
  };

  // This function will run if the image fails to load
  img.onerror = function() {
    console.error("Error loading PDF background image from:", templateImageUrl);
    alert('Unable to load the PDF background image. Please check the template URL.');
  };

  // Start loading the image
  img.src = templateImageUrl;
};
