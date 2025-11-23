import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// GET /api/bills - List all bills with filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};

    if (category && category !== 'all') {
      where.category = category;
    }

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.timestamp.lte = end;
      }
    }

    // Fetch bills with pagination
    const [bills, total] = await Promise.all([
      prisma.bill.findMany({
        where,
        include: {
          createdBy: {
            select: {
              id: true,
              username: true,
              role: true,
            },
          },
          items: true,
        },
        orderBy: {
          timestamp: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.bill.count({ where }),
    ]);

    return NextResponse.json(
      {
        bills,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get bills error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/bills - Create a new bill (Admin only)
export async function POST(request) {
  try {
    const userRole = request.headers.get('x-user-role');
    const userId = request.headers.get('x-user-id');

    // Check if user is admin
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Only admins can create bills.' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const category = formData.get('category');
    const description = formData.get('description') || '';
    const gstPercentage = parseFloat(formData.get('gstPercentage') || '0');
    const itemsJson = formData.get('items');
    const file = formData.get('file');

    // Validation
    if (!category || !itemsJson || !file) {
      return NextResponse.json(
        { error: 'All required fields must be filled' },
        { status: 400 }
      );
    }

    // Parse items
    let items;
    try {
      items = JSON.parse(itemsJson);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid items data' },
        { status: 400 }
      );
    }

    // Validate items
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'At least one item is required' },
        { status: 400 }
      );
    }

    // Calculate amounts
    const subtotal = items.reduce((sum, item) => {
      const itemSubtotal = parseFloat(item.pieces) * parseFloat(item.pricePerUnit);
      return sum + itemSubtotal;
    }, 0);

    const gstAmount = (subtotal * gstPercentage) / 100;
    const totalAmount = subtotal + gstAmount;

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadsDir, fileName);
    await writeFile(filePath, buffer);

    // Create bill with items in database
    const bill = await prisma.bill.create({
      data: {
        subtotal,
        gstPercentage,
        gstAmount,
        totalAmount,
        category,
        description,
        filePath: `/uploads/${fileName}`,
        createdById: parseInt(userId),
        items: {
          create: items.map(item => ({
            itemName: item.itemName,
            pieces: parseInt(item.pieces),
            pricePerUnit: parseFloat(item.pricePerUnit),
            subtotal: parseInt(item.pieces) * parseFloat(item.pricePerUnit),
          })),
        },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
        items: true,
      },
    });

    return NextResponse.json(
      { success: true, bill },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create bill error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
