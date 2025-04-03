
# TalentLink Job Platform

A comprehensive job search and recruitment platform built with React (frontend) and Flask/SQLite (backend).

## Features

- **Dual User Types**:
  - Job seekers can browse jobs, upload resumes, and track applications
  - Employers can post jobs and manage applicants
  
- **Authentication System**:
  - Register, login, and profile management
  
- **Dashboard with Analytics**:
  - Visual metrics using charts and graphs
  - Application status tracking
  
- **Mock Users for Testing**:
  - Job Seeker: username `muser`, password `muser`
  - Employer: username `mvc`, password `mvc`

## Technical Stack

### Frontend
- React with TypeScript
- Tailwind CSS
- shadcn/ui components
- AG Grid (for data tables)
- Recharts (for graphs and charts)

### Backend
- Flask (Python)
- SQLite (Database)
- RESTful API architecture

## Setup Instructions

### Frontend

1. Install Node.js dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

### Backend

1. Create a Python virtual environment (optional but recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Start the Flask server:
```bash
python app.py
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login

### Jobs
- `GET /api/jobs` - Get all active jobs
- `GET /api/jobs/:id` - Get a specific job
- `POST /api/jobs` - Create a new job
- `PUT /api/jobs/:id` - Update a job
- `DELETE /api/jobs/:id` - Delete a job
- `GET /api/employers/:id/jobs` - Get all jobs posted by an employer

### Applications
- `GET /api/users/:id/applications` - Get all applications for a user
- `GET /api/jobs/:id/applications` - Get all applications for a job
- `POST /api/jobs/:id/apply` - Apply for a job
- `PUT /api/applications/:id/status` - Update application status
- `PUT /api/applications/:id/notes` - Update application notes

### Resumes
- `GET /api/users/:id/resumes` - Get all resumes for a user
- `POST /api/users/:id/resumes` - Upload a new resume
- `DELETE /api/resumes/:id` - Delete a resume
- `PUT /api/users/:id/resumes/:id/default` - Set a resume as default

### Stats
- `GET /api/employers/:id/stats` - Get employer statistics
- `GET /api/users/:id/stats` - Get job seeker statistics

## License

MIT
