import React, {useEffect, useState} from 'react'
import App from '../intro';
import Persona from './persona';
import InterbotForms from './interBotChat/interbotForms';
import GroundedOptions from './groundedOptions';
import './css-components/intro.css';

// takes click and mode
const ClickConfirm = ({mode, textTextBlock}) => {

    const [funcSelect, funcSelectSetterFunc] = useState('');

    const toModeUI = () => {
        if (funcSelect){
            if (funcSelect==='grounded_conversation'){
                return <GroundedOptions mode={funcSelect} textTextBlock={textTextBlock}/>
            }
            else if(funcSelect==='simulated_conversation'){
                return <Persona mode={funcSelect} textTextBlock={textTextBlock}/>
            }
            else if (funcSelect==='interBot_conversation'){
                return <InterbotForms mode={funcSelect} textTextBlock={textTextBlock}/>
            }
        }
    };

    useEffect(()=> {
    if (localStorage.getItem("previousChat")){
        localStorage.removeItem("previousChat");
    }        
    },[]);

    return (
        funcSelect===''?
            <div className="buttonMode">
                <button id="buttonModeElement" onClick={()=>funcSelectSetterFunc("grounded_conversation")}>Grounded Conversation</button>
                <button id="buttonModeElement" onClick={()=>funcSelectSetterFunc("simulated_conversation")}>Simulated Conversation</button>
                <button id="buttonModeElement" onClick={()=>funcSelectSetterFunc("interBot_conversation")}>Inter Bot Conversation</button>
            </div>
        :
            toModeUI()
    )
};

export default ClickConfirm;