from fastapi import APIRouter, Depends, FastAPI, HTTPException, status
from models.response_schema import Response
from models.models import User, Base, Role, Permission
from db.database import Database
from sqlalchemy import and_, desc
from models.request_schema import CreatePermission, CreateRole, CreateUser, Token, TokenData, UpdateUser
import bcrypt
from models.response_schema import Response

from datetime import datetime, timedelta
from typing import Union
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext


# APIRouter creates path operations for product module
router = APIRouter(
    prefix="/user",
    tags=["User"],
    responses={404: {"description": "Not found"}},
)

database = Database()
engine = database.get_db_connection()
db = database.get_db_session(engine)

# to get a string like this run:
# openssl rand -hex 32
SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def verify_password(plain_password, password):
    return pwd_context.verify(plain_password, password)


def get_password_hash(password):
    return pwd_context.hash(password)


def get_user(email: str):
    user_dict = {}
    user = db.query(User).filter(User.email == email).first()
    if user:
        user_dict['email'] = user.email
        user_dict['password'] = user.password
        user_dict['id'] = user.id
        user_dict['role_id'] = user.role_id
        user_dict['super_user'] = user.super_user
        return User(**user_dict)


def authenticate_user(email: str, password: str):
    user = get_user(email)
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user


def create_access_token(data: dict, expires_delta: Union[timedelta, None] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = get_user(email=token_data.email)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(current_user: User = Depends(get_current_user)):
    if not current_user.email:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


@router.post("/login", response_description="Logged In Successfully.")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", 'status':200}


@router.get("/me/")
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return {"user":current_user.email, 'super_user': current_user.super_user}

@router.get("/me/permissions/")
async def read_own_items(current_user: User = Depends(get_current_active_user)):
    try:
        role = db.query(Role).filter(Role.id == current_user.role_id).first()
        permission_list = []
        if role and role.permissions:
            for key in role.permissions:
                permission_list.append(key.action)
        return {"user_id":current_user.id, "super_user": current_user.super_user,"first_name": current_user.first_name,"last_name": current_user.last_name, 'permissions': permission_list}
    except Exception as ex:
        response_code = None
        response_msg = "Something went wrong"
        error = True
        return Response('Internal Server Error', response_code, response_msg, error)

@router.post("/add", response_description="User Created Successfully.")
async def add_user(req: CreateUser):
    try:
        new_user = User()
        session = database.get_db_session(engine)
        exists = session.query(User).filter(User.email == req.email).first()
        if not exists:
            new_user.first_name = req.first_name
            new_user.last_name = req.last_name
            new_user.email = req.email
            new_user.super_user = req.super_user
            new_user.role_id = req.role_id
            new_user.password = bcrypt.hashpw(str(req.password).encode('utf-8'), bcrypt.gensalt())
            session.add(new_user)
            session.flush()
            # get id of the inserted product
            session.refresh(new_user, attribute_names=['id'])
            data = {"user": new_user.id}
            session.commit()
            session.close()
            return Response(data, 200, "User added successfully.", False)
        else:
            return Response([], 200, "User already exists.", True)
    except Exception as ex:
        response_code = None
        response_msg = "Something went wrong"
        error = True
        return Response('Internal Server Error', response_code, response_msg, error)

@router.put("/update/{user_id}")
async def update_user(user_id: str, request:UpdateUser, current_user: User = Depends(get_current_active_user)):
    session = database.get_db_session(engine)
    try: 
        is_user_updated = session.query(User).filter(User.id == user_id).update(request.dict(), synchronize_session=False)
        session.flush()
        session.commit()
        response_msg = "User updated successfully"
        response_code = 200
        error = False
        if is_user_updated == 1:
            # After successful update, retrieve updated data from db
            data = session.query(User).filter(User.id == user_id).one().id
        elif is_user_updated == 0:
            response_msg = "Role not updated. No Blog found with this id :" + \
                str(request)
            error = True
            data = None
        return Response(data, response_code, response_msg, error)
    except Exception as ex:
        response_code = None
        response_msg = "Something went wrong"
        error = True
        return Response('Internal Server Error', response_code, response_msg, error)

@router.post("/role/add", response_description="Role Created Successfully.")
async def add_role(req: CreateRole, current_user: User = Depends(get_current_active_user)):
    try:
        new_role = Role()
        session = database.get_db_session(engine)
        exists = session.query(Role).filter(Role.name == req.name).first()
        if not exists:
            new_role.name = req.name
            session.add(new_role)
            session.flush()
            # get id of the inserted product
            session.refresh(new_role, attribute_names=['id'])
            data = {"role": new_role}
            session.commit()
            session.close()
            return Response(data, 200, "Role added successfully.", False)
        else:
            return Response([], 200, "Role already exists.", True)
    except Exception as ex:
        response_code = None
        response_msg = "Something went wrong"
        error = True
        return Response('Internal Server Error', response_code, response_msg, error)

@router.put("/role/update/{role_id}")
async def update_role(role_id: str, request:CreateRole, current_user: User = Depends(get_current_active_user)):
    session = database.get_db_session(engine)
    try: 
        is_role_updated = session.query(Role).filter(Role.id == role_id).update(request.dict(), synchronize_session=False)
        session.flush()
        session.commit()
        response_msg = "Role updated successfully"
        response_code = 200
        error = False
        if is_role_updated == 1:
            # After successful update, retrieve updated data from db
            data = session.query(Role).filter(Role.id == role_id).one().id
        elif is_role_updated == 0:
            response_msg = "Blog not updated. No Blog found with this id :" + \
                str(request)
            error = True
            data = None
        return Response(data, response_code, response_msg, error)
    except Exception as ex:
        response_code = None
        response_msg = "Something went wrong"
        error = True
        return Response('Internal Server Error', response_code, response_msg, error)


@router.post("/permisssion/add", response_description="Role Created Successfully.")
async def add_permission(req: CreatePermission, current_user: User = Depends(get_current_active_user)):
    try:
        new_permission = Permission()
        session = database.get_db_session(engine)
        exists = session.query(Permission).filter(and_(Permission.action == req.action, Permission.role_id == req.role_id)).first()
        if not exists:
            new_permission.action = req.action
            new_permission.resource = req.resource
            new_permission.role_id = req.role_id
            session.add(new_permission)
            session.flush()
            # get id of the inserted product
            session.refresh(new_permission, attribute_names=['id'])
            data = {"permission": new_permission}
            session.commit()
            session.close()
            return Response(data, 200, "Permission added successfully.", False)
        else:
            return Response([], 200, "Permission already exists.", True)
    except Exception as ex:
        response_code = None
        response_msg = "Something went wrong"
        error = True
        return Response('Internal Server Error', response_code, response_msg, error)

@router.get("/roles/")
async def read_all_roles():
    try:
        session = database.get_db_session(engine)
        data = session.query(Role).filter().order_by(desc(Role.created_date)).all()
        return Response(data, 200, "Roles retrieved successfully.", False)
    except Exception as ex:
        response_code = None
        response_msg = "Something went wrong"
        error = True
        return Response('Internal Server Error', response_code, response_msg, error)

@router.get("/permissions/")
async def read_all_permissions():
    try:
        session = database.get_db_session(engine)
        data = session.query(Permission).filter().order_by(desc(Permission.created_date)).all()
        return Response(data, 200, "Permissions retrieved successfully.", False)
    except Exception as ex:
        response_code = None
        response_msg = "Something went wrong"
        error = True
        return Response('Internal Server Error', response_code, response_msg, error)

@router.get("/all-users/")
async def read_all_users(current_user: User = Depends(get_current_active_user)):
    try:
        session = database.get_db_session(engine)
        data = session.query(User).filter(User.id != current_user.id).order_by(desc(User.created_date)).all()
        temp = []
        for key in data:
            temp.append({'name':key.first_name +' ' + key.last_name, 'email' : key.email, 'id':key.id})
        return Response(temp, 200, "Users retrieved successfully.", False)
    except Exception as ex:
        response_code = None
        response_msg = "Something went wrong"
        error = True
        return Response('Internal Server Error', response_code, response_msg, error)

@router.get("/get/{user_id}/")
async def read_all_users(user_id: str,current_user: User = Depends(get_current_active_user)):
    try:
        session = database.get_db_session(engine)
        data = session.query(User).filter(User.id == user_id).first()
        return Response(data, 200, "Users retrieved successfully.", False)
    except Exception as ex:
        response_code = None
        response_msg = "Something went wrong"
        error = True
        return Response('Internal Server Error', response_code, response_msg, error)

