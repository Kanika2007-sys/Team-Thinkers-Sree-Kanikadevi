#!/usr/bin/env bash
# Run with: ./start.sh
# Handles everything: creates the venv if missing, installs dependencies,
# and starts the server on http://127.0.0.1:8000
set -e
cd "$(dirname "$0")"

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate

echo "Installing dependencies..."
pip install -r requirements.txt

echo ""
echo "Starting server at http://127.0.0.1:8000/docs ..."
echo "(Press CTRL+C to stop)"
echo ""

python run.py
