from backend.database import Base, engine
from backend.security.models import User

Base.metadata.create_all(bind=engine)

print("Tables created successfully.")