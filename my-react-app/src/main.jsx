import { createRoot } from 'react-dom/client'

const myelement = (
  <h1> Hellow world </h1> 
  
);

class user{
  constructor(name){
    this.name = name;
  }

  present(){
    return "hello " + this.name;
  }

  hello = () => {
    return "hello brooooooo"
  }
}

var nm = new user("Sandip")


createRoot(document.getElementById('root')).render(
  <>
  {myelement}
  {nm.present()}
  {nm.hello()}
  </>
  
)  