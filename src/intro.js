import React, {use, useEffect, useState} from 'react'
import ClickFirst from './converseComponents/ClickFirst';
import CHAT from './converseComponents/chat';
import InterbotChat from './converseComponents/interBotChat/interbotChat';
import './converseComponents/css-components/intro.css';

// master component
const App = ({mode, textTextBlock, persona, learningObj, interBotPersona}) => {
        
    const modeDeciderFunc = () => {
        if (mode){
            if (mode==='grounded_conversation' || mode==='simulated_conversation' || mode==='grounded_qa_conversation'){
                return <CHAT modeStr={mode} textTextBlock={textTextBlock} persona={persona} learningObj={learningObj}/>
            }
            else if (mode==='interBot_conversation'){
                return <InterbotChat modeStr={mode} textTextBlock={textTextBlock} interBotPersona={interBotPersona}/>
            }
        }
    };

    return (
        <>
        <div className='main'>
            {
                mode?
                modeDeciderFunc()
                :
                <>
                <ClickFirst/>
                </>
            }
        </div>
        </>
    );
};

export default App;
