from google import genai
from dotenv import load_dotenv
import os, ast, json
from fastapi import FastAPI
from prompts import *
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from typing import AsyncIterable
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

load_dotenv(dotenv_path="./.env")
os.environ["GEMINI_API_KEY"] = os.getenv("GEMINI_API_KEY")
client = genai.Client()

history_dict = []

app = FastAPI()

origins = [
    "http://localhost:8080",
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    "http://127.0.0.1:6770",
    "https://conversation-r1y4.onrender.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Correctly mount React static files under '/app' instead of '/'
app.mount("/app", StaticFiles(directory="build", html=True), name="static")
# PROD
# app.mount("/app", StaticFiles(directory="buildProd", html=True), name="static")


@app.get("/app/{full_path:path}")
async def serve_react_app():
    return FileResponse("build/index.html")
# PROD
# async def serve_react_app():
#     return FileResponse("buildProd/index.html")


async def stream_generate_func(que: str, chatHistoryObj: list, textTextBlock: str, mode: str, persona: str, interBotPersona: str, learningObj: str) -> AsyncIterable[str]:
    
    ### test-uncomment
    if mode=='grounded_conversation':
        print(f"mode selected: {mode}")
        response = client.models.generate_content_stream(
            model="gemini-2.5-flash",
            # contents=[f"{grounded_func_prompt} TEXT_CONTENT: {que} HISTORY_PREVIOUS_CONVERSATION: {chatHistoryObj}"]
            contents=[f"{grounded_func_prompt};\n\nTEXT_CONTENT: {textTextBlock};\n\nHUMAN_CURRENT_MESSAGE:{que}\n\nHISTORY_PREVIOUS_CONVERSATION (conversation history is arranged from LATEST to OLDEST dialogue between you (Bot) and Human. Important for context of chat!): {chatHistoryObj};"]
            )
    elif mode=='grounded_qa_conversation':
        print(f"mode selected: {mode}")
        response = client.models.generate_content_stream(
            model="gemini-2.5-flash",
            contents=[f"{grounded_qa_func_prompt};\n\nTEXT_CONTENT: {textTextBlock};\n\nHUMAN_CURRENT_MESSAGE:{que}\n\nHISTORY_PREVIOUS_CONVERSATION (conversation history is arranged from LATEST to OLDEST dialogue between you (Bot) and Human. Important for context of chat!): {chatHistoryObj};"]
            ) 
    elif mode=='simulated_conversation':
        print(f"mode selected: {mode}")
        response = client.models.generate_content_stream(
            model="gemini-2.5-flash",
            contents=[f"{simulated_func_prompt};\n\nPERSONALITY:{persona};\n\nLEARNING_OBJECTIVES:{learningObj}\n\nTEXT_CONTENT: {textTextBlock};\n\nHUMAN_CURRENT_MESSAGE:{que}\n\nHISTORY_PREVIOUS_CONVERSATION (conversation history is arranged from LATEST to OLDEST dialogue between you (Bot) and Human. Important for context of chat!): {chatHistoryObj};"]
            ) 
    elif mode=='interBot_conversation':
        print(f"mode selected: {mode}")
        response = client.models.generate_content_stream(
            model="gemini-2.5-flash",
            contents=[f"{interBot_conversation_func_prompt};\n\nPERSONALITIES:{interBotPersona};\n\nTEXT_CONTENT: {textTextBlock};\n\nHUMAN_CURRENT_MESSAGE:{que}\n\nHISTORY_PREVIOUS_CONVERSATION (conversation history is arranged from LATEST to OLDEST dialogue between you (Bot) and Human. Important for context of chat!): {chatHistoryObj};"]
            ) 

    # response = "test content" ### test-remove
    temp_ar = ''
    for chunk in response:
        token = chunk.text ### test-uncomment 
        # token=chunk ### test-remove
        print(token, end='')
        temp_ar += token
        yield token

@app.post("/converse")
async def converse(req: dict):
    
    que = req.get('que')
    chatHistoryObj = req.get('chatHistoryObj', [])  # Directly use as JSON object
    chatHistoryObj.reverse()
    mode = req.get('mode')
    textTextBlock = req.get('textTextBlock')
    persona = req.get('persona', '')
    interBotPersona = req.get('interBotPersona', '')
    learningObj = req.get('learningObj', '')


    print(f'''Question: {que}\n AND History: {chatHistoryObj}\n AND TextBlock: {textTextBlock}
          \nAND persona: {persona}\nAND interBotPersona: {interBotPersona}''')

    generator = stream_generate_func(que, chatHistoryObj, textTextBlock, mode, persona, interBotPersona, learningObj)
    
    return StreamingResponse(generator, media_type="text/event-stream")