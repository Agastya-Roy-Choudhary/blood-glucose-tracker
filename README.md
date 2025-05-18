# Blood Glucose Tracker

![Version](https://img.shields.io/badge/version-1.0.5-blue)

A web application for tracking blood glucose levels with user authentication and data visualization.

**Current Version: 1.0.5**

## Development Status

🚧 **This website is under development. Some features may not work correctly.** 🚧

## Features

- User authentication (login/signup)
- Email verification
- Blood glucose data tracking
- Data visualization
- Dark/light theme support
- Responsive design

## Hosting Instructions

### Option 1: GitHub Pages (Free)

1. Create a GitHub account if you don't have one
2. Create a new repository named `blood-glucose-tracker`
3. Upload all the HTML, CSS, and JavaScript files to the repository
4. Go to repository Settings → Pages
5. Under "Source", select "main" branch
6. Click "Save"
7. Your site will be published at `https://yourusername.github.io/blood-glucose-tracker/`

### Option 2: Netlify (Free)

1. Create a Netlify account
2. Click "New site from Git"
3. Connect to your GitHub repository
4. Deploy settings: Build command: leave empty, Publish directory: leave as "/"
5. Click "Deploy site"
6. Your site will be published at a Netlify subdomain (you can add a custom domain later)

### Option 3: Vercel (Free)

1. Create a Vercel account
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings (default settings should work fine)
5. Click "Deploy"
6. Your site will be published at a Vercel subdomain (you can add a custom domain later)

## Local Development

To run the website locally:

1. Clone the repository
2. Open the project folder
3. Open `index.html` in your browser

## Email Verification Setup

For email verification to work in production:

1. Sign up for an email service provider (SendGrid, Mailgun, etc.)
2. Create an API key
3. Set up a backend server to handle email sending
4. Update the `sendVerificationCode()` function in `email_verification.html` to call your backend API

## License

MIT 