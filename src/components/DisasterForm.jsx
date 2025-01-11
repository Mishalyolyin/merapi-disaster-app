// src/components/DisasterForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Plus, X, AlertTriangle, Users, MapPin, Calendar } from 'lucide-react';
import axios from '../utils/axios';
import WebSocketService from '../services/websocket';
import { updateAdminStats } from '../store/disasterSlice';
import { logActivity } from '../utils/activityLogger';

const DisasterForm = ({ mode = 'create' }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    type: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    status: 'Normal',
    evacuationPoints: []
  });

  useEffect(() => {
    if (mode === 'edit' && id) {
      fetchDisasterData();
    }
  }, [mode, id]);

  const fetchDisasterData = async () => {
    try {
      const response = await axios.get(`/disasters/${id}`);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching disaster:', error);
    }
  };

  const calculateNewStats = async () => {
    try {
      const response = await axios.get('/disasters');
      const allDisasters = response.data;
      
      // Calculate total evacuees
      const totalEvacuees = allDisasters.reduce((total, disaster) => {
        if (disaster.evacuationPoints) {
          return total + disaster.evacuationPoints.reduce((sum, point) => 
            sum + (point.currentOccupancy || 0), 0);
        }
        return total;
      }, 0);

      // Calculate seismic activity
      const seismicActivity = allDisasters.reduce((total, disaster) => {
        if (
          disaster.type.toLowerCase().includes('seismik') || 
          disaster.type.toLowerCase().includes('gempa') ||
          disaster.type.toLowerCase().includes('vulkanik')
        ) {
          return total + 1;
        }
        return total;
      }, 0);

      return {
        seismicActivity,
        evacuees: totalEvacuees
      };
    } catch (error) {
      console.error('Error calculating stats:', error);
      return null;
    }
  };

  const logDisasterActivity = async (disaster, mode) => {
    const activityType = disaster.status === 'Awas' ? 'alert' : 'warning';
    const activityMessage = mode === 'edit' 
      ? `Update status: ${disaster.type} di ${disaster.location}`
      : `Bencana baru: ${disaster.type} di ${disaster.location}`;

    await logActivity(activityType, activityMessage, disaster.location);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.type.trim()) newErrors.type = 'Type is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    
    formData.evacuationPoints.forEach((point, index) => {
      if (!point.name.trim()) {
        newErrors[`evacuationPoint${index}Name`] = 'Name is required';
      }
      if (point.capacity <= 0) {
        newErrors[`evacuationPoint${index}Capacity`] = 'Capacity must be greater than 0';
      }
      if (point.currentOccupancy < 0) {
        newErrors[`evacuationPoint${index}Occupancy`] = 'Occupancy cannot be negative';
      }
      if (point.currentOccupancy > point.capacity) {
        newErrors[`evacuationPoint${index}Occupancy`] = 'Occupancy cannot exceed capacity';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      let response;
      if (mode === 'edit') {
        response = await axios.put(`/disasters/${id}`, formData);
      } else {
        response = await axios.post('/disasters', formData);
      }

      // Recalculate stats
      const newStats = await calculateNewStats();
      if (newStats) {
        // Update redux store
        dispatch(updateAdminStats(newStats));

        // Emit update through WebSocket
        WebSocketService.emit('disaster_update', {
          disaster: response.data,
          stats: newStats
        });
      }

      // Log activity
      await logDisasterActivity(response.data, mode);

      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error saving disaster:', error);
      setErrors({ submit: 'Failed to save disaster. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const addEvacuationPoint = () => {
    setFormData({
      ...formData,
      evacuationPoints: [
        ...formData.evacuationPoints,
        {
          id: Date.now(),
          name: '',
          capacity: 0,
          currentOccupancy: 0
        }
      ]
    });
  };

  const removeEvacuationPoint = (index) => {
    const newPoints = [...formData.evacuationPoints];
    newPoints.splice(index, 1);
    setFormData({ ...formData, evacuationPoints: newPoints });
  };

  const updateEvacuationPoint = (index, field, value) => {
    const newPoints = [...formData.evacuationPoints];
    newPoints[index] = { ...newPoints[index], [field]: value };
    setFormData({ ...formData, evacuationPoints: newPoints });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {mode === 'edit' ? 'Edit Disaster' : 'Add New Disaster'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                    ${errors.type ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                    ${errors.location ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                    ${errors.date ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="Normal">Normal</option>
                  <option value="Waspada">Waspada</option>
                  <option value="Siaga">Siaga</option>
                  <option value="Awas">Awas</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                  ${errors.description ? 'border-red-300' : 'border-gray-300'}`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Evacuation Points Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Evacuation Points</h3>
                <button
                  type="button"
                  onClick={addEvacuationPoint}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Point
                </button>
              </div>

              <div className="space-y-4">
                {formData.evacuationPoints.map((point, index) => (
                  <div key={point.id} className="border rounded-lg p-4 relative">
                    <button
                      type="button"
                      onClick={() => removeEvacuationPoint(index)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                    >
                      <X className="h-5 w-5" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                          type="text"
                          value={point.name}
                          onChange={(e) => updateEvacuationPoint(index, 'name', e.target.value)}
                          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                            ${errors[`evacuationPoint${index}Name`] ? 'border-red-300' : 'border-gray-300'}`}
                        />
                        {errors[`evacuationPoint${index}Name`] && (
                          <p className="mt-1 text-sm text-red-600">{errors[`evacuationPoint${index}Name`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Capacity</label>
                        <input
                          type="number"
                          value={point.capacity}
                          onChange={(e) => updateEvacuationPoint(index, 'capacity', parseInt(e.target.value))}
                          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                            ${errors[`evacuationPoint${index}Capacity`] ? 'border-red-300' : 'border-gray-300'}`}
                        />
                        {errors[`evacuationPoint${index}Capacity`] && (
                          <p className="mt-1 text-sm text-red-600">{errors[`evacuationPoint${index}Capacity`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Current Occupancy</label>
                        <input
                          type="number"
                          value={point.currentOccupancy}
                          onChange={(e) => updateEvacuationPoint(index, 'currentOccupancy', parseInt(e.target.value))}
                          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                            ${errors[`evacuationPoint${index}Occupancy`] ? 'border-red-300' : 'border-gray-300'}`}
                        />
                        {errors[`evacuationPoint${index}Occupancy`] && (
                          <p className="mt-1 text-sm text-red-600">{errors[`evacuationPoint${index}Occupancy`]}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {errors.submit && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{errors.submit}</p>
                  </div>
                </div>
              </div>
            )}

<div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/admin/dashboard')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Saving...' : mode === 'edit' ? 'Update Disaster' : 'Create Disaster'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Preview Section */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{formData.type || 'Disaster Type'}</h2>
                <div className="flex items-center text-gray-500 mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  {formData.location || 'Location'}
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                formData.status === 'Waspada' ? 'bg-yellow-100 text-yellow-800' :
                formData.status === 'Siaga' ? 'bg-orange-100 text-orange-800' :
                formData.status === 'Awas' ? 'bg-red-100 text-red-800' :
                'bg-green-100 text-green-800'
              }`}>
                {formData.status}
              </span>
            </div>

            <div className="flex items-center text-gray-500 mb-4">
              <Calendar className="h-4 w-4 mr-1" />
              {formData.date ? new Date(formData.date).toLocaleDateString() : 'Date'}
            </div>

            <p className="text-gray-600 mb-6">
              {formData.description || 'Description will appear here'}
            </p>

            {formData.evacuationPoints.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Evacuation Points</h4>
                <div className="space-y-3">
                  {formData.evacuationPoints.map((point, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{point.name || 'Evacuation Point Name'}</span>
                        <div className="flex items-center text-gray-500">
                          <Users className="h-4 w-4 mr-1" />
                          {point.currentOccupancy}/{point.capacity}
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="relative pt-1">
                          <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                            <div
                              style={{ width: `${(point.currentOccupancy / point.capacity) * 100}%` }}
                              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                                (point.currentOccupancy / point.capacity) > 0.8 ? 'bg-red-500' :
                                (point.currentOccupancy / point.capacity) > 0.5 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisasterForm;