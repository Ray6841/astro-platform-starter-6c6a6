import React, { useState, useEffect } from 'react';

interface Equipment {
  id: number;
  equipmentId: string;
  name: string;
  type: 'forklift' | 'conveyor' | 'asrs' | 'pick_to_light' | 'rfid_reader' | 'agv' | 'pallet_jack' | 'other';
  status: 'operational' | 'maintenance' | 'out_of_service' | 'reserved';
  warehouseId: number;
  location: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  lastMaintenance: string;
  nextMaintenance: string;
  operator: string | null;
  currentTask: string | null;
  utilization: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface MaintenanceRecord {
  id: number;
  equipmentId: number;
  type: 'preventive' | 'corrective' | 'emergency';
  description: string;
  technician: string;
  startDate: string;
  endDate: string | null;
  cost: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes: string;
}

const EquipmentManagement: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [editingMaintenance, setEditingMaintenance] = useState<MaintenanceRecord | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState('');
  const [activeTab, setActiveTab] = useState('equipment');

  const [equipmentFormData, setEquipmentFormData] = useState({
    equipmentId: '',
    name: '',
    type: 'forklift',
    status: 'operational',
    warehouseId: '',
    location: '',
    manufacturer: '',
    model: '',
    serialNumber: '',
    purchaseDate: '',
    lastMaintenance: '',
    nextMaintenance: '',
    operator: '',
    currentTask: '',
    utilization: '',
    notes: ''
  });

  const [maintenanceFormData, setMaintenanceFormData] = useState({
    equipmentId: '',
    type: 'preventive',
    description: '',
    technician: '',
    startDate: '',
    endDate: '',
    cost: '',
    status: 'scheduled',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [warehousesResponse] = await Promise.all([
        fetch('/api/warehouses')
      ]);
      
      const warehousesData = await warehousesResponse.json();
      
      if (warehousesData.success) {
        setWarehouses(warehousesData.data);
      }

      // Mock data for equipment and maintenance
      const mockEquipment: Equipment[] = [
        {
          id: 1,
          equipmentId: 'EQ001',
          name: 'Forklift 1',
          type: 'forklift',
          status: 'operational',
          warehouseId: 1,
          location: 'Zone A',
          manufacturer: 'Toyota',
          model: 'FD150',
          serialNumber: 'TK-2024-001',
          purchaseDate: '2024-01-15',
          lastMaintenance: '2024-01-10',
          nextMaintenance: '2024-02-10',
          operator: 'John Smith',
          currentTask: 'Moving pallets to Zone B',
          utilization: 85.5,
          notes: 'Excellent condition, regular maintenance performed',
          createdAt: '2024-01-15T08:00:00Z',
          updatedAt: '2024-01-15T08:00:00Z'
        },
        {
          id: 2,
          equipmentId: 'EQ002',
          name: 'Conveyor System A',
          type: 'conveyor',
          status: 'operational',
          warehouseId: 1,
          location: 'Sorting Area',
          manufacturer: 'Hytrol',
          model: 'EZLogic',
          serialNumber: 'HY-2024-002',
          purchaseDate: '2024-01-20',
          lastMaintenance: '2024-01-15',
          nextMaintenance: '2024-02-15',
          operator: null,
          currentTask: 'Sorting packages',
          utilization: 92.3,
          notes: 'Automated sorting system, high efficiency',
          createdAt: '2024-01-20T08:00:00Z',
          updatedAt: '2024-01-20T08:00:00Z'
        },
        {
          id: 3,
          equipmentId: 'EQ003',
          name: 'ASRS Crane 1',
          type: 'asrs',
          status: 'maintenance',
          warehouseId: 2,
          location: 'High Bay Storage',
          manufacturer: 'Dematic',
          model: 'ASRS-500',
          serialNumber: 'DM-2024-003',
          purchaseDate: '2024-01-25',
          lastMaintenance: '2024-01-20',
          nextMaintenance: '2024-01-25',
          operator: null,
          currentTask: null,
          utilization: 0,
          notes: 'Scheduled maintenance - replacing sensors',
          createdAt: '2024-01-25T08:00:00Z',
          updatedAt: '2024-01-25T08:00:00Z'
        }
      ];

      const mockMaintenance: MaintenanceRecord[] = [
        {
          id: 1,
          equipmentId: 3,
          type: 'preventive',
          description: 'Replace sensors and calibrate system',
          technician: 'Mike Johnson',
          startDate: '2024-01-25',
          endDate: null,
          cost: 2500,
          status: 'in_progress',
          notes: 'Scheduled preventive maintenance'
        },
        {
          id: 2,
          equipmentId: 1,
          type: 'preventive',
          description: 'Oil change and safety inspection',
          technician: 'Sarah Wilson',
          startDate: '2024-01-10',
          endDate: '2024-01-10',
          cost: 350,
          status: 'completed',
          notes: 'Completed successfully'
        }
      ];

      setEquipment(mockEquipment);
      setMaintenanceRecords(mockMaintenance);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEquipmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const equipmentData = {
        ...equipmentFormData,
        utilization: parseFloat(equipmentFormData.utilization)
      };

      if (editingEquipment) {
        // Update existing equipment
        const updatedEquipment = equipment.map(eq => 
          eq.id === editingEquipment.id ? { ...eq, ...equipmentData, id: editingEquipment.id } : eq
        );
        setEquipment(updatedEquipment);
      } else {
        // Add new equipment
        const newEquipment: Equipment = {
          ...equipmentData,
          id: Math.max(...equipment.map(eq => eq.id)) + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setEquipment([...equipment, newEquipment]);
      }

      setShowEquipmentModal(false);
      setEditingEquipment(null);
      resetEquipmentForm();
    } catch (error) {
      console.error('Error saving equipment:', error);
    }
  };

  const handleMaintenanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const maintenanceData = {
        ...maintenanceFormData,
        cost: parseFloat(maintenanceFormData.cost)
      };

      if (editingMaintenance) {
        // Update existing maintenance record
        const updatedRecords = maintenanceRecords.map(record => 
          record.id === editingMaintenance.id ? { ...record, ...maintenanceData, id: editingMaintenance.id } : record
        );
        setMaintenanceRecords(updatedRecords);
      } else {
        // Add new maintenance record
        const newRecord: MaintenanceRecord = {
          ...maintenanceData,
          id: Math.max(...maintenanceRecords.map(r => r.id)) + 1
        };
        setMaintenanceRecords([...maintenanceRecords, newRecord]);
      }

      setShowMaintenanceModal(false);
      setEditingMaintenance(null);
      resetMaintenanceForm();
    } catch (error) {
      console.error('Error saving maintenance record:', error);
    }
  };

  const handleEquipmentEdit = (eq: Equipment) => {
    setEditingEquipment(eq);
    setEquipmentFormData({
      equipmentId: eq.equipmentId,
      name: eq.name,
      type: eq.type,
      status: eq.status,
      warehouseId: eq.warehouseId.toString(),
      location: eq.location,
      manufacturer: eq.manufacturer,
      model: eq.model,
      serialNumber: eq.serialNumber,
      purchaseDate: eq.purchaseDate.split('T')[0],
      lastMaintenance: eq.lastMaintenance,
      nextMaintenance: eq.nextMaintenance,
      operator: eq.operator || '',
      currentTask: eq.currentTask || '',
      utilization: eq.utilization.toString(),
      notes: eq.notes
    });
    setShowEquipmentModal(true);
  };

  const handleMaintenanceEdit = (record: MaintenanceRecord) => {
    setEditingMaintenance(record);
    setMaintenanceFormData({
      equipmentId: record.equipmentId.toString(),
      type: record.type,
      description: record.description,
      technician: record.technician,
      startDate: record.startDate,
      endDate: record.endDate || '',
      cost: record.cost.toString(),
      status: record.status,
      notes: record.notes
    });
    setShowMaintenanceModal(true);
  };

  const handleEquipmentDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this equipment?')) {
      setEquipment(equipment.filter(eq => eq.id !== id));
    }
  };

  const handleMaintenanceDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this maintenance record?')) {
      setMaintenanceRecords(maintenanceRecords.filter(record => record.id !== id));
    }
  };

  const resetEquipmentForm = () => {
    setEquipmentFormData({
      equipmentId: '',
      name: '',
      type: 'forklift',
      status: 'operational',
      warehouseId: '',
      location: '',
      manufacturer: '',
      model: '',
      serialNumber: '',
      purchaseDate: '',
      lastMaintenance: '',
      nextMaintenance: '',
      operator: '',
      currentTask: '',
      utilization: '',
      notes: ''
    });
  };

  const resetMaintenanceForm = () => {
    setMaintenanceFormData({
      equipmentId: '',
      type: 'preventive',
      description: '',
      technician: '',
      startDate: '',
      endDate: '',
      cost: '',
      status: 'scheduled',
      notes: ''
    });
  };

  const getFilteredEquipment = () => {
    let filtered = equipment;
    
    if (filterStatus) {
      filtered = filtered.filter(eq => eq.status === filterStatus);
    }
    
    if (filterType) {
      filtered = filtered.filter(eq => eq.type === filterType);
    }
    
    if (filterWarehouse) {
      filtered = filtered.filter(eq => eq.warehouseId === parseInt(filterWarehouse));
    }
    
    return filtered;
  };

  const getWarehouseName = (warehouseId: number) => {
    const warehouse = warehouses.find(w => w.id === warehouseId);
    return warehouse ? warehouse.name : 'Unknown';
  };

  const getEquipmentName = (equipmentId: number) => {
    const eq = equipment.find(e => e.id === equipmentId);
    return eq ? eq.name : 'Unknown';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_service': return 'bg-red-100 text-red-800';
      case 'reserved': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'forklift': return 'bg-blue-100 text-blue-800';
      case 'conveyor': return 'bg-green-100 text-green-800';
      case 'asrs': return 'bg-purple-100 text-purple-800';
      case 'pick_to_light': return 'bg-orange-100 text-orange-800';
      case 'rfid_reader': return 'bg-indigo-100 text-indigo-800';
      case 'agv': return 'bg-pink-100 text-pink-800';
      case 'pallet_jack': return 'bg-yellow-100 text-yellow-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const filteredEquipment = getFilteredEquipment();
  const equipmentTypes = ['forklift', 'conveyor', 'asrs', 'pick_to_light', 'rfid_reader', 'agv', 'pallet_jack', 'other'];
  const statuses = ['operational', 'maintenance', 'out_of_service', 'reserved'];
  const maintenanceTypes = ['preventive', 'corrective', 'emergency'];
  const maintenanceStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Equipment Management</h1>
          <p className="mt-2 text-gray-600">Track warehouse equipment, automation devices, and maintenance</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => { setActiveTab('equipment'); setShowEquipmentModal(true); resetEquipmentForm(); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Add Equipment
          </button>
          <button
            onClick={() => { setActiveTab('maintenance'); setShowMaintenanceModal(true); resetMaintenanceForm(); }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Schedule Maintenance
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('equipment')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'equipment'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Equipment
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'maintenance'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Maintenance
          </button>
        </nav>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status.replace('_', ' ').toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              {equipmentTypes.map(type => (
                <option key={type} value={type}>{type.replace('_', ' ').toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Warehouse</label>
            <select
              value={filterWarehouse}
              onChange={(e) => setFilterWarehouse(e.target.value)}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Warehouses</option>
              {warehouses.map(warehouse => (
                <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setFilterStatus(''); setFilterType(''); setFilterWarehouse(''); }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Equipment Tab */}
      {activeTab === 'equipment' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filteredEquipment.map((eq) => (
            <div key={eq.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{eq.name}</h3>
                  <p className="text-sm text-gray-500">ID: {eq.equipmentId}</p>
                </div>
                <div className="flex space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(eq.type)}`}>
                    {eq.type.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(eq.status)}`}>
                    {eq.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span><strong>Warehouse:</strong></span>
                  <span>{getWarehouseName(eq.warehouseId)}</span>
                </div>
                <div className="flex justify-between">
                  <span><strong>Location:</strong></span>
                  <span>{eq.location}</span>
                </div>
                <div className="flex justify-between">
                  <span><strong>Manufacturer:</strong></span>
                  <span>{eq.manufacturer} {eq.model}</span>
                </div>
                <div className="flex justify-between">
                  <span><strong>Serial Number:</strong></span>
                  <span>{eq.serialNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span><strong>Utilization:</strong></span>
                  <span>{eq.utilization}%</span>
                </div>
                {eq.operator && (
                  <div className="flex justify-between">
                    <span><strong>Operator:</strong></span>
                    <span>{eq.operator}</span>
                  </div>
                )}
                {eq.currentTask && (
                  <div className="flex justify-between">
                    <span><strong>Current Task:</strong></span>
                    <span className="text-blue-600">{eq.currentTask}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span><strong>Next Maintenance:</strong></span>
                  <span>{new Date(eq.nextMaintenance).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => handleEquipmentEdit(eq)}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleEquipmentDelete(eq.id)}
                  className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Maintenance Tab */}
      {activeTab === 'maintenance' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Technician</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {maintenanceRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{getEquipmentName(record.equipmentId)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        record.type === 'preventive' ? 'bg-green-100 text-green-800' :
                        record.type === 'corrective' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {record.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.technician}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(record.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        record.status === 'completed' ? 'bg-green-100 text-green-800' :
                        record.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        record.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {record.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${record.cost.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleMaintenanceEdit(record)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleMaintenanceDelete(record.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Equipment Modal */}
      {showEquipmentModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingEquipment ? 'Edit Equipment' : 'Add New Equipment'}
              </h3>
              <form onSubmit={handleEquipmentSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Equipment ID</label>
                    <input
                      type="text"
                      required
                      value={equipmentFormData.equipmentId}
                      onChange={(e) => setEquipmentFormData({ ...equipmentFormData, equipmentId: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      required
                      value={equipmentFormData.name}
                      onChange={(e) => setEquipmentFormData({ ...equipmentFormData, name: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select
                      required
                      value={equipmentFormData.type}
                      onChange={(e) => setEquipmentFormData({ ...equipmentFormData, type: e.target.value as any })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {equipmentTypes.map(type => (
                        <option key={type} value={type}>{type.replace('_', ' ').toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      required
                      value={equipmentFormData.status}
                      onChange={(e) => setEquipmentFormData({ ...equipmentFormData, status: e.target.value as any })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>{status.replace('_', ' ').toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Warehouse</label>
                    <select
                      required
                      value={equipmentFormData.warehouseId}
                      onChange={(e) => setEquipmentFormData({ ...equipmentFormData, warehouseId: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Warehouse</option>
                      {warehouses.map(warehouse => (
                        <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                      type="text"
                      required
                      value={equipmentFormData.location}
                      onChange={(e) => setEquipmentFormData({ ...equipmentFormData, location: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Manufacturer</label>
                    <input
                      type="text"
                      required
                      value={equipmentFormData.manufacturer}
                      onChange={(e) => setEquipmentFormData({ ...equipmentFormData, manufacturer: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Model</label>
                    <input
                      type="text"
                      required
                      value={equipmentFormData.model}
                      onChange={(e) => setEquipmentFormData({ ...equipmentFormData, model: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Serial Number</label>
                    <input
                      type="text"
                      required
                      value={equipmentFormData.serialNumber}
                      onChange={(e) => setEquipmentFormData({ ...equipmentFormData, serialNumber: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Purchase Date</label>
                    <input
                      type="date"
                      required
                      value={equipmentFormData.purchaseDate}
                      onChange={(e) => setEquipmentFormData({ ...equipmentFormData, purchaseDate: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Next Maintenance</label>
                    <input
                      type="date"
                      required
                      value={equipmentFormData.nextMaintenance}
                      onChange={(e) => setEquipmentFormData({ ...equipmentFormData, nextMaintenance: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Operator</label>
                    <input
                      type="text"
                      value={equipmentFormData.operator}
                      onChange={(e) => setEquipmentFormData({ ...equipmentFormData, operator: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Utilization (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={equipmentFormData.utilization}
                      onChange={(e) => setEquipmentFormData({ ...equipmentFormData, utilization: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Task</label>
                  <input
                    type="text"
                    value={equipmentFormData.currentTask}
                    onChange={(e) => setEquipmentFormData({ ...equipmentFormData, currentTask: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={equipmentFormData.notes}
                    onChange={(e) => setEquipmentFormData({ ...equipmentFormData, notes: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    {editingEquipment ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEquipmentModal(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Modal */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingMaintenance ? 'Edit Maintenance Record' : 'Schedule Maintenance'}
              </h3>
              <form onSubmit={handleMaintenanceSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Equipment</label>
                    <select
                      required
                      value={maintenanceFormData.equipmentId}
                      onChange={(e) => setMaintenanceFormData({ ...maintenanceFormData, equipmentId: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Equipment</option>
                      {equipment.map(eq => (
                        <option key={eq.id} value={eq.id}>{eq.name} ({eq.equipmentId})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select
                      required
                      value={maintenanceFormData.type}
                      onChange={(e) => setMaintenanceFormData({ ...maintenanceFormData, type: e.target.value as any })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {maintenanceTypes.map(type => (
                        <option key={type} value={type}>{type.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Technician</label>
                    <input
                      type="text"
                      required
                      value={maintenanceFormData.technician}
                      onChange={(e) => setMaintenanceFormData({ ...maintenanceFormData, technician: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      required
                      value={maintenanceFormData.status}
                      onChange={(e) => setMaintenanceFormData({ ...maintenanceFormData, status: e.target.value as any })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {maintenanceStatuses.map(status => (
                        <option key={status} value={status}>{status.replace('_', ' ').toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input
                      type="date"
                      required
                      value={maintenanceFormData.startDate}
                      onChange={(e) => setMaintenanceFormData({ ...maintenanceFormData, startDate: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <input
                      type="date"
                      value={maintenanceFormData.endDate}
                      onChange={(e) => setMaintenanceFormData({ ...maintenanceFormData, endDate: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cost ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={maintenanceFormData.cost}
                      onChange={(e) => setMaintenanceFormData({ ...maintenanceFormData, cost: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    required
                    value={maintenanceFormData.description}
                    onChange={(e) => setMaintenanceFormData({ ...maintenanceFormData, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={maintenanceFormData.notes}
                    onChange={(e) => setMaintenanceFormData({ ...maintenanceFormData, notes: e.target.value })}
                    rows={2}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    {editingMaintenance ? 'Update' : 'Schedule'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMaintenanceModal(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentManagement;