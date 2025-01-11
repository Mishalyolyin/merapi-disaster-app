// src/components/DisasterCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';

const DisasterCard = ({ disaster }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/disasters/${disaster.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold">{disaster.type}</h3>
          <p className="text-gray-500">{disaster.location}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          disaster.status === 'Waspada' ? 'bg-yellow-100 text-yellow-800' :
          disaster.status === 'Siaga' ? 'bg-orange-100 text-orange-800' :
          'bg-red-100 text-red-800'
        }`}>
          {disaster.status}
        </span>
      </div>

      {disaster.evacuationPoints?.map(point => (
        <div key={point.id} className="mt-3">
          <div className="flex justify-between text-sm mb-1">
            <span>{point.name}</span>
            <span>{point.currentOccupancy}/{point.capacity} orang</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              style={{ width: `${(point.currentOccupancy / point.capacity) * 100}%` }}
              className={`h-2 rounded-full ${
                (point.currentOccupancy / point.capacity) > 0.8 ? 'bg-red-500' :
                (point.currentOccupancy / point.capacity) > 0.5 ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default DisasterCard;