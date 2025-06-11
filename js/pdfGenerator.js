// File: js/pdfGenerator.js

window.generatePDF = function(config, actions) {
  if (typeof window.jspdf === 'undefined') {
    console.error('jsPDF library is not loaded.');
    alert('Error: The PDF library is missing.');
    if (window.hideLoading) window.hideLoading();
    return;
  }

  const { templateImageUrl, textPosition } = config;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'px', format: 'a4' });
  const pageHeight = doc.internal.pageSize.getHeight();

  // --- SAFETY NET ---
  // Check for invalid coordinates from the config file.
  if (textPosition.y > pageHeight) {
    alert(`Configuration Error: The starting Y coordinate (${textPosition.y}) is outside the page height (${Math.round(pageHeight)}). Please correct your config.js file.`);
    if (window.hideLoading) window.hideLoading();
    return; // Stop execution
  }
  
  // Also check if there are any actions to add
  if (!actions || actions.length === 0) {
    alert('There are no action items to add to the PDF.');
    if (window.hideLoading) window.hideLoading();
    return; // Stop execution
  }


  const addContentAndSave = (loadedImage) => {
    try {
      const pageWidth = doc.internal.pageSize.getWidth();
      
      if (loadedImage) {
        doc.addImage(loadedImage, 'PNG', 0, 0, pageWidth, pageHeight);
      } else {
        console.warn('Background image could not be loaded. Proceeding with a blank background.');
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(textPosition.fontSize);
      doc.setTextColor(0, 0, 0);

      let cursorY = textPosition.y;
      const pageMargin = textPosition.x;

      actions.forEach(text => {
        const maxWidth = pageWidth - (pageMargin * 2);
        const lines = doc.splitTextToSize(text, maxWidth);
        const textBlockHeight = lines.length * textPosition.lineHeight;

        if (cursorY + textBlockHeight > pageHeight - pageMargin) {
          doc.addPage();
          if (loadedImage) {
            doc.addImage(loadedImage, 'PNG', 0, 0, pageWidth, pageHeight);
          }
          cursorY = textPosition.y;
        }
        
        doc.text(lines, textPosition.x, cursorY);
        cursorY += textBlockHeight + (textPosition.lineHeight / 2);
      });

      doc.save('action-plan.pdf');

    } catch (error) {
      console.error('An error occurred during PDF content creation:', error);
      alert('Sorry, an error occurred while creating the PDF content.');
    } finally {
      if (window.hideLoading) window.hideLoading();
    }
  };

  const img = new Image();
  img.crossOrigin = 'Anonymous';
  img.onload = function() {
    addContentAndSave(this); 
  };
  img.onerror = function() {
    console.error(`Failed to load template image from: ${templateImageUrl}.`);
    alert('Warning: The PDF background image could not be loaded. Your PDF will be generated without it.');
    addContentAndSave(null);
  };
  img.src = templateImageUrl;
};
