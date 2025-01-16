from fastapi import APIRouter, HTTPException, Query
from ..services.dental_catalog_service import DentalCatalogService
from ..models.dental_catalog import DentalCatalogModel
from typing import List, Optional

router = APIRouter(prefix="/api/dental-catalog", tags=["dental-catalog"])
dental_catalog_service = DentalCatalogService()

@router.post("/", response_model=DentalCatalogModel)
async def create_catalog_item(item: DentalCatalogModel):
    return await dental_catalog_service.create_catalog_item(item)

@router.get("/", response_model=List[DentalCatalogModel])
async def get_catalog_items(type: Optional[str] = Query(None)):
    if type and type not in ['category', 'treatment']:
        raise HTTPException(status_code=400, detail="Invalid type. Must be 'category' or 'treatment'")
    return await dental_catalog_service.get_catalog_items(type)

@router.get("/common", response_model=List[DentalCatalogModel])
async def get_all_common_items():
    return await dental_catalog_service.get_common_items()

@router.get("/{item_id}", response_model=DentalCatalogModel)
async def get_catalog_item(item_id: str):
    item = await dental_catalog_service.get_catalog_item(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@router.put("/{item_id}", response_model=DentalCatalogModel)
async def update_catalog_item(item_id: str, item: DentalCatalogModel):
    return await dental_catalog_service.update_catalog_item(item_id, item.dict(exclude_unset=True))

@router.delete("/{item_id}")
async def delete_catalog_item(item_id: str):
    await dental_catalog_service.delete_catalog_item(item_id)
    return {"message": "Item deleted successfully"} 