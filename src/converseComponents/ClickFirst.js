import React, {useEffect, useState} from 'react'
import ClickConfirm from './ClickConfirm';
import './css-components/intro.css';

// takes click and mode
const ClickFirst = () => {

    const [clickVar, clickVarSetterFunc] = useState('');
    const [textTextBlock, textTextBlockSetterFunc] = useState('');
    
    const clickFunc = (e) => {
        e.preventDefault();
        clickVarSetterFunc("clicked");
    };

    return (
        clickVar===''?
        <div className='ClickFirst'> 
        <p id="ClickFirstpara">Text</p>
        <textarea id='textTextBlock' type='text' rows="9" cols="70" value={textTextBlock} onChange={(e)=>{textTextBlockSetterFunc(e.target.value)}}></textarea>
        
        <div className='clickButton'>
            <button onClick={clickFunc} id='clickButton'>&#10024;</button>
        </div>    
            
        </div>
        :
        <ClickConfirm textTextBlock={textTextBlock}/>
    )
};

export default ClickFirst;