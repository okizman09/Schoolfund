import httpx
from typing import Optional, Dict, Any, List
from ...config import settings

class BmoniClient:
    """
    Official BMONI Embedded REST API Client
    
    Source of Truth:
    - Official Docs: https://bkey.mintlify.app/
    - Interactive Reference: https://embedded-dev.bmoni.com/docs
    
    Verified Base URLs:
    - Development / Sandbox: https://embedded-dev.bmoni.com
    - Production: https://embedded.bmoni.com
    
    Authentication:
    - Header: x-api-key: <your_api_key>
    """
    def __init__(self):
        self.base_url = settings.BMONI_API_BASE_URL.rstrip('/')
        self.api_key = settings.BMONI_API_KEY
        self.enabled = settings.BMONI_ENABLED
        self.headers = {
            "x-api-key": self.api_key or "",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    async def get_wallet_balances(self, user_id: str) -> Dict[str, Any]:
        """
        Official Endpoint: GET /v1/users/{userId}/smart-wallets/account/balances
        Docs: https://bkey.mintlify.app/request-test-tokens
        """
        if not self.enabled:
            return {"status": "mocked", "message": "Sandbox adapter mode active"}
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.get(
                    f"{self.base_url}/v1/users/{user_id}/smart-wallets/account/balances",
                    headers=self.headers
                )
                return res.json()
        except Exception as e:
            return {"status": "error", "error": str(e)}

    async def get_nigerian_deposit_account(self, user_id: str) -> Dict[str, Any]:
        """
        Official Endpoint: GET /v1/users/{userId}/bank-accounts/deposit-accounts/NGN
        Docs: https://bkey.mintlify.app/api-reference/ngn-rails
        Returns the Nigerian Virtual Bank Account assigned to the user.
        """
        if not self.enabled:
            return {"status": "mocked", "message": "Sandbox adapter mode active"}
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.get(
                    f"{self.base_url}/v1/users/{user_id}/bank-accounts/deposit-accounts/NGN",
                    headers=self.headers
                )
                return res.json()
        except Exception as e:
            return {"status": "error", "error": str(e)}

    async def get_supported_nigerian_banks(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Official Endpoint: GET /v1/users/{userId}/bank-accounts/nigerian-banks
        Docs: https://bkey.mintlify.app/api-reference/ngn-rails
        Returns supported banks with CBN codes for offramp verification.
        """
        if not self.enabled:
            return []
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.get(
                    f"{self.base_url}/v1/users/{user_id}/bank-accounts/nigerian-banks",
                    headers=self.headers
                )
                return res.json()
        except Exception:
            return []
