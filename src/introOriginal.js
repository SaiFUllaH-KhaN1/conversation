import React, {useState, useEffect, useRef} from 'react';
import './intro.css';

let FavColor = (props) => {
  return(
    <p>my fav color is {props.name} & {props.another}</p>
  )
}

let App =() => {

  {/*variable, setter function and then default state value; never update state manually, instead use the setter function
  for it in React! */}
  let [count_var,counterSetterFunction] = useState(0);

  {/* useRef for keeping a value across multiple renders */}
  let firstRender = useRef(true);

  {/*useEffect either used to load something for first time (if dependancy is empty), OR used to load everytime a variable changes */}
  useEffect(()=>{alert("App started!");},[]);  {/*a function, a list of dependancy/ies */}
  
  // to alert when count_var changes. Does not alert (sing useRef) on component's first render!;
  useEffect(()=>{
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    alert("Count clicked!");
  },
  [count_var]
  );

  return (
    <>
      
      <div className="intro-div">
        <h2>React JS!</h2>
      </div>
      
      {/*component injection with props  */}
      <div className='para-div'>
        <FavColor name="green" another="purple" /> 
      </div>
    
      {/*useState in action; outer function for registering click, calling the setter function, then using another
      inline function to update state in compatibile way to react's batch-update philosophy*/}
      <div className='para-div'>
        <button onClick={()=>counterSetterFunction((x)=>x+1)}>Clicked {count_var} times!</button>
      </div>

    {/*fragments for multiple html elements  */}
    </>  
  );
}

export default App;