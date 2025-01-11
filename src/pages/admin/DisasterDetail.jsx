// src/pages/admin/DisasterDetail.jsx

// ... imports tetap sama ...

const AdminDisasterDetail = () => {
  // ... state dan functions tetap sama ...

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Navigation dan Buttons */}
      <div className="flex justify-between items-center mb-6">
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Kembali ke Dashboard
        </Link>
        
        <div className="flex space-x-4">
          <Link
            to={`/admin/disasters/${id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

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

          {/* Sisanya tetap sama seperti sebelumnya ... */}
          
        </div>
      </div>

      {/* Delete Confirmation Modal tetap sama */}
    </div>
  );
};

export default AdminDisasterDetail;