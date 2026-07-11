# Career Companion

*A guided job-search companion built with React, designed to help entry-level software engineers, bootcamp students, and career changers stay organized, focused, and confident throughout their career journey.*

---

## Overview

Searching for a software engineering job can quickly become overwhelming. Opportunities are spread across multiple job boards, application materials live in different documents, and it is easy to lose momentum while trying to manage everything at once.

Career Companion was created to solve that problem.

Instead of treating the job search as one large task, Career Companion guides users through small, intentional career actions while providing one central workspace for discovering opportunities, tracking applications, organizing resume content, planning next steps, and staying focused on consistent progress.

This project was built as a front-end React application that integrates a live external API while demonstrating component reuse, asynchronous data fetching, state management, routing, and responsive interface design.

---

# Product Vision

Career Companion is built around one simple idea:

> **Small, consistent actions build meaningful career growth.**

Rather than overwhelming users with dozens of job postings and disconnected tools, the application encourages steady progress through guided workflows and organized career planning.

The experience is designed specifically for:

- Software Engineering students
- Bootcamp graduates
- Career changers
- Entry-level developers
- Anyone beginning their first technology job search

---

# Core Features

## Today Dashboard

The Today page provides users with a focused starting point for each session.

Features include:

- Personalized greeting
- Guided daily career action
- Three-stage workflow
  - Ready
  - Active
  - Complete
- Weekly progress summary
- Quick navigation to the Action Plan

This page encourages users to focus on one meaningful task rather than becoming overwhelmed by the entire job-search process.

---

## Opportunities

Career Companion connects to the **Remotive Public Jobs API** to retrieve live software engineering opportunities.

Users can:

- Search by keyword
- Browse remote software engineering positions
- View company information
- Review job type and location
- Open the original application
- Save opportunities for later review

The application gracefully handles:

- Loading states
- Network errors
- Empty search results

---

## Opportunity Tracker

Saved opportunities are stored using browser localStorage so users can return to them later.

Features include:

- Saved opportunities
- Remove saved opportunities
- External application links
- Persistent storage after refresh
- Empty-state messaging

---

## Resume Workspace

The Resume page provides a lightweight workspace where users can organize resume content before transferring it into a final resume.

Users can save:

- Target role
- Professional summary
- Technical skills
- Experience highlights

Changes are automatically reflected in a live preview and remain available after refreshing the browser.

---

## Action Plan

The Action Plan breaks the job search into manageable tasks.

Users can:

- Track completed tasks
- Monitor overall progress
- Reset their action plan
- Continue building daily momentum

Progress is automatically saved using localStorage.

---

## Profile

The Profile page stores personal career preferences including:

- Name
- Target role
- Preferred location
- Weekly application goal
- Career focus

A live profile summary updates as users edit their information.

---

# Technical Highlights

Career Companion demonstrates several core React concepts including:

- Component-based architecture
- React Router navigation
- React Hooks
- Controlled components
- Asynchronous API requests
- Dynamic rendering
- Conditional rendering
- State management
- LocalStorage persistence
- Reusable UI components
- Responsive layout

---

# Technology Stack

| Technology | Purpose |
|------------|---------|
| React | User Interface |
| Vite | Development & Build Tool |
| JavaScript (ES6+) | Application Logic |
| React Router | Client-side Routing |
| CSS | Styling |
| Fetch API | External Data Requests |
| localStorage | Client-side Persistence |
| Git | Version Control |
| GitHub | Repository Hosting |

---

# External API

Career Companion uses the **Remotive Public Jobs API**.

Base Endpoint

```
https://remotive.com/api/remote-jobs
```

Example Request

```
https://remotive.com/api/remote-jobs?search=software engineer&category=software-dev&limit=20
```

The API data is normalized before being rendered to ensure the UI remains consistent regardless of the response format.

---

# Routing

The application uses React Router to provide six primary views.

```
/
├── Today
├── Opportunities
├── Tracker
├── Resume
├── Action Plan
└── Profile
```

---

# Project Structure

```
career-companion
│
├── README.md
│
└── frontend
    │
    ├── src
    │
    ├── components
    │      ├── AppLayout
    │      ├── Sidebar
    │      ├── Button
    │      ├── Greeting
    │      ├── GuidanceCard
    │      ├── GuidedSession
    │      ├── CompletionCard
    │      ├── ProgressSummary
    │      ├── PageCard
    │      └── opportunities
    │
    ├── pages
    │
    ├── services
    │
    ├── utils
    │
    ├── App.jsx
    └── main.jsx
```

---

# Installation

Clone the repository

```bash
git clone https://github.com/ashlibriggs/career-companion.git
```

Navigate into the project

```bash
cd career-companion/frontend
```

Install dependencies

```bash
npm install
```

Run the development server

```bash
npm run dev
```

Create a production build

```bash
npm run build
```

---

# Engineering Decisions

Several design decisions were intentionally made during development.

### Component Reuse

Reusable components such as Buttons, Cards, Layouts, and Navigation help reduce duplicated code while keeping the project organized.

### Separation of Concerns

API logic is isolated inside the services folder while browser persistence is managed through reusable utility functions.

### User Experience

Rather than displaying only job listings, the application was designed around a guided workflow that helps users maintain momentum throughout their job search.

### Persistence

Important user information remains available after refreshing the page through browser localStorage.

---

# Challenges

Some of the most valuable learning experiences during this project included:

- Working with asynchronous API requests
- Handling loading, empty, and error states
- Managing React state across multiple pages
- Designing reusable components
- Persisting application data with localStorage
- Organizing a growing React project into maintainable folders

---

# Future Improvements

Future versions of Career Companion could include:

- User authentication
- Cloud database storage
- Application status tracking
- Interview scheduling
- Calendar integration
- AI-assisted resume feedback
- Personalized career recommendations
- Saved searches
- Advanced filtering
- Resume version management
- Analytics dashboard
- AI-powered career coaching

---

# Known Limitations

Current limitations include:

- Browser-only localStorage persistence
- No backend database
- No user authentication
- Limited filtering options
- No multi-device synchronization
- Availability depends on the external API

---

# Testing

The application was manually tested for:

- Route navigation
- API requests
- Search functionality
- Loading states
- Error handling
- Empty states
- Saved opportunities
- Resume persistence
- Action Plan persistence
- Profile persistence
- Browser refresh behavior

The application successfully passes a production build using:

```bash
npm run build
```

---

# What I Learned

Building Career Companion strengthened my understanding of:

- React component architecture
- State management
- React Router
- Asynchronous JavaScript
- API integration
- LocalStorage persistence
- UI organization
- Product thinking
- Incremental feature development
- Debugging real-world React applications

More importantly, this project reinforced the value of building software around the user's experience rather than simply implementing technical features.

---

# Author

**Ashli Briggs**

Software Engineering Student • Future AI Product Engineer

GitHub:
https://github.com/ashlibriggs

---

## Acknowledgements

This project was developed as part of the SMU Software Engineering Bootcamp (powered by Flatiron School) and represents the first capstone project focused on React development, external API integration, and modern frontend engineering practices.