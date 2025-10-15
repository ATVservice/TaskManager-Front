import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { getMoreDetails } from "../../services/taskService";

const TaskRedirect = () => {
    console.log("✅ TaskRedirect component loaded");
    const { id } = useParams();
    console.log("📌 Task ID from params:", id);
    const navigate = useNavigate();
    const [checking, setChecking] = useState(true);
    const [notFound, setNotFound] = useState(false);
  
    useEffect(() => {
      console.log("🔍 Starting to check task:", id);
      const checkTask = async () => {
        try {
          console.log("📡 Calling getMoreDetails with ID:", id);
          const task = await getMoreDetails(id);
          console.log("✅ Task found:", task);
          
          if (task) {
            if (task.frequencyType || task.taskModel === 'RecurringTask') {
              navigate(`/tasks?tab=recurring&task=${id}`);
            } else if (task.status === 'הושלם') {
              navigate(`/tasks?tab=completed&task=${id}`);
            } else if (task.status === 'בוטלה') {
              navigate(`/tasks?tab=cancelled&task=${id}`);
            } else {
              navigate(`/tasks?tab=today&task=${id}`);
            }
          } else {
            console.log("❌ Task is null/undefined");
            setNotFound(true);
          }
        } catch (err) {
          console.error("❌ Error checking task:", err);
          setNotFound(true);
          toast.error('המשימה לא נמצאה במערכת');
        } finally {
          setChecking(false);
        }
      };
      checkTask();
    }, [id, navigate]);
  
    if (checking) return <div style={{ textAlign: 'center', marginTop: '40px' }}>בודק משימה...</div>;
    
    if (notFound) {
      return (
        <div style={{ textAlign: 'center', marginTop: '60px' }}>
          <h2>❌ המשימה לא קיימת במערכת</h2>
          <p>יתכן שהיא נמחקה או הועברה לארכיון.</p>
          <button
            onClick={() => navigate('/tasks?tab=today')}
            style={{
              padding: '10px 20px',
              background: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            חזרה למשימות להיום
          </button>
        </div>
      );
    }
    
    return null;  // ← חשוב! צריך return כאן
};

export default TaskRedirect;  // ← זה מה שחסר!!!