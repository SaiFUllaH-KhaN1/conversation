import React, {useState, useEffect, useRef} from 'react';
import './intro.css';
import Header from './myComponents/header.js'
import Footer from './myComponents/Footer.js'
import Todos from './myComponents/Todos.js'
import Add from './myComponents/add.js';
import About from './myComponents/About.js';

import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';

const App = () => {

  // deletes by combining to include all todo elements except the one deleted 
  const onDelete = (todo) => {
    console.log(`Deleting u... ${todo.desc}`);
    todosSetterFunc(todos.filter((ele) => {return ele!==todo;}));
  };

  // gives a default value to todos variable as empty array if not present in local storage,
  // if present it retreives from local storage 
  const [todos, todosSetterFunc] = useState(()=>{
    const myTodos = localStorage.getItem("todos"); 
    if (myTodos == null){return []};
    return JSON.parse(myTodos);
  });

  // a function that recieves title and desc from the Add component,
  // compiled in a dict element and added via ... expand operator for setting value
  // of todos via the todosSetterFunc useState setter function
  const addTodo = (title, desc) => {
    let dict = {sno: crypto.randomUUID(), title: title, desc: desc};
    todosSetterFunc([...todos, dict]);
    console.log(title, desc, "and", todos);
  }

  // updates local storage at every time the todos is changed
  useEffect(()=>{return localStorage.setItem("todos",JSON.stringify(todos))}, [todos]);

  return (
    
    <>
      {/* master fragment*/}

      <>
        {/*Body fragment*/}
        <Router>

          <Header title="TODO APP" searchBar={false}/> 

          <Routes>      

            <Route path='/' element={<> <Add addTodo={addTodo}/> <Todos todos={todos} onDelete={onDelete}/> </>} >
            </Route>

            <Route path='/about' element={<About/>} >
            </Route>

          </Routes>

          <Footer/>

        </Router>
        
      </>

      <>
        {/*css style fragment*/}
        {/* <style>{`
        `}</style> */}
      </>

    </>

  );
}

export default App;