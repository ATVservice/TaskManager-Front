import React, { useEffect, useState } from 'react';
import { fetchAllAssociations, fetchGetAssociatedEmployees } from '../../services/associationService';

const Association = () => {
  const [associations, setAssociations] = useState([]);
  const [associatedEmployees,setAssociatedEmployees]= useState([])
  const [openAssociatedEmployees, setOpenAssociatedEmployees] = useState(false);

  useEffect(() => {
    const getAssociations = async () => {
      try {
        const data = await fetchAllAssociations();
        setAssociations(data);
      } catch (error) {
        console.error('Error fetching associations:', error);
      }
    };

    getAssociations();
  }, []);
  
  const getAssociatedEmployees = async (associationId) => {
    try {
      const dataE = await fetchGetAssociatedEmployees(associationId);
      setAssociatedEmployees(dataE);
      console.log("employees",associatedEmployees);
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
      {openAssociatedEmployees && (
          <div>
               <button onClick={closeAssociatedEmployees}>X</button>
               {associatedEmployees.map((employees) => (
                <p>{employees.userName}</p>
          ))}
          </div>
        )}
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
    </div>
  );
};

export default Association;
