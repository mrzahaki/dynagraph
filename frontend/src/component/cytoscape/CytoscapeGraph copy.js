import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import edgehandles from 'cytoscape-edgehandles';
import './cytoscape.css'; // Include your Cytoscape stylesheet here

let cy;
let eh;

const CytoscapeGraph = () => {
  
  
  const cyRef = useRef(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [drawMode, setDrawMode] = useState(false); // State to track draw mode
  
  const handleEdgeWeightInput = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  useEffect(() => {
    const loadCytoscape = async () => {
      try {
        // Load necessary scripts dynamically
        await Promise.all([
          import('cytoscape'),
          import('cytoscape-edgehandles'),
          // Include other scripts here if needed
        ]);

        const layout = {
          name: 'grid',
          rows: 2,
          cols: 2
        };

        var style= [
          {
            selector: 'node[name]',
            style: {
              'content': 'data(name)'
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
      
        var elements= {
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
        
        // Initialize Cytoscape instance
        cy = cytoscape({
          container: cyRef.current,
          elements,
          style,
          layout
        });

        // Ensure edgehandles is registered as an extension
      cytoscape.use(edgehandles);
      eh = cy.edgehandles();

      cy.on('dblclick', 'edge', (event) => {
        const edge = event.target;
        setSelectedEdge(edge);
        handleEdgeWeightInput();
      });

      

      } catch (error) {
        console.error('Error loading Cytoscape or edgehandles:', error);
      }
    };

    loadCytoscape();


    return () => {
      // Cleanup - destroy Cytoscape instance when unmounting
      if (cyRef.current) {
        cyRef.current.innerHTML = ''; // Clear container
      }
    };
  }, []);


  const handleWeightSubmit = (e) => {
    e.preventDefault();
    const weight = e.target.elements.weight.value;
    if (selectedEdge) {
      // const edgeData = selectedEdge.data('id'); // Assuming the edge has an 'id' attribute
      // const edge = cy.getElementById(edgeData);
      selectedEdge.data('weight', weight);
    }
    setShowModal(false);
  };

  // Function to generate a random name for a new node
  const generateRandomName = () => {
    let id = Math.random().toString(36).substr(2, 5); // Generate a random ID
    return id;
  };

  // Function to add a new node with a random name
  const addRandomNode = () => {
    const newNodeId = generateRandomName(); // Generate a random ID
    const newNode = { data: { id: newNodeId, name: newNodeId } };
    // console.log('New node:', newNode);
    cy.add({ nodes: [newNode] });
  };


  // Toggle draw mode function
  const toggleDrawMode = () => {
      if (drawMode) {
        eh.disableDrawMode();
      } else {
        eh.enableDrawMode();
      }
      setDrawMode(!drawMode); // Update draw mode state
  };


  return (
    <>
    {showModal && (
      <div 
        className="modal"
        style={{ position: 'absolute', zIndex: 9999, margin: '1em' }}
      >
        <form onSubmit={handleWeightSubmit}>
          <label>
            Enter Weight:
            <input type="number" name="weight" />
          </label>
          <button type="submit">Submit</button>
          <button onClick={handleModalClose}>Cancel</button>
        </form>
      </div>
    )}

      <div
        id="cy"
        ref={cyRef}
      />
      <div
        id="buttons"
        style={{ position: 'absolute', right: 0, top: 0, zIndex: 9999, margin: '1em' }}
      >
        <button id="draw-toggle" onClick={toggleDrawMode}>Draw mode {drawMode?'Enabled': 'Disabled'}</button>
        <button id="add-node" onClick={addRandomNode}>Add Node</button>
      </div>

      
    
    </>
  );
};

export default CytoscapeGraph;
