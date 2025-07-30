import React, { useState, useEffect } from 'react';

interface Worker {
  id: number;
  employeeId: string;
  name: string;
  role: 'picker' | 'packer' | 'receiver' | 'supervisor' | 'manager';
  status: 'active' | 'inactive' | 'on_break' | 'off_duty';
  warehouseId: number;
  shift: 'morning' | 'afternoon' | 'night' | 'flexible';
  hourlyRate: number;
  skills: string[];
  currentTask: string | null;
  tasksCompleted: number;
  totalHours: number;
  productivity: number;
  createdAt: string;
  updatedAt: string;
}

interface Shift {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  warehouseId: number;
  workers: number[];
  maxWorkers: number;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
}

interface ProductivityRecord {
  id: number;
  workerId: number;
  date: string;
  tasksCompleted: number;
  hoursWorked: number;
  efficiency: number;
  notes: string;
}

const LaborManagement: React.FC = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [productivityRecords, setProductivityRecords] = useState<ProductivityRecord[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showProductivityModal, setShowProductivityModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [editingProductivity, setEditingProductivity] = useState<ProductivityRecord | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState('');
  const [activeTab, setActiveTab] = useState('workers');

  const [workerFormData, setWorkerFormData] = useState({
    employeeId: '',
    name: '',
    role: 'picker',
    status: 'active',
    warehouseId: '',
    shift: 'morning',
    hourlyRate: '',
    skills: [''],
    currentTask: '',
    tasksCompleted: '',
    totalHours: '',
    productivity: ''
  });

  const [shiftFormData, setShiftFormData] = useState({
    name: '',
    startTime: '',
    endTime: '',
    warehouseId: '',
    maxWorkers: '',
    workers: []
  });

  const [productivityFormData, setProductivityFormData] = useState({
    workerId: '',
    date: '',
    tasksCompleted: '',
    hoursWorked: '',
    efficiency: '',
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

      // Mock data for workers, shifts, and productivity
      const mockWorkers: Worker[] = [
        {
          id: 1,
          employeeId: 'EMP001',
          name: 'John Smith',
          role: 'picker',
          status: 'active',
          warehouseId: 1,
          shift: 'morning',
          hourlyRate: 18.50,
          skills: ['picking', 'packing', 'RF scanning'],
          currentTask: 'Picking Order ORD-2024-001',
          tasksCompleted: 45,
          totalHours: 160,
          productivity: 95.2,
          createdAt: '2024-01-15T08:00:00Z',
          updatedAt: '2024-01-15T08:00:00Z'
        },
        {
          id: 2,
          employeeId: 'EMP002',
          name: 'Sarah Johnson',
          role: 'packer',
          status: 'active',
          warehouseId: 1,
          shift: 'afternoon',
          hourlyRate: 17.75,
          skills: ['packing', 'quality control'],
          currentTask: 'Packing Order ORD-2024-002',
          tasksCompleted: 38,
          totalHours: 145,
          productivity: 92.8,
          createdAt: '2024-01-15T08:00:00Z',
          updatedAt: '2024-01-15T08:00:00Z'
        },
        {
          id: 3,
          employeeId: 'EMP003',
          name: 'Mike Davis',
          role: 'receiver',
          status: 'on_break',
          warehouseId: 2,
          shift: 'morning',
          hourlyRate: 19.25,
          skills: ['receiving', 'putaway', 'forklift'],
          currentTask: null,
          tasksCompleted: 52,
          totalHours: 168,
          productivity: 88.5,
          createdAt: '2024-01-15T08:00:00Z',
          updatedAt: '2024-01-15T08:00:00Z'
        }
      ];

      const mockShifts: Shift[] = [
        {
          id: 1,
          name: 'Morning Shift',
          startTime: '06:00',
          endTime: '14:00',
          warehouseId: 1,
          workers: [1, 2],
          maxWorkers: 8,
          status: 'active',
          createdAt: '2024-01-15T08:00:00Z'
        },
        {
          id: 2,
          name: 'Afternoon Shift',
          startTime: '14:00',
          endTime: '22:00',
          warehouseId: 1,
          workers: [2],
          maxWorkers: 6,
          status: 'scheduled',
          createdAt: '2024-01-15T08:00:00Z'
        }
      ];

      const mockProductivity: ProductivityRecord[] = [
        {
          id: 1,
          workerId: 1,
          date: '2024-01-15',
          tasksCompleted: 12,
          hoursWorked: 8,
          efficiency: 95.2,
          notes: 'Excellent performance, exceeded targets'
        },
        {
          id: 2,
          workerId: 2,
          date: '2024-01-15',
          tasksCompleted: 10,
          hoursWorked: 8,
          efficiency: 92.8,
          notes: 'Good performance, minor delays due to equipment'
        }
      ];

      setWorkers(mockWorkers);
      setShifts(mockShifts);
      setProductivityRecords(mockProductivity);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const skills = workerFormData.skills.filter(skill => skill.trim() !== '');
      const workerData = {
        ...workerFormData,
        hourlyRate: parseFloat(workerFormData.hourlyRate),
        tasksCompleted: parseInt(workerFormData.tasksCompleted),
        totalHours: parseFloat(workerFormData.totalHours),
        productivity: parseFloat(workerFormData.productivity),
        skills
      };

      if (editingWorker) {
        // Update existing worker
        const updatedWorkers = workers.map(w => 
          w.id === editingWorker.id ? { ...w, ...workerData, id: editingWorker.id } : w
        );
        setWorkers(updatedWorkers);
      } else {
        // Add new worker
        const newWorker: Worker = {
          ...workerData,
          id: Math.max(...workers.map(w => w.id)) + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setWorkers([...workers, newWorker]);
      }

      setShowWorkerModal(false);
      setEditingWorker(null);
      resetWorkerForm();
    } catch (error) {
      console.error('Error saving worker:', error);
    }
  };

  const handleShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const shiftData = {
        ...shiftFormData,
        maxWorkers: parseInt(shiftFormData.maxWorkers),
        workers: shiftFormData.workers.map(w => parseInt(w))
      };

      if (editingShift) {
        // Update existing shift
        const updatedShifts = shifts.map(s => 
          s.id === editingShift.id ? { ...s, ...shiftData, id: editingShift.id } : s
        );
        setShifts(updatedShifts);
      } else {
        // Add new shift
        const newShift: Shift = {
          ...shiftData,
          id: Math.max(...shifts.map(s => s.id)) + 1,
          status: 'scheduled',
          createdAt: new Date().toISOString()
        };
        setShifts([...shifts, newShift]);
      }

      setShowShiftModal(false);
      setEditingShift(null);
      resetShiftForm();
    } catch (error) {
      console.error('Error saving shift:', error);
    }
  };

  const handleProductivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const productivityData = {
        ...productivityFormData,
        workerId: parseInt(productivityFormData.workerId),
        tasksCompleted: parseInt(productivityFormData.tasksCompleted),
        hoursWorked: parseFloat(productivityFormData.hoursWorked),
        efficiency: parseFloat(productivityFormData.efficiency)
      };

      if (editingProductivity) {
        // Update existing record
        const updatedRecords = productivityRecords.map(r => 
          r.id === editingProductivity.id ? { ...r, ...productivityData, id: editingProductivity.id } : r
        );
        setProductivityRecords(updatedRecords);
      } else {
        // Add new record
        const newRecord: ProductivityRecord = {
          ...productivityData,
          id: Math.max(...productivityRecords.map(r => r.id)) + 1
        };
        setProductivityRecords([...productivityRecords, newRecord]);
      }

      setShowProductivityModal(false);
      setEditingProductivity(null);
      resetProductivityForm();
    } catch (error) {
      console.error('Error saving productivity record:', error);
    }
  };

  const handleWorkerEdit = (worker: Worker) => {
    setEditingWorker(worker);
    setWorkerFormData({
      employeeId: worker.employeeId,
      name: worker.name,
      role: worker.role,
      status: worker.status,
      warehouseId: worker.warehouseId.toString(),
      shift: worker.shift,
      hourlyRate: worker.hourlyRate.toString(),
      skills: worker.skills.length > 0 ? worker.skills : [''],
      currentTask: worker.currentTask || '',
      tasksCompleted: worker.tasksCompleted.toString(),
      totalHours: worker.totalHours.toString(),
      productivity: worker.productivity.toString()
    });
    setShowWorkerModal(true);
  };

  const handleShiftEdit = (shift: Shift) => {
    setEditingShift(shift);
    setShiftFormData({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      warehouseId: shift.warehouseId.toString(),
      maxWorkers: shift.maxWorkers.toString(),
      workers: shift.workers.map(w => w.toString())
    });
    setShowShiftModal(true);
  };

  const handleWorkerDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this worker?')) {
      setWorkers(workers.filter(w => w.id !== id));
    }
  };

  const handleShiftDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this shift?')) {
      setShifts(shifts.filter(s => s.id !== id));
    }
  };

  const resetWorkerForm = () => {
    setWorkerFormData({
      employeeId: '',
      name: '',
      role: 'picker',
      status: 'active',
      warehouseId: '',
      shift: 'morning',
      hourlyRate: '',
      skills: [''],
      currentTask: '',
      tasksCompleted: '',
      totalHours: '',
      productivity: ''
    });
  };

  const resetShiftForm = () => {
    setShiftFormData({
      name: '',
      startTime: '',
      endTime: '',
      warehouseId: '',
      maxWorkers: '',
      workers: []
    });
  };

  const resetProductivityForm = () => {
    setProductivityFormData({
      workerId: '',
      date: '',
      tasksCompleted: '',
      hoursWorked: '',
      efficiency: '',
      notes: ''
    });
  };

  const addSkill = () => {
    setWorkerFormData({
      ...workerFormData,
      skills: [...workerFormData.skills, '']
    });
  };

  const removeSkill = (index: number) => {
    const newSkills = workerFormData.skills.filter((_, i) => i !== index);
    setWorkerFormData({ ...workerFormData, skills: newSkills });
  };

  const updateSkill = (index: number, value: string) => {
    const newSkills = [...workerFormData.skills];
    newSkills[index] = value;
    setWorkerFormData({ ...workerFormData, skills: newSkills });
  };

  const getFilteredWorkers = () => {
    let filtered = workers;
    
    if (filterStatus) {
      filtered = filtered.filter(worker => worker.status === filterStatus);
    }
    
    if (filterRole) {
      filtered = filtered.filter(worker => worker.role === filterRole);
    }
    
    if (filterWarehouse) {
      filtered = filtered.filter(worker => worker.warehouseId === parseInt(filterWarehouse));
    }
    
    return filtered;
  };

  const getWarehouseName = (warehouseId: number) => {
    const warehouse = warehouses.find(w => w.id === warehouseId);
    return warehouse ? warehouse.name : 'Unknown';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'on_break': return 'bg-yellow-100 text-yellow-800';
      case 'off_duty': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'picker': return 'bg-blue-100 text-blue-800';
      case 'packer': return 'bg-green-100 text-green-800';
      case 'receiver': return 'bg-purple-100 text-purple-800';
      case 'supervisor': return 'bg-orange-100 text-orange-800';
      case 'manager': return 'bg-indigo-100 text-indigo-800';
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

  const filteredWorkers = getFilteredWorkers();
  const roles = ['picker', 'packer', 'receiver', 'supervisor', 'manager'];
  const statuses = ['active', 'inactive', 'on_break', 'off_duty'];
  const shiftTypes = ['morning', 'afternoon', 'night', 'flexible'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Labor Management</h1>
          <p className="mt-2 text-gray-600">Worker assignments, productivity tracking, and shift management</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => { setActiveTab('workers'); setShowWorkerModal(true); resetWorkerForm(); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Add Worker
          </button>
          <button
            onClick={() => { setActiveTab('shifts'); setShowShiftModal(true); resetShiftForm(); }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Create Shift
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('workers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'workers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Workers
          </button>
          <button
            onClick={() => setActiveTab('shifts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'shifts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Shifts
          </button>
          <button
            onClick={() => setActiveTab('productivity')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'productivity'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Productivity
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Roles</option>
              {roles.map(role => (
                <option key={role} value={role}>{role.toUpperCase()}</option>
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
              onClick={() => { setFilterStatus(''); setFilterRole(''); setFilterWarehouse(''); }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Workers Tab */}
      {activeTab === 'workers' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filteredWorkers.map((worker) => (
            <div key={worker.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{worker.name}</h3>
                  <p className="text-sm text-gray-500">ID: {worker.employeeId}</p>
                </div>
                <div className="flex space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(worker.role)}`}>
                    {worker.role.toUpperCase()}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(worker.status)}`}>
                    {worker.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span><strong>Warehouse:</strong></span>
                  <span>{getWarehouseName(worker.warehouseId)}</span>
                </div>
                <div className="flex justify-between">
                  <span><strong>Shift:</strong></span>
                  <span>{worker.shift.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span><strong>Hourly Rate:</strong></span>
                  <span>${worker.hourlyRate}/hr</span>
                </div>
                <div className="flex justify-between">
                  <span><strong>Tasks Completed:</strong></span>
                  <span>{worker.tasksCompleted}</span>
                </div>
                <div className="flex justify-between">
                  <span><strong>Total Hours:</strong></span>
                  <span>{worker.totalHours} hrs</span>
                </div>
                <div className="flex justify-between">
                  <span><strong>Productivity:</strong></span>
                  <span>{worker.productivity}%</span>
                </div>
                {worker.currentTask && (
                  <div className="flex justify-between">
                    <span><strong>Current Task:</strong></span>
                    <span className="text-blue-600">{worker.currentTask}</span>
                  </div>
                )}
              </div>

              {worker.skills.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {worker.skills.map((skill, index) => (
                      <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => handleWorkerEdit(worker)}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleWorkerDelete(worker.id)}
                  className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Shifts Tab */}
      {activeTab === 'shifts' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {shifts.map((shift) => (
            <div key={shift.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{shift.name}</h3>
                  <p className="text-sm text-gray-500">{shift.startTime} - {shift.endTime}</p>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  shift.status === 'active' ? 'bg-green-100 text-green-800' :
                  shift.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                  shift.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {shift.status.toUpperCase()}
                </span>
              </div>
              
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span><strong>Warehouse:</strong></span>
                  <span>{getWarehouseName(shift.warehouseId)}</span>
                </div>
                <div className="flex justify-between">
                  <span><strong>Workers Assigned:</strong></span>
                  <span>{shift.workers.length} / {shift.maxWorkers}</span>
                </div>
                <div className="flex justify-between">
                  <span><strong>Duration:</strong></span>
                  <span>8 hours</span>
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => handleShiftEdit(shift)}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleShiftDelete(shift.id)}
                  className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Productivity Tab */}
      {activeTab === 'productivity' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Worker</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Efficiency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productivityRecords.map((record) => {
                  const worker = workers.find(w => w.id === record.workerId);
                  return (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{worker?.name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{worker?.employeeId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.tasksCompleted}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.hoursWorked}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          record.efficiency >= 90 ? 'bg-green-100 text-green-800' :
                          record.efficiency >= 80 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {record.efficiency}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900">View Details</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Worker Modal */}
      {showWorkerModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingWorker ? 'Edit Worker' : 'Add New Worker'}
              </h3>
              <form onSubmit={handleWorkerSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                    <input
                      type="text"
                      required
                      value={workerFormData.employeeId}
                      onChange={(e) => setWorkerFormData({ ...workerFormData, employeeId: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      required
                      value={workerFormData.name}
                      onChange={(e) => setWorkerFormData({ ...workerFormData, name: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select
                      required
                      value={workerFormData.role}
                      onChange={(e) => setWorkerFormData({ ...workerFormData, role: e.target.value as any })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {roles.map(role => (
                        <option key={role} value={role}>{role.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      required
                      value={workerFormData.status}
                      onChange={(e) => setWorkerFormData({ ...workerFormData, status: e.target.value as any })}
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
                      value={workerFormData.warehouseId}
                      onChange={(e) => setWorkerFormData({ ...workerFormData, warehouseId: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Warehouse</option>
                      {warehouses.map(warehouse => (
                        <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Shift</label>
                    <select
                      required
                      value={workerFormData.shift}
                      onChange={(e) => setWorkerFormData({ ...workerFormData, shift: e.target.value as any })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                                             {shiftTypes.map(shift => (
                         <option key={shift} value={shift}>{shift.toUpperCase()}</option>
                       ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hourly Rate ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={workerFormData.hourlyRate}
                      onChange={(e) => setWorkerFormData({ ...workerFormData, hourlyRate: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Task</label>
                    <input
                      type="text"
                      value={workerFormData.currentTask}
                      onChange={(e) => setWorkerFormData({ ...workerFormData, currentTask: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-medium text-gray-900">Skills</h4>
                    <button
                      type="button"
                      onClick={addSkill}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm"
                    >
                      Add Skill
                    </button>
                  </div>
                  <div className="space-y-2">
                    {workerFormData.skills.map((skill, index) => (
                      <div key={index} className="flex space-x-2">
                        <input
                          type="text"
                          value={skill}
                          onChange={(e) => updateSkill(index, e.target.value)}
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter skill"
                        />
                        {workerFormData.skills.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSkill(index)}
                            className="bg-red-600 hover:bg-red-700 text-white px-2 py-2 rounded-md text-sm"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    {editingWorker ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowWorkerModal(false)}
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

      {/* Shift Modal */}
      {showShiftModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingShift ? 'Edit Shift' : 'Create New Shift'}
              </h3>
              <form onSubmit={handleShiftSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Shift Name</label>
                    <input
                      type="text"
                      required
                      value={shiftFormData.name}
                      onChange={(e) => setShiftFormData({ ...shiftFormData, name: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Warehouse</label>
                    <select
                      required
                      value={shiftFormData.warehouseId}
                      onChange={(e) => setShiftFormData({ ...shiftFormData, warehouseId: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Warehouse</option>
                      {warehouses.map(warehouse => (
                        <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Time</label>
                    <input
                      type="time"
                      required
                      value={shiftFormData.startTime}
                      onChange={(e) => setShiftFormData({ ...shiftFormData, startTime: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Time</label>
                    <input
                      type="time"
                      required
                      value={shiftFormData.endTime}
                      onChange={(e) => setShiftFormData({ ...shiftFormData, endTime: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Max Workers</label>
                    <input
                      type="number"
                      required
                      value={shiftFormData.maxWorkers}
                      onChange={(e) => setShiftFormData({ ...shiftFormData, maxWorkers: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    {editingShift ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowShiftModal(false)}
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

export default LaborManagement;