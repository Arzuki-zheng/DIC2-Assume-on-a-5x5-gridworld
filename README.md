# Grid Map RL Application

This is a Flask-based web application that visualizes Policy Evaluation and Value Iteration on a configurable NxN grid world.

## Local Setup

1. Make sure you have Python 3.x installed.
2. Install the requirements:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the application:
   ```bash
   python app.py
   ```
4. Open your browser to `http://127.0.0.1:5000`.

## Deployment to GitHub

1. Initialize a Git repository in this folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for Grid Map RL project"
   ```
2. Create a new repository on GitHub.
3. Link your local repository to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

## Deployment to Render

This project is fully ready to be deployed to Render's free tier.

1. Go to [Render](https://render.com/) and sign up or log in.
2. Click **New +** -> **Web Service**.
3. Connect your GitHub account and select your newly created repository.
4. Render will automatically detect it as a Python app.
5. In the settings:
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
6. Click **Create Web Service**.
7. Wait a few minutes for Render to deploy your application. Once finished, you will receive a public URL (e.g., `https://your-app-name.onrender.com`).
