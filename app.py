import os
from datetime import datetime
from functools import wraps
from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-only-change-me")
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///universe.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["UPLOAD_FOLDER"] = os.path.join(app.root_path, "static", "uploads")
app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
db = SQLAlchemy(app)
EXTENSIONS = {"png", "jpg", "jpeg", "webp", "gif"}

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    category = db.Column(db.String(30), nullable=False)
    price = db.Column(db.Float, nullable=False)
    condition = db.Column(db.String(40), nullable=False)
    description = db.Column(db.Text)
    image = db.Column(db.String(255))
    seller_email = db.Column(db.String(150), nullable=False)
    seller_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    author = db.Column(db.String(100), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Club(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    category = db.Column(db.String(80), nullable=False)
    description = db.Column(db.Text, nullable=False)

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    club_name = db.Column(db.String(120), nullable=False)
    event_date = db.Column(db.String(50), nullable=False)
    location = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text)

class AcademicRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    subject = db.Column(db.String(100), nullable=False)
    attendance = db.Column(db.Float, default=0)
    marks = db.Column(db.Float, default=0)

def user_now():
    return db.session.get(User, session.get("user_id")) if session.get("user_id") else None

def login_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not user_now():
            flash("Please log in first.", "error")
            return redirect(url_for("login"))
        return fn(*args, **kwargs)
    return wrapper

@app.context_processor
def inject_user():
    return {"logged_in_user": user_now()}

@app.route("/")
def index():
    return render_template("index.html", events=Event.query.order_by(Event.id.desc()).limit(3).all())

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        name = request.form.get("name", "").strip()
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        if not name or not email or len(password) < 8:
            flash("Enter your name, email and a password of at least 8 characters.", "error")
        elif User.query.filter_by(email=email).first():
            flash("That email is already registered.", "error")
        else:
            u = User(name=name, email=email, password_hash=generate_password_hash(password))
            db.session.add(u); db.session.commit(); session["user_id"] = u.id
            flash("Welcome to UniVerse!", "success")
            return redirect(url_for("dashboard"))
    return render_template("auth.html", mode="register")

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        u = User.query.filter_by(email=request.form.get("email", "").strip().lower()).first()
        if u and check_password_hash(u.password_hash, request.form.get("password", "")):
            session["user_id"] = u.id
            return redirect(url_for("dashboard"))
        flash("Email or password is incorrect.", "error")
    return render_template("auth.html", mode="login")

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("index"))

@app.route("/dashboard")
@login_required
def dashboard():
    records = AcademicRecord.query.filter_by(user_id=user_now().id).all()
    return render_template("dashboard.html", records=records)

@app.route("/academics")
@login_required
def academics():
    return render_template("academics.html", records=AcademicRecord.query.filter_by(user_id=user_now().id).all())

@app.route("/marketplace")
def marketplace():
    category, search = request.args.get("category", "all"), request.args.get("q", "").strip()
    query = Product.query
    if category != "all": query = query.filter_by(category=category)
    if search: query = query.filter(Product.name.ilike(f"%{search}%"))
    return render_template("marketplace.html", products=query.order_by(Product.created_at.desc()).all(), category=category, search=search)

@app.route("/marketplace/new", methods=["POST"])
@login_required
def create_product():
    name = request.form.get("name", "").strip()
    category = request.form.get("category", "")
    condition = request.form.get("condition", "")
    try: price = float(request.form.get("price", "0"))
    except ValueError: price = 0
    if not name or category not in {"textbooks", "notes", "materials"} or price <= 0 or not condition:
        flash("Please complete all required listing details.", "error")
        return redirect(url_for("marketplace"))
    image_name = None
    upload = request.files.get("image")
    if upload and upload.filename:
        ext = upload.filename.rsplit(".", 1)[-1].lower()
        if ext in EXTENSIONS:
            image_name = secure_filename(f"{datetime.utcnow().timestamp()}_{upload.filename}")
            upload.save(os.path.join(app.config["UPLOAD_FOLDER"], image_name))
    u = user_now()
    db.session.add(Product(name=name, category=category, price=price, condition=condition,
        description=request.form.get("description", "").strip(), image=image_name,
        seller_email=u.email, seller_id=u.id))
    db.session.commit()
    flash("Your item has been listed!", "success")
    return redirect(url_for("marketplace"))

@app.route("/campus", methods=["GET", "POST"])
def campus():
    if request.method == "POST":
        u = user_now()
        if not u:
            flash("Log in to publish a post.", "error")
            return redirect(url_for("login"))
        content = request.form.get("content", "").strip()
        if content:
            db.session.add(Post(content=content, author=u.name, user_id=u.id)); db.session.commit()
            flash("Your post is live!", "success")
            return redirect(url_for("campus"))
    return render_template("campus.html", posts=Post.query.order_by(Post.created_at.desc()).all())

@app.route("/delete-post/<int:post_id>", methods=["POST"])
def delete_post(post_id):
    u = user_now()
    if not u:
        flash("Please log in first.", "error")
        return redirect(url_for("login"))
    post = Post.query.get_or_404(post_id)
    if post.user_id != u.id:
        flash("You can only delete your own posts.", "error")
    else:
        db.session.delete(post)
        db.session.commit()
        flash("Post deleted successfully!", "success")
    return redirect(url_for("campus"))

@app.route("/clubs")
def clubs():
    return render_template("clubs.html", clubs=Club.query.all(), events=Event.query.order_by(Event.id.desc()).all())

@app.route("/api/products")
def api_products():
    return jsonify([{"id":p.id,"name":p.name,"category":p.category,"price":p.price,
        "condition":p.condition,"description":p.description,"seller_email":p.seller_email}
        for p in Product.query.order_by(Product.created_at.desc()).all()])

with app.app_context():
    db.create_all()
    if not Club.query.first():
        db.session.add_all([
            Club(name="Coding Club",category="Technology",description="Build projects, solve problems and learn together."),
            Club(name="Music Society",category="Arts",description="Perform, practise and discover music."),
            Club(name="Photography Club",category="Creative",description="Capture campus stories and learn photography."),
            Club(name="Robotics Club",category="Technology",description="Design, build and experiment with robotics.")])
    if not Event.query.first():
        db.session.add_all([
            Event(title="Student Project Showcase",club_name="Coding Club",event_date="Coming soon",location="Innovation Lab",description="Share student projects and meet fellow builders."),
            Event(title="Open Mic Evening",club_name="Music Society",event_date="Coming soon",location="Student Lounge",description="An evening for music and performances.")])
    db.session.commit()

if __name__ == "__main__":
    app.run(debug=True)
