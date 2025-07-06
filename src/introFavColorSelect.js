import React, {useState, useEffect, useRef} from 'react';
import './intro.css';

let Message = (props) => {
  return("Your fav color is: "+ props.name);
}

let App = () => {

  let [selectColor, selectColorSetterFunction] = useState('');

  return (
    
    <>
      {/* master fragment*/}

      <>
        {/*Body fragment*/}
        <div className="intro-div">
          <h2>Colors Quizz</h2>

          {selectColor===''? 
          <>
            <h3>Which is your fav color? Select one!</h3>
            <div className='color-boxes'>
              <div className="red-box" onClick={()=>{selectColorSetterFunction("red")}}>
              </div>
              <div className="yellow-box" onClick={()=>{selectColorSetterFunction("yellow")}}>
              </div>
              <div className="purple-box" onClick={()=>{selectColorSetterFunction("purple")}}>
              </div>
            </div>
          </>
          :
          <>
            <h3><Message name={selectColor}/></h3>
            <button onClick={()=>selectColorSetterFunction('')}>Go Back</button>
          </>
          }

        </div>
        
      </>


      <>
        {/*css style fragment*/}
        <style>{`
          body { 
            background-color: grey;
          }
          
          .intro-div {
            text-align: center;
          }
          
          .para-div {
            text-align: center;
            font-style: italic;
            font-weight:800;
            color: yellowgreen;
            /* border: 5px solid red; */
          }
          
          .color-boxes{
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5vw;
          }
          
          .red-box {
            width: 50px;
            height: 50px;
            background-color: red;
          }
          
          .red-box:hover {
            transition: all 0.5s ease-in-out;
            transform: scale(1.3);
            box-shadow: 0em 0em 0.5em 0.5em rgba(255, 0, 0, 0.604);
          }
          
          .yellow-box{
            width: 50px;
            height: 50px;
            background-color: yellow;
          }
          
          .yellow-box:hover {
            transition: all 0.5s ease-in-out;
            transform: scale(1.3);
            box-shadow: 0em 0em 0.5em 0.5em rgba(255, 255, 0, 0.604);
          }
          
          .purple-box {
            width: 50px;
            height: 50px;
            background-color: rgb(69, 43, 241);
          }
          
          .purple-box:hover {
            transition: all 0.5s ease-in-out;
            transform: scale(1.3);
            box-shadow: 0em 0em 0.5em 0.5em rgba(69, 43, 241, 0.604);
          }
        `}</style>
      </>

    </>

  );
}

export default App;