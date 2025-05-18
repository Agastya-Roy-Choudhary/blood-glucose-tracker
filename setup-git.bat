@echo off
echo Initializing Git repository...

:: Initialize Git repository
git init

:: Add all files
git add .

:: Create initial commit
git commit -m "Initial commit"

echo.
echo Git repository initialized successfully!
echo.
echo Next steps:
echo 1. Create a GitHub account if you don't have one
echo 2. Create a new repository on GitHub
echo 3. Run the following commands (replace YOUR_USERNAME with your GitHub username^):
echo    git remote add origin https://github.com/YOUR_USERNAME/blood-glucose-tracker.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 4. Go to your repository on GitHub
echo 5. Go to Settings ^> Pages
echo 6. Under 'Source', select 'main' branch
echo 7. Click 'Save'
echo.
echo Your site will be published at https://YOUR_USERNAME.github.io/blood-glucose-tracker/
echo.
pause 