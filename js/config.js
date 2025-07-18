// File: js/config.js

// Editable question + logic config
window.CONFIG = {
  templateImageUrl: 'assets/background.png',
  textPosition: {
    x: 370,         // X coordinate for PDF text
    y: 1280,        // Y coordinate for PDF text
    lineHeight: 24, // Vertical spacing between lines
    fontSize: 14    // Point size for PDF text
  },
  questions: [
    { id: 'name', type: 'text', label: 'Name' },
    {
      id: 'selfKnowledge',
      type: 'radio',
      label: 'Now that you’ve uncovered your top three interest themes, which action will you take next to turn that self-knowledge into the beginning steps of your career exploration?',
      options: [
        {
          value: 'learn_interest_themes',
          label: 'Learn what your Interest Themes mean',
          actions: [
            'Log into CareerLink, navigate to “Self-Knowledge,” and read the definitions of each of your interest themes. Link: https://www.csun.edu/careerlink/self-knowledge/meaning-behind-your-onet-interest-profiler-results'
          ]
        },
        {
          value: 'attend_drop_in',
          label: 'Attend a drop-in session at the Career Center',
          actions: [
            'Visit the Career Center to attend a virtual or in-person drop-in. Bring your interest results and explore resources that showcase which majors and career paths best suit you. Link: https://www.csun.edu/career/services'
          ]
        },
        {
          value: 'identify_values_strengths',
          label: 'Identify your values and strengths',
          actions: [
            'Schedule a career counseling appointment at the Career Center to complete assessments that uncover your values and strengths. Link: https://www.csun.edu/career'
          ]
        }
      ]
    },
    {
      id: 'research',
      type: 'radio',
      label: 'To narrow down your list of potential majors or careers this semester, which research activity will you complete?',
      options: [
        {
          value: 'explore_majors',
          label: 'Explore majors',
          actions: [
            'Review two CSUN academic programs in CareerLink that match your Interest Profiler results and save them to your Academic Programs Dashboard. Then note their required courses and typical career outcomes. Link: https://www.csun.edu/careerlink/academic-programs/browse-majors'
          ]
        },
        {
          value: 'explore_careers',
          label: 'Explore careers',
          actions: [
            'Review Career Profiles in CareerLink and bookmark three Career Profiles that match your Interest Profiler results and save them to your Career Profiles Dashboard. Then note each profile’s salary range and job outlook. Link: https://www.csun.edu/careerlink/career-profiles/browse'
          ]
        },
        {
          value: 'attend_workshop',
          label: 'Attend a Career Center Workshop',
          actions: [
            'Register for and attend one Career Center workshop on industry trends or job search preparation (e.g., resume building, interview strategies, etc.). Link: https://news.csun.edu/organizer/career-center/?eventDisplay=past'
          ]
        }
      ]
    },
    {
      id: 'decisionMaking',
      type: 'radio',
      label: 'Which support service will you engage with this semester to turn your research into a concrete career plan?',
      options: [
        {
          value: 'meet_career_counselor',
          label: 'Meet with a Career Counselor',
          actions: [
            'Schedule a one-hour appointment to map out short- and long-term career goals and build a draft action plan. Link: https://www.csun.edu/career'
          ]
        },
        {
          value: 'meet_academic_advisor',
          label: 'Meet with an Academic Advisor',
          actions: [
            'Meet with your academic advisor to align your course plan with your chosen career path and confirm prerequisites. Link: https://www.csun.edu/University-Advising'
          ]
        },
        {
          value: 'meet_mentor',
          label: 'Meet with a Mentor',
          actions: [
            'Meet with someone you trust (mentor, professor, supervisor, alumni, trusted family or friend) to help guide your decision on a major or career path. Link: http://csun.protopia.co/'
          ]
        }
      ]
    },
    {
      id: 'realWorldExperience',
      type: 'radio',
      label: 'Which experiential opportunity will you pursue this semester to better understand your career path?',
      options: [
        {
          value: 'informational_job_shadowing',
          label: 'Informational Interviewing or Job Shadowing',
          actions: [
            'Meet with a professional from a career field of your interest to job shadow or conduct an informational interview. Link: https://www.csun.edu/careerlink/handshake-jobs-internships-more/informational-interviewing',
            'Job Shadowing Link: https://www.csun.edu/careerlink/handshake-jobs-internships-more/job-shadowing',
            'Corporate Connect Link: https://www.csun.edu/alumni/corporate-connect'
          ]
        },
        {
          value: 'internship_oncampus_job',
          label: 'Internship or On-Campus Job',
          actions: [
            'Apply to at least one internship or on-campus job in Handshake that aligns with your career path. Link: https://csun.joinhandshake.com/'
          ]
        },
        {
          value: 'student_org_involvement',
          label: 'Student Organization Involvement',
          actions: [
            'On MataSync, find and join a club that aligns with your interests. Attend the next meeting or event to start networking with peers and alumni in that field. Link: https://csun.campuslabs.com/engage/'
          ]
        },
        {
          value: 'micro_internship_parker_dewey',
          label: 'Micro-Internship with Parker-Dewey',
          actions: [
            'Complete one paid or unpaid micro-internship project through Parker Dewey. Link: https://www.csun.edu/careerlink/internships/micro-internships-parker-dewey'
          ]
        }
      ]
    },
    {
      id: 'growDevelop',
      type: 'radio',
      label: 'How will you continue building your professional skills this semester?',
      options: [
        {
          value: 'linkedin_learning',
          label: 'Complete a LinkedIn Learning course',
          actions: [
            'Complete one LinkedIn Learning course in a professional skill you want to develop and share your certificate on LinkedIn. Link: https://www.csun.edu/it/linkedin-learning'
          ]
        },
        {
          value: 'forage_simulation',
          label: 'Complete a job-simulation on Forage',
          actions: [
            'Complete one job-simulation on Forage that relates to your major or career path. Link: https://www.csun.edu/careerlink/career-readiness-and-planning/forage-experience-real-world-job-trainings'
          ]
        },
        {
          value: 'campus_involvement',
          label: 'Become involved on campus',
          actions: [
            'Actively participate in student life through clubs, organizations, events, or leadership opportunities. Link: https://www.csun.edu/as/jobs'
          ]
        },
        {
          value: 'practice_interview',
          label: 'Practice interview skills with a Career Counselor',
          actions: [
            'Schedule a career counseling appointment to complete a mock interview and receive immediate feedback. Link: https://www.csun.edu/careerlink/job-search-preparation/interviewing'
          ]
        }
      ]
    }
  ]
};
