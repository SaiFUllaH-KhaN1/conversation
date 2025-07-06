import React from 'react'
import TodoItem from './TodoItem.js'

const Todos = ({todos, onDelete}) => {
  return (
   
    <div className='container my-3' style={{minHeight:"100vh"}}>

      <h3 className='container my-3'>To Dos List </h3>

      {
        todos.length === 0 ?
        <div>
          <h5>No Todos Here!</h5>
        </div>
        :
        todos.map((ele)=>{
          console.log("ele.sno ",ele.sno)
          // key required for rendering multiple components
          return < TodoItem todo={ele} key={ele.sno} onDelete={onDelete} />
      })}

    </div>

  )
}

export default Todos;