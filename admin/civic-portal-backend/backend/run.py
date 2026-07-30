"""
Convenience entry point for VS Code's "Run Python File" button (or `python run.py`).

Why this file exists: app/main.py and other files under app/ use absolute imports
like `from app import models`. That only resolves correctly if the *working
directory* is this folder (backend/) — the one containing this file and the
`app/` package — not if you run a file that lives *inside* app/ directly.

This file lives at the backend root, so running it (from here) puts backend/
on sys.path, which lets `app.main` be imported normally. Just make sure this
file stays at the same level as `requirements.txt` and the `app/` folder.

NOTE: bound to 127.0.0.1 (not 0.0.0.0) on purpose — so the URL uvicorn prints
in the terminal is one you can paste straight into a browser. 0.0.0.0 is a
"listen on every network interface" bind address; browsers can't open it
directly and will show ERR_ADDRESS_INVALID if you try.
"""
import webbrowser
import threading
import uvicorn


def _open_browser():
    import time
    time.sleep(1.5)
    webbrowser.open("http://127.0.0.1:8000/")


if __name__ == "__main__":
    threading.Thread(target=_open_browser, daemon=True).start()
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
