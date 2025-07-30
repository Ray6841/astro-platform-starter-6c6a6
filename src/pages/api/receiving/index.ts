import type { APIRoute } from 'astro';

// Mock data for receiving operations
let receivingOrders = [
  {
    id: 1,
    asnNumber: 'ASN-2024-001',
    poNumber: 'PO-2024-001',
    supplier: 'TechCorp Inc.',
    expectedArrival: '2024-01-20T08:00:00Z',
    actualArrival: '2024-01-20T08:15:00Z',
    status: 'received',
    warehouseId: 1,
    dockNumber: 'DOCK-01',
    carrier: 'FastFreight Logistics',
    items: [
      {
        id: 1,
        sku: 'SKU-001',
        name: 'Laptop Computer',
        expectedQuantity: 100,
        receivedQuantity: 98,
        damagedQuantity: 2,
        location: 'A1-B2-C3',
        notes: '2 units damaged in transit'
      }
    ],
    totalItems: 100,
    receivedItems: 98,
    damagedItems: 2,
    receivedBy: 'John Receiver',
    createdAt: '2024-01-19T10:00:00Z',
    updatedAt: '2024-01-20T08:30:00Z'
  },
  {
    id: 2,
    asnNumber: 'ASN-2024-002',
    poNumber: 'PO-2024-002',
    supplier: 'OfficeFurniture Co.',
    expectedArrival: '2024-01-22T09:00:00Z',
    actualArrival: null,
    status: 'scheduled',
    warehouseId: 1,
    dockNumber: 'DOCK-02',
    carrier: 'Reliable Transport',
    items: [
      {
        id: 2,
        sku: 'SKU-002',
        name: 'Office Chair',
        expectedQuantity: 50,
        receivedQuantity: 0,
        damagedQuantity: 0,
        location: 'D4-E5-F6',
        notes: ''
      }
    ],
    totalItems: 50,
    receivedItems: 0,
    damagedItems: 0,
    receivedBy: null,
    createdAt: '2024-01-21T14:00:00Z',
    updatedAt: '2024-01-21T14:00:00Z'
  }
];

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const status = url.searchParams.get('status');
    const warehouseId = url.searchParams.get('warehouseId');

    if (id) {
      const receivingOrder = receivingOrders.find(r => r.id === parseInt(id));
      if (!receivingOrder) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Receiving order not found'
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify({
        success: true,
        data: receivingOrder
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let filteredOrders = receivingOrders;

    if (status) {
      filteredOrders = filteredOrders.filter(r => r.status === status);
    }

    if (warehouseId) {
      filteredOrders = filteredOrders.filter(r => r.warehouseId === parseInt(warehouseId));
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
    const newReceivingOrder = {
      id: receivingOrders.length + 1,
      asnNumber: `ASN-2024-${String(receivingOrders.length + 1).padStart(3, '0')}`,
      ...body,
      status: 'scheduled',
      actualArrival: null,
      receivedBy: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    receivingOrders.push(newReceivingOrder);
    
    return new Response(JSON.stringify({
      success: true,
      data: newReceivingOrder
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
    
    const index = receivingOrders.findIndex(r => r.id === id);
    if (index === -1) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Receiving order not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    receivingOrders[index] = {
      ...receivingOrders[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    return new Response(JSON.stringify({
      success: true,
      data: receivingOrders[index]
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
        message: 'Receiving order ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const index = receivingOrders.findIndex(r => r.id === parseInt(id));
    if (index === -1) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Receiving order not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    receivingOrders.splice(index, 1);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Receiving order deleted successfully'
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