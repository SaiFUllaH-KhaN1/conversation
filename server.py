from google import genai
from google.genai import types
from dotenv import load_dotenv
import os, uuid, base64, shutil
from fastapi import FastAPI, Form, UploadFile
from prompts import *
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from typing import AsyncIterable
from fastapi.staticfiles import StaticFiles
from typing import Annotated
from PIL import Image
from io import BytesIO

load_dotenv("./.env")
PASS_VAR = os.getenv("PASS")
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

history_dict = []

app = FastAPI()

origins = [
    "http://localhost:8080",
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    "http://127.0.0.1:6770",
    "http://localhost:6770",
    "https://conversation-r1y4.onrender.com",
    "https://conversation-v2.onrender.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


@app.post("/inter_bot_media_preview")
async def inter_bot_media_preview(p1Persona: Annotated[str, Form()]='', p2Persona: Annotated[str, Form()]='', file1: UploadFile=None, file2: UploadFile=None):

    session_id_temp = "user_files/"+str(uuid.uuid4())

    os.makedirs(session_id_temp, exist_ok=True)

    if p1Persona!='' and p2Persona!='':

        print(f"""for route: inter_bot_media_preview\n p1Persona {p1Persona} p2Persona {p2Persona}""")

        p1Persona_response = client.models.generate_content(
                model="gemini-2.0-flash-lite",
                contents=[f"{interBot_media_character};\n\nCHARACTER_APPEARANCE:{p1Persona};"]
        ) 
        p2Persona_response = client.models.generate_content(
                model="gemini-2.0-flash-lite",
                contents=[f"{interBot_media_character};\n\nCHARACTER_APPEARANCE:{p2Persona};"]
        ) 
        
        print(f"p1Persona_response: {p1Persona_response.text};\n\np2Persona_response: {p2Persona_response.text};")

        p1Persona_image = client.models.generate_content(
                model="gemini-2.0-flash-preview-image-generation",
                contents=[f"{interBot_media_character_image};\n\nCHARACTER_APPEARANCE:{p1Persona_response.text};"],
                config=types.GenerateContentConfig(
                    response_modalities=['TEXT', 'IMAGE']
                )
        )
        
        p2Persona_image = client.models.generate_content(
                model="gemini-2.0-flash-preview-image-generation",
                contents=[f"{interBot_media_character_image};\n\nCHARACTER_APPEARANCE:{p2Persona_response.text};"],
                config=types.GenerateContentConfig(
                    response_modalities=['TEXT', 'IMAGE']
                )
        )

        for part in p1Persona_image.candidates[0].content.parts:
            if part.inline_data is not None:
                image = Image.open(BytesIO((part.inline_data.data)))
                image.save(f"{session_id_temp}/gemini_rx_1.png")
                image_bytes = part.inline_data.data
                image_data_decoded1 = base64.b64encode(image_bytes).decode('utf-8')
                p1PersonaImage = f'''<img id="img-interbot-media" src="data:image/png;base64,{image_data_decoded1}" alt="Person 1 Image">'''

        for part in p2Persona_image.candidates[0].content.parts:
            if part.inline_data is not None:
                image = Image.open(BytesIO((part.inline_data.data)))
                image.save(f"{session_id_temp}/gemini_rx_2.png")
                image_bytes = part.inline_data.data
                image_data_decoded2 = base64.b64encode(image_bytes).decode('utf-8')
                p2PersonaImage = f'''<img id="img-interbot-media" src="data:image/png;base64,{image_data_decoded2}" alt="Person 2 Image">'''

    #     # for local check
    #     session_id_temp = "9ac6123e-268f-4e6d-8268-5274f1809106"
    #     image1 = Image.open(f'{session_id_temp}/gemini_rx_1.png')
    #     image2 = Image.open(f'{session_id_temp}/gemini_rx_2.png')
    #     def image_to_base64(image):
    #         buffered = BytesIO()
    #         image.save(buffered, format="PNG")
    #         return base64.b64encode(buffered.getvalue()).decode('utf-8')
    #     image_data_decoded1 = image_to_base64(image1)
    #     image_data_decoded2 = image_to_base64(image2)
    #     p1PersonaImage = f'''<img id="img-interbot-media" src="data:image/png;base64,{image_data_decoded1}" alt="Person 1 Image">'''
    #     p2PersonaImage = f'''<img id="img-interbot-media" src="data:image/png;base64,{image_data_decoded2}" alt="Person 2 Image">'''
    #     p1Persona_response = """Ethnicity="French"
    # Skin Color="Fair"
    # Height="Average"
    # Age="45"

    # Head=
    # Head Hair Style:"Neat, slightly tousled, short and styled back"
    # All Hair Color:"Salt and pepper, with more grey at the temples"
    # Beard Style:"Well-groomed, short stubble"
    # Eyes color and description:"Blue eyes, with a slightly squinting expression, suggesting he smiles often."
    # Nose:"Slightly aquiline"
    # Cheeks:"Slightly flushed, with a hint of age"
    # Chin:"Strong and slightly pointed"
    # Neck:"Average length and size"

    # Torso=
    # Shape:"Average"
    # Width:"Medium"
    # Torso General Description (front and back)="Slightly broad shoulders. No visible muscle definition. The front is relaxed, showing no protruding belly."

    # Legs=
    # Legs General Description="Average length, not overly muscular."

    # Clothes=
    # Clothes on Body and their color="A light brown linen shirt, partially unbuttoned at the collar. A dark navy blue blazer."
    # Clothes on Legs and their color="Dark grey trousers."
    # Footwear="Brown leather loafers"

    # Accessories=
    # Accessories Description="A thin silver watch on his left wrist. Possibly a small, discreet lapel pin (e.g., a tiny fleur-de-lis). Possibly holding a rolled-up map or brochure."""
    #     p2Persona_response = """Ethnicity="American"
    # Skin Color="Fair"
    # Height="6'0""
    # Age="45"

    # Head=
    # Head Hair Style:"Short, neatly-combed, slightly receding hairline"
    # All Hair Color:"Salt and pepper, mostly grey with some dark patches"
    # Beard Style:"Short, well-groomed stubble"
    # Eyes color and description:"Blue, friendly, with a slight twinkle."
    # Nose:"Straight, slightly broad"
    # Cheeks:"Slightly weathered, with subtle smile lines."
    # Chin:"Strong, slightly squared"
    # Neck:"Average length, with a hint of sun exposure"

    # Torso=
    # Shape:"Athletic, but with a slight softening around the middle"
    # Width:"Average"
    # Torso General Description (front and back)="Broad shoulders, a well-defined chest, and a slightly rounded stomach. The back is straight with a good posture"

    # Legs=
    # Legs General Description="Average build, sturdy legs"

    # Clothes=
    # Clothes on Body and their color="Khaki-colored short-sleeved shirt with a small logo on the chest in a subtle dark color."
    # Clothes on Legs and their color="Dark navy blue cargo pants."
    # Footwear="Brown leather hiking boots"

    # Accessories=
    # Accessories Description="Tan leather belt with a silver buckle, a watch on his left wrist, a small backpack and a pair of sunglasses hanging on his shirt."""
    #     result = f"""Copy the below AI completed detailed prompt and edit if you do not like the resultant images generated!<br/>Person 1's image and prompt are as following:<br/>{p1PersonaImage}<br/>{p1Persona_response}<br/>Person 2's image and prompt are as following:<br/>{p2PersonaImage}<br/>{p2Persona_response}"""
    #     return {"result": result, "p1Persona_response": p1Persona_response, "p2Persona_response": p2Persona_response, "session_id_temp": session_id_temp}

        result = f"""Copy the below AI completed detailed prompt and edit if you do not like the resultant images generated!<br/>Person 1's image and prompt are as following:<br/>{p1PersonaImage}<br/>{p1Persona_response.text}<br/>Person 2's image and prompt are as following:<br/>{p2PersonaImage}<br/>{p2Persona_response.text}"""

        return {"result": result, "p1Persona_response": p1Persona_response.text, "p2Persona_response": p2Persona_response.text, "session_id_temp": session_id_temp}

    elif file1!=None and p2Persona!='':

        print(f"""for route: inter_bot_media_preview\n file1 {file1.filename} p2Persona {p2Persona} """)

        file1_bytes = await file1.read()
        with open(f"{session_id_temp}/gemini_rx_1.png", 'wb') as f:
            f.write(file1_bytes)
        # image = Image.open(BytesIO((file1_bytes)))
        # image.save(f"{session_id_temp}/gemini_rx_1.png")
        image_bytes = file1_bytes
        image_data_decoded1 = base64.b64encode(image_bytes).decode('utf-8')
        p1PersonaImage = f'''<img id="img-interbot-media" src="data:image/png;base64,{image_data_decoded1}" alt="Person 1 Image">'''

        p2Persona_response = client.models.generate_content(
                model="gemini-2.0-flash-lite",
                contents=[f"{interBot_media_character};\n\nCHARACTER_APPEARANCE:{p2Persona};"]
        ) 
        
        print(f"p2Persona_response: {p2Persona_response.text};")
        
        p2Persona_image = client.models.generate_content(
                model="gemini-2.0-flash-preview-image-generation",
                contents=[f"{interBot_media_character_image};\n\nCHARACTER_APPEARANCE:{p2Persona_response.text};"],
                config=types.GenerateContentConfig(
                    response_modalities=['TEXT', 'IMAGE']
                )
        )

        for part in p2Persona_image.candidates[0].content.parts:
            if part.inline_data is not None:
                image = Image.open(BytesIO((part.inline_data.data)))
                image.save(f"{session_id_temp}/gemini_rx_2.png")
                image_bytes = part.inline_data.data
                image_data_decoded2 = base64.b64encode(image_bytes).decode('utf-8')
                p2PersonaImage = f'''<img id="img-interbot-media" src="data:image/png;base64,{image_data_decoded2}" alt="Person 2 Image">'''

        result = f"""Copy the below AI completed detailed prompt and edit if you do not like the resultant images generated!<br/>Person 1's uploaded image is following:<br/>{p1PersonaImage}<br/>Person 2's image and prompt are as following:<br/>{p2PersonaImage}<br/>{p2Persona_response.text}"""

        return {"result": result, "p2Persona_response": p2Persona_response.text, "session_id_temp": session_id_temp}

    elif file2!=None and p1Persona!='':

        print(f"""for route: inter_bot_media_preview\n p1Persona {p1Persona} file2 {file2.filename}  """)

        file2_bytes = await file2.read()
        with open(f"{session_id_temp}/gemini_rx_2.png", 'wb') as f:
            f.write(file2_bytes)

        image_bytes = file2_bytes
        image_data_decoded2 = base64.b64encode(image_bytes).decode('utf-8')
        p2PersonaImage = f'''<img id="img-interbot-media" src="data:image/png;base64,{image_data_decoded2}" alt="Person 2 Image">'''

        p1Persona_response = client.models.generate_content(
                model="gemini-2.0-flash-lite",
                contents=[f"{interBot_media_character};\n\nCHARACTER_APPEARANCE:{p1Persona};"]
        ) 
        
        print(f"p1Persona_response: {p1Persona_response.text};")
        
        p1Persona_image = client.models.generate_content(
                model="gemini-2.0-flash-preview-image-generation",
                contents=[f"{interBot_media_character_image};\n\nCHARACTER_APPEARANCE:{p1Persona_response.text};"],
                config=types.GenerateContentConfig(
                    response_modalities=['TEXT', 'IMAGE']
                )
        )

        for part in p1Persona_image.candidates[0].content.parts:
            if part.inline_data is not None:
                image = Image.open(BytesIO((part.inline_data.data)))
                image.save(f"{session_id_temp}/gemini_rx_1.png")
                image_bytes = part.inline_data.data
                image_data_decoded1 = base64.b64encode(image_bytes).decode('utf-8')
                p1PersonaImage = f'''<img id="img-interbot-media" src="data:image/png;base64,{image_data_decoded1}" alt="Person 1 Image">'''

        result = f"""AI completed detailed prompt and the resultant images generated!<br/>Person 1's image and prompt are as following:<br/>{p1PersonaImage}<br/>{p1Persona_response.text}<br/>Person 2's uploaded image is following:<br/>{p2PersonaImage}"""

        return {"result": result, "p1Persona_response": p1Persona_response.text, "session_id_temp": session_id_temp}

    elif file1!=None and file2!=None:

        print(f"""for route: inter_bot_media_preview\n file1 {file1.filename} file2 {file2.filename} """)

        file1_bytes = await file1.read()
        with open(f"{session_id_temp}/gemini_rx_1.png", 'wb') as f:
            f.write(file1_bytes)

        image_bytes = file1_bytes
        image_data_decoded1 = base64.b64encode(image_bytes).decode('utf-8')
        p1PersonaImage = f'''<img id="img-interbot-media" src="data:image/png;base64,{image_data_decoded1}" alt="Person 1 Image">'''

        file2_bytes = await file2.read()
        with open(f"{session_id_temp}/gemini_rx_2.png", 'wb') as f:
            f.write(file2_bytes)
        # image = Image.open(BytesIO((file1_bytes)))
        # image.save(f"{session_id_temp}/gemini_rx_1.png")
        image_bytes = file2_bytes
        image_data_decoded2 = base64.b64encode(image_bytes).decode('utf-8')
        p2PersonaImage = f'''<img id="img-interbot-media" src="data:image/png;base64,{image_data_decoded2}" alt="Person 2 Image">'''

        result = f"""AI completed detailed prompt and the resultant images generated!<br/>Person 1's image and prompt are as following:<br/>Person 1's uploaded image is following:<br/>{p1PersonaImage}<br/>Person 2's uploaded image is following:<br/>{p2PersonaImage}"""

        return {"result": result, "session_id_temp": session_id_temp}

@app.post("/inter_bot_media")
async def inter_bot_media(mode: Annotated[str, Form()], textTextBlock: Annotated[str, Form()], interBotPersona: Annotated[str, Form()], sessionId: Annotated[str, Form()], p1Persona: Annotated[str, Form()]='', p2Persona: Annotated[str, Form()]=''):
    
    session_id_temp =  sessionId

    print(f"""for route inter_bot_media\nmode {mode}, textTextBlock: {textTextBlock}, interBotPersona: {interBotPersona} p1Persona {p1Persona} p2Persona {p2Persona}, session_id_temp: {session_id_temp}""")

    p1_path_image = f"{session_id_temp}/gemini_rx_1.png"
    p2_path_image = f"{session_id_temp}/gemini_rx_2.png"

    # we use the above 2 images of persons generated to give image context to final dialogue conversation
    p1Persona_image = Image.open(p1_path_image)
    p2Persona_image = Image.open(p2_path_image)

    final_dialogue = client.models.generate_content(
            model="gemini-2.0-flash-preview-image-generation",
            contents=[f"{interBot_media_dialogue};\n\nTEXT_CONTENT:{textTextBlock};\n\nPERSONALITIES:{interBotPersona}", f"PERSON1_APPEARANCE:{p1Persona}. The following is image attached for how PERSON1_APPEARANCE looks:", p1Persona_image, f"PERSON2_APPEARANCE:{p2Persona}. The following is image attached for how PERSON2_APPEARANCE looks:", p2Persona_image],
            config=types.GenerateContentConfig(
                response_modalities=['TEXT', 'IMAGE']
            )
    )

    # # # for local check
    # temp_dict = {}
    # with open('temp_response.py', 'r', encoding='utf-8') as f:
    #     exec(f.read(), temp_dict)
    # final_dialogue_py = temp_dict['var']
    # counter_img = 1
    # session_id_temp = "1993f478-ecdb-48f4-bdad-4ac4dc5bec4f"
    # this_session_file = f"{session_id_temp}/file.txt"
    # with open(this_session_file, 'a') as f:
    #     for part in final_dialogue_py.candidates[0].content.parts:
    #         if part.text is not None:
    #             f.write(f"<br/>{part.text}<br/>###IMAGE_{counter_img}_BELOW<br/>")
    #         elif part.inline_data is not None:
    #             image_bytes = part.inline_data.data
    #             image_data_decoded = base64.b64encode(image_bytes)
    #             source_img = f'{session_id_temp}/gemini-image{counter_img}.png'
    #             pathlib.Path(source_img).write_bytes(image_data_decoded)
    #             f.write(f'''<br/><img src="data:image/png;base64,{image_data_decoded}" alt="An Image {counter_img}"><br/>''')
    #             counter_img += 1

    counter_img = 1
    this_session_file = f"{session_id_temp}/file.txt"
    with open(this_session_file, 'a') as f:
        for part in final_dialogue.candidates[0].content.parts:
            if part.text is not None:
                f.write(f"<br/>{part.text}<br/>")
            elif part.inline_data is not None:
                image_bytes = part.inline_data.data
                image = Image.open(BytesIO((part.inline_data.data)))
                source_img = f'{session_id_temp}/gemini-image{counter_img}.png'
                image.save(source_img)
                image_data_decoded = base64.b64encode(image_bytes).decode('utf-8')
                f.write(f'''<br/><img id="img-interbot-media" src="data:image/png;base64,{image_data_decoded}" alt="An Image {counter_img}" width="640" height="520"><br/>''')
                counter_img += 1

    # # # for local check
    # counter_img = 1
    # with open(f"79c4235a-a645-4a21-bef2-5dde524f380d/file.txt", "a") as f:
    #     for x in range(1,7):
    #         source_img = f'79c4235a-a645-4a21-bef2-5dde524f380d/gemini-image{counter_img}.png'
    #         with open(source_img, 'rb') as f_rb:
    #             image_bytes = f_rb.read()
    #         image_data_decoded = base64.b64encode(image_bytes).decode('utf-8')                
    #         f.write(f'''<br/><img src="data:image/png;base64,{image_data_decoded}" alt="An Image {counter_img}"><br/>''')
    #         counter_img += 1
    # # for local check
    # with open(f"8ff72176-0633-4966-918b-99d1210ff1ac/file.txt", "r") as f:
    #     content = f.read()
    #     return {"result": content}

    with open(this_session_file, "r") as f:
        content = f.read()
        return {"result": content}

@app.post("/delete_dir")
async def delete_dir(PASS: Annotated[str, Form()]):
    if PASS == PASS_VAR:
        shutil.rmtree("user_files")
        print("Deleted files of user's")
    else:
        print("wrong pass")

# Correctly mount React static files under '/app' instead of '/'
app.mount("/", StaticFiles(directory="prodbuild", html=True), name="static")
