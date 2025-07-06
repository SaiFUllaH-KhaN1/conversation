import React, {useEffect, useState, useRef} from 'react'
import App from '../../intro';

const InterbotForms = ({mode, textTextBlock, interBotPersona}) => {
    

    const [enter, enterSetterFunction] = useState('');
    const [textEntered, textEnteredSetterFunction] = useState('');

    const clickFunc = (e) => {
        e.preventDefault();
        enterSetterFunction("clicked");
    };

    return (
    enter===''?
    <>
    <div className='ClickFirst'> 
        
        <p id="ClickFirstpara">Describe Bots' Personality!</p>

        <textarea id='textTextBlock' type='text' rows="5" cols="70" value={textEntered} onChange={(e)=>{textEnteredSetterFunction(e.target.value)}}></textarea>
                
        <div className='clickButton'>
            <button onClick={clickFunc} id='clickButton'>&#10024;</button>
        </div>  

    </div>
    </>
    :
    <App mode={mode} textTextBlock={textTextBlock} interBotPersona={textEntered}/>
  )
}

export default InterbotForms;