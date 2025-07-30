import React, { useState, useEffect } from 'react';

interface QualityCheck {
  id: number;
  checkNumber: string;
  type: 'inbound' | 'outbound' | 'cycle_count' | 'damage_inspection' | 'expiry_check';
  status: 'pending' | 'in_progress' | 'passed' | 'failed' | 'quarantine';
  warehouseId: number;
  location: string;
  inspector: string;
  items: QualityItem[];
  totalItems: number;
  passedItems: number;
  failedItems: number;
  notes: string;
  createdAt: string;
  completedAt: string | null;
}

interface QualityItem {
  id: number;
  sku: string;
  name: string;
  expectedQuantity: number;
  actualQuantity: number;
  condition: 'good' | 'damaged' | 'expired' | 'contaminated';
  qualityScore: number;
  notes: string;
}

const QualityControl: React.FC = () => {
  const [qualityChecks, setQualityChecks] = useState<QualityCheck[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCheck, setEditingCheck] = useState<QualityCheck | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState('');

  const [formData, setFormData] = useState({
    type: 'inbound',
    warehouseId: '',
    location: '',
    inspector: '',
    notes: '',
    items: [{ sku: '', name: '', expectedQuantity: '', actualQuantity: '', condition: 'good', qualityScore: '', notes: '' }]
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

      // Mock quality control data
      const mockQualityChecks: QualityCheck[] = [
        {
          id: 1,
          checkNumber: 'QC-2024-001',
          type: 'inbound',
          status: 'completed',
          warehouseId: 1,
          location: 'Receiving Dock A',
          inspector: 'Sarah Johnson',
          items: [
            {
              id: 1,
              sku: 'SKU001',
              name: 'Product A',
              expectedQuantity: 100,
              actualQuantity: 98,
              condition: 'good',
              qualityScore: 95,
              notes: 'Minor packaging damage on 2 units'
            }
          ],
          totalItems: 1,
          passedItems: 1,
          failedItems: 0,
          notes: 'Overall good quality, minor issues noted',
          createdAt: '2024-01-15T08:00:00Z',
          completedAt: '2024-01-15T10:30:00Z'
        },
        {
          id: 2,
          checkNumber: 'QC-2024-002',
          type: 'outbound',
          status: 'in_progress',
          warehouseId: 1,
          location: 'Packing Station 1',
          inspector: 'Mike Davis',
          items: [
            {
              id: 2,
              sku: 'SKU002',
              name: 'Product B',
              expectedQuantity: 50,
              actualQuantity: 50,
              condition: 'good',
              qualityScore: 100,
              notes: 'All items in perfect condition'
            }
          ],
          totalItems: 1,
          passedItems: 1,
          failedItems: 0,
          notes: 'Quality check in progress',
          createdAt: '2024-01-15T14:00:00Z',
          completedAt: null
        }
      ];

      setQualityChecks(mockQualityChecks);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const items = formData.items.map(item => ({
        ...item,
        expectedQuantity: parseInt(item.expectedQuantity),
        actualQuantity: parseInt(item.actualQuantity),
        qualityScore: parseFloat(item.qualityScore)
      }));
      
      const totalItems = items.length;
      const passedItems = items.filter(item => item.condition === 'good').length;
      const failedItems = totalItems - passedItems;
      
      const qualityData = {
        ...formData,
        items,
        totalItems,
        passedItems,
        failedItems
      };

      if (editingCheck) {
        const updatedChecks = qualityChecks.map(check => 
          check.id === editingCheck.id ? { ...check, ...qualityData, id: editingCheck.id } : check
        );
        setQualityChecks(updatedChecks);
      } else {
        const newCheck: QualityCheck = {
          ...qualityData,
          id: Math.max(...qualityChecks.map(c => c.id)) + 1,
          checkNumber: `QC-2024-${String(Math.max(...qualityChecks.map(c => c.id)) + 1).padStart(3, '0')}`,
          status: 'pending',
          createdAt: new Date().toISOString(),
          completedAt: null
        };
        setQualityChecks([...qualityChecks, newCheck]);
      }

      setShowModal(false);
      setEditingCheck(null);
      resetForm();
    } catch (error) {
      console.error('Error saving quality check:', error);
    }
  };

  const handleEdit = (check: QualityCheck) => {
    setEditingCheck(check);
    setFormData({
      type: check.type,
      warehouseId: check.warehouseId.toString(),
      location: check.location,
      inspector: check.inspector,
      notes: check.notes,
      items: check.items.map(item => ({
        sku: item.sku,
        name: item.name,
        expectedQuantity: item.expectedQuantity.toString(),
        actualQuantity: item.actualQuantity.toString(),
        condition: item.condition,
        qualityScore: item.qualityScore.toString(),
        notes: item.notes
      }))
    });
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this quality check?')) {
      setQualityChecks(qualityChecks.filter(check => check.id !== id));
    }
  };

  const handleStatusChange = async (checkId: number, newStatus: string) => {
    const updatedChecks = qualityChecks.map(check => 
      check.id === checkId 
        ? { 
            ...check, 
            status: newStatus as any,
            completedAt: newStatus === 'completed' ? new Date().toISOString() : check.completedAt
          } 
        : check
    );
    setQualityChecks(updatedChecks);
  };

  const resetForm = () => {
    setFormData({
      type: 'inbound',
      warehouseId: '',
      location: '',
      inspector: '',
      notes: '',
      items: [{ sku: '', name: '', expectedQuantity: '', actualQuantity: '', condition: 'good', qualityScore: '', notes: '' }]
    });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { sku: '', name: '', expectedQuantity: '', actualQuantity: '', condition: 'good', qualityScore: '', notes: '' }]
    });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const getFilteredChecks = () => {
    let filtered = qualityChecks;
    
    if (filterStatus) {
      filtered = filtered.filter(check => check.status === filterStatus);
    }
    
    if (filterType) {
      filtered = filtered.filter(check => check.type === filterType);
    }
    
    if (filterWarehouse) {
      filtered = filtered.filter(check => check.warehouseId === parseInt(filterWarehouse));
    }
    
    return filtered;
  };

  const getWarehouseName = (warehouseId: number) => {
    const warehouse = warehouses.find(w => w.id === warehouseId);
    return warehouse ? warehouse.name : 'Unknown';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'passed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'quarantine': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'inbound': return 'bg-blue-100 text-blue-800';
      case 'outbound': return 'bg-green-100 text-green-800';
      case 'cycle_count': return 'bg-purple-100 text-purple-800';
      case 'damage_inspection': return 'bg-orange-100 text-orange-800';
      case 'expiry_check': return 'bg-red-100 text-red-800';
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

  const filteredChecks = getFilteredChecks();
  const types = ['inbound', 'outbound', 'cycle_count', 'damage_inspection', 'expiry_check'];
  const statuses = ['pending', 'in_progress', 'passed', 'failed', 'quarantine'];
  const conditions = ['good', 'damaged', 'expired', 'contaminated'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quality Control</h1>
          <p className="mt-2 text-gray-600">Quality assurance and inspection management</p>
        </div>
        <button
          onClick={() => { setShowModal(true); resetForm(); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Create Quality Check
        </button>
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
              {types.map(type => (
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

      {/* Quality Checks Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {filteredChecks.map((check) => (
          <div key={check.id} className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{check.checkNumber}</h3>
                <p className="text-sm text-gray-500">{check.type.replace('_', ' ').toUpperCase()}</p>
              </div>
              <div className="flex space-x-2">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(check.type)}`}>
                  {check.type.replace('_', ' ').toUpperCase()}
                </span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(check.status)}`}>
                  {check.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span><strong>Warehouse:</strong></span>
                <span>{getWarehouseName(check.warehouseId)}</span>
              </div>
              <div className="flex justify-between">
                <span><strong>Location:</strong></span>
                <span>{check.location}</span>
              </div>
              <div className="flex justify-between">
                <span><strong>Inspector:</strong></span>
                <span>{check.inspector}</span>
              </div>
              <div className="flex justify-between">
                <span><strong>Items:</strong></span>
                <span>{check.totalItems} total, {check.passedItems} passed, {check.failedItems} failed</span>
              </div>
              <div className="flex justify-between">
                <span><strong>Created:</strong></span>
                <span>{new Date(check.createdAt).toLocaleString()}</span>
              </div>
              {check.completedAt && (
                <div className="flex justify-between">
                  <span><strong>Completed:</strong></span>
                  <span>{new Date(check.completedAt).toLocaleString()}</span>
                </div>
              )}
            </div>

            {check.notes && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700"><strong>Notes:</strong> {check.notes}</p>
              </div>
            )}

            <div className="mt-6 flex space-x-3">
              <select
                value={check.status}
                onChange={(e) => handleStatusChange(check.id, e.target.value)}
                className={`flex-1 text-sm font-semibold rounded-md px-3 py-2 border-0 ${getStatusColor(check.status)}`}
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status.replace('_', ' ').toUpperCase()}</option>
                ))}
              </select>
              <button
                onClick={() => handleEdit(check)}
                className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-2 rounded-md text-sm font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(check.id)}
                className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded-md text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingCheck ? 'Edit Quality Check' : 'Create New Quality Check'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {types.map(type => (
                        <option key={type} value={type}>{type.replace('_', ' ').toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Warehouse</label>
                    <select
                      required
                      value={formData.warehouseId}
                      onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
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
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Inspector</label>
                    <input
                      type="text"
                      required
                      value={formData.inspector}
                      onChange={(e) => setFormData({ ...formData, inspector: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Quality Items */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-medium text-gray-900">Quality Items</h4>
                    <button
                      type="button"
                      onClick={addItem}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm"
                    >
                      Add Item
                    </button>
                  </div>
                  <div className="space-y-4">
                    {formData.items.map((item, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-md">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">SKU</label>
                          <input
                            type="text"
                            required
                            value={item.sku}
                            onChange={(e) => updateItem(index, 'sku', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Name</label>
                          <input
                            type="text"
                            required
                            value={item.name}
                            onChange={(e) => updateItem(index, 'name', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Expected Qty</label>
                          <input
                            type="number"
                            required
                            value={item.expectedQuantity}
                            onChange={(e) => updateItem(index, 'expectedQuantity', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Actual Qty</label>
                          <input
                            type="number"
                            required
                            value={item.actualQuantity}
                            onChange={(e) => updateItem(index, 'actualQuantity', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Condition</label>
                          <select
                            required
                            value={item.condition}
                            onChange={(e) => updateItem(index, 'condition', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          >
                            {conditions.map(condition => (
                              <option key={condition} value={condition}>{condition.toUpperCase()}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-end space-x-2">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">Quality Score</label>
                            <input
                              type="number"
                              step="0.1"
                              required
                              value={item.qualityScore}
                              onChange={(e) => updateItem(index, 'qualityScore', e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          {formData.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="bg-red-600 hover:bg-red-700 text-white px-2 py-2 rounded-md text-sm"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    {editingCheck ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
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

export default QualityControl;