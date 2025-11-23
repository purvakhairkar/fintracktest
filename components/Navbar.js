'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Menu, X, DollarSign, Package, FileText, BarChart3, PlusCircle, User, LogOut } from 'lucide-react';

export default function Navbar({ user }) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        router.push('/login');
        router.refresh();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold">FinTrack</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link href="/">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <Package className="w-4 h-4 mr-2" />
                Parts
              </Button>
            </Link>
            <Link href="/bills">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <FileText className="w-4 h-4 mr-2" />
                Bills
              </Button>
            </Link>
            <Link href="/analytics">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </Link>
            {user?.role === 'ADMIN' && (
              <Link href="/add-bill">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Bill
                </Button>
              </Link>
            )}
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-white hover:bg-white/10 space-x-2">
                  <User className="w-4 h-4" />
                  <span>{user?.username}</span>
                  <Badge variant="secondary" className="ml-1">
                    {user?.role}
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-semibold">{user?.username}</p>
                    <p className="text-xs text-muted-foreground">{user?.role}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white hover:bg-white/10"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10">
                <Package className="w-4 h-4 mr-2" />
                Parts
              </Button>
            </Link>
            <Link href="/bills" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10">
                <FileText className="w-4 h-4 mr-2" />
                Bills
              </Button>
            </Link>
            <Link href="/analytics" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </Link>
            {user?.role === 'ADMIN' && (
              <Link href="/add-bill" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Bill
                </Button>
              </Link>
            )}
            <div className="border-t border-white/10 pt-2 mt-2">
              <div className="px-3 py-2">
                <p className="font-semibold text-sm">{user?.username}</p>
                <Badge variant="secondary" className="mt-1">
                  {user?.role}
                </Badge>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start text-red-300 hover:bg-red-500/10 hover:text-red-200"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
