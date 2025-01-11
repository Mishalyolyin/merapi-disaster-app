// src/utils/adminUtils.js
export const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  export const calculatePercentage = (current, total) => {
    if (!total) return 0;
    return (current / total) * 100;
  };
  
  export const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'waspada':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-yellow-200'
        };
      case 'siaga':
        return {
          bg: 'bg-orange-100',
          text: 'text-orange-800',
          border: 'border-orange-200'
        };
      case 'awas':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-200'
        };
      default:
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-200'
        };
    }
  };
  