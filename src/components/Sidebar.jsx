import React from 'react';

const Sidebar = () => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('nodeType', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-96 bg-slate-950 p-4">
      <div className="text-lg text-center font-semibold mb-4 text-white">Drag and Drop Nodes</div>
      <div
        className="mb-2 p-2 bg-white text-black rounded-xl cursor-pointer border-2 text-center"
        draggable
        onDragStart={(event) => onDragStart(event, 'input')}
      >
        Input Node
      </div>
      <div
        className="mb-2 p-2 bg-white text-black rounded-xl cursor-pointer border-2   text-center"
        draggable
        onDragStart={(event) => onDragStart(event, 'default')}
      >
        Default Node
      </div>
      <div
        className="mb-2 p-2 bg-white text-black rounded-xl cursor-pointer border-2  text-center"
        draggable
        onDragStart={(event) => onDragStart(event, 'output')}
      >
        Output Node
      </div>
    </aside>
  );
};

export default Sidebar;
