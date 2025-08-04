import { FaTrashAlt, FaRecycle } from 'react-icons/fa';
import './TrashWithRecycleIcon.css'; 


const TrashWithRecycleIcon = () => {
    const RecyclingBin = () => {
        window.open('/recyclingBin', '_blank');
    }
  return (
    <button className="icon-container" onClick={RecyclingBin}>
      <FaTrashAlt className="trash-icon" />
      <FaRecycle className="recycle-icon" />
    </button>
  );
};

export default TrashWithRecycleIcon;
