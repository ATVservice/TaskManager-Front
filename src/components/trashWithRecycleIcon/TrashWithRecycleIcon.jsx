import './TrashWithRecycleIcon.css'; 
import { useNavigate } from 'react-router-dom';



const TrashWithRecycleIcon = () => {
  const navigate = useNavigate();

  return (
    <button className="icon-container" onClick={() => navigate('/recyclingBin')}>
   
      <img src="/Recycleing.png" alt="Trash" className="trash-icon" />

    </button>
  );
};

export default TrashWithRecycleIcon;
