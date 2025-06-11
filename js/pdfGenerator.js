// File: js/pdfGenerator.js

window.generatePDF = function(config, actions) {
  // --- 1. Pre-flight Checks and Setup ---
  // Note: The loading spinner is shown in script.js before this function is called.

  if (typeof window.jspdf === 'undefined') {
    console.error('jsPDF library is not loaded.');
    alert('Error: The PDF library is missing.');
    if (window.hideLoading) window.hideLoading(); // Hide spinner on failure
    return;
  }

  const { templateImageUrl, textPosition } = config;
  const { jsPDF } = window.jspdf;

  const { x, y, lineHeight, fontSize } = textPosition;
  const pageMargin = x;

  // --- 2. Create PDF and Load Image Asynchronously ---
  const doc = new jsPDF({ unit: 'px', format: 'a4' });
  const img = new Image();
  img.crossOrigin = 'Anonymous'; // Necessary for cross-domain images

  // This function runs ONLY when the image has successfully loaded
  img.onload = function() {
    try {
      // --- 3. Add Content to the PDF ---
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      doc.addImage(this, 'PNG', 0, 0, pageWidth, pageHeight);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(fontSize);
      doc.setTextColor(0, 0, 0); // Black

      let cursorY = y;

      actions.forEach(text => {
        const maxWidth = pageWidth - (pageMargin * 2);
        const lines = doc.splitTextToSize(text, maxWidth); // Auto-wrap text

        // Check if the text block will fit on the current page
        const textBlockHeight = lines.length * lineHeight;
        if (cursorY + textBlockHeight > pageHeight - pageMargin) {
          doc.addPage();
          doc.addImage(this, 'PNG', 0, 0, pageWidth, pageHeight); // Add background to new page
          cursorY = y; // Reset cursor for the new page
        }
        
        doc.text(lines, x, cursorY);

        // A simplified method to add a link if the text contains a URL
        const urlMatch = text.match(/(https?:\/\/[^\s]+)/);
        if (urlMatch) {
            doc.link(x, cursorY - fontSize, maxWidth, textBlockHeight, { url: urlMatch[0] });
        }

        // Move the cursor down for the next action item
        cursorY += textBlockHeight + (lineHeight / 2); // Add a small gap between items
      });

      // --- 4. Save the PDF ---
      doc.save('action-plan.pdf');
    } catch (error) {
      console.error('An error occurred during PDF creation:', error);
      alert('Sorry, there was an error while creating the PDF.');
    } finally {
      // Hide the loading spinner after saving or on error
      if (window.hideLoading) window.hideLoading();
    }
  };

  // This function runs if the image fails to load
  img.onerror = function() {
    console.error(`Failed to load template image from: ${templateImageUrl}. Check the URL and server's CORS policy.`);
    alert('The PDF could not be created because the background image failed to load.');
    if (window.hideLoading) window.hideLoading(); // Hide spinner on failure
  };

  // Trigger the image loading process
  img.src = templateImageUrl;
};
