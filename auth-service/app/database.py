from sqlalchemy import create_engine, Column, String, Integer, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

engine = create_engine(os.getenv("postgresql://postgres:yehia@localhost:5432/circleConnect"))
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    google_sub = Column(String, unique=True, index=True)   
    name = Column(String, nullable=True)
    role = Column(String, default="user")  
    #--------------------------------------------
    birthday = Column(String, nullable=True) 
    bio = Column(Text, nullable=True)
    instagram_url = Column(String, nullable=True)
    profile_picture = Column(String, nullable=True) 
    location = Column(String, nullable=True)
    
Base.metadata.create_all(bind=engine)