import type { APIRoute } from 'astro';

// Mock data for inventory items
let inventoryItems = [
  {
    id: 1,
    sku: 'SKU-001',
    name: 'Laptop Computer',
    description: 'High-performance laptop for business use',
    category: 'Electronics',
    warehouseId: 1,
    location: 'A1-B2-C3',
    quantity: 150,
    unitCost: 899.99,
    reorderPoint: 20,
    maxStock: 200,
    supplier: 'TechCorp Inc.',
    lotNumber: 'LOT-2024-001',
    expiryDate: '2025-12-31',
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    sku: 'SKU-002',
    name: 'Office Chair',
    description: 'Ergonomic office chair with lumbar support',
    category: 'Furniture',
    warehouseId: 1,
    location: 'D4-E5-F6',
    quantity: 75,
    unitCost: 299.99,
    reorderPoint: 15,
    maxStock: 100,
    supplier: 'OfficeFurniture Co.',
    lotNumber: 'LOT-2024-002',
    expiryDate: null,
    status: 'active',
    createdAt: '2024-01-16T11:00:00Z',
    updatedAt: '2024-01-16T11:00:00Z'
  },
  {
    id: 3,
    sku: 'SKU-003',
    name: 'Wireless Mouse',
    description: 'Bluetooth wireless mouse with precision tracking',
    category: 'Electronics',
    warehouseId: 2,
    location: 'G7-H8-I9',
    quantity: 300,
    unitCost: 49.99,
    reorderPoint: 50,
    maxStock: 500,
    supplier: 'TechCorp Inc.',
    lotNumber: 'LOT-2024-003',
    expiryDate: '2026-06-30',
    status: 'active',
    createdAt: '2024-01-17T12:00:00Z',
    updatedAt: '2024-01-17T12:00:00Z'
  }
];

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const warehouseId = url.searchParams.get('warehouseId');
    const category = url.searchParams.get('category');

    if (id) {
      const item = inventoryItems.find(i => i.id === parseInt(id));
      if (!item) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Inventory item not found'
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify({
        success: true,
        data: item
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let filteredItems = inventoryItems;

    if (warehouseId) {
      filteredItems = filteredItems.filter(i => i.warehouseId === parseInt(warehouseId));
    }

    if (category) {
      filteredItems = filteredItems.filter(i => i.category === category);
    }

    return new Response(JSON.stringify({
      success: true,
      data: filteredItems
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
    const newItem = {
      id: inventoryItems.length + 1,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    inventoryItems.push(newItem);
    
    return new Response(JSON.stringify({
      success: true,
      data: newItem
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
    
    const index = inventoryItems.findIndex(i => i.id === id);
    if (index === -1) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Inventory item not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    inventoryItems[index] = {
      ...inventoryItems[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    return new Response(JSON.stringify({
      success: true,
      data: inventoryItems[index]
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
        message: 'Inventory item ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const index = inventoryItems.findIndex(i => i.id === parseInt(id));
    if (index === -1) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Inventory item not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    inventoryItems.splice(index, 1);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Inventory item deleted successfully'
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