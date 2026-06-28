export class FastAPIGenerator {
  public generateFastAPI(routerName: string): string {
    return `from fastapi import APIRouter\n\nrouter = APIRouter(prefix="/${routerName.toLowerCase()}")\n\n@router.get("/")\ndef get_items():\n    return {"items": []}\n`;
  }
}
