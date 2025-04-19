from pydantic import BaseModel
from typing import Optional

class User(BaseModel):
    id: int
    email: str
    google_id: str 
    name: Optional[str] = None
    role: str = "user" 
    
    birthday: Optional[str] = None
    bio: Optional[str] = None
    instagram_url: Optional[str] = None
    profile_picture: Optional[str] = None
    location: Optional[str] = None

    class Config:
        from_attributes = True 

class Token(BaseModel):
    access_token: str
    token_type: str