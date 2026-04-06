from fastapi import Depends, APIRouter, UploadFile, File, Form, BackgroundTasks, HTTPException, status
from typing import Optional
from modules.material.material_controller import MaterialController
from core.dependencies import get_current_active_user
router = APIRouter(prefix="/topics/{topic_id}/materials", tags=["Materials"])


def _extract_user_id(current_user: dict) -> str:
    user_id = current_user.get("id") or current_user.get("_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authenticated user payload",
        )
    return str(user_id)


@router.post("/")
async def upload_material(
    topic_id: str,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_active_user),
    text: Optional[str] = Form(None),
    url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
):
    user_id = _extract_user_id(current_user)
    return await MaterialController.upload_material(
        topic_id, user_id, text, url, file, background_tasks
    )


@router.get("/")
async def get_materials(topic_id: str, current_user: dict = Depends(get_current_active_user)):
    user_id = _extract_user_id(current_user)
    return await MaterialController.get_materials(topic_id, user_id)


@router.get("/{material_id}")
async def get_material(topic_id: str, material_id: str):
    return await MaterialController.get_material(material_id)


@router.delete("/{material_id}")
async def delete_material(topic_id: str, material_id: str):
    return await MaterialController.delete_material(material_id)


@router.post("/{material_id}/reprocess")
async def reprocess_material(topic_id: str, material_id: str, background_tasks: BackgroundTasks):
    return await MaterialController.reprocess_material(material_id, background_tasks)


@router.get("/{material_id}/status")
async def get_status(topic_id: str, material_id: str):
    return await MaterialController.get_status(material_id)