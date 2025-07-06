import React, {useEffect, useState, useRef} from 'react'
import App from '../intro';

const Persona = ({mode, textTextBlock, persona, learningObj}) => {
    

    const [enter, enterSetterFunction] = useState('');
    const [textEntered, textEnteredSetterFunction] = useState('');
    const [textEnteredLO, textEnteredLOSetterFunction] = useState('');

    const clickFunc = (e) => {
        e.preventDefault();
        enterSetterFunction("clicked");
    };

    return (
    enter===''?
    <>
    <div className='ClickFirst'> 

        <p id="ClickFirstpara">Learning Objectives of this Simulation:</p>
        <textarea id='textTextBlock' type='text' rows="3" cols="70" value={textEnteredLO} onChange={(e)=>{textEnteredLOSetterFunction(e.target.value)}}></textarea>
        
        <br></br>

        <p id="ClickFirstpara">Describe Bot's Personality and additional scenario context, if any.</p>
        <textarea id='textTextBlock' type='text' rows="3" cols="70" value={textEntered} onChange={(e)=>{textEnteredSetterFunction(e.target.value)}}></textarea>
        
        <div className='clickButton'>
            <button onClick={clickFunc} id='clickButton'>&#10024;</button>
        </div>  

    </div>
    </>
    :
    <App mode={mode} textTextBlock={textTextBlock} persona={textEntered} learningObj={textEnteredLO}/>
  )
}

export default Persona;