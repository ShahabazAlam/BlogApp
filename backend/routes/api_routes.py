from fastapi import APIRouter
from app import blogs, users

router = APIRouter()
router.include_router(blogs.router)
router.include_router(users.router)