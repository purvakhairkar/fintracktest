'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import Navbar from '@/components/Navbar';
import Loading from '@/components/Loading';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { FileText, Filter, RotateCcw, ChevronDown, ChevronUp, ExternalLink, Trash2, Receipt } from 'lucide-react';

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

export default function BillsPage() {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, bill: null });
  const [expandedBill, setExpandedBill] = useState(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(console.error);
  }, []);

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: '10',
  });
  if (category !== 'all') queryParams.set('category', category);
  if (startDate) queryParams.set('startDate', startDate);
  if (endDate) queryParams.set('endDate', endDate);

  const { data, error, isLoading, mutate } = useSWR(
    `/api/bills?${queryParams.toString()}`,
    fetcher
  );

  const handleDelete = async () => {
    if (!deleteModal.bill) return;

    try {
      const response = await fetch(`/api/bills/${deleteModal.bill.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Bill deleted successfully!",
        });
        mutate();
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.error || 'Failed to delete bill',
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error",
        variant: "destructive",
      });
    } finally {
      setDeleteModal({ isOpen: false, bill: null });
    }
  };

  const resetFilters = () => {
    setCategory('all');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  if (!user) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar user={user} />

      <Dialog open={deleteModal.isOpen} onOpenChange={(open) => !open && setDeleteModal({ isOpen: false, bill: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Bill</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this bill ({deleteModal.bill?.category})? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModal({ isOpen: false, bill: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="container mx-auto px-4 py-8">
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-3xl">Bill Management</CardTitle>
            </div>
            <CardDescription className="text-base">
              View, manage, and filter your bills
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
                <Select value={category} onValueChange={(val) => { setCategory(val); setPage(1); }}>
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
                  onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                />
              </div>

              <div className="flex items-end">
                <Button onClick={resetFilters} variant="outline" className="w-full">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>

            {isLoading ? (
              <Loading />
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500">Error loading bills</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {data?.bills?.map((bill) => (
                    <Card key={bill.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold">Bill #{bill.id}</h3>
                              <Badge variant="secondary">{bill.category}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {new Date(bill.timestamp).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                            {bill.description && (
                              <p className="text-sm text-muted-foreground mt-2 italic">{bill.description}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">Subtotal: ₹{bill.subtotal?.toFixed(2) || '0.00'}</p>
                              <p className="text-xs text-muted-foreground">GST ({bill.gstPercentage}%): ₹{bill.gstAmount?.toFixed(2) || '0.00'}</p>
                              <p className="text-sm font-semibold">Total Amount</p>
                              <p className="text-3xl font-bold text-indigo-600">₹{bill.totalAmount.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={() => setExpandedBill(expandedBill === bill.id ? null : bill.id)}
                          variant="outline"
                          className="w-full justify-between mb-3"
                        >
                          <span className="flex items-center gap-2">
                            <Receipt className="w-4 h-4" />
                            {bill.items?.length || 0} Item{bill.items?.length !== 1 ? 's' : ''}
                          </span>
                          {expandedBill === bill.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>

                        {expandedBill === bill.id && (
                          <div className="space-y-2 mb-4 p-4 bg-slate-50 rounded-lg">
                            {bill.items?.map((item) => (
                              <div key={item.id} className="bg-white p-3 rounded-lg border grid grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="font-medium text-muted-foreground">Item</p>
                                  <p className="font-semibold">{item.itemName}</p>
                                </div>
                                <div>
                                  <p className="font-medium text-muted-foreground">Pieces</p>
                                  <p className="font-semibold">{item.pieces}</p>
                                </div>
                                <div>
                                  <p className="font-medium text-muted-foreground">Price/Unit</p>
                                  <p className="font-semibold">₹{item.pricePerUnit.toFixed(2)}</p>
                                </div>
                                <div>
                                  <p className="font-medium text-muted-foreground">Subtotal</p>
                                  <p className="font-bold">₹{item.subtotal.toFixed(2)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex justify-between items-center pt-3 border-t">
                          <Button variant="link" asChild className="p-0">
                            <a
                              href={bill.filePath}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2"
                            >
                              <ExternalLink className="w-4 h-4" />
                              View Attachment
                            </a>
                          </Button>
                          {user?.role === 'ADMIN' && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeleteModal({ isOpen: true, bill })}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {data?.bills?.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-lg">
                      No bills found. {user?.role === 'ADMIN' && 'Add your first bill!'}
                    </p>
                  </div>
                )}

                {data?.pagination && data.pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-6">
                    <Button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      variant="outline"
                    >
                      Previous
                    </Button>
                    <span className="text-sm font-medium">
                      Page {page} of {data.pagination.totalPages}
                    </span>
                    <Button
                      onClick={() => setPage(page + 1)}
                      disabled={page === data.pagination.totalPages}
                      variant="outline"
                    >
                      Next
                    </Button>
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
