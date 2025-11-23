import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch all bills with items
    const bills = await prisma.bill.findMany({
      include: {
        items: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    // Calculate total expenses
    const totalExpense = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);

    // Group by category
    const categoryData = bills.reduce((acc, bill) => {
      if (!acc[bill.category]) {
        acc[bill.category] = 0;
      }
      acc[bill.category] += bill.totalAmount;
      return acc;
    }, {});

    // Format for pie chart
    const categoryChartData = Object.entries(categoryData).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
    }));

    // Find biggest category
    const biggestCategory = categoryChartData.length > 0
      ? categoryChartData.reduce((max, cat) => cat.value > max.value ? cat : max)
      : null;

    // Group by month
    const monthData = bills.reduce((acc, bill) => {
      const date = new Date(bill.timestamp);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleString('default', { month: 'short', year: 'numeric' });

      if (!acc[monthYear]) {
        acc[monthYear] = {
          month: monthName,
          amount: 0,
        };
      }
      acc[monthYear].amount += bill.totalAmount;
      return acc;
    }, {});

    // Format for bar chart and sort by date
    const monthChartData = Object.entries(monthData)
      .map(([key, data]) => ({
        month: data.month,
        amount: parseFloat(data.amount.toFixed(2)),
      }))
      .sort((a, b) => {
        const [yearA, monthA] = a.month.split(' ');
        const [yearB, monthB] = b.month.split(' ');
        const dateA = new Date(`${monthA} 1, ${yearA}`);
        const dateB = new Date(`${monthB} 1, ${yearB}`);
        return dateA - dateB;
      });

    // Get recent bills (last 5)
    const recentBills = bills.slice(0, 5).map(bill => {
      const itemCount = bill.items?.length || 0;
      const itemSummary = itemCount === 1
        ? bill.items[0].itemName
        : `${itemCount} items`;

      return {
        id: bill.id,
        item: itemSummary,
        category: bill.category,
        totalAmount: bill.totalAmount,
        timestamp: bill.timestamp,
      };
    });

    return NextResponse.json(
      {
        totalExpense: parseFloat(totalExpense.toFixed(2)),
        biggestCategory: biggestCategory ? {
          name: biggestCategory.name,
          value: biggestCategory.value,
        } : null,
        categoryData: categoryChartData,
        monthData: monthChartData,
        recentBills,
        totalBills: bills.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
