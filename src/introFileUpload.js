import React, {useEffect, useState} from 'react'

// takes user search
const Header = ({retreiveFunc}) => {

    const [searchStr, searchStrSetterFunction] = useState();

    const thisValue = (e) => {
        e.preventDefault();
        console.log("searchStr", searchStr);
        retreiveFunc(searchStr);    
    };
    return (
        <nav className="navbar navbar-expand-lg bg-body-tertiary">
            <form className="d-flex container" role="search" onSubmit={thisValue}>
                <input type='file' accept='.pdf' onChange={(e)=>{console.log(e.target.files[0]); return searchStrSetterFunction(e.target.files[0])}} />
                <button className="btn btn-outline-success">Search</button>
            </form>      
        </nav>
    );
};

// this is to show user data
const Show = ({updateValue}) => {
    console.log("updateValue",updateValue);
    if (updateValue){
    return(
        <iframe src={URL.createObjectURL(updateValue)} width="80%" height="600px" title="pdf preview" />
    );
    }
    else{
        return(
        <p>Not running</p>
        );
    }   
};

// master component
const App = () => {

    const [updateValue, updateValueSetterFunction] = useState();

    const retreiveFunc = (searchStr) => {
        updateValueSetterFunction(searchStr);
        return updateValue;
    };

    return (
        <>
            <Header retreiveFunc={retreiveFunc}/>
            <Show updateValue={updateValue}/>
        </>
    );
};

export default App;
