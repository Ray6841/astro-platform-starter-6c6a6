import React, { useState, useEffect } from 'react';

interface DashboardStats {
  totalWarehouses: number;
  totalInventory: number;
  pendingOrders: number;
  activeTasks: number;
  totalValue: number;
  ordersToday: number;
  tasksCompleted: number;
  accuracy: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalWarehouses: 0,
    totalInventory: 0,
    pendingOrders: 0,
    activeTasks: 0,
    totalValue: 0,
    ordersToday: 0,
    tasksCompleted: 0,
    accuracy: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);

  useEffect(() => {
    // Fetch dashboard data
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch warehouses
      const warehousesResponse = await fetch('/api/warehouses');
      const warehousesData = await warehousesResponse.json();
      
      // Fetch inventory
      const inventoryResponse = await fetch('/api/inventory');
      const inventoryData = await inventoryResponse.json();
      
      // Fetch orders
      const ordersResponse = await fetch('/api/orders');
      const ordersData = await ordersResponse.json();
      
      // Fetch tasks
      const tasksResponse = await fetch('/api/tasks');
      const tasksData = await tasksResponse.json();

      // Calculate stats
      const totalValue = inventoryData.data?.reduce((sum: number, item: any) => 
        sum + (item.quantity * item.unitCost), 0) || 0;
      
      const pendingOrders = ordersData.data?.filter((order: any) => 
        order.status === 'pending').length || 0;
      
      const activeTasks = tasksData.data?.filter((task: any) => 
        task.status === 'assigned' || task.status === 'in_progress').length || 0;

      setStats({
        totalWarehouses: warehousesData.data?.length || 0,
        totalInventory: inventoryData.data?.length || 0,
        pendingOrders,
        activeTasks,
        totalValue,
        ordersToday: Math.floor(Math.random() * 10) + 5, // Mock data
        tasksCompleted: Math.floor(Math.random() * 20) + 15, // Mock data
        accuracy: 98.5, // Mock data
      });

      setRecentOrders(ordersData.data?.slice(0, 5) || []);
      setRecentTasks(tasksData.data?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color }: any) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 rounded-md flex items-center justify-center ${color}`}>
              <span className="text-white text-lg">{icon}</span>
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-lg font-medium text-gray-900">{value}</dd>
              {subtitle && <dd className="text-sm text-gray-500">{subtitle}</dd>}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Warehouse Management System Overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Warehouses"
          value={stats.totalWarehouses}
          subtitle="Active facilities"
          icon="🏢"
          color="bg-blue-500"
        />
        <StatCard
          title="Total Inventory"
          value={stats.totalInventory}
          subtitle="SKUs managed"
          icon="📦"
          color="bg-green-500"
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          subtitle="Awaiting fulfillment"
          icon="📋"
          color="bg-yellow-500"
        />
        <StatCard
          title="Active Tasks"
          value={stats.activeTasks}
          subtitle="In progress"
          icon="✅"
          color="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Value"
          value={`$${stats.totalValue.toLocaleString()}`}
          subtitle="Inventory value"
          icon="💰"
          color="bg-indigo-500"
        />
        <StatCard
          title="Orders Today"
          value={stats.ordersToday}
          subtitle="Processed today"
          icon="📈"
          color="bg-pink-500"
        />
        <StatCard
          title="Tasks Completed"
          value={stats.tasksCompleted}
          subtitle="This week"
          icon="🎯"
          color="bg-teal-500"
        />
        <StatCard
          title="Accuracy Rate"
          value={`${stats.accuracy}%`}
          subtitle="Pick accuracy"
          icon="🎯"
          color="bg-orange-500"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Orders
            </h3>
            <div className="space-y-4">
              {recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">{order.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">${order.totalAmount}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Tasks
            </h3>
            <div className="space-y-4">
              {recentTasks.map((task: any) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{task.taskNumber}</p>
                    <p className="text-sm text-gray-500">{task.type} - {task.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{task.assignedTo || 'Unassigned'}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      task.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                      task.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                      task.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <a
              href="/orders/new"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <span className="text-2xl mb-2">📋</span>
              <span className="text-sm font-medium text-gray-900">New Order</span>
            </a>
            <a
              href="/receiving/new"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <span className="text-2xl mb-2">📥</span>
              <span className="text-sm font-medium text-gray-900">Receive Items</span>
            </a>
            <a
              href="/tasks/new"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <span className="text-2xl mb-2">✅</span>
              <span className="text-sm font-medium text-gray-900">Create Task</span>
            </a>
            <a
              href="/inventory/new"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <span className="text-2xl mb-2">📦</span>
              <span className="text-sm font-medium text-gray-900">Add Inventory</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;