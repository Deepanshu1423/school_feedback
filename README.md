# School Feedback System

A full-stack School Feedback System built for collecting and managing **Parent → Teacher feedback** in a structured, user-friendly way.

## Project Overview

This project helps schools collect feedback from parents for their children’s teachers, allows teachers to review and respond to that feedback, and gives admins full control over users, classes, subjects, mappings, reports, and feedback forms.

## Tech Stack

### Frontend
- React.js
- React Router DOM
- Axios
- Tailwind CSS / Custom CSS

### Backend
- Node.js
- Express.js
- MySQL
- JWT Authentication

## Main Modules

### Parent Module
- Parent login
- Child selection dropdown
- Parent dashboard
- Submit feedback
- Feedback history
- View teacher response

### Teacher Module
- Teacher login
- Teacher dashboard
- Teacher feedback list
- Submit / edit response

### Admin Module
- Admin login
- Admin dashboard
- Teachers management
- Parents management
- Students management
- Classes management
- Subjects management
- Mappings management
- Feedback forms management
- Reports management
- All feedbacks management

## Key Features

- Role-based login system
- Parent → Teacher feedback flow
- Teacher response flow
- Admin control panel
- Child-wise feedback tracking
- Dynamic teacher / subject dropdown filtering
- Feedback status tracking
- Responsive UI for mobile and laptop
- Compact bronze / cream / black theme
- Search, filter, sorting, and clear actions on multiple pages

## Current Workflow

1. Parent logs in
2. Parent selects child
3. Parent submits feedback for mapped teacher and subject
4. Feedback is stored in database
5. Teacher logs in and checks feedback list
6. Teacher responds to feedback
7. Parent can view response in feedback history
8. Admin manages users, mappings, forms, and reports

## Database Design

Main tables used in the project:

- `master_Roles`
- `user_Details`
- `user_Admins`
- `user_Teachers`
- `user_Parents`
- `master_Classes`
- `master_Subjects`
- `user_Students`
- `user_ParentStudentMapping`
- `user_TeacherClassSubjectMapping`
- `master_FeedbackForms`
- `user_Feedbacks`

## Project Structure

```text
School Feedback System/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── app.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── auth/
│   │   │   ├── parent/
│   │   │   └── teacher/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md
