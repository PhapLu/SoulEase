from langchain.schema import HumanMessage, SystemMessage
from langchain.chat_models.base import BaseChatModel
from typing import List
import httpx

class LocalGemmaChat(BaseChatModel):
    model: str = "gemma3:4b"
    base_url: str = "http://localhost:11434"

    async def _agenerate(self, messages: List, **kwargs):
        payload = {
            "model": self.model,
            "messages": [{"role": m.role, "content": m.content} for m in messages],
            "max_tokens": kwargs.get("max_tokens", 512),
            "temperature": kwargs.get("temperature", 0.2),
        }

        async with httpx.AsyncClient(base_url=self.base_url) as client:
            resp = await client.post("/v1/chat/completions", json=payload)
            resp.raise_for_status()
            out = resp.json()["choices"][0]["message"]["content"]

        return out  # Return plain text

    async def _call(self, messages: List, **kwargs):
        return await self._agenerate(messages, **kwargs)
