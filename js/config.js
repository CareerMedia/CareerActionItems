// Editable question + logic config
window.CONFIG = {
  templateImageUrl: 'assets/background.png',
  textPosition: { x: 370, y: 1280, lineHeight: 24 },
  questions: [
    {
      id: 'name',
      type: 'text',
      label: 'Name'
    },
    {
      id: 'experience',
      type: 'radio',
      label: 'How many years have you worked in your field?',
      options: [
        { value: '0-1', label: '0–1', actions: ['Start with our Intro Module on Canvas: https://canvas.edu/module/intro'] },
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
        { value: 'technical', label: 'Technical Skills', actions: ['Visit Tech Mastery: https://canvas.edu/module/technical'] }
      ]
    }
  ]
};
