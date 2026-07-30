@echo off
REM Run this by double-clicking it, or from a terminal opened in this folder.
REM It handles everything: creates the venv if missing, installs dependencies,
REM and starts the server on http://127.0.0.1:8000

cd /d "%~dp0"

if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat

echo Installing dependencies...
pip install -r requirements.txt

echo.
echo Starting server at http://127.0.0.1:8000/docs ...
echo (Press CTRL+C to stop)
echo.

python run.py
pause
