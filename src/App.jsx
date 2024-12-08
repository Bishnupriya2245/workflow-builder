import React, { useRef, useCallback, useState, useEffect } from 'react';
import { ReactFlow, addEdge, Controls, Background, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Sidebar from './components/Sidebar';
import html2canvas from 'html2canvas';

const App = () => {
  const reactFlowWrapper = useRef(null);

  const [selectedNode, setSelectedNode] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [nodeName, setNodeName] = useState('');

  const loadStateFromLocalStorage = () => {
    const storedNodes = JSON.parse(localStorage.getItem('nodes')) || [];
    const storedEdges = JSON.parse(localStorage.getItem('edges')) || [];
    return { storedNodes, storedEdges };
  };

  const { storedNodes, storedEdges } = loadStateFromLocalStorage();
  const [nodes, setNodes, onNodesChange] = useNodesState(storedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(storedEdges);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('nodeType');
      if (!type) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      const newNode = {
        id: `${Date.now()}`,
        type,
        position,
        data: { label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node` },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [nodes],
  );

  useEffect(() => {
    localStorage.setItem('nodes', JSON.stringify(nodes));
    localStorage.setItem('edges', JSON.stringify(edges));
  }, [nodes, edges]);

  const clearCanvas = () => {
    setNodes([]);
    setEdges([]);
    localStorage.removeItem('nodes');
    localStorage.removeItem('edges');
  };

  const isClearButtonDisabled = nodes.length === 0 && edges.length === 0;

  const handleNodeSelection = (e) => {
    const selectedNode = nodes.find((node) => node.id === e.target.value);
    setSelectedNode(selectedNode);
    setNodeName('');
  };

  const handleUpdateNodeName = () => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode.id
          ? { ...node, data: { label: nodeName } }
          : node
      )
    );
    setModalVisible(false);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const closeModalOnOutsideClick = (e) => {
    if (e.target === e.currentTarget) {
      setModalVisible(false);
    }
  };

  const downloadCanvasAsPNG = () => {
    html2canvas(reactFlowWrapper.current).then((canvas) => {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'react-flow-canvas.png';
      link.click();
    });
  };

  return (
    <div className="flex h-screen">
      <Sidebar />

      <div
        className="flex-1 bg-gray-50"
        onDrop={onDrop}
        onDragOver={onDragOver}
        ref={reactFlowWrapper}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onConnect={onConnect}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          style={{ backgroundColor: '#f7fafc' }}
        >
          <Controls />
          <Background />
        </ReactFlow>
      </div>

      <div className="absolute top-0 right-0 m-4">
        <button
          onClick={clearCanvas}
          className={`px-4 py-2 ${isClearButtonDisabled ? 'bg-slate-950' : 'bg-red-500'} text-white rounded-lg`}
          disabled={isClearButtonDisabled}
        >
          Clear
        </button>
        <button
          onClick={() => setModalVisible(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg ml-4"
        >
          Edit
        </button>
        <button
          onClick={downloadCanvasAsPNG}
          className="px-4 py-2 bg-green-500 text-white rounded-lg ml-4"
        >
          Download
        </button>
      </div>

      {modalVisible && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center"
          onClick={closeModalOnOutsideClick}
        >
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Edit Node Name</h2>
            <select
              value={selectedNode ? selectedNode.id : ''}
              onChange={handleNodeSelection}
              className="w-full p-2 border rounded mb-4"
            >
              <option value="">Select Node</option>
              {nodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.data.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={nodeName}
              onChange={(e) => setNodeName(e.target.value)}
              className="w-full p-2 border rounded mb-4"
              placeholder="Enter new name for node"
            />
            <button
              onClick={handleUpdateNodeName}
              className="bg-blue-500 text-white py-2 px-4 rounded mr-2"
            >
              Update
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-500 text-white py-2 px-4 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
