import React, {useEffect, useState, useRef} from 'react'
import App from '../intro';
import './css-components/intro.css';
import { v4 as uuidv4 } from 'uuid';

// takes click and mode
const CHAT = ({modeStr, exitValue, textTextBlock, learningObj, persona, instructions_grounded}) => {
    
    // exit logic
    const [exit, exitFunctionSetter] = useState('Exit');
    const exitFunc = (e) => {
        e.preventDefault();
        exitFunctionSetter('');
    };

    //input form
    const [chatVar,chatVarSetterFunction] = useState('');

    const [textResponse,textResponseSetterFunction] = useState('');

    const [idPHistoryFuncVar,idPHistoryFuncVarSetterFunction] = useState('');

    const [paraphraseBool, paraphraseBoolSetterFunction] = useState(false);

    const [chatEnded, setChatEndedSetterFunction] = useState(false);

    const [sendBtnVisibility, sendBtnVisibilitySetterFunction] = useState(true);


    const confirmSubmission = (e) => {
        e.preventDefault();
    
        let session_id = '';

        session_id = localStorage.getItem("session_id");
        console.log(`session_id found in local storage as: ${session_id}`);

        // session_idSetterFunction(JSON.stringify(newId));

        const idPvalue = document.getElementById("idP").innerHTML;
        let [chatHistoryObj, firstTimeChatMessage] = chatHistoryFunc(chatVar, idPvalue);
        // chatHistoryObj = JSON.stringify(chatHistoryObj);
        // console.log("chatHistoryObj",chatHistoryObj);

        document.getElementById("idP").innerHTML = '';
        textResponseSetterFunction('');
        sendBtnVisibilitySetterFunction(false);

        idPHistoryFunc();

        // const encodedchatHistoryObj = encodeURIComponent(chatHistoryObj);
        // const encodedmodeStr = encodeURIComponent(modeStr);
        // const encodedtextTextBlock = encodeURIComponent(textTextBlock);
        // const encodedpersona = encodeURIComponent(persona);
        // const encodedchatVar = encodeURIComponent(chatVar);
        // const encodedlearningObj = encodeURIComponent(learningObj);

        //PROD https://conversation-v2.onrender.com/converse //local: http://127.0.0.1:6770/converse
        const responseFunctionCall = async () => {
            const responseVar = await fetch("https://conversation-v2.onrender.com/converse",
            {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    que: firstTimeChatMessage ? "INITIATE_CHAT" : chatVar,
                    chatHistoryObj: chatHistoryObj,
                    mode: modeStr,
                    textTextBlock: textTextBlock,
                    persona: persona,
                    learningObj: learningObj,
                    instructions_grounded: instructions_grounded,
                    session_id: session_id,
                  })
            });
            var reader = responseVar.body.getReader();
            var decoder = new TextDecoder('utf-8');

            reader.read().then(function processResult(result) {
                
                if (result.done) {
                    sendBtnVisibilitySetterFunction(true);
                    console.log("Done");
                    chatVarSetterFunction('');
                    paraphraseBoolSetterFunction((x) => !x);     
                    return;
                };

                let token = decoder.decode(result.value);

                // here streaming update occurs!
                // if (token.includes("!RESPONSE_HAS_ENDED_CLEAR_THE_EARLY_MESSAGE_PLEASE!"))
                // {
                //     console.log(`AI COMMAND DETECTED! Token is: ${token}`);
                //     var textAfter = token.split("!RESPONSE_HAS_ENDED_CLEAR_THE_EARLY_MESSAGE_PLEASE!")[1];
                //     textResponseSetterFunction((x)=>{return textAfter;});
                // }
                // else{
                //     textResponseSetterFunction((x)=>{return x+token;});
                // };

                // for Anton streaming update
                let token_array = token.split('||||'); // splitting to split double jsons for example
                // {"this":"that"}||||{"alsoThis":"alsoThat"}||||
                // It occurs that in one streaming instance, double json may be there.
                // This is how backend sends to frontend with or without seperators.
                // Backend may send just one json as well like {"this":"that"}
                // This frontend way supports both cases where single or double jsons are sent in
                // one stream instance
                console.log(`token_array is: ${token_array}`);
                for (let ele of token_array){

                    ele = ele.trim(); // trimming extra spaces
                    if (!ele) {continue}; // for skipping blank elements and not
                    // processing if such empty element is there in the array to which we
                    // are using for loop

                    ele = JSON.parse(ele); // we convert string to json for below process

                    // we retreive keys. chunk_response key is what the real
                    // streamed tokens are. Ones the chunks are completed
                    // then there is a key named "response", which includes
                    // the final full AI generated message and that is used to 
                    // replace all the chunks in displayed in the frontend before
                    // for that specific message. In addition, you may also have
                    // session_id and time calculation and chat_history 
                    // with the element which has they as "response" 
                    if (ele.chunk_response){
                        let chunk_value = ele.chunk_response;
                        console.log(`Recieving chunks:${chunk_value}`);
                        textResponseSetterFunction((x)=>{return x+chunk_value;});
                    }
                    else if (ele.response){
                        let final_value = ele.response;
                        let session_id = ele.session_id; // the final response
                        // will also have other keys as well which would have value
                        // for example session_id, chat_history array or some other 
                        // outputs like token_time,
                        // that would need their value to be processed
                        console.log(`Final value:${final_value}, and session id is:${session_id}`);
                        textResponseSetterFunction((x)=>{return final_value;});
                    };

                };
                      
                return reader.read().then(processResult);
            });

            // for normal static responses!
            // const data = await responseVar.json();
            // console.log("data made", data.result);
            // textResponseSetterFunction(data.result);
        };
        responseFunctionCall();
    };

    // here non-stream text block recieved
    const chatHistoryFunc = (chatVar, idPvalue) => {
        // e.preventDefault();
        console.log("idPvalue",idPvalue);
        if (localStorage.getItem("previousChat")){
            const all_previous_chats = JSON.parse(localStorage.getItem("previousChat"));
            
            const dict_que_res = {Human: chatVar, Bot: ''};
            
            const previous_obj = all_previous_chats[all_previous_chats.length - 1]
            previous_obj.Bot = idPvalue;

            all_previous_chats.push(dict_que_res);
            localStorage.setItem("previousChat",JSON.stringify(all_previous_chats));
            
            // to check if correctly set history!
            console.log("current que",chatVar);
            let chatHistoryObj = null;
            chatHistoryObj = all_previous_chats.slice(0,all_previous_chats.length-1);
            const firstTimeChatMessage = false;
            return [chatHistoryObj, firstTimeChatMessage];
        }
        else{
            const all_previous_chats = [];
            
            const dict_que_res = {Human: "INITIATE_CHAT", Bot: ''};
            const dict_que_res2 = {Human: "", Bot: ''};
            all_previous_chats.push(dict_que_res);
            all_previous_chats.push(dict_que_res2);
            console.log("no previous chat, adding:", all_previous_chats);
            localStorage.setItem("previousChat",JSON.stringify(all_previous_chats));

            // to check if correctly set history!
            console.log("current que",chatVar);
            let chatHistoryObj = null;
            chatHistoryObj = all_previous_chats.slice(0,all_previous_chats.length-1);
            const firstTimeChatMessage = true;
            return [chatHistoryObj, firstTimeChatMessage];
        };
    };

    const idPHistoryFunc = () => {
        let x = JSON.parse(localStorage.getItem("previousChat"));
        let y = x.slice(1,);
        // Array to hold React nodes
        const nodes = [];
        y.forEach((ele, idx) => {
            if (idx === 0) {
                nodes.push(
                <div className='botHistoryInstance' key={`bot-${idx}`}><p dangerouslySetInnerHTML={{__html: ele.Bot}}></p> </div>
                );
            } else {
                nodes.push(
                <div key={`human-${idx}`}>
                <div className='humanHistoryInstance'><p dangerouslySetInnerHTML={{__html: ele.Human}}></p> </div> 
                <div className='botHistoryInstance'><p dangerouslySetInnerHTML={{__html: ele.Bot}}></p> </div> 
                </div>
                );
            }
        });
        idPHistoryFuncVarSetterFunction(nodes);
    };

    const modeShower = (modeStr) => {
        if(modeStr==='grounded_conversation'){
            return <p>Mode: Tutor</p>
        }
        else if (modeStr==='simulated_conversation'){
            return <p>Mode: Simulation</p>
        }
    };

    // useEffect(()=>
    // {
    //     console.log("paraphraseBool",paraphraseBool);
    //     if (textResponse.includes('!RESPONSE_HAS_ENDED_CLEAR_THE_EARLY_MESSAGE_PLEASE!')){
    //         console.log("!RESPONSE_HAS_ENDED_CLEAR_THE_EARLY_MESSAGE_PLEASE! detected!");
    //         textResponseSetterFunction((x)=>{
    //             let y = x.split(/###topicsSKIPPED[\s\S]*?###/);
    //             return y[1];
    //             });
    //     };
    // },[paraphraseBool]);

    const oneTime = useRef(false);
    useEffect(()=>
    {
        if (oneTime.current===false){
            console.log("textTextBlock", {textTextBlock});
            
            // session_id set
            const newId = uuidv4();
            localStorage.setItem("session_id",JSON.stringify(newId));
            console.log(`------\nNo prior session_id. Made: ${typeof newId}, ${newId} and stringify is: ${JSON.stringify(newId)}\n------`);
                        
            chatVarSetterFunction('INITIATE_CHAT');
            document.getElementById("submissionBut").click();
            chatVarSetterFunction('');
            
            oneTime.current=true;
        }        
    },[]);
    
    const scroller = useRef(null);
    useEffect(()=>{
        if (scroller.current){
            scroller.current.scrollIntoView({behavior:"smooth",block:"end",inline:'nearest'});
        };
        sendBtnVisibilitySetterFunction(true);
        }, [idPHistoryFuncVar, textResponse]);

    return (
        <>
        {
        exit?
        <>
        <div className='main-chat'>

            <div className='exitButtonDivAndModeDiv'>
                <div className="modeDiv">
                    {
                    modeShower(modeStr)
                    }
                </div>
                <div className="exitButtonDiv">
                    <button id="exitButton" onClick={exitFunc}>X</button>
                </div>
            </div>

            <div className="humanBot">
                <div id="idDivHistory">
                {idPHistoryFuncVar}
                </div>
            
                <p id="idP" dangerouslySetInnerHTML={{ __html: textResponse }}></p>
                <div ref={scroller} />
            </div>

            <div className="chat-controls">
            {chatEnded?
                <p id="chatEndMessage" className="greenText600">Chat Ended!</p>
            :
                <>
                <textarea id="submissionChat" type='text' rows="2" cols="60" value={chatVar} onChange={(e)=>{chatVarSetterFunction(e.target.value)}}/>
                <button id="submissionBut" onClick={confirmSubmission} style={{visibility: sendBtnVisibility ? "visible" : "hidden"}}>&#9654;</button>
                </>
            }    
            </div>

        </div>
        </>
        
        :
        <App mode={exit}/>
        }
        </>
    )
};

export default CHAT;
