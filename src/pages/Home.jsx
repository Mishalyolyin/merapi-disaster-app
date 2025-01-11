import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, AlertTriangle, Phone, Shield, MapPin, Bell } from 'lucide-react';

const Home = () => {
  const [isEmergencyVisible, setIsEmergencyVisible] = useState(true);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Emergency Alert Banner */}
      {isEmergencyVisible && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg flex justify-between items-center">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
            <div>
              <p className="text-red-700 font-medium">Status Darurat</p>
              <p className="text-red-600 text-sm">Peningkatan aktivitas Gunung Merapi terdeteksi</p>
            </div>
          </div>
          <button 
            onClick={() => setIsEmergencyVisible(false)}
            className="text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-8 mb-12 text-white">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-bold mb-4">Merapi Monitor</h1>
          <p className="text-xl mb-6 text-blue-100">
            Sistem pemantauan real-time untuk keselamatan masyarakat di sekitar Gunung Merapi
          </p>
          <Link
            to="/register"
            className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Daftar Sekarang
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Status Card */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Status Terkini</h2>
              <span className="px-4 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                Level II (Waspada)
              </span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center text-gray-600">
                <Bell className="h-5 w-5 mr-2" />
                Update terakhir: {new Date().toLocaleDateString()}
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="h-5 w-5 mr-2" />
                Koordinat: 7°32'30" LS, 110°26'30" BT
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-4">
            <Link to="/dashboard" className="text-blue-600 hover:text-blue-800 font-medium">
              Lihat detail aktivitas →
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 p-6 rounded-xl border border-green-100">
            <Shield className="h-8 w-8 text-green-600 mb-3" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">Panduan Keselamatan</h3>
            <p className="text-green-700">Pelajari protokol keselamatan dan jalur evakuasi</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
            <Phone className="h-8 w-8 text-purple-600 mb-3" />
            <h3 className="text-lg font-semibold text-purple-900 mb-2">Kontak Darurat</h3>
            <p className="text-purple-700">Nomor penting yang dapat dihubungi</p>
          </div>
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Panduan Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Panduan Keselamatan</h3>
          <ul className="space-y-3">
            {[
              'Perhatikan informasi resmi BPPTKG',
              'Siapkan masker & perlengkapan darurat',
              'Kenali jalur evakuasi terdekat',
              'Ikuti arahan petugas setempat',
              'Jaga komunikasi dengan keluarga'
            ].map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="h-6 w-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm mr-3 mt-0.5">
                  {index + 1}
                </span>
                <span className="text-gray-600">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Kontak Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Kontak Penting</h3>
          <div className="space-y-4">
            {[
              { name: 'BPPTKG', number: '(0274) 514981' },
              { name: 'Pusat Informasi', number: '(0274) 555123' },
              { name: 'Posko Pengungsian', number: '(0274) 555234' },
              { name: 'Emergency', number: '112' }
            ].map((contact, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">{contact.name}</span>
                <span className="text-blue-600">{contact.number}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Tentang Gunung Merapi</h3>
          <div className="prose text-gray-600">
            <p className="mb-4">
              Gunung Merapi (2.968 mdpl) adalah gunung berapi aktif di Indonesia 
              yang terletak di perbatasan Provinsi Jawa Tengah dan 
              Daerah Istimewa Yogyakarta.
            </p>
            <p>
              Sebagai salah satu gunung berapi teraktif di Indonesia, 
              pemantauan aktivitas Gunung Merapi dilakukan secara intensif 
              untuk mengantisipasi bahaya yang ditimbulkan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;