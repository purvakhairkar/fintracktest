import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import path from 'path';

// DELETE /api/bills/[id] - Delete a bill (Admin only)
export async function DELETE(request, { params }) {
  try {
    const userRole = request.headers.get('x-user-role');

    // Check if user is admin
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Only admins can delete bills.' },
        { status: 403 }
      );
    }

    const id = parseInt(params.id);

    // Find the bill first to get file path
    const bill = await prisma.bill.findUnique({
      where: { id },
    });

    if (!bill) {
      return NextResponse.json(
        { error: 'Bill not found' },
        { status: 404 }
      );
    }

    // Delete the file
    try {
      const filePath = path.join(process.cwd(), 'public', bill.filePath);
      await unlink(filePath);
    } catch (fileError) {
      console.error('Error deleting file:', fileError);
      // Continue even if file deletion fails
    }

    // Delete the bill from database
    await prisma.bill.delete({
      where: { id },
    });

    return NextResponse.json(
      { success: true, message: 'Bill deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete bill error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
