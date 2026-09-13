import bcrypt
from backend.database import SessionLocal
from backend.security.models import User

email = "test3@company.com"
plain_password = "three1234"

hashed = bcrypt.hashpw(plain_password.encode(), bcrypt.gensalt()).decode()

db = SessionLocal()
new_user = User(email=email, hashed_password=hashed)
db.add(new_user)
db.commit()
db.close()

print(f"Created user: {email}")