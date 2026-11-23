# UniVerse — Full-Stack Student Campus Platform

## Features
- Student registration, login and logout (hashed passwords)
- Student dashboard and private academic-record page
- Campus Feed: authenticated students can publish posts
- Clubs & Events: seeded sample club and event content
- Marketplace: authenticated students list books and study materials, upload photos, search and filter listings
- Contact seller through a prefilled email link
- JSON endpoint: `/api/products`

## Stack
HTML, CSS, JavaScript, Jinja, Python Flask, Flask-SQLAlchemy, SQLite by default, MySQL supported.

## Run on macOS
1. Install Python 3.10 or newer.
2. Open this folder in VS Code.
3. Choose Terminal → New Terminal.
4. Run:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python app.py
```

5. Open http://127.0.0.1:5000

The app creates the SQLite database and starter clubs/events automatically.

## Switch to MySQL
1. Start MySQL and run `schema_mysql.sql` in MySQL Workbench or the MySQL terminal.
2. Edit `.env`:
   `DATABASE_URL=mysql+pymysql://USERNAME:PASSWORD@localhost/universe_db`
3. Restart `python app.py`. Tables are created automatically.

Never upload your real `.env` file or database password to GitHub.

## Demo
Register two accounts. Student A lists a book. Log out and sign in as Student B: the listing is shared because both accounts use the same database. Log in and publish a Campus Feed post.

## Notes
This is a local academic project starter, not production-hardened software. Before public deployment, add CSRF protection, rate limiting, email verification, password reset, stronger upload validation, and production secret management. Academic marks and attendance are not fabricated; records appear when added to the database. Seller contact opens the visitor's email application; it does not send email automatically.
