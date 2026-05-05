import asyncio
import websockets
import base64

async def test():
    uri = "ws://localhost:8000/ws/posture"
    async with websockets.connect(uri) as ws:
        print("CONNECTED")
        await ws.send(base64.b64encode(b"test").decode())
        msg = await ws.recv()
        print("RESPONSE:", msg)

asyncio.run(test())