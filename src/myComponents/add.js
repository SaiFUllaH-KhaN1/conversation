import React, {useState} from 'react'

const Add = ({addTodo}) => {
  
    const [title,titleSetterFunction] = useState('');
    const [desc,descSetterFunction] = useState('');
  
    // on submission of form, submitFunction is passed and is defined below
    const submitFunction = (e) => {
        e.preventDefault();
        if (!title || !desc){
            alert("Empty either title or desc");
        }
        else{
            addTodo(title, desc);
            titleSetterFunction('');
            descSetterFunction('');
        }
    };

    return (
    <div className='container'>

        <h3>Add Todo below</h3>
        <form onSubmit={submitFunction}>
            <div className="mb-3 row">
            <label htmlFor="titlebox" className="col-sm-2 col-form-label">Title</label>
            <input type="text" className="form-control" id="titlebox" value={title} onChange={(e)=>titleSetterFunction(e.target.value)}/>
            </div>

            <div className="mb-3 row">
            <label htmlFor="descbox" className="col-sm-2 col-form-label">Description</label>
            <input type="text" className="form-control" id="descbox" value={desc} onChange={(e)=>descSetterFunction(e.target.value)}/>
            </div>

            <button type='submit' className='btn btn-sm btn-success'>Add Todo</button>
        </form>
    </div>
  );
}

export default Add;
