// TaskRedirect.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMoreDetails } from '../../services/taskService';
import toast from 'react-hot-toast';

const TaskRedirect = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const checkTask = async () => {
      try {
        const task = await getMoreDetails(id);

        if (!task || task.isDeleted || task.isArchived) {
          setNotFound(true);
        } else {
          // קובעים לאיזה טאב לנווט
          if (task.status === 'הושלם') {
            navigate(`/tasks/${id}?tab=completed`);
          } else if (task.status === 'בוטלה') {
            navigate(`/tasks/${id}?tab=cancelled`);
          } else if (task.frequencyType) {
            navigate(`/tasks/${id}?tab=recurring`);
          } else {
            navigate(`/tasks/${id}?tab=today`);
          }
        }
      } catch (err) {
        setNotFound(true);
      } finally {
        setChecking(false);
      }
    };

    checkTask();
  }, [id, navigate]);

  if (checking) return <p style={{ textAlign: 'center', marginTop: '100px' }}>טוען משימה...</p>;

  if (notFound) {
    return (
      <div style={{
        textAlign: 'center',
        marginTop: '120px',
        color: '#333',
        fontFamily: 'Heebo, sans-serif'
      }}>
        <h2 style={{ color: '#d9534f' }}>❌ המשימה לא נמצאה</h2>
        <p>ייתכן שהיא נמחקה, בוטלה או שאינה קיימת עוד במערכת.</p>
        <button
          onClick={() => navigate('/tasks?tab=today')}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            marginTop: '20px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          חזרה למשימות
        </button>
      </div>
    );
  }

  return null;
};

export default TaskRedirect;
