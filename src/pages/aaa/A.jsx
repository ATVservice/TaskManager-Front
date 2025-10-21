import React, { useEffect, useRef, useState } from 'react';
import SimpleAgGrid from '../../components/simpleAgGrid/SimpleAgGrid.jsx'
import { getRecurringTaskHistory, getTaskHistory } from '../../services/historyService.js';
import { AuthContext } from '../../context/AuthContext.jsx';
import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { CircleArrowRight, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { Title } from 'react-head';

const A = () => {
  

    return (
        <>
            <Title>היסטוריה</Title>

            <div className="history-page-wrapper">

                <div className="history-header">

                    <h2 className="history-title">עובדדדדדדדדדדד</h2>
                </div>

              
            </div>
        </>
    );
};

export default A;