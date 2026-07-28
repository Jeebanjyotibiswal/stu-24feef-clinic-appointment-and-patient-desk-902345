from fastapi import Depends, HTTPException, status

from app.dependencies.auth import get_current_user


def require_role(allowed_roles: list):
    lower_allowed = [role.lower() for role in allowed_roles]

    def role_checker(current_user=Depends(get_current_user)):
        current_role = (current_user.get("role") or "").lower()

        if current_role not in lower_allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access Denied"
            )

        return current_user

    return role_checker