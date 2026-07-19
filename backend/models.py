from config import db
from werkzeug.security import (
    generate_password_hash,
    check_password_hash,
)


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255),nullable=False)
    role = db.Column(db.String(50), default="job_seeker")
    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
    )

    saved_jobs = db.relationship(
        "SavedJob",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)


    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f"<User {self.email}>"


class SavedJob(db.Model):
    __tablename__ = "saved_jobs"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    company = db.Column(db.String(200), nullable=False)
    location = db.Column(db.String(200))
    job_url = db.Column(db.String(500))
    source = db.Column(db.String(100))

    status = db.Column(
        db.String(50),
        nullable=False,
        default="saved",
    )

    applied_at = db.Column(db.DateTime)
    deadline = db.Column(db.DateTime)
    notes = db.Column(db.Text)

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
    )

    updated_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        onupdate=db.func.now(),
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
    )

    user = db.relationship(
        "User",
        back_populates="saved_jobs",
    )

    interviews = db.relationship(
        "Interview",
        back_populates="saved_job",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"<SavedJob {self.title} at {self.company}>"


class Interview(db.Model):
    __tablename__ = "interviews"

    id = db.Column(db.Integer, primary_key=True)

    interview_type = db.Column(
        db.String(100),
        nullable=False,
    )

    scheduled_at = db.Column(
        db.DateTime,
        nullable=False,
    )

    location = db.Column(db.String(250))
    meeting_url = db.Column(db.String(500))
    notes = db.Column(db.Text)

    status = db.Column(
        db.String(50),
        nullable=False,
        default="scheduled",
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
    )

    updated_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        onupdate=db.func.now(),
    )

    saved_job_id = db.Column(
        db.Integer,
        db.ForeignKey("saved_jobs.id"),
        nullable=False,
    )

    saved_job = db.relationship(
        "SavedJob",
        back_populates="interviews",
    )

    def __repr__(self):
        return (
            f"<Interview {self.interview_type} "
            f"for saved job {self.saved_job_id}>"
        )