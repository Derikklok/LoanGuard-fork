from fastapi import APIRouter, Depends, Query
from database import predictions_col
from routes.auth import get_current_user
from bson import ObjectId

router = APIRouter(prefix="/history", tags=["History"])


def serialize(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    return doc


@router.get("")
async def get_history(
    skip:  int  = Query(0, ge=0),
    limit: int  = Query(20, le=100),
    current_user: dict = Depends(get_current_user)
):
    """
    Admins see all predictions. Officers see only their own.
    """
    query = {} if current_user["role"] == "admin" \
            else {"officer_id": str(current_user["_id"])}

    cursor = predictions_col.find(query) \
                            .sort("created_at", -1) \
                            .skip(skip).limit(limit)

    records = [serialize(doc) async for doc in cursor]
    total   = await predictions_col.count_documents(query)

    return {"total": total, "records": records}


@router.get("/{record_id}")
async def get_record(
    record_id: str,
    current_user: dict = Depends(get_current_user)
):
    doc = await predictions_col.find_one({"_id": ObjectId(record_id)})
    if not doc:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Record not found")
    return serialize(doc)


@router.delete("/{record_id}")
async def delete_record(
    record_id: str,
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Admins only")
    await predictions_col.delete_one({"_id": ObjectId(record_id)})
    return {"message": "Deleted"}