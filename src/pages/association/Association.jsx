import React, { useEffect, useState } from 'react';
import { fetchAllAssociations, fetchGetAssociatedEmployees } from '../../services/associationService';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
const Association = () => {
  const { user } = useContext(AuthContext);
  const [associations, setAssociations] = useState([]);
  const [associatedEmployees, setAssociatedEmployees] = useState([])
  const [openAssociatedEmployees, setOpenAssociatedEmployees] = useState(false);

  useEffect(() => {
    const getAssociations = async () => {

      const token = user?.token;
      try {
        const data = await fetchAllAssociations(token);
        setAssociations(data);
      } catch (error) {
        alert(error.response?.data?.message || 'שגיאה בשליפת העמותות');
        console.error('Error fetching associations:', error);
      }
    };

    getAssociations();
  }, []);

  const getAssociatedEmployees = async (associationId) => {
    const token = user?.token;

    try {
      const dataE = await fetchGetAssociatedEmployees(associationId, token);
      setAssociatedEmployees(dataE);
      console.log("employees", associatedEmployees);
      setOpenAssociatedEmployees(true);
    } catch (error) {
      console.error('Error fetching associations:', error);
    }
  }
  const closeAssociatedEmployees = () => {
    setOpenAssociatedEmployees(false);
    setAssociatedEmployees([]);
  }

  return (
    <div>
      <h2>רשימת עמותות</h2>

      <table border="1">
        <thead>
          <tr>
            <th>שם עמותה</th>
            <th>עובדים משוייכים</th>
            <th>שייך עובדים</th>
          </tr>
        </thead>
        <tbody>
          {associations.map((asso) => (
            <tr key={asso._id}>
              <td>{asso.name}</td>
              <td>
                <button onClick={() => getAssociatedEmployees(asso._id)} >עובדים משוייכים</button>

              </td>
              <td>2</td>
            </tr>
          ))}
        </tbody>
      </table>
      {openAssociatedEmployees && (
        <div>
          <button onClick={closeAssociatedEmployees}>X</button>
          {associatedEmployees.map((employees) => (
            <p>{employees.userName}</p>
          ))}
          {associatedEmployees.length === 0 && <p>אין עובדים משוייכים לעמותה זו</p>}
        </div>
      )}
    </div>
  );
};

export default Association;
