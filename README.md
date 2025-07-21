# To-Dont App

This repository contains both the Django backend API and the React frontend for a small todo list application.

## Prerequisites

- **Backend**: Python 3 and `pip`.
- **Frontend**: Node.js (version 16 or later is recommended) and `npm`.

## Backend Required Python Packages

To avoid compatibility issues, use the following package versions:

- `django`
- `djangorestframework`
- `django-allauth==0.54.0`
- `dj-rest-auth==2.2.5`
- `django-cors-headers`
- `requests`

You can install them with:
```bash
pip install django djangorestframework django-allauth==0.54.0 dj-rest-auth==2.2.5 django-cors-headers requests
```

## Running the Backend

1. Open a terminal and navigate into the `backend` directory:
   ```bash
   cd backend
   ```
2. (Optional) Create and activate a virtual environment:
   ```bash
   python3 -m venv venv

   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install the required Python packages:
   ```bash
   pip install django djangorestframework django-allauth==0.54.0 dj-rest-auth==2.2.5 django-cors-headers requests
   ```
4. Apply the database migrations:
   ```bash
   python manage.py migrate
   ```
5. Start the Django development server:
   ```bash
   python manage.py runserver
   ```
   The API will be available at `http://127.0.0.1:8000/`. Go to http://127.0.0.1:8000/admin and login with your admin credentials to view the database.

## Running the Frontend

1. In a new terminal, navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install the Node dependencies:
   ```bash
   npm install
   ```
3. Launch the development server:
   ```bash
   npm run dev
   ```
   By default Vite serves the app at `http://127.0.0.1:5173/`.

Make sure the backend is running before using the frontend so API requests succeed.
