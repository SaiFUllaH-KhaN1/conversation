import React, {useEffect, useState} from 'react'

//declaring API keys outside the master component
const API_URL = "http://www.omdbapi.com/?i=tt3896198&apikey=a3ec5fcd";

// takes user search
const Header = ({retreiveFunc}) => {

    const [searchStr, searchStrSetterFunction] = useState('');

    const thisValue = (e) => {
        e.preventDefault();
        retreiveFunc(searchStr);    
    };
    return (
        <nav className="navbar navbar-expand-lg bg-body-tertiary">
            <form className="d-flex container" role="search" onSubmit={thisValue}>
                <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search"
                value={searchStr} onChange={(e)=>{return searchStrSetterFunction(e.target.value)}}
                />
                <button className="btn btn-outline-success">Search</button>
            </form>      
        </nav>
    );
};

// this is to show user data
const Show = ({updateValue}) => {

    const [dataVar, setData] = useState('');

    useEffect(() => {

    // API process the search results
    const searchFunc = async () => {
        const responseVar = await fetch(`${API_URL}&s=${updateValue}`);
        const data = await responseVar.json();
        setData(data.Search);
    };
    searchFunc(); // call the function coded above

    console.log("value updated and got: ", "&",`${API_URL}&s=${updateValue}`);
    }, [updateValue]);

    // displaying search results
    return (
        dataVar?
        <div className="d-flex container">
            <div>
                {dataVar.map((dictEle)=>{return <div className="container my-3"> 
                    <h4>{dictEle.Title}</h4> <h5>{dictEle.Year}</h5>
                    <p>{dictEle.Type}</p>
                    <img src={dictEle.Poster !== "N/A" ? dictEle.Poster : "https://via.placeholder.com/400"} alt={dictEle.Title} />
                    <hr className="container my-4"></hr>
                </div>
                })}
            </div>
        </div>
        :
        <div className="container">
            <p>Not Found!</p>
        </div>        
    );
};

// master component
const App = () => {

    const [updateValue, updateValueSetterFunction] = useState('');

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
