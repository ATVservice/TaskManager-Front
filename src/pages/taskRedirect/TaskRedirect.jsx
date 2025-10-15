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
          console.log("✅ Task received:", task);
          
          if (!task) {
            console.log("❌ Task is null/undefined");
            setNotFound(true);
            setChecking(false);
            return;
          }
          
          // בודק אם המשימה נמחקה או בארכיון
          if (task.isDeleted || task.isArchived) {
            console.log("❌ Task is deleted or archived");
            setNotFound(true);
            setChecking(false);
            return;
          }
          
          // המשימה קיימת וזמינה - מנתב
          console.log("✅ Task is available, navigating...");
          if (task.frequencyType || task.taskModel === 'RecurringTask') {
            navigate(`/tasks?tab=recurring&task=${id}`, { replace: true });
          } else if (task.status === 'הושלם') {
            navigate(`/tasks?tab=completed&task=${id}`, { replace: true });
          } else if (task.status === 'בוטלה') {
            navigate(`/tasks?tab=cancelled&task=${id}`, { replace: true });
          } else {
            navigate(`/tasks?tab=today&task=${id}`, { replace: true });
          }
        } catch (err) {
          console.error("❌ Error checking task:", err);
          setNotFound(true);
        } finally {
          setChecking(false);
        }
      };
      checkTask();
    }, [id, navigate]);
  
    if (checking) {
      return (
        <div style={{ 
          textAlign: 'center', 
          marginTop: '100px',
          fontSize: '18px',
          color: '#666'
        }}>
          <div style={{ marginBottom: '20px' }}>🔍</div>
          בודק משימה...
        </div>
      );
    }
    
    if (notFound) {
      return (
        <div style={{ 
          textAlign: 'center', 
          marginTop: '80px',
          padding: '20px'
        }}>
          <h2 style={{ color: '#d9534f', marginBottom: '20px' }}>
            ❌ המשימה לא קיימת במערכת
          </h2>
          <p style={{ 
            fontSize: '16px', 
            color: '#666', 
            marginBottom: '30px',
            lineHeight: '1.6'
          }}>
            יתכן שהמשימה נמחקה, הועברה לארכיון, או שמספר המשימה שגוי.
          </p>
          <button
            onClick={() => navigate('/tasks?tab=today')}
            style={{
              padding: '12px 30px',
              background: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '0 2px 8px rgba(0,123,255,0.3)',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#0056b3'}
            onMouseOut={(e) => e.target.style.background = '#007bff'}
          >
            חזרה למשימות להיום
          </button>
        </div>
      );
    }
    
    return null;
};

export default TaskRedirect;