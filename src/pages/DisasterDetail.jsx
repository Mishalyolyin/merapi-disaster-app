// src/pages/DisasterDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDisasters } from '../store/disasterSlice';
import { getRecentActivities, formatTimeAgo } from '../utils/activityLogger';
import WebSocketService from '../services/websocket';
import { 
  MapPin, Calendar, Users, ArrowLeft,
  AlertTriangle, Wind, ThermometerSun,
  RefreshCw
} from 'lucide-react';

const DisasterDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { data: disasters } = useSelector((state) => state.disasters);
  const disaster = disasters.find(d => d.id === parseInt(id));

  const fetchData = async () => {
    setLoading(true);
    try {
      await dispatch(fetchDisasters()).unwrap();
      await fetchRelatedActivities();
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedActivities = async () => {
    if (disaster) {
      try {
        const allActivities = await getRecentActivities(10);
        const relatedActivities = allActivities.filter(a => 
          a.location === disaster.location
        );
        setActivities(relatedActivities);
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    }
  };

  useEffect(() => {
    fetchData();

    // Connect WebSocket
    WebSocketService.connect();

    // Subscribe to updates
    const disasterUnsubscribe = WebSocketService.subscribe('disaster_update', fetchData);
    const activityUnsubscribe = WebSocketService.subscribe('activity_update', fetchRelatedActivities);

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchData, 30000);

    return () => {
      disasterUnsubscribe();
      activityUnsubscribe();
      clearInterval(interval);
      WebSocketService.disconnect();
    };
  }, [id]);

  if (loading || !disaster) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        to="/dashboard"
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Kembali ke Dashboard
      </Link>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          {/* Header & Status */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{disaster.type}</h1>
              <div className="flex items-center text-gray-500 mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                {disaster.location}
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              disaster.status === 'Waspada' ? 'bg-yellow-100 text-yellow-800' :
              disaster.status === 'Siaga' ? 'bg-orange-100 text-orange-800' :
              disaster.status === 'Awas' ? 'bg-red-100 text-red-800' :
              'bg-green-100 text-green-800'
            }`}>
              {disaster.status}
            </span>
          </div>

          {/* Date */}
          <div className="flex items-center text-gray-600 mb-6">
            <Calendar className="h-5 w-5 mr-2" />
            <span>{new Date(disaster.date).toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Deskripsi</h2>
            <p className="text-gray-600">{disaster.description}</p>
          </div>

          {/* Evacuation Points */}
          {disaster.evacuationPoints && disaster.evacuationPoints.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Titik Evakuasi</h2>
              <div className="space-y-4">
                {disaster.evacuationPoints.map((point) => {
                  const occupancyPercentage = (point.currentOccupancy / point.capacity) * 100;
                  return (
                    <div key={point.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-gray-900">{point.name}</h3>
                        <div className="flex items-center text-gray-600">
                          <Users className="h-4 w-4 mr-1" />
                          <span>
                            {point.currentOccupancy}/{point.capacity}
                          </span>
                        </div>
                      </div>
                      <div className="relative pt-1">
                        <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                          <div
                            style={{ width: `${occupancyPercentage}%` }}
                            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                              occupancyPercentage > 80 ? 'bg-red-500' :
                              occupancyPercentage > 50 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Environmental Stats */}
          <div className="mt-8 border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Kondisi Lingkungan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <ThermometerSun className="h-5 w-5 text-orange-500 mr-2" />
                  <span className="text-gray-700 font-medium">Suhu</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">27°C</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Wind className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-gray-700 font-medium">Kecepatan Angin</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">12 km/h</p>
              </div>
            </div>
          </div>

          {/* Alert Section */}
          {(disaster.status === 'Siaga' || disaster.status === 'Awas') && (
            <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <div className="flex">
                <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
                <div>
                  <h3 className="text-red-800 font-medium">Peringatan {disaster.status}</h3>
                  <p className="text-red-700 mt-1">
                    {disaster.status === 'Awas' 
                      ? 'Segera ikuti arahan petugas untuk evakuasi'
                      : 'Harap tetap waspada dan ikuti instruksi petugas'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisasterDetail;