'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import Navbar from '@/components/Navbar';
import Loading from '@/components/Loading';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Filter, RotateCcw } from 'lucide-react';

const fetcher = (url) => fetch(url).then((res) => res.json());

const CATEGORIES = [
  'all',
  'food',
  'travel',
  'equipment-compute',
  'equipment-electrical',
  'equipment-mechanical',
  'part-compute',
  'part-electrical',
  'part-mechanical',
  'office accessories',
  'salaries',
];

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [category, setCategory] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(console.error);
  }, []);

  const queryParams = new URLSearchParams({
    page: '1',
    limit: '1000',
  });
  if (category !== 'all') queryParams.set('category', category);
  if (startDate) queryParams.set('startDate', startDate);
  if (endDate) queryParams.set('endDate', endDate);

  const { data, error, isLoading } = useSWR(
    `/api/bills?${queryParams.toString()}`,
    fetcher
  );

  const resetFilters = () => {
    setCategory('all');
    setStartDate('');
    setEndDate('');
  };

  const allItems = data?.bills?.flatMap(bill =>
    bill.items?.map(item => ({
      ...item,
      billId: bill.id,
      billCategory: bill.category,
      billDate: bill.timestamp,
    })) || []
  ) || [];

  if (!user) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar user={user} />

      <div className="container mx-auto px-4 py-8">
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Package className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-3xl">All Parts & Items</CardTitle>
            </div>
            <CardDescription className="text-base">
              View and filter all parts from your bills
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 rounded-lg border">
              <div className="space-y-2">
                <Label htmlFor="category" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Category
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div className="flex items-end">
                <Button
                  onClick={resetFilters}
                  variant="outline"
                  className="w-full"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>

            {isLoading ? (
              <Loading />
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500">Error loading items</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead>Bill ID</TableHead>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Pieces</TableHead>
                        <TableHead className="text-right">Price/Unit</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allItems.map((item, index) => (
                        <TableRow key={`${item.billId}-${item.id}-${index}`}>
                          <TableCell>
                            <Badge className="bg-blue-600 hover:bg-blue-700">
                              #{item.billId}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold">{item.itemName}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{item.billCategory}</Badge>
                          </TableCell>
                          <TableCell className="text-right">{item.pieces}</TableCell>
                          <TableCell className="text-right">₹{item.pricePerUnit.toFixed(2)}</TableCell>
                          <TableCell className="text-right font-semibold">₹{item.subtotal.toFixed(2)}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(item.billDate).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {allItems.map((item, index) => (
                    <Card key={`${item.billId}-${item.id}-${index}`}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-bold text-lg">{item.itemName}</h3>
                          <Badge className="bg-blue-600">#{item.billId}</Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Category:</span>
                            <Badge variant="secondary">{item.billCategory}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Pieces:</span>
                            <span className="font-semibold">{item.pieces}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Price/Unit:</span>
                            <span className="font-semibold">₹{item.pricePerUnit.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal:</span>
                            <span className="font-bold">₹{item.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Date:</span>
                            <span>{new Date(item.billDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {allItems.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-lg">
                      No items found. {user?.role === 'ADMIN' && 'Add your first bill to see items here!'}
                    </p>
                  </div>
                )}

                {allItems.length > 0 && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-center text-lg font-semibold text-blue-900">
                      Total Items: <span className="text-2xl text-blue-600">{allItems.length}</span>
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
