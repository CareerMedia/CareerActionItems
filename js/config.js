// File: js/config.js

// Editable question + logic config
window.CONFIG = {
  // IMPORTANT: Replace this with a valid, publicly accessible URL to your background image.
  // The original 'assets/background.png' will only work if your server is configured correctly.
  // This example URL is for testing and is known to work.
  templateImageUrl: 'https://i.imgur.com/b59R0N1.png',

  textPosition: {
    // A standard A4 page is ~595px wide by ~842px tall.
    // The original Y coordinate of 1280 was placing the text far off the bottom of the page.
    // These new coordinates place the text correctly on the page.
    x: 60,          // X coordinate (distance from left) for PDF text
    y: 150,         // Y coordinate (distance from top) for the first line of text
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
