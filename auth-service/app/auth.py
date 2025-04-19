from .security import JWTCreation, token_Verification
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2AuthorizationCodeBearer
import httpx
from .models import Token, User as UserModel
from .database import SessionLocal, User
import os 
from sqlalchemy.orm import Session

router = APIRouter(prefix="/auth")

OAuthInstance = OAuth2AuthorizationCodeBearer(
    authorizationUrl="https://accounts.google.com/o/oauth2/auth", 
    tokenUrl="https://oauth2.googleapis.com/token"
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/login")
async def login_redirect():
    ClientID = os.getenv('GOOGLE_CLIENT_ID')     
    redirecturl = os.getenv('REDIRECT_URI') 
    googleLoginurl = (
        "https://accounts.google.com/o/oauth2/auth?"
        f"response_type=code&"
        f"client_id={ClientID}&"
        f"redirect_uri={redirecturl}&"
        "scope=openid%20profile%20email" 
    )
    return {"login_url": googleLoginurl}

@router.get("/callback", response_model=Token)
async def callback(code: str, db: Session = Depends(get_db)):
    # Debugging:
    # print(f"Authorization code: {code}")
    # print(f"Client ID: {os.getenv('GOOGLE_CLIENT_ID')}")
    # print(f"Redirect URI: {os.getenv('REDIRECT_URI')}")
    
    async with httpx.AsyncClient() as client:
        tokenResponse = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": os.getenv("GOOGLE_CLIENT_ID"),
                "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
                "redirect_uri": os.getenv("REDIRECT_URI"),
                "grant_type": "authorization_code"
            }
        )

        if tokenResponse.status_code != 200:
            # Debugging:
            # print(f"Error: {tokenResponse.status_code}")
            # print(f"Response Body: {tokenResponse.text}")
            raise HTTPException(
                status_code=400,
                detail="Google token exchange failed"
            )

        token_data = tokenResponse.json()
        # Debugging:
        # print(f"Token Data: {token_data}")

        userResponse = await client.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {token_data['access_token']}"}
        )  

        if userResponse.status_code != 200:
            # Debugging:
            # print(f"Error: {userResponse.status_code}")
            # print(f"Response Body: {userResponse.text}")
            raise HTTPException(
                status_code=400,
                detail="Failed to retrieve user info from Google"
            )

        DataOfUser = userResponse.json()

        user = db.query(User).filter(User.google_sub == DataOfUser["sub"]).first()
        if not user:
            user = User(
                google_sub=DataOfUser["sub"],
                email=DataOfUser["email"],
                name=DataOfUser.get("name", ""),
                role="user"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        JWTToken = JWTCreation({
            "sub": user.google_sub,
            "email": user.email,
            "name": user.name,
            "user_id": user.id,
            "role": user.role
        })
        
        # Debugging:
        # print(token_Verification(JWTToken))
        
        return {"access_token": JWTToken, "token_type": "Bearer"}