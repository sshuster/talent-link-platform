
# Python Flask Backend for TalentLink Job Platform
from flask import Flask, request, jsonify, g
import sqlite3
import os
import json
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

# Initialize Flask app
app = Flask(__name__)

# Database configuration
DATABASE = 'talentlink.db'

# Helper functions for database operations
def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def query_db(query, args=(), one=False):
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv

def execute_db(query, args=()):
    conn = get_db()
    cur = conn.execute(query, args)
    conn.commit()
    cur.close()
    return cur.lastrowid

# Initialize database
def init_db():
    with app.app_context():
        db = get_db()
        with app.open_resource('schema.sql', mode='r') as f:
            db.executescript(f.read())
        
        # Insert mock users if they don't exist
        user_muser = query_db('SELECT * FROM users WHERE username = ?', ('muser',), one=True)
        if not user_muser:
            execute_db(
                'INSERT INTO users (username, email, password_hash, user_type, created_at) VALUES (?, ?, ?, ?, ?)',
                ('muser', 'muser@example.com', generate_password_hash('muser'), 'seeker', datetime.now().isoformat())
            )
        
        user_mvc = query_db('SELECT * FROM users WHERE username = ?', ('mvc',), one=True)
        if not user_mvc:
            execute_db(
                'INSERT INTO users (username, email, password_hash, user_type, created_at) VALUES (?, ?, ?, ?, ?)',
                ('mvc', 'mvc@example.com', generate_password_hash('mvc'), 'employer', datetime.now().isoformat())
            )

# Ensure the database exists
if not os.path.exists(DATABASE):
    with app.app_context():
        init_db()

# API Routes

# Auth routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    user_type = data.get('userType')
    
    if not all([username, email, password, user_type]):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Check if user already exists
    existing_user = query_db('SELECT * FROM users WHERE username = ? OR email = ?', 
                             (username, email), one=True)
    
    if existing_user:
        return jsonify({'error': 'Username or email already in use'}), 409
    
    # Create new user
    user_id = execute_db(
        'INSERT INTO users (username, email, password_hash, user_type, created_at) VALUES (?, ?, ?, ?, ?)',
        (username, email, generate_password_hash(password), user_type, datetime.now().isoformat())
    )
    
    return jsonify({
        'message': 'User registered successfully',
        'user_id': user_id
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if not all([username, password]):
        return jsonify({'error': 'Missing username or password'}), 400
    
    # Get user
    user = query_db('SELECT * FROM users WHERE username = ?', (username,), one=True)
    
    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({'error': 'Invalid username or password'}), 401
    
    # Convert user row to dict
    user_dict = dict(user)
    # Remove password hash before returning
    del user_dict['password_hash']
    
    return jsonify(user_dict), 200

# Job routes
@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    jobs = query_db('SELECT * FROM jobs WHERE status = "active" ORDER BY posted_date DESC')
    return jsonify([dict(job) for job in jobs]), 200

@app.route('/api/jobs/<int:job_id>', methods=['GET'])
def get_job(job_id):
    job = query_db('SELECT * FROM jobs WHERE id = ?', (job_id,), one=True)
    
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    
    return jsonify(dict(job)), 200

@app.route('/api/jobs', methods=['POST'])
def create_job():
    data = request.json
    
    required_fields = ['title', 'company', 'location', 'description', 'requirements', 
                       'salary', 'jobType', 'employerId']
    
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    job_id = execute_db(
        '''INSERT INTO jobs (title, company, location, description, requirements, salary, 
           job_type, posted_date, employer_id, status) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
        (data['title'], data['company'], data['location'], data['description'], 
         data['requirements'], data['salary'], data['jobType'], datetime.now().isoformat(), 
         data['employerId'], 'active')
    )
    
    new_job = query_db('SELECT * FROM jobs WHERE id = ?', (job_id,), one=True)
    
    return jsonify(dict(new_job)), 201

@app.route('/api/jobs/<int:job_id>', methods=['PUT'])
def update_job(job_id):
    data = request.json
    job = query_db('SELECT * FROM jobs WHERE id = ?', (job_id,), one=True)
    
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    
    # Update only provided fields
    update_fields = []
    update_values = []
    
    for key, value in data.items():
        if key == 'jobType':
            update_fields.append('job_type = ?')
            update_values.append(value)
        elif key in ['title', 'company', 'location', 'description', 'requirements', 'salary', 'status']:
            update_fields.append(f"{key} = ?")
            update_values.append(value)
    
    if not update_fields:
        return jsonify({'error': 'No valid fields to update'}), 400
    
    update_values.append(job_id)
    
    execute_db(
        f'''UPDATE jobs SET {', '.join(update_fields)} 
           WHERE id = ?''',
        tuple(update_values)
    )
    
    updated_job = query_db('SELECT * FROM jobs WHERE id = ?', (job_id,), one=True)
    
    return jsonify(dict(updated_job)), 200

@app.route('/api/jobs/<int:job_id>', methods=['DELETE'])
def delete_job(job_id):
    job = query_db('SELECT * FROM jobs WHERE id = ?', (job_id,), one=True)
    
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    
    execute_db('DELETE FROM jobs WHERE id = ?', (job_id,))
    
    return jsonify({'message': 'Job deleted successfully'}), 200

@app.route('/api/employers/<int:employer_id>/jobs', methods=['GET'])
def get_employer_jobs(employer_id):
    jobs = query_db('SELECT * FROM jobs WHERE employer_id = ? ORDER BY posted_date DESC', (employer_id,))
    return jsonify([dict(job) for job in jobs]), 200

# Application routes
@app.route('/api/users/<int:user_id>/applications', methods=['GET'])
def get_user_applications(user_id):
    applications = query_db(
        'SELECT * FROM applications WHERE user_id = ? ORDER BY applied_date DESC', 
        (user_id,)
    )
    return jsonify([dict(app) for app in applications]), 200

@app.route('/api/jobs/<int:job_id>/applications', methods=['GET'])
def get_job_applications(job_id):
    applications = query_db(
        'SELECT a.*, u.username, u.email FROM applications a JOIN users u ON a.user_id = u.id WHERE a.job_id = ? ORDER BY a.applied_date DESC', 
        (job_id,)
    )
    return jsonify([dict(app) for app in applications]), 200

@app.route('/api/jobs/<int:job_id>/apply', methods=['POST'])
def apply_for_job(job_id):
    data = request.json
    user_id = data.get('userId')
    resume_id = data.get('resumeId')
    
    if not all([user_id, resume_id]):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Check if job exists
    job = query_db('SELECT * FROM jobs WHERE id = ?', (job_id,), one=True)
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    
    # Check if already applied
    existing_app = query_db(
        'SELECT * FROM applications WHERE job_id = ? AND user_id = ?', 
        (job_id, user_id), 
        one=True
    )
    
    if existing_app:
        return jsonify({'error': 'You have already applied for this job'}), 409
    
    app_id = execute_db(
        '''INSERT INTO applications (job_id, user_id, resume_id, status, applied_date) 
           VALUES (?, ?, ?, ?, ?)''',
        (job_id, user_id, resume_id, 'pending', datetime.now().isoformat())
    )
    
    new_app = query_db('SELECT * FROM applications WHERE id = ?', (app_id,), one=True)
    
    return jsonify(dict(new_app)), 201

@app.route('/api/applications/<int:app_id>/status', methods=['PUT'])
def update_application_status(app_id):
    data = request.json
    status = data.get('status')
    
    if not status:
        return jsonify({'error': 'Missing status'}), 400
    
    application = query_db('SELECT * FROM applications WHERE id = ?', (app_id,), one=True)
    
    if not application:
        return jsonify({'error': 'Application not found'}), 404
    
    execute_db('UPDATE applications SET status = ? WHERE id = ?', (status, app_id))
    
    updated_app = query_db('SELECT * FROM applications WHERE id = ?', (app_id,), one=True)
    
    return jsonify(dict(updated_app)), 200

@app.route('/api/applications/<int:app_id>/notes', methods=['PUT'])
def update_application_notes(app_id):
    data = request.json
    notes = data.get('notes')
    
    application = query_db('SELECT * FROM applications WHERE id = ?', (app_id,), one=True)
    
    if not application:
        return jsonify({'error': 'Application not found'}), 404
    
    execute_db('UPDATE applications SET notes = ? WHERE id = ?', (notes, app_id))
    
    updated_app = query_db('SELECT * FROM applications WHERE id = ?', (app_id,), one=True)
    
    return jsonify(dict(updated_app)), 200

# Resume routes
@app.route('/api/users/<int:user_id>/resumes', methods=['GET'])
def get_user_resumes(user_id):
    resumes = query_db(
        'SELECT * FROM resumes WHERE user_id = ? ORDER BY upload_date DESC', 
        (user_id,)
    )
    return jsonify([dict(resume) for resume in resumes]), 200

@app.route('/api/users/<int:user_id>/resumes', methods=['POST'])
def upload_resume(user_id):
    # Check if user exists
    user = query_db('SELECT * FROM users WHERE id = ?', (user_id,), one=True)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # In a real app, we would handle file uploads here
    title = request.form.get('title')
    
    if not title:
        return jsonify({'error': 'Missing resume title'}), 400
    
    # Mock file name
    file_name = f"resume_{user_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}.pdf"
    
    # Get current default resume for this user
    default_resume = query_db(
        'SELECT * FROM resumes WHERE user_id = ? AND is_default = 1', 
        (user_id,), 
        one=True
    )
    
    # If no default resume exists, make this one default
    is_default = 0 if default_resume else 1
    
    resume_id = execute_db(
        '''INSERT INTO resumes (user_id, title, file_name, upload_date, is_default) 
           VALUES (?, ?, ?, ?, ?)''',
        (user_id, title, file_name, datetime.now().isoformat(), is_default)
    )
    
    new_resume = query_db('SELECT * FROM resumes WHERE id = ?', (resume_id,), one=True)
    
    return jsonify(dict(new_resume)), 201

@app.route('/api/resumes/<int:resume_id>', methods=['DELETE'])
def delete_resume(resume_id):
    resume = query_db('SELECT * FROM resumes WHERE id = ?', (resume_id,), one=True)
    
    if not resume:
        return jsonify({'error': 'Resume not found'}), 404
    
    execute_db('DELETE FROM resumes WHERE id = ?', (resume_id,))
    
    return jsonify({'message': 'Resume deleted successfully'}), 200

@app.route('/api/users/<int:user_id>/resumes/<int:resume_id>/default', methods=['PUT'])
def set_default_resume(user_id, resume_id):
    # Check if resume exists and belongs to user
    resume = query_db(
        'SELECT * FROM resumes WHERE id = ? AND user_id = ?', 
        (resume_id, user_id), 
        one=True
    )
    
    if not resume:
        return jsonify({'error': 'Resume not found'}), 404
    
    # Clear existing default
    execute_db('UPDATE resumes SET is_default = 0 WHERE user_id = ?', (user_id,))
    
    # Set new default
    execute_db('UPDATE resumes SET is_default = 1 WHERE id = ?', (resume_id,))
    
    updated_resume = query_db('SELECT * FROM resumes WHERE id = ?', (resume_id,), one=True)
    
    return jsonify(dict(updated_resume)), 200

# Stats routes
@app.route('/api/employers/<int:employer_id>/stats', methods=['GET'])
def get_employer_stats(employer_id):
    # Get total jobs count
    total_jobs = query_db(
        'SELECT COUNT(*) as count FROM jobs WHERE employer_id = ?', 
        (employer_id,), 
        one=True
    )['count']
    
    # Get active jobs count
    active_jobs = query_db(
        'SELECT COUNT(*) as count FROM jobs WHERE employer_id = ? AND status = "active"', 
        (employer_id,), 
        one=True
    )['count']
    
    # Get employer job IDs
    job_ids_query = query_db('SELECT id FROM jobs WHERE employer_id = ?', (employer_id,))
    job_ids = [job['id'] for job in job_ids_query]
    
    # Get application stats
    total_applications = 0
    reviewed_applications = 0
    interviewed_candidates = 0
    
    if job_ids:
        job_ids_str = ','.join('?' for _ in job_ids)
        
        total_applications = query_db(
            f'SELECT COUNT(*) as count FROM applications WHERE job_id IN ({job_ids_str})', 
            tuple(job_ids), 
            one=True
        )['count']
        
        reviewed_applications = query_db(
            f'SELECT COUNT(*) as count FROM applications WHERE job_id IN ({job_ids_str}) AND status = "reviewed"', 
            tuple(job_ids), 
            one=True
        )['count']
        
        interviewed_candidates = query_db(
            f'SELECT COUNT(*) as count FROM applications WHERE job_id IN ({job_ids_str}) AND status = "interviewed"', 
            tuple(job_ids), 
            one=True
        )['count']
    
    stats = {
        'totalJobs': total_jobs,
        'activeJobs': active_jobs,
        'totalApplications': total_applications,
        'reviewedApplications': reviewed_applications,
        'interviewedCandidates': interviewed_candidates
    }
    
    return jsonify(stats), 200

@app.route('/api/users/<int:user_id>/stats', methods=['GET'])
def get_seeker_stats(user_id):
    # Get total applications
    total_applications = query_db(
        'SELECT COUNT(*) as count FROM applications WHERE user_id = ?', 
        (user_id,), 
        one=True
    )['count']
    
    # Get pending applications
    pending_applications = query_db(
        'SELECT COUNT(*) as count FROM applications WHERE user_id = ? AND status = "pending"', 
        (user_id,), 
        one=True
    )['count']
    
    # Get reviewed applications
    reviewed_applications = query_db(
        'SELECT COUNT(*) as count FROM applications WHERE user_id = ? AND status = "reviewed"', 
        (user_id,), 
        one=True
    )['count']
    
    # Get interviewed count
    interviews = query_db(
        'SELECT COUNT(*) as count FROM applications WHERE user_id = ? AND status = "interviewed"', 
        (user_id,), 
        one=True
    )['count']
    
    # Get offers count
    offers = query_db(
        'SELECT COUNT(*) as count FROM applications WHERE user_id = ? AND status = "offered"', 
        (user_id,), 
        one=True
    )['count']
    
    stats = {
        'totalApplications': total_applications,
        'pendingApplications': pending_applications,
        'reviewedApplications': reviewed_applications,
        'interviews': interviews,
        'offers': offers
    }
    
    return jsonify(stats), 200

if __name__ == '__main__':
    app.run(debug=True)
