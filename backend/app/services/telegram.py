import logging

import httpx

from ..config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


async def send_application_message(text: str) -> None:
    """
    Send text to Telegram; logs issues instead of failing silently.
    """
    if not settings.telegram_bot_token or not settings.telegram_chat_id:
        logger.warning("Telegram: token/chat_id not configured, message not sent")
        return
    url = f"https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage"
    payload = {"chat_id": settings.telegram_chat_id, "text": text, "parse_mode": "HTML"}
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code != 200:
                logger.error("Telegram send failed: %s %s", resp.status_code, resp.text)
    except Exception as exc:  # pragma: no cover
        logger.exception("Telegram send error: %s", exc)


