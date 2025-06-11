// File: js/config.js

// Editable question + logic config
window.CONFIG = {
  // IMPORTANT: Replace this with the final URL to your background image.
  templateImageUrl: 'assets/background.png',

  // --- THIS IS THE CRITICAL FIX ---
  // A standard A4 page is ~595px wide by ~842px tall.
  // The Y coordinate MUST be less than ~800 to be visible.
  textPosition: {
    x: 60,          // Distance from the left edge (e.g., 60)
    y: 270,         // Distance from the top edge (e.g., 150)
    lineHeight: 22, // Vertical spacing between lines
    fontSize: 12    // Point size for PDF text
  },
  questions: [
    { id: 'name', type: 'text', label: 'Name' },
    {
      id: 'experience',
      type: 'radio',
      label: 'How many years have you worked in your field?',
      options: [
        { value: '0-1', label: '0–1', actions: ['Start with our Intro Module: https://canvas.edu/module/intro'] },
        { value: '2-5', label: '2–5', actions: ['Check out Intermediate Strategies: https://canvas.edu/module/intermediate'] },
        { value: '6+',  label: '6+',  actions: ['Advance your skills here: https://canvas.edu/module/advanced'] }
      ]
    },
    {
      id: 'goal',
      type: 'radio',
      label: 'What’s your next career goal?',
      options: [
        { value: 'networking', label: 'Networking', actions: ['Enroll in Networking Basics: https://canvas.edu/module/networking'] },
        { value: 'leadership', label: 'Leadership', actions: ['Explore Leadership 101: https://canvas.edu/module/leadership'] },
        { value: 'technical',  label: 'Technical Skills', actions: ['Visit Tech Mastery: https://canvas.edu/module/technical'] }
      ]
    }
  ]
};
