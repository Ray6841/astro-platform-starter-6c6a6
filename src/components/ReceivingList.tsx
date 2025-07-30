import React, { useState, useEffect } from 'react';

interface ReceivingItem {
  id: number;
  sku: string;
  name: string;
  expectedQuantity: number;
  receivedQuantity: number;
  damagedQuantity: number;
  location: string;
  notes: string;
}

interface ReceivingOrder {
  id: number;
  asnNumber: string;
  poNumber: string;
  supplier: string;
  expectedArrival: string;
  actualArrival: string | null;
  status: 'scheduled' | 'in_transit' | 'received' | 'putaway_complete';
  warehouseId: number;
  dockNumber: string;
  carrier: string;
  items: ReceivingItem[];
  totalItems: number;
  receivedItems: number;
  damagedItems: number;
  receivedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

const ReceivingList: React.FC = () => {
  const [receivingOrders, setReceivingOrders] = useState<ReceivingOrder[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ReceivingOrder | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState('');
  const [formData, setFormData] = useState({
    poNumber: '',
    supplier: '',
    expectedArrival: '',
    warehouseId: '',
    dockNumber: '',
    carrier: '',
    items: [{ sku: '', name: '', expectedQuantity: '', receivedQuantity: '0', damagedQuantity: '0', location: '', notes: '' }]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [receivingResponse, warehousesResponse] = await Promise.all([
        fetch('/api/receiving'),
        fetch('/api/warehouses')
      ]);
      
      const receivingData = await receivingResponse.json();
      const warehousesData = await warehousesResponse.json();
      
      if (receivingData.success) {
        setReceivingOrders(receivingData.data);
      }
      if (warehousesData.success) {
        setWarehouses(warehousesData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingOrder ? `/api/receiving` : '/api/receiving';
      const method = editingOrder ? 'PUT' : 'POST';
      
      const items = formData.items.map(item => ({
        ...item,
        expectedQuantity: parseInt(item.expectedQuantity),
        receivedQuantity: parseInt(item.receivedQuantity),
        damagedQuantity: parseInt(item.damagedQuantity)
      }));
      
      const totalItems = items.reduce((sum, item) => sum + item.expectedQuantity, 0);
      const receivedItems = items.reduce((sum, item) => sum + item.receivedQuantity, 0);
      const damagedItems = items.reduce((sum, item) => sum + item.damagedQuantity, 0);
      
      const body = editingOrder 
        ? { ...formData, id: editingOrder.id, items, totalItems, receivedItems, damagedItems }
        : { ...formData, items, totalItems, receivedItems, damagedItems };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (data.success) {
        setShowModal(false);
        setEditingOrder(null);
        resetForm();
        fetchData();
      }
    } catch (error) {
      console.error('Error saving receiving order:', error);
    }
  };

  const handleEdit = (order: ReceivingOrder) => {
    setEditingOrder(order);
    setFormData({
      poNumber: order.poNumber,
      supplier: order.supplier,
      expectedArrival: order.expectedArrival.split('T')[0],
      warehouseId: order.warehouseId.toString(),
      dockNumber: order.dockNumber,
      carrier: order.carrier,
      items: order.items.map(item => ({
        sku: item.sku,
        name: item.name,
        expectedQuantity: item.expectedQuantity.toString(),
        receivedQuantity: item.receivedQuantity.toString(),
        damagedQuantity: item.damagedQuantity.toString(),
        location: item.location,
        notes: item.notes
      }))
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this receiving order?')) {
      try {
        const response = await fetch(`/api/receiving?id=${id}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (data.success) {
          fetchData();
        }
      } catch (error) {
        console.error('Error deleting receiving order:', error);
      }
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch('/api/receiving', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      const data = await response.json();
      if (data.success) {
        fetchData();
      }
    } catch (error) {
      console.error('Error updating receiving order status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      poNumber: '',
      supplier: '',
      expectedArrival: '',
      warehouseId: '',
      dockNumber: '',
      carrier: '',
      items: [{ sku: '', name: '', expectedQuantity: '', receivedQuantity: '0', damagedQuantity: '0', location: '', notes: '' }]
    });
  };

  const openNewModal = () => {
    setEditingOrder(null);
    resetForm();
    setShowModal(true);
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { sku: '', name: '', expectedQuantity: '', receivedQuantity: '0', damagedQuantity: '0', location: '', notes: '' }]
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

  const getFilteredOrders = () => {
    let filtered = receivingOrders;
    
    if (filterStatus) {
      filtered = filtered.filter(order => order.status === filterStatus);
    }
    
    if (filterWarehouse) {
      filtered = filtered.filter(order => order.warehouseId === parseInt(filterWarehouse));
    }
    
    return filtered;
  };

  const getWarehouseName = (warehouseId: number) => {
    const warehouse = warehouses.find(w => w.id === warehouseId);
    return warehouse ? warehouse.name : 'Unknown';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_transit': return 'bg-yellow-100 text-yellow-800';
      case 'received': return 'bg-green-100 text-green-800';
      case 'putaway_complete': return 'bg-purple-100 text-purple-800';
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

  const filteredOrders = getFilteredOrders();
  const statuses = ['scheduled', 'in_transit', 'received', 'putaway_complete'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Receiving Operations</h1>
          <p className="mt-2 text-gray-600">Manage inbound shipments and ASN processing</p>
        </div>
        <button
          onClick={openNewModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Create ASN
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              onClick={() => { setFilterStatus(''); setFilterWarehouse(''); }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Receiving Orders Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{order.asnNumber}</h3>
                <p className="text-sm text-gray-500">PO: {order.poNumber}</p>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                {order.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span><strong>Supplier:</strong></span>
                <span>{order.supplier}</span>
              </div>
              <div className="flex justify-between">
                <span><strong>Warehouse:</strong></span>
                <span>{getWarehouseName(order.warehouseId)}</span>
              </div>
              <div className="flex justify-between">
                <span><strong>Dock:</strong></span>
                <span>{order.dockNumber}</span>
              </div>
              <div className="flex justify-between">
                <span><strong>Carrier:</strong></span>
                <span>{order.carrier}</span>
              </div>
              <div className="flex justify-between">
                <span><strong>Expected Arrival:</strong></span>
                <span>{new Date(order.expectedArrival).toLocaleDateString()}</span>
              </div>
              {order.actualArrival && (
                <div className="flex justify-between">
                  <span><strong>Actual Arrival:</strong></span>
                  <span>{new Date(order.actualArrival).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span><strong>Items:</strong></span>
                <span>{order.totalItems} expected, {order.receivedItems} received</span>
              </div>
              {order.damagedItems > 0 && (
                <div className="flex justify-between text-red-600">
                  <span><strong>Damaged:</strong></span>
                  <span>{order.damagedItems} items</span>
                </div>
              )}
              {order.receivedBy && (
                <div className="flex justify-between">
                  <span><strong>Received By:</strong></span>
                  <span>{order.receivedBy}</span>
                </div>
              )}
            </div>

            <div className="mt-6 flex space-x-3">
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                className={`flex-1 text-sm font-semibold rounded-md px-3 py-2 border-0 ${getStatusColor(order.status)}`}
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status.replace('_', ' ').toUpperCase()}</option>
                ))}
              </select>
              <button
                onClick={() => handleEdit(order)}
                className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-2 rounded-md text-sm font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(order.id)}
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
                {editingOrder ? 'Edit Receiving Order' : 'Create New ASN'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">PO Number</label>
                    <input
                      type="text"
                      required
                      value={formData.poNumber}
                      onChange={(e) => setFormData({ ...formData, poNumber: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Supplier</label>
                    <input
                      type="text"
                      required
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Expected Arrival</label>
                    <input
                      type="date"
                      required
                      value={formData.expectedArrival}
                      onChange={(e) => setFormData({ ...formData, expectedArrival: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
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
                    <label className="block text-sm font-medium text-gray-700">Dock Number</label>
                    <input
                      type="text"
                      required
                      value={formData.dockNumber}
                      onChange={(e) => setFormData({ ...formData, dockNumber: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Carrier</label>
                    <input
                      type="text"
                      required
                      value={formData.carrier}
                      onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Receiving Items */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-medium text-gray-900">Receiving Items</h4>
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
                          <label className="block text-sm font-medium text-gray-700">Received Qty</label>
                          <input
                            type="number"
                            value={item.receivedQuantity}
                            onChange={(e) => updateItem(index, 'receivedQuantity', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Damaged Qty</label>
                          <input
                            type="number"
                            value={item.damagedQuantity}
                            onChange={(e) => updateItem(index, 'damagedQuantity', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="flex items-end space-x-2">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">Location</label>
                            <input
                              type="text"
                              value={item.location}
                              onChange={(e) => updateItem(index, 'location', e.target.value)}
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

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    {editingOrder ? 'Update' : 'Create'}
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

export default ReceivingList;