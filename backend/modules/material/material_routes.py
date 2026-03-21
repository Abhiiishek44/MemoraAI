from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks
from typing import Optional
from app.modules.materials.material_controller import material_controller as MaterialController

router = APIRouter(prefix="/topics/{topic_id}/materials", tags=["Materials"])


@router.post("/")
async def upload_material(
    topic_id: str,
    background_tasks: BackgroundTasks,
    user_id: str = Form(...),
    text: Optional[str] = Form(None),
    url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
):
    return await MaterialController.upload_material(
        topic_id, user_id, text, url, file, background_tasks
    )


@router.get("/")
async def get_materials(topic_id: str):
    return await MaterialController.get_materials(topic_id)


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