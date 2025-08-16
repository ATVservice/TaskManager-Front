import { FaTrashAlt, FaRecycle } from 'react-icons/fa';
import './TrashWithRecycleIcon.css'; 
import { useNavigate } from 'react-router-dom';



const TrashWithRecycleIcon = () => {
  const navigate = useNavigate();

  return (
    <button className="icon-container" onClick={() => navigate('/recyclingBin')}>
      <FaTrashAlt className="trash-icon" />
      <FaRecycle className="recycle-icon" />
    </button>
  );
};

export default TrashWithRecycleIcon;
