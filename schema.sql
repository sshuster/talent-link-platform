
-- SQLite schema for TalentLink Job Platform

-- Drop tables if they exist
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS resumes;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    user_type TEXT NOT NULL CHECK(user_type IN ('seeker', 'employer')),
    created_at TEXT NOT NULL,
    profile_pic TEXT,
    bio TEXT
);

-- Jobs table
CREATE TABLE jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    salary TEXT NOT NULL,
    job_type TEXT NOT NULL CHECK(job_type IN ('full-time', 'part-time', 'contract', 'remote')),
    posted_date TEXT NOT NULL,
    employer_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'closed')),
    FOREIGN KEY (employer_id) REFERENCES users (id)
);

-- Resumes table
CREATE TABLE resumes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    file_name TEXT NOT NULL,
    upload_date TEXT NOT NULL,
    is_default INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Applications table
CREATE TABLE applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    resume_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'reviewed', 'interviewed', 'offered', 'rejected')),
    applied_date TEXT NOT NULL,
    notes TEXT,
    FOREIGN KEY (job_id) REFERENCES jobs (id),
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (resume_id) REFERENCES resumes (id)
);

-- Create indexes for better performance
CREATE INDEX idx_jobs_employer_id ON jobs (employer_id);
CREATE INDEX idx_resumes_user_id ON resumes (user_id);
CREATE INDEX idx_applications_job_id ON applications (job_id);
CREATE INDEX idx_applications_user_id ON applications (user_id);
