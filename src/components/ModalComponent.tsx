import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const ModalComponent: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50">
      <div className="bg-white p-4 rounded shadow-lg">
        {children}
        <button onClick={onClose} className="bg-red-500 text-white p-2 mt-2">Close</button>
      </div>
    </div>
  );
};

export default ModalComponent;
