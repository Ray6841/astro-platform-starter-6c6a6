import type { APIRoute } from 'astro';

// Mock data for orders
let orders = [
  {
    id: 1,
    orderNumber: 'ORD-2024-001',
    customerName: 'ABC Corporation',
    customerEmail: 'orders@abccorp.com',
    customerPhone: '+1-555-0101',
    shippingAddress: '123 Business St, Corporate City, CC 12345',
    status: 'pending',
    priority: 'high',
    orderDate: '2024-01-15T09:00:00Z',
    requestedShipDate: '2024-01-20T17:00:00Z',
    items: [
      {
        id: 1,
        sku: 'SKU-001',
        name: 'Laptop Computer',
        quantity: 5,
        unitPrice: 899.99,
        totalPrice: 4499.95
      },
      {
        id: 2,
        sku: 'SKU-002',
        name: 'Office Chair',
        quantity: 10,
        unitPrice: 299.99,
        totalPrice: 2999.90
      }
    ],
    totalAmount: 7499.85,
    warehouseId: 1,
    assignedTo: 'John Worker',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z'
  },
  {
    id: 2,
    orderNumber: 'ORD-2024-002',
    customerName: 'XYZ Industries',
    customerEmail: 'purchasing@xyzind.com',
    customerPhone: '+1-555-0202',
    shippingAddress: '456 Industrial Ave, Factory Town, FT 67890',
    status: 'processing',
    priority: 'medium',
    orderDate: '2024-01-16T10:30:00Z',
    requestedShipDate: '2024-01-25T17:00:00Z',
    items: [
      {
        id: 3,
        sku: 'SKU-003',
        name: 'Wireless Mouse',
        quantity: 50,
        unitPrice: 49.99,
        totalPrice: 2499.50
      }
    ],
    totalAmount: 2499.50,
    warehouseId: 2,
    assignedTo: 'Sarah Worker',
    createdAt: '2024-01-16T10:30:00Z',
    updatedAt: '2024-01-16T10:30:00Z'
  }
];

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const status = url.searchParams.get('status');
    const warehouseId = url.searchParams.get('warehouseId');

    if (id) {
      const order = orders.find(o => o.id === parseInt(id));
      if (!order) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Order not found'
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify({
        success: true,
        data: order
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let filteredOrders = orders;

    if (status) {
      filteredOrders = filteredOrders.filter(o => o.status === status);
    }

    if (warehouseId) {
      filteredOrders = filteredOrders.filter(o => o.warehouseId === parseInt(warehouseId));
    }

    return new Response(JSON.stringify({
      success: true,
      data: filteredOrders
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
    const newOrder = {
      id: orders.length + 1,
      orderNumber: `ORD-2024-${String(orders.length + 1).padStart(3, '0')}`,
      ...body,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    orders.push(newOrder);
    
    return new Response(JSON.stringify({
      success: true,
      data: newOrder
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
    
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Order not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    orders[index] = {
      ...orders[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    return new Response(JSON.stringify({
      success: true,
      data: orders[index]
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
        message: 'Order ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const index = orders.findIndex(o => o.id === parseInt(id));
    if (index === -1) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Order not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    orders.splice(index, 1);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Order deleted successfully'
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