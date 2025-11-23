'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Loading from '@/components/Loading';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Upload, Receipt, FileText, DollarSign } from 'lucide-react';

const CATEGORIES = [
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

export default function AddBillPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    category: 'food',
    description: '',
    gstPercentage: '18',
  });
  const [items, setItems] = useState([
    { itemName: '', pieces: '', pricePerUnit: '' }
  ]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        if (data.user?.role !== 'ADMIN') {
          router.push('/');
        }
      })
      .catch(() => router.push('/login'));
  }, [router]);

  const calculateSubtotal = () => {
    return items.reduce((total, item) => {
      const pieces = parseFloat(item.pieces) || 0;
      const price = parseFloat(item.pricePerUnit) || 0;
      return total + (pieces * price);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const gstAmount = (subtotal * (parseFloat(formData.gstPercentage) || 0)) / 100;
  const totalAmount = subtotal + gstAmount;

  const addItem = () => {
    setItems([...items, { itemName: '', pieces: '', pricePerUnit: '' }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate items
    const hasEmptyItems = items.some(item =>
      !item.itemName || !item.pieces || !item.pricePerUnit
    );

    if (hasEmptyItems) {
      toast({
        title: "Error",
        description: "Please fill all item fields",
        variant: "destructive",
      });
      return;
    }

    if (!file) {
      toast({
        title: "Error",
        description: "Please upload a file",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('category', formData.category);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('gstPercentage', formData.gstPercentage);
      formDataToSend.append('items', JSON.stringify(items));
      formDataToSend.append('file', file);

      const response = await fetch('/api/bills', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Bill added successfully!",
        });
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } else {
        toast({
          title: "Error",
          description: data.error || 'Failed to add bill',
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
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(selectedFile.type)) {
        toast({
          title: "Error",
          description: "Only PDF, JPG, and PNG files are allowed",
          variant: "destructive",
        });
        e.target.value = '';
        return;
      }
      setFile(selectedFile);
    }
  };

  if (!user) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar user={user} />

      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto shadow-xl border-0">
          <CardHeader className="space-y-1 bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-600 rounded-lg">
                <Receipt className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-3xl">Add New Bill</CardTitle>
            </div>
            <CardDescription className="text-base">
              Create a new bill with items and GST calculation
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description / Notes (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add any additional notes or description..."
                  rows={3}
                />
              </div>

              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Items
                  </h2>
                  <Button
                    type="button"
                    onClick={addItem}
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-4">
                  {items.map((item, index) => (
                    <Card key={index} className="bg-slate-50 border-slate-200">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-semibold text-slate-700">Part {index + 1}</h3>
                          {items.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => removeItem(index)}
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Item Name</Label>
                            <Input
                              type="text"
                              value={item.itemName}
                              onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                              placeholder="e.g., Cable, Screw, etc."
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Pieces</Label>
                            <Input
                              type="number"
                              min="1"
                              step="1"
                              value={item.pieces}
                              onChange={(e) => updateItem(index, 'pieces', e.target.value)}
                              placeholder="0"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Price/Unit</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.pricePerUnit}
                              onChange={(e) => updateItem(index, 'pricePerUnit', e.target.value)}
                              placeholder="0.00"
                              required
                            />
                          </div>
                        </div>

                        <div className="mt-3 text-sm text-slate-600">
                          Subtotal: <span className="font-semibold text-slate-900">
                            ${((parseFloat(item.pieces) || 0) * (parseFloat(item.pricePerUnit) || 0)).toFixed(2)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gstPercentage">GST Percentage (%)</Label>
                <Select value={formData.gstPercentage} onValueChange={(value) => setFormData({ ...formData, gstPercentage: value })}>
                  <SelectTrigger id="gstPercentage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0% (No GST)</SelectItem>
                    <SelectItem value="5">5%</SelectItem>
                    <SelectItem value="12">12%</SelectItem>
                    <SelectItem value="18">18%</SelectItem>
                    <SelectItem value="28">28%</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-bold text-slate-800">Bill Summary</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2">
                      <span className="text-slate-700">Subtotal:</span>
                      <span className="text-lg font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2">
                      <span className="text-slate-700">GST ({formData.gstPercentage}%):</span>
                      <span className="text-lg font-semibold text-slate-900">${gstAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t-2 border-purple-300">
                      <span className="text-xl font-bold text-slate-800">Total Amount:</span>
                      <span className="text-3xl font-bold text-purple-600">${totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label htmlFor="file" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload File (PDF, JPG, PNG)
                </Label>
                <Input
                  type="file"
                  id="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  required
                />
                {file && (
                  <p className="text-sm text-slate-600">
                    Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {loading ? 'Adding Bill...' : 'Add Bill'}
                </Button>
                <Button
                  type="button"
                  onClick={() => router.push('/')}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
