from re import I
from fastapi import APIRouter, File, Form, UploadFile, Depends
from models.response_schema import Response
from models.models import Blog, Role, Base, User
from db.database import Database
from sqlalchemy import and_, desc
from models.request_schema import CreateBlog, CreateUser, UpdateBlog
import bcrypt, os
from models.response_schema import Response
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from .users import get_current_active_user
from typing import Optional

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# APIRouter creates path operations for product module
router = APIRouter(
    prefix="/blog",
    tags=["Blogs"],
    responses={404: {"description": "Not found"}},
)

database = Database()
engine = database.get_db_connection()
Base.metadata.create_all(bind=engine)


@router.post("/add", response_description="Post Created Successfully.")
async def add_blog(title: str = Form(), description: Optional[str] = Form(None), image: Optional[UploadFile] = File(None), current_user: User = Depends(get_current_active_user)):
    try:
        if not os.path.exists('media'):
            os.makedirs('media')
        file_name = ''
        if image:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            file_location = os.path.join(base_dir,"media")
            contents = await image.read()
            with open(file_location+'/'+image.filename, 'wb') as f:
                f.write(contents)
            file_name = image.filename

        blog = Blog()
        blog.title = title
        blog.description = description
        blog.image = file_name
        blog.user_id = current_user.id
        session = database.get_db_session(engine)
        session.add(blog)
        session.flush()
        # get id of the inserted product
        session.refresh(blog, attribute_names=['id'])
        data = {"blog": blog}
        session.commit()
        session.close()
        return Response(data, 200, "Blog added successfully.", False)
    except Exception as ex:
        response_code = None
        response_msg = "Something went wrong"
        error = True
        return Response('Internal Server Error', response_code, response_msg, error)


@router.put("/update")
async def update_blog(title: str = Form(), description: Optional[str] = Form(None),  blog_id : str = Form(), image: Optional[UploadFile] = File(None), current_user: User = Depends(get_current_active_user)):
    session = database.get_db_session(engine)
    try: 
        obj = {Blog.title: title, Blog.description: description}
        if image:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            file_location = os.path.join(base_dir,"media")
            contents = await image.read()
            with open(file_location+'/'+image.filename, 'wb') as f:
                f.write(contents)
            obj[Blog.image] = image.filename

        is_blog_updated = session.query(Blog).filter(Blog.id == blog_id).update(obj, synchronize_session=False)
        session.flush()
        session.commit()
        response_msg = "Blog updated successfully"
        response_code = 200
        error = False
        if is_blog_updated == 1:
            # After successful update, retrieve updated data from db
            data = session.query(Blog).filter(Blog.id == blog_id).one()
        elif is_blog_updated == 0:
            response_msg = "Blog not updated. No Blog found with this id :" + \
                str(blog_id)
            error = True
            data = None
        return Response(data, response_code, response_msg, error)
    except Exception as ex:
        response_code = None
        response_msg = "Something went wrong"
        error = True
        return Response('Internal Server Error', response_code, response_msg, error)


@router.delete("/{blog_id}/delete/")
async def delete_product(blog_id: str, current_user: User = Depends(get_current_active_user)):
    session = database.get_db_session(engine)
    try:
        is_blog_deleted = session.query(Blog).filter(Blog.id == blog_id).delete()
        session.flush()
        session.commit()
        response_msg = "Blog deleted successfully"
        response_code = 200
        error = False
        data = {"blog_id": blog_id}
        if is_blog_deleted == 0:
            response_msg = "Product not deleted. No product found with this id :" + \
                str(blog_id)
            error = True
            data = None
        return Response(data, response_code, response_msg, error)
    except Exception as ex:
        response_code = None
        response_msg = "Something went wrong"
        error = True
        return Response('Internal Server Error', response_code, response_msg, error)

@router.get("/")
async def read_all_blogs(current_user: User = Depends(get_current_active_user)):
    try:
        session = database.get_db_session(engine)
        data = session.query(Blog).filter().order_by(desc(Blog.created_date)).all()
        return Response(data, 200, "Blogs retrieved successfully.", False)
    except Exception as ex:
        response_code = None
        response_msg = "Something went wrong"
        error = True
        return Response('Internal Server Error', response_code, response_msg, error)