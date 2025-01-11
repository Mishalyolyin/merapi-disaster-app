// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDisasters } from '../store/disasterSlice';
import { getRecentActivities } from '../utils/activityLogger';
import WebSocketService from '../services/websocket';
import DisasterCard from '../components/DisasterCard';
import {
  ThermometerSun,
  Wind,
  Activity,
  Users,
  RefreshCw,
  Phone,
  AlertTriangle
} from 'lucide-react';

const Dashboard = () => {
  const dispatch = useDispatch();
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [weatherStats, setWeatherStats] = useState({
    temperature: 27,
    windSpeed: 12,
    humidity: 75,
    windDirection: "Tenggara"
  });

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { data: disasters } = useSelector((state) => state.disasters);
  const adminStats = useSelector((state) => state.disasters.adminStats);

  // Status counters
  const statusCounts = disasters.reduce((acc, disaster) => {
    acc[disaster.status] = (acc[disaster.status] || 0) + 1;
    return acc;
  }, {});

  // BMKG Contact Info
  const bmkgContacts = [
    { name: "BPPTKG", number: "(0274) 514981" },
    { name: "Pusat Informasi", number: "(0274) 555123" },
    { name: "Posko Pengungsian", number: "(0274) 555234" },
    { name: "Emergency", number: "112" }
  ];

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await dispatch(fetchDisasters());
      const recentActivities = await getRecentActivities(5);
      setActivities(recentActivities);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleRefresh();
    
    WebSocketService.connect();

    // Subscribe to weather updates with more frequent updates
    const weatherUnsubscribe = WebSocketService.subscribe('weather_update', (data) => {
      setWeatherStats(data);
      // Update lastUpdate time when weather data changes
      setLastUpdate(new Date());
    });

    // Subscribe to activity updates
    const activityUnsubscribe = WebSocketService.subscribe('activity_update', (data) => {
      setActivities(prev => [data, ...prev].slice(0, 5));
    });

    // Auto-refresh data every 30 seconds
    const refreshInterval = setInterval(handleRefresh, 30000);

    return () => {
      weatherUnsubscribe();
      activityUnsubscribe();
      clearInterval(refreshInterval);
      WebSocketService.disconnect();
    };
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Pemantauan</h1>
          <p className="text-sm text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString('id-ID')}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Perbarui Data
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Temperature Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-lg bg-orange-50">
              <ThermometerSun className="h-6 w-6 text-orange-500" />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Suhu Rata-rata</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {weatherStats.temperature.toFixed(1)}°C
          </p>
        </div>

        {/* Wind Speed Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-lg bg-blue-50">
              <Wind className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Kecepatan Angin</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {parseFloat(weatherStats.windSpeed).toFixed(1)} km/h
          </p>
        </div>

        {/* Seismic Activity Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-lg bg-purple-50">
              <Activity className="h-6 w-6 text-purple-500" />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Aktivitas Seismik</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {adminStats.seismicActivity} kejadian
          </p>
        </div>

        {/* Evacuees Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-lg bg-green-50">
              <Users className="h-6 w-6 text-green-500" />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Total Pengungsi</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {adminStats.evacuees}
          </p>
        </div>
      </div>

      {/* Status Counters */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-yellow-800 font-medium">WASPADA</span>
            <span className="text-2xl font-bold text-yellow-800">
              {statusCounts.Waspada || 0}
            </span>
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-100 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-orange-800 font-medium">SIAGA</span>
            <span className="text-2xl font-bold text-orange-800">
              {statusCounts.Siaga || 0}
            </span>
          </div>
        </div>
        <div className="bg-red-50 border border-red-100 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-red-800 font-medium">AWAS</span>
            <span className="text-2xl font-bold text-red-800">
              {statusCounts.Awas || 0}
            </span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content - Disaster Cards */}
        <div className="lg:col-span-2 space-y-4">
          {disasters.map(disaster => (
            <DisasterCard key={disaster.id} disaster={disaster} />
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Weather Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Kondisi Cuaca</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Suhu</span>
                <span>{weatherStats.temperature.toFixed(1)}°C</span>
              </div>
              <div className="flex justify-between">
                <span>Kelembaban</span>
                <span>{Math.round(weatherStats.humidity)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Kecepatan Angin</span>
                <span>{parseFloat(weatherStats.windSpeed).toFixed(1)} km/h</span>
              </div>
              <div className="flex justify-between">
                <span>Arah Angin</span>
                <span>{weatherStats.windDirection}</span>
              </div>
            </div>
          </div>

          {/* Live Updates */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Live Updates</h3>
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <span className={`w-2 h-2 mt-2 rounded-full ${
                    activity.type === 'warning' ? 'bg-yellow-400' :
                    activity.type === 'alert' ? 'bg-red-400' :
                    'bg-blue-400'
                  }`} />
                  <div>
                    <div className="flex justify-between text-sm">
                      <p className="text-gray-500">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                      <p className="text-gray-500">{activity.location}</p>
                    </div>
                    <p className="mt-1">{activity.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BMKG Contacts */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Kontak Penting</h3>
            <div className="space-y-3">
              {bmkgContacts.map((contact, index) => (
                <div key={index} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="font-medium">{contact.name}</span>
                  </div>
                  <span className="text-blue-600">{contact.number}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;