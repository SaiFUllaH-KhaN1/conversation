import React, {useEffect, useState, useRef} from 'react'
import App from '../intro';

const GroundedOptions = ({mode, textTextBlock}) => {

    const [enter, enterSetterFunction] = useState('');
    const [textEntered, textEnteredSetterFunction] = useState('');

    return (
    enter===''?
    <>

        <div className="buttonMode">
            <button id="buttonModeElement" onClick={()=>{enterSetterFunction('clicked'); textEnteredSetterFunction("grounded_conversation")}}>Grounded Discussion</button>
            <button id="buttonModeElement" onClick={()=>{enterSetterFunction('clicked'); textEnteredSetterFunction("grounded_qa_conversation")}}>Grounded Q & A</button>
        </div>

    </>
    :
    <App mode={textEntered} textTextBlock={textTextBlock}/>
  )
}

export default GroundedOptions;