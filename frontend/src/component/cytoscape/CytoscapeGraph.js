import React, { Component } from 'react';
import cytoscape from 'cytoscape';
import edgehandles from 'cytoscape-edgehandles';
import { useState } from "../../tools/reactAccessories";
import './cytoscape.css'; // Include your Cytoscape stylesheet here

class CytoscapeGraph extends Component {

  constructor(props) {
    super(props);
    
    this.state = {
      unknown_state_test: {},
    }
    this.plainRef = React.createRef();
    this.cytoscape_instance = null;
    this.edgehandles_instance = null;


    [this.showModal, this.setShowModal] = useState(this, false);
    [this.selectedEdge, this.setSelectedEdge] = useState(this, null);
    [this.drawMode, this.setDrawMode] = useState(this, false); // State to track draw mode
    // Define start and stop node IDs in component state
    [this.startNode, this.setStartNode] = useState(this, null);
    [this.stopNode, this.setStopNode] = useState(this, null);
    

    this.layout = {
      name: 'grid',
      rows: 2,
      cols: 2
    };

    this.style= [
      {
        selector: '.optimal-path', // Class for optimal path edges
        style: {
          'line-color': 'red', // Change this color as needed
          'target-arrow-color': 'red',
        }
      },
      {
        selector: 'node[name]',
        style: {
          'content': 'data(name)'
        }
      },
      {
        selector: '.start-node', // Class for start nodes
        style: {
          'background-color': 'red' // Change this color as needed
        }
      },
    
      {
        selector: '.stop-node', // Class for stop nodes
        style: {
          'background-color': 'black' // Change this color as needed
        }
      },
      {
        selector: '.start-node', // Class for start nodes
        style: {
          'background-color': 'red', // Change this color as needed
          'label': 'Start' // Display label as 'Start' near start nodes
        }
      },
      {
        selector: '.stop-node', // Class for stop nodes
        style: {
          'background-color': 'black', // Change this color as needed
          'label': 'Stop' // Display label as 'Stop' near stop nodes
        }
      },
      {
        selector: 'edge',
        style: {
          'curve-style': 'bezier',
          'target-arrow-shape': 'triangle'
        }
      },
  
      // some style for the extension
  
      {
        selector: '.eh-handle',
        style: {
          'background-color': 'red',
          'width': 12,
          'height': 12,
          'shape': 'ellipse',
          'overlay-opacity': 0,
          'border-width': 12, // makes the handle easier to hit
          'border-opacity': 0
        }
      },
  
      {
        selector: '.eh-hover',
        style: {
          'background-color': 'red'
        }
      },
  
      {
        selector: '.eh-source',
        style: {
          'border-width': 2,
          'border-color': 'red'
        }
      },
  
      {
        selector: '.eh-target',
        style: {
          'border-width': 2,
          'border-color': 'red'
        }
      },
  
      {
        selector: '.eh-preview, .eh-ghost-edge',
        style: {
          'background-color': 'red',
          'line-color': 'red',
          'target-arrow-color': 'red',
          'source-arrow-color': 'red'
        }
      },
  
      {
        selector: '.eh-ghost-edge.eh-preview-active',
        style: {
          'opacity': 0
        }
      },
      // Add a style definition for edge label displaying the weight
      {
        selector: 'edge',
        style: {
          'curve-style': 'bezier',
          'target-arrow-shape': 'triangle',
          'label': 'data(weight)', // Display edge weight as label
          'text-background-color': 'white',
          'text-background-opacity': 1,
          'text-background-padding': '3px',
          'text-background-shape': 'round-rectangle',
          'text-valign': 'center',
          'text-halign': 'center',
          'color': 'black',
          'font-size': '10px',
        }
      }
    ]
  
    this.elements= {
      nodes: [
        { data: { id: 'j', name: 'A' } },
        { data: { id: 'e', name: 'B' } },
        { data: { id: 'k', name: 'C' } },
        { data: { id: 'g', name: 'D' } }
      ],
      edges: [
        { data: { source: 'j', target: 'e', weight: 1 } },
        { data: { source: 'j', target: 'k', weight: 2 } },
        { data: { source: 'j', target: 'g', weight: 4 } },
        { data: { source: 'e', target: 'j', weight: 2 } },
        { data: { source: 'e', target: 'k', weight: 3 } },
        { data: { source: 'k', target: 'j', weight: 5 } },
        { data: { source: 'k', target: 'e', weight: 2 } },
        { data: { source: 'k', target: 'g', weight: 8 } },
        { data: { source: 'g', target: 'j', weight: 1 } }
      ]
    }

    // Bind necessary functions
    this.addRandomNode = this.addRandomNode.bind(this);
    this.toggleDrawMode = this.toggleDrawMode.bind(this);
    this.generateRandomName = this.generateRandomName.bind(this);
    this.handleWeightSubmit = this.handleWeightSubmit.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
    this.handleEdgeWeightInput = this.handleEdgeWeightInput.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.cytoscape_click_handler = this.cytoscape_click_handler.bind(this);
    // this.edge_interaction_handler = this.edge_interaction_handler.bind(this);

    

  }

  async componentDidMount() {
    await this.loadCytoscape();
    this.edge_interaction_handler()
    
    // Event listeners for mouse down and up to detect right-click and toggle draw mode
    document.addEventListener('mousedown', this.handleMouseDown);
    document.addEventListener('mouseup', this.handleMouseUp);

     // Add click event listener to nodes for selecting/deselecting start/stop nodes
     this.cytoscape_instance.on('click', 'node', this.cytoscape_click_handler);
    
  }

  componentWillUnmount() {
    if (this.plainRef.current) {
      this.plainRef.current.innerHTML = ''; // Clear container
    }
    // Remove event listeners when the component unmounts
    document.removeEventListener('mousedown', this.handleMouseDown);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }


  cytoscape_click_handler(event){
    const node = event.target;
      const nodeId = node.id();

      // If the clicked node is the start node, deselect it
      if (nodeId === this.startNode()) {
        this.setStartNode(null);
        node.removeClass('start-node');

        if (this.stopNode()) {
          const prevStopNode = this.cytoscape_instance.getElementById(this.stopNode());
          prevStopNode.removeClass('stop-node');
        }
        this.setStopNode(nodeId);
        node.addClass('stop-node');
      } 
      
      // Similar logic for stop node selection/deselection
      else if (nodeId === this.stopNode()) {
        this.setStopNode(null);
        node.removeClass('stop-node');
      }

      else {
        // Deselect the current start node (if any)
        if (this.startNode) {
          const prevStartNode = this.cytoscape_instance.getElementById(this.startNode());
          prevStartNode.removeClass('start-node');
        }
        // Select a new start node
        this.setStartNode(nodeId);
        node.addClass('start-node');
      }

      // Inside cytoscape_click_handler after setting the start and stop nodes
  
  }

  loadCytoscape = async () => {
    try {
      // Load necessary scripts dynamically
      await Promise.all([
        import('cytoscape'),
        import('cytoscape-edgehandles'),
        // Include other scripts here if needed
      ]);

      // Initialize Cytoscape instance
      this.cytoscape_instance = cytoscape({
        container: this.plainRef.current,
        elements: this.elements,
        style: this.style,
        layout: this.layout
      });

      // Ensure edgehandles is registered as an extension
    cytoscape.use(edgehandles);
    this.edgehandles_instance = this.cytoscape_instance.edgehandles();

    this.cytoscape_instance.on('dblclick', 'edge', (event) => {
      const edge = event.target;
      this.setSelectedEdge(edge);
      this.handleEdgeWeightInput();
    });


    
    } catch (error) {
      console.error('Error loading Cytoscape or edgehandles:', error);
    }
  };

  handleWeightSubmit(e) {
    e.preventDefault();
    // console.log('Selected Edge Data (Before):', this.selectedEdge().data());
    const weight = parseInt(e.target.elements.weight.value, 10);
    if (this.selectedEdge()) {
      this.selectedEdge().data('weight', weight);
      this.highlightOptimalPath()
    }
    // console.log('Selected Edge Data (After):', this.selectedEdge().data());
    this.setShowModal(false);
  }
  


  edge_interaction_handler() {
    let lastClickTime = 0;
    let clickedElement = null;
    const timeThreshold = 300; // Adjust this threshold as needed
  
    this.cytoscape_instance.on('cxttap', (event) => {
      const currentTime = new Date().getTime();
      const element = event.target;
  
      if (clickedElement === element && currentTime - lastClickTime < timeThreshold) {
        // Double-click detected
        if (element.isNode && element.isNode()) {
          this.cytoscape_instance.remove(element);
        } else if (element.isEdge && element.isEdge()) {
          this.cytoscape_instance.remove(element);
        }
      } else {
        // Single-click
        clickedElement = element;
        lastClickTime = currentTime;
      }
    });
  }

  // Function to generate a random name for a new node
  generateRandomName(){
    let id = Math.random().toString(36).substr(2, 5); // Generate a random ID
    return id;
  };

  // Function to add a new node with a random name
  addRandomNode(){
    const newNodeId = this.generateRandomName(); // Generate a random ID
    const newNode = { data: { id: newNodeId, name: newNodeId } };
    // console.log('New node:', newNode);
    this.cytoscape_instance.add({ nodes: [newNode] });
  };


  // Toggle draw mode function
  toggleDrawMode (){
      if (this.drawMode()) {
        this.edgehandles_instance.disableDrawMode();
      } else {
        this.edgehandles_instance.enableDrawMode();
      }
      this.setDrawMode(!this.drawMode()); // Update draw mode state
  };

  handleEdgeWeightInput(){
    this.setShowModal(true);
  };

  handleModalClose(){
    this.setShowModal(false);
  };

  // Method to handle mouse down events (detect right-click and enable draw mode)
  handleMouseDown = (event) => {
    if (event.button === 2) { // Check if it's the right-click (button value 2)
      event.preventDefault(); // Prevent default right-click behavior

      this.edgehandles_instance.enableDrawMode();
      this.setDrawMode(true); // Update draw mode state
    }
  };

  // Method to handle mouse up events (detect right-click release and disable draw mode)
  handleMouseUp = (event) => {
    if (event.button === 2 && this.drawMode()) { // Check if it's the right-click and draw mode is enabled
      this.edgehandles_instance.disableDrawMode();
      this.setDrawMode(false); // Update draw mode state
    }
  };

  findOptimalPath = () => {
    const { cytoscape_instance } = this;
  
    if (!this.startNode() || !this.stopNode()) {
      console.error('Start and stop nodes must be selected.');
      return;
    }
  
    const dijkstraResult = cytoscape_instance.elements().dijkstra(`#${this.startNode()}`, (edge) => edge.data('weight'), true);
    // console.log('Dijkstra Result:', dijkstraResult);
    
    const optimalPath = dijkstraResult.pathTo(cytoscape_instance.getElementById(this.stopNode()));
    // console.log('Optimal Path:', optimalPath);
  
    return optimalPath;
  };

  highlightOptimalPath = () => {
    const { cytoscape_instance } = this;
    const optimalPath = this.findOptimalPath();
  
    if (!optimalPath) {
      try{
        cytoscape_instance.elements().removeClass('optimal-path'); // Clear previous highlighting
      }
      catch(error)
      {
        console.error('free optimal path');
      }
      console.error('No optimal path found.');
      return;
    }
  
    cytoscape_instance.elements().removeClass('optimal-path'); // Clear previous highlighting
  
    optimalPath.forEach(edge => {
      edge.addClass('optimal-path');
    });
  };

  render() {
    this.highlightOptimalPath();
    return (
      <>
        {this.showModal() && (
          <div 
            className="modal"
            style={{ position: 'absolute', zIndex: 9999, margin: '1em' }}
          >
            <form onSubmit={this.handleWeightSubmit}>
              <label>
                Enter Weight:
                <input type="number" name="weight" />
              </label>
              <button type="submit">Submit</button>
              <button onClick={this.handleModalClose}>Cancel</button>
            </form>
          </div>
        )}

          <div
            id="cy"
            ref={this.plainRef}
          />
          <div
            id="buttons"
            style={{ position: 'absolute', right: 0, top: 0, zIndex: 9999, margin: '1em' }}
          >
            <button id="draw-toggle" onClick={this.toggleDrawMode}>Draw mode {this.drawMode()?'Enabled': 'Disabled'}</button>
            <button id="add-node" onClick={this.addRandomNode}>Add Node</button>
          </div>
      
      </>
    );
  }
}

export default CytoscapeGraph;
