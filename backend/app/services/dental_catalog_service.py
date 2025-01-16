from typing import List
from fastapi import HTTPException
from bson import ObjectId
from ..models.dental_catalog import DentalCatalogModel
from ..database import Database
from ..logger import logger

class DentalCatalogService:
    @property
    async def catalog_collection(self):
        db = await Database.get_db()
        return db.dental_catalog

    async def create_catalog_item(self, item: DentalCatalogModel) -> DentalCatalogModel:
        try:
            collection = await self.catalog_collection
            item_dict = item.dict(by_alias=True, exclude={'id'})
            
            result = await collection.insert_one(item_dict)
            created_item = await collection.find_one({"_id": result.inserted_id})
            
            if not created_item:
                raise HTTPException(status_code=404, detail="Failed to create catalog item")
                
            return DentalCatalogModel(**created_item)
        except Exception as e:
            logger.error(f"Error creating catalog item: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Error creating catalog item: {str(e)}")

    async def get_catalog_items(self, item_type: str = None) -> List[DentalCatalogModel]:
        collection = await self.catalog_collection
        query = {"type": item_type} if item_type else {}
        items = await collection.find(query).to_list(None)
        return [DentalCatalogModel(**item) for item in items]

    async def get_common_items(self, item_type: str = None) -> List[DentalCatalogModel]:
        collection = await self.catalog_collection
        query = {"is_common": True}
        if item_type:
            query["type"] = item_type
        items = await collection.find(query).to_list(None)
        return [DentalCatalogModel(**item) for item in items]

    async def update_catalog_item(self, item_id: str, item_data: dict) -> DentalCatalogModel:
        collection = await self.catalog_collection
        item = await collection.find_one({"_id": ObjectId(item_id)})
        if not item:
            raise HTTPException(status_code=404, detail="Catalog item not found")
        
        await collection.update_one(
            {"_id": ObjectId(item_id)},
            {"$set": item_data}
        )
        updated_item = await collection.find_one({"_id": ObjectId(item_id)})
        return DentalCatalogModel(**updated_item)

    async def delete_catalog_item(self, item_id: str):
        collection = await self.catalog_collection
        result = await collection.delete_one({"_id": ObjectId(item_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Catalog item not found") 