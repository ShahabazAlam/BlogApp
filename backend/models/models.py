from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Boolean
import datetime
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from db.database import Database
import bcrypt
from models.request_schema import CreateUser

Base = declarative_base()

# model/Permission
class  Permission(Base):
    __tablename__ = "permissions"

    # fields 
    id = Column(Integer,primary_key=True, index=True)
    action = Column(String(60), nullable=False)
    resource = Column(String(60), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"))
    created_date = Column(DateTime, default=datetime.datetime.utcnow)

    roles = relationship("Role", back_populates="permissions")

    class Config:
        orm_mode = True
# model/Role
class  Role(Base):
    __tablename__ = "roles"

    # fields 
    id = Column(Integer,primary_key=True, index=True)
    name = Column(String(100))
    permissions = relationship("Permission", back_populates="roles")
    created_date = Column(DateTime, default=datetime.datetime.utcnow)

    class Config:
        orm_mode = True

# model/Blog
class  Blog(Base):
    __tablename__ = "blogs"

    # fields 
    id = Column(Integer,primary_key=True, index=True)
    title = Column(String(100))
    description = Column(Text)
    image = Column(Text)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_date = Column(DateTime, default=datetime.datetime.utcnow)

    class Config:
        orm_mode = True

# model/User
class User(Base):
    __tablename__ = "users"

    # fields 
    id = Column(Integer,primary_key=True, index=True)
    email = Column(String(50), unique=True, nullable=False)
    password = Column(String(60), nullable=False)
    first_name = Column(String(20))
    last_name = Column(String(20))
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=True)
    super_user = Column(Boolean, default=False)
    created_date = Column(DateTime, default=datetime.datetime.utcnow)

    class Config:
        orm_mode = True





database = Database()
engine = database.get_db_connection()
db = database.get_db_session(engine)

Base.metadata.create_all(bind=engine)

def CreateSuperUser():
    session = database.get_db_session(engine)
    new_role = Role()
    exists = session.query(Role).filter(Role.name == 'Super Admin').first()
    if not exists:
        new_role.name = 'Super Admin'
        session.add(new_role)
        session.commit()
    else:
        new_role = session.query(Role).filter(Role.id == 1).first()
    new_user = User()
    exists = session.query(User).filter(User.email == 'admin@admin.com').first()
    if not exists:
        new_user.first_name = 'Super'
        new_user.last_name = 'Admin'
        new_user.email = 'admin@admin.com'
        new_user.super_user = True
        new_user.role_id = new_role.id
        new_user.password = bcrypt.hashpw(str('Admin#100').encode('utf-8'), bcrypt.gensalt())
        session.add(new_user)
        session.commit()
    
    session.close()

CreateSuperUser()