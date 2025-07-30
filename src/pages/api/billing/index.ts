import type { APIRoute } from 'astro';

// Mock data for billing records
let billingRecords = [
  {
    id: 1,
    invoiceNumber: 'INV-2024-001',
    customerName: 'ABC Corporation',
    customerId: 'CUST-001',
    billingPeriod: '2024-01-01 to 2024-01-31',
    invoiceDate: '2024-02-01T00:00:00Z',
    dueDate: '2024-02-15T00:00:00Z',
    status: 'pending',
    warehouseId: 1,
    items: [
      {
        id: 1,
        description: 'Storage - Laptop Computer (150 units)',
        quantity: 150,
        unitPrice: 2.50,
        totalPrice: 375.00,
        category: 'storage'
      },
      {
        id: 2,
        description: 'Handling - Order processing (5 orders)',
        quantity: 5,
        unitPrice: 15.00,
        totalPrice: 75.00,
        category: 'handling'
      },
      {
        id: 3,
        description: 'Value-added services - Special packaging',
        quantity: 1,
        unitPrice: 50.00,
        totalPrice: 50.00,
        category: 'value_added'
      }
    ],
    subtotal: 500.00,
    tax: 50.00,
    total: 550.00,
    notes: 'Monthly billing for January 2024',
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: '2024-02-01T09:00:00Z'
  },
  {
    id: 2,
    invoiceNumber: 'INV-2024-002',
    customerName: 'XYZ Industries',
    customerId: 'CUST-002',
    billingPeriod: '2024-01-01 to 2024-01-31',
    invoiceDate: '2024-02-01T00:00:00Z',
    dueDate: '2024-02-15T00:00:00Z',
    status: 'paid',
    warehouseId: 2,
    items: [
      {
        id: 4,
        description: 'Storage - Wireless Mouse (300 units)',
        quantity: 300,
        unitPrice: 1.00,
        totalPrice: 300.00,
        category: 'storage'
      },
      {
        id: 5,
        description: 'Handling - Order processing (2 orders)',
        quantity: 2,
        unitPrice: 15.00,
        totalPrice: 30.00,
        category: 'handling'
      }
    ],
    subtotal: 330.00,
    tax: 33.00,
    total: 363.00,
    notes: 'Monthly billing for January 2024',
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: '2024-02-01T09:00:00Z'
  }
];

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const status = url.searchParams.get('status');
    const customerId = url.searchParams.get('customerId');
    const warehouseId = url.searchParams.get('warehouseId');

    if (id) {
      const billingRecord = billingRecords.find(b => b.id === parseInt(id));
      if (!billingRecord) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Billing record not found'
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify({
        success: true,
        data: billingRecord
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let filteredRecords = billingRecords;

    if (status) {
      filteredRecords = filteredRecords.filter(b => b.status === status);
    }

    if (customerId) {
      filteredRecords = filteredRecords.filter(b => b.customerId === customerId);
    }

    if (warehouseId) {
      filteredRecords = filteredRecords.filter(b => b.warehouseId === parseInt(warehouseId));
    }

    return new Response(JSON.stringify({
      success: true,
      data: filteredRecords
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
    const newBillingRecord = {
      id: billingRecords.length + 1,
      invoiceNumber: `INV-2024-${String(billingRecords.length + 1).padStart(3, '0')}`,
      ...body,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    billingRecords.push(newBillingRecord);
    
    return new Response(JSON.stringify({
      success: true,
      data: newBillingRecord
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
    
    const index = billingRecords.findIndex(b => b.id === id);
    if (index === -1) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Billing record not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    billingRecords[index] = {
      ...billingRecords[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    return new Response(JSON.stringify({
      success: true,
      data: billingRecords[index]
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
        message: 'Billing record ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const index = billingRecords.findIndex(b => b.id === parseInt(id));
    if (index === -1) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Billing record not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    billingRecords.splice(index, 1);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Billing record deleted successfully'
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