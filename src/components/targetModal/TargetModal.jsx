import React, { useContext, useEffect, useState } from "react";
import { X } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { getGoalsByEmployee } from "../../services/goalService";

const TargetModal = ({ employeeId, onClose }) => {
    const [goals, setGoals] = useState([]);
    const { user } = useContext(AuthContext);


    useEffect(() => {
        console.log("employeeId",employeeId)
        if (!employeeId) return;

        const fetchGoals = async () => {
            try {
                const token = user?.token;
                if (!token) return;
                const data = await getGoalsByEmployee(employeeId, token)
                // מיון לפי importance
                const sorted = data.sort((a, b) => a.importance.localeCompare(b.importance));
                setGoals(sorted);
            } catch (err) {
                console.error("שגיאה בשליפת יעדים:", err);
            }
        };

        fetchGoals();
    }, [employeeId]);

    return (
        <div className="modal-overlay">
            <div className="modal-content modern-modal">
                <button className="close-btn" onClick={onClose}>
                    <X size={20} />
                </button>
                <h2 className="modal-title">📌 יעדים</h2>

                {goals.length === 0 ? (
                    <p className="no-goals">אין יעדים לעובד זה</p>
                ) : (
                    <div className="goals-container">
                        {Object.entries(
                            goals.reduce((acc, goal) => {
                                if (!acc[goal.importance]) acc[goal.importance] = [];
                                acc[goal.importance].push(goal);
                                return acc;
                            }, {})
                        ).map(([importance, goalsByImportance]) => (
                            <div key={importance} className="goal-card">
                                <h3>{importance}</h3>
                                {goalsByImportance.map((goal) => (
                                    <div key={goal._id} className="goal-details">
                                        <p>
                                        {goal.targetType === 'כלל העובדים' ? '🌍 כללי' : '👤 אישי'}    |    

                                            <strong>תדירות: </strong>{goal.frequency}   |
                                            <strong> יעד: </strong>{goal.targetCount}
                                            {goal.subImportance && (
                                                <>   |   <strong>תת-חשיבות: </strong>{goal.subImportance}</>
                                            )}    
                                        </p>

                                    </div>

                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TargetModal;
