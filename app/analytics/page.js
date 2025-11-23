'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Navbar from '@/components/Navbar';
import Loading from '@/components/Loading';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, DollarSign, FileText, BarChart3, PieChartIcon } from 'lucide-react';

const fetcher = (url) => fetch(url).then((res) => res.json());

const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'
];

export default function AnalyticsPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(console.error);
  }, []);

  const { data, error, isLoading } = useSWR('/api/analytics/summary', fetcher);

  if (!user) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar user={user} />

      <div className="container mx-auto px-4 py-8">
        <Card className="shadow-xl border-0 mb-8">
          <CardHeader className="space-y-1 bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-600 rounded-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-3xl">Analytics Dashboard</CardTitle>
            </div>
            <CardDescription className="text-base">
              View your spending insights and financial analytics
            </CardDescription>
          </CardHeader>
        </Card>

        {isLoading ? (
          <Loading />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">Error loading analytics</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold opacity-90">Total Expenses</h3>
                    <DollarSign className="w-8 h-8 opacity-80" />
                  </div>
                  <p className="text-4xl font-bold">${data?.totalExpense?.toFixed(2) || '0.00'}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold opacity-90">Total Bills</h3>
                    <FileText className="w-8 h-8 opacity-80" />
                  </div>
                  <p className="text-4xl font-bold">{data?.totalBills || 0}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold opacity-90">Biggest Category</h3>
                    <TrendingUp className="w-8 h-8 opacity-80" />
                  </div>
                  <p className="text-xl font-bold truncate">{data?.biggestCategory?.name || 'N/A'}</p>
                  <p className="text-2xl font-bold">${data?.biggestCategory?.value?.toFixed(2) || '0.00'}</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="shadow-xl border-0">
                <CardHeader className="space-y-1 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <PieChartIcon className="w-4 h-4 text-white" />
                    </div>
                    <CardTitle className="text-xl">Expenses by Category</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {data?.categoryData && data.categoryData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={data.categoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {data.categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        {data?.categoryData?.map((item, index) => (
                          <div key={index} className="flex items-center text-sm">
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-slate-700 truncate">{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-muted-foreground py-12">No data available</div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0">
                <CardHeader className="space-y-1 bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-600 rounded-lg">
                      <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                    <CardTitle className="text-xl">Monthly Expenses</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {data?.monthData && data.monthData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={data.monthData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                        <Legend />
                        <Bar dataKey="amount" fill="#3b82f6" name="Expenses" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center text-muted-foreground py-12">No data available</div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Bills Table */}
            <Card className="shadow-xl border-0">
              <CardHeader className="space-y-1 bg-gradient-to-r from-violet-50 to-purple-50 border-b">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-violet-600 rounded-lg">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <CardTitle className="text-xl">Recent Bills</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {data?.recentBills && data.recentBills.length > 0 ? (
                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead>ID</TableHead>
                          <TableHead>Item</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.recentBills.map((bill) => (
                          <TableRow key={bill.id}>
                            <TableCell>
                              <Badge className="bg-violet-600 hover:bg-violet-700">
                                #{bill.id}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-semibold">{bill.item}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{bill.category}</Badge>
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              ${bill.totalAmount.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(bill.timestamp).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">No recent bills</div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
