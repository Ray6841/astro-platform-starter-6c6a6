import type { APIRoute } from 'astro';

// Mock data for warehouses
let warehouses = [
  {
    id: 1,
    name: 'Main Distribution Center',
    code: 'MDC-001',
    address: '123 Warehouse Blvd, Industrial City, IC 12345',
    capacity: 50000,
    status: 'active',
    manager: 'John Smith',
    phone: '+1-555-0123',
    email: 'john.smith@company.com',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    name: 'Secondary Storage Facility',
    code: 'SSF-002',
    address: '456 Storage Ave, Business District, BD 67890',
    capacity: 25000,
    status: 'active',
    manager: 'Sarah Johnson',
    phone: '+1-555-0456',
    email: 'sarah.johnson@company.com',
    createdAt: '2024-01-20T14:30:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  }
];

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (id) {
      const warehouse = warehouses.find(w => w.id === parseInt(id));
      if (!warehouse) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Warehouse not found'
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify({
        success: true,
        data: warehouse
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: warehouses
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
    const newWarehouse = {
      id: warehouses.length + 1,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    warehouses.push(newWarehouse);
    
    return new Response(JSON.stringify({
      success: true,
      data: newWarehouse
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
    
    const index = warehouses.findIndex(w => w.id === id);
    if (index === -1) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Warehouse not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    warehouses[index] = {
      ...warehouses[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    return new Response(JSON.stringify({
      success: true,
      data: warehouses[index]
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
        message: 'Warehouse ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const index = warehouses.findIndex(w => w.id === parseInt(id));
    if (index === -1) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Warehouse not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    warehouses.splice(index, 1);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Warehouse deleted successfully'
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