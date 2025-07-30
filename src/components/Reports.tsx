import React, { useState, useEffect } from 'react';

interface KPI {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: string;
  color: string;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
  }[];
}

const Reports: React.FC = () => {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [billing, setBilling] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [warehousesResponse, inventoryResponse, ordersResponse, tasksResponse, billingResponse] = await Promise.all([
        fetch('/api/warehouses'),
        fetch('/api/inventory'),
        fetch('/api/orders'),
        fetch('/api/tasks'),
        fetch('/api/billing')
      ]);
      
      const warehousesData = await warehousesResponse.json();
      const inventoryData = await inventoryResponse.json();
      const ordersData = await ordersResponse.json();
      const tasksData = await tasksResponse.json();
      const billingData = await billingResponse.json();
      
      if (warehousesData.success) setWarehouses(warehousesData.data);
      if (inventoryData.success) setInventory(inventoryData.data);
      if (ordersData.success) setOrders(ordersData.data);
      if (tasksData.success) setTasks(tasksData.data);
      if (billingData.success) setBilling(billingData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateKPIs = (): KPI[] => {
    const totalWarehouses = warehouses.length;
    const totalInventory = inventory.length;
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const activeTasks = tasks.filter(task => task.status === 'in_progress').length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const totalBilling = billing.reduce((sum, record) => sum + record.total, 0);
    const paidBilling = billing.filter(record => record.status === 'paid').reduce((sum, record) => sum + record.total, 0);

    return [
      {
        title: 'Total Warehouses',
        value: totalWarehouses,
        change: 0,
        changeType: 'increase',
        icon: '🏢',
        color: 'bg-blue-500'
      },
      {
        title: 'Total Inventory Items',
        value: totalInventory,
        change: 5.2,
        changeType: 'increase',
        icon: '📦',
        color: 'bg-green-500'
      },
      {
        title: 'Pending Orders',
        value: pendingOrders,
        change: -2.1,
        changeType: 'decrease',
        icon: '📋',
        color: 'bg-yellow-500'
      },
      {
        title: 'Active Tasks',
        value: activeTasks,
        change: 8.3,
        changeType: 'increase',
        icon: '⚡',
        color: 'bg-purple-500'
      },
      {
        title: 'Task Completion Rate',
        value: `${Math.round((completedTasks / (completedTasks + activeTasks)) * 100)}%`,
        change: 3.7,
        changeType: 'increase',
        icon: '✅',
        color: 'bg-indigo-500'
      },
      {
        title: 'Total Revenue',
        value: `$${totalBilling.toLocaleString()}`,
        change: 12.5,
        changeType: 'increase',
        icon: '💰',
        color: 'bg-emerald-500'
      },
      {
        title: 'Payment Rate',
        value: `${Math.round((paidBilling / totalBilling) * 100)}%`,
        change: 1.8,
        changeType: 'increase',
        icon: '💳',
        color: 'bg-pink-500'
      },
      {
        title: 'Average Order Value',
        value: `$${Math.round(totalBilling / totalOrders)}`,
        change: -1.2,
        changeType: 'decrease',
        icon: '📊',
        color: 'bg-orange-500'
      }
    ];
  };

  const getInventoryByCategory = () => {
    const categories = inventory.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: Object.keys(categories),
      datasets: [{
        label: 'Items by Category',
        data: Object.values(categories),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(236, 72, 153, 1)'
        ]
      }]
    };
  };

  const getOrderStatusDistribution = () => {
    const statuses = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: Object.keys(statuses).map(status => status.replace('_', ' ').toUpperCase()),
      datasets: [{
        label: 'Orders by Status',
        data: Object.values(statuses),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(107, 114, 128, 0.8)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(107, 114, 128, 1)'
        ]
      }]
    };
  };

  const getTaskTypeDistribution = () => {
    const types = tasks.reduce((acc, task) => {
      acc[task.type] = (acc[task.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: Object.keys(types).map(type => type.replace('_', ' ').toUpperCase()),
      datasets: [{
        label: 'Tasks by Type',
        data: Object.values(types),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(236, 72, 153, 1)'
        ]
      }]
    };
  };

  const getRecentActivity = () => {
    const allActivities = [
      ...orders.map(order => ({
        type: 'order',
        title: `Order ${order.orderNumber} created`,
        description: `${order.customerName} - ${order.items.length} items`,
        time: order.createdAt,
        status: order.status
      })),
      ...tasks.map(task => ({
        type: 'task',
        title: `Task ${task.taskNumber} assigned`,
        description: `${task.type} task to ${task.assignedTo || 'Unassigned'}`,
        time: task.createdAt,
        status: task.status
      })),
      ...billing.map(record => ({
        type: 'billing',
        title: `Invoice ${record.invoiceNumber} created`,
        description: `${record.customerName} - $${record.total}`,
        time: record.createdAt,
        status: record.status
      }))
    ];

    return allActivities
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 10);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const kpis = calculateKPIs();
  const recentActivity = getRecentActivity();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="mt-2 text-gray-600">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex space-x-4">
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Warehouses</option>
            {warehouses.map(warehouse => (
              <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
            ))}
          </select>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full ${kpi.color} flex items-center justify-center text-white text-sm font-medium`}>
                {kpi.icon}
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">{kpi.title}</p>
                <p className="text-2xl font-semibold text-gray-900">{kpi.value}</p>
              </div>
            </div>
            <div className="mt-4">
              <span className={`inline-flex items-center text-sm font-medium ${
                kpi.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {kpi.changeType === 'increase' ? '↗' : '↘'} {Math.abs(kpi.change)}%
              </span>
              <span className="text-sm text-gray-500 ml-1">from last period</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Inventory by Category */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Inventory by Category</h3>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-gray-500">Chart visualization would be implemented with Chart.js or similar library</p>
              <div className="mt-4 space-y-2">
                {getInventoryByCategory().labels.map((label, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{label}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {getInventoryByCategory().datasets[0].data[index]} items
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Order Status Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">📈</div>
              <p className="text-gray-500">Chart visualization would be implemented with Chart.js or similar library</p>
              <div className="mt-4 space-y-2">
                {getOrderStatusDistribution().labels.map((label, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{label}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {getOrderStatusDistribution().datasets[0].data[index]} orders
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Distribution and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Task Type Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Task Type Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">⚡</div>
              <p className="text-gray-500">Chart visualization would be implemented with Chart.js or similar library</p>
              <div className="mt-4 space-y-2">
                {getTaskTypeDistribution().labels.map((label, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{label}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {getTaskTypeDistribution().datasets[0].data[index]} tasks
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                  activity.type === 'order' ? 'bg-blue-500' :
                  activity.type === 'task' ? 'bg-green-500' : 'bg-purple-500'
                }`}>
                  {activity.type === 'order' ? '📋' : activity.type === 'task' ? '⚡' : '💰'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(activity.time).toLocaleString()}
                  </p>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  activity.status === 'completed' || activity.status === 'paid' ? 'bg-green-100 text-green-800' :
                  activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  activity.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {activity.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {Math.round((completedTasks / (completedTasks + activeTasks)) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Task Completion Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {Math.round((paidBilling / totalBilling) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Payment Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {Math.round(totalBilling / totalOrders)}
            </div>
            <div className="text-sm text-gray-600">Average Order Value ($)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;