import React from "react";
import './app.css';
import CytoscapeGraph from "./component/cytoscape/CytoscapeGraph";


class App extends React.Component {


  constructor(props){
      super(props);
  }


  resizeErrorHandler(){

  }

  componentDidMount() {

  }
 
  render(){
    //console.log('render triggered')
    return (
      <> 
          <CytoscapeGraph />
      </>
    );
  }
};

export default App;