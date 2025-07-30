import type { APIRoute } from 'astro';

// Mock data for tasks
let tasks = [
  {
    id: 1,
    taskNumber: 'TASK-2024-001',
    type: 'picking',
    priority: 'high',
    status: 'assigned',
    assignedTo: 'John Worker',
    warehouseId: 1,
    orderId: 1,
    location: 'A1-B2-C3',
    items: [
      {
        sku: 'SKU-001',
        name: 'Laptop Computer',
        quantity: 5,
        pickedQuantity: 0
      }
    ],
    estimatedDuration: 30,
    startTime: null,
    endTime: null,
    notes: 'Handle with care - fragile items',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    taskNumber: 'TASK-2024-002',
    type: 'replenishment',
    priority: 'medium',
    status: 'pending',
    assignedTo: null,
    warehouseId: 1,
    orderId: null,
    location: 'D4-E5-F6',
    items: [
      {
        sku: 'SKU-002',
        name: 'Office Chair',
        quantity: 10,
        pickedQuantity: 0
      }
    ],
    estimatedDuration: 45,
    startTime: null,
    endTime: null,
    notes: 'Move from bulk storage to picking area',
    createdAt: '2024-01-15T11:00:00Z',
    updatedAt: '2024-01-15T11:00:00Z'
  },
  {
    id: 3,
    taskNumber: 'TASK-2024-003',
    type: 'cycle_count',
    priority: 'low',
    status: 'completed',
    assignedTo: 'Sarah Worker',
    warehouseId: 2,
    orderId: null,
    location: 'G7-H8-I9',
    items: [
      {
        sku: 'SKU-003',
        name: 'Wireless Mouse',
        quantity: 300,
        pickedQuantity: 300
      }
    ],
    estimatedDuration: 60,
    startTime: '2024-01-15T14:00:00Z',
    endTime: '2024-01-15T15:00:00Z',
    notes: 'Annual cycle count completed',
    createdAt: '2024-01-15T13:00:00Z',
    updatedAt: '2024-01-15T15:00:00Z'
  }
];

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const status = url.searchParams.get('status');
    const type = url.searchParams.get('type');
    const warehouseId = url.searchParams.get('warehouseId');
    const assignedTo = url.searchParams.get('assignedTo');

    if (id) {
      const task = tasks.find(t => t.id === parseInt(id));
      if (!task) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Task not found'
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify({
        success: true,
        data: task
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let filteredTasks = tasks;

    if (status) {
      filteredTasks = filteredTasks.filter(t => t.status === status);
    }

    if (type) {
      filteredTasks = filteredTasks.filter(t => t.type === type);
    }

    if (warehouseId) {
      filteredTasks = filteredTasks.filter(t => t.warehouseId === parseInt(warehouseId));
    }

    if (assignedTo) {
      filteredTasks = filteredTasks.filter(t => t.assignedTo === assignedTo);
    }

    return new Response(JSON.stringify({
      success: true,
      data: filteredTasks
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const newTask = {
      id: tasks.length + 1,
      taskNumber: `TASK-2024-${String(tasks.length + 1).padStart(3, '0')}`,
      ...body,
      status: 'pending',
      startTime: null,
      endTime: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    
    return new Response(JSON.stringify({
      success: true,
      data: newTask
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Task not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    tasks[index] = {
      ...tasks[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    return new Response(JSON.stringify({
      success: true,
      data: tasks[index]
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Task ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const index = tasks.findIndex(t => t.id === parseInt(id));
    if (index === -1) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Task not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    tasks.splice(index, 1);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Task deleted successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};