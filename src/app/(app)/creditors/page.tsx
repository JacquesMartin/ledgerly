
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Loader2, 
  PlusCircle, 
  Search, 
  Filter, 
  Star, 
  Mail, 
  Phone, 
  MapPin,
  Edit,
  Trash2,
  MoreHorizontal,
  UserPlus,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, serverTimestamp, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Creditor } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

// Enhanced Creditor type with additional fields
interface EnhancedCreditor extends Creditor {
  rating?: number;
  totalLoans?: number;
  totalAmount?: number;
  lastInteraction?: string;
  notes?: string;
  phone?: string;
  address?: string;
  company?: string;
  createdAt?: any;
}

export default function CreditorsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [creditors, setCreditors] = useState<EnhancedCreditor[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  
  // Form states
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCreditor, setEditingCreditor] = useState<EnhancedCreditor | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const q = query(collection(db, `users/${user.uid}/creditors`));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const creditorsData: EnhancedCreditor[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        creditorsData.push({ 
          id: doc.id, 
          ...data,
          rating: data.rating || 0,
          totalLoans: data.totalLoans || 0,
          totalAmount: data.totalAmount || 0,
          notes: data.notes || '',
          phone: data.phone || '',
          address: data.address || '',
          company: data.company || ''
        } as EnhancedCreditor);
      });
      setCreditors(creditorsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Filter creditors based on search and filters
  const filteredCreditors = creditors.filter(creditor => {
    const matchesSearch = 
      creditor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creditor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (creditor.company && creditor.company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || creditor.status === statusFilter;
    
    const matchesRating = ratingFilter === 'all' || 
      (ratingFilter === 'high' && creditor.rating >= 4) ||
      (ratingFilter === 'medium' && creditor.rating >= 2 && creditor.rating < 4) ||
      (ratingFilter === 'low' && creditor.rating < 2);
    
    return matchesSearch && matchesStatus && matchesRating;
  });

  // Calculate statistics
  const stats = {
    total: creditors.length,
    approved: creditors.filter(c => c.status === 'approved').length,
    pending: creditors.filter(c => c.status === 'pending').length,
    totalLoans: creditors.reduce((sum, c) => sum + (c.totalLoans || 0), 0),
    totalAmount: creditors.reduce((sum, c) => sum + (c.totalAmount || 0), 0),
    averageRating: creditors.length > 0 ? 
      (creditors.reduce((sum, c) => sum + (c.rating || 0), 0) / creditors.length).toFixed(1) : '0.0'
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setAddress('');
    setNotes('');
  };

  const handleAddCreditor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !email || !name) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Name and email are required.',
      });
      return;
    }
    setFormLoading(true);
    try {
      await addDoc(collection(db, `users/${user.uid}/creditors`), {
        name,
        email,
        phone: phone || '',
        company: company || '',
        address: address || '',
        notes: notes || '',
        status: 'approved',
        rating: 0,
        totalLoans: 0,
        totalAmount: 0,
        createdAt: serverTimestamp(),
      });
      toast({
        title: 'Success',
        description: 'Creditor added to your personal network.',
      });
      resetForm();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding creditor: ', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({
        variant: 'destructive',
        title: 'Error adding creditor',
        description: errorMessage,
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditCreditor = async (creditor: EnhancedCreditor) => {
    if (!user) return;
    setFormLoading(true);
    try {
      const creditorRef = doc(db, `users/${user.uid}/creditors`, creditor.id);
      await updateDoc(creditorRef, {
        name: creditor.name,
        email: creditor.email,
        phone: creditor.phone || '',
        company: creditor.company || '',
        address: creditor.address || '',
        notes: creditor.notes || '',
      });
      toast({
        title: 'Success',
        description: 'Creditor updated successfully.',
      });
      setEditingCreditor(null);
    } catch (error) {
      console.error('Error updating creditor: ', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update creditor.',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCreditor = async (creditorId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/creditors`, creditorId));
      toast({
        title: 'Success',
        description: 'Creditor removed successfully.',
      });
    } catch (error) {
      console.error('Error deleting creditor: ', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete creditor.',
      });
    }
  };

  const handleUpdateRating = async (creditorId: string, newRating: number) => {
    if (!user) return;
    try {
      const creditorRef = doc(db, `users/${user.uid}/creditors`, creditorId);
      await updateDoc(creditorRef, { rating: newRating });
      toast({
        title: 'Success',
        description: 'Rating updated successfully.',
      });
    } catch (error) {
      console.error('Error updating rating: ', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update rating.',
      });
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Creditor Management</h1>
          <p className="text-muted-foreground">Manage your creditor network and track loan relationships.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add Creditor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Creditor</DialogTitle>
              <DialogDescription>
                Add a new creditor to your network with complete contact information.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddCreditor} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="creditor@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    type="text"
                    placeholder="ABC Lending Corp"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="123 Main St, City, State 12345"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes about this creditor..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <PlusCircle className="mr-2 h-4 w-4" />
                  )}
                  Add Creditor
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Creditors</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.approved} approved, {stats.pending} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Loans</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLoans}</div>
            <p className="text-xs text-muted-foreground">
              Across all creditors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              All time loans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating}</div>
            <p className="text-xs text-muted-foreground">
              Out of 5 stars
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">
              Approved creditors
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search creditors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Rating</Label>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="all">All Ratings</option>
                <option value="high">High (4-5 stars)</option>
                <option value="medium">Medium (2-3 stars)</option>
                <option value="low">Low (0-1 stars)</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setRatingFilter('all');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Creditors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Creditors ({filteredCreditors.length})</CardTitle>
          <CardDescription>
            Showing {filteredCreditors.length} of {creditors.length} creditors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Creditor</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Loans</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-12 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredCreditors.length > 0 ? (
                filteredCreditors.map((creditor) => (
                  <TableRow key={creditor.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {creditor.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{creditor.name}</div>
                          {creditor.notes && (
                            <div className="text-sm text-muted-foreground truncate max-w-48">
                              {creditor.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {creditor.email}
                        </div>
                        {creditor.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {creditor.phone}
                          </div>
                        )}
                        {creditor.address && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate max-w-32">{creditor.address}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {creditor.company || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">
                          {creditor.rating || 0}/5
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{creditor.totalLoans || 0} loans</div>
                        <div className="text-muted-foreground">
                          ${(creditor.totalAmount || 0).toLocaleString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={creditor.status === 'approved' ? 'default' : 'secondary'}
                        className="capitalize"
                      >
                        {creditor.status === 'approved' ? (
                          <CheckCircle className="mr-1 h-3 w-3" />
                        ) : (
                          <Clock className="mr-1 h-3 w-3" />
                        )}
                        {creditor.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingCreditor(creditor)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteCreditor(creditor.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                    {creditors.length === 0 
                      ? "You haven't added any creditors yet." 
                      : "No creditors match your current filters."
                    }
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Creditor Dialog */}
      {editingCreditor && (
        <Dialog open={!!editingCreditor} onOpenChange={() => setEditingCreditor(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Creditor</DialogTitle>
              <DialogDescription>
                Update creditor information and details.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (editingCreditor) {
                handleEditCreditor(editingCreditor);
              }
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Full Name *</Label>
                  <Input
                    id="edit-name"
                    type="text"
                    value={editingCreditor?.name || ''}
                    onChange={(e) => setEditingCreditor(prev => 
                      prev ? { ...prev, name: e.target.value } : null
                    )}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email Address *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingCreditor?.email || ''}
                    onChange={(e) => setEditingCreditor(prev => 
                      prev ? { ...prev, email: e.target.value } : null
                    )}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone Number</Label>
                  <Input
                    id="edit-phone"
                    type="tel"
                    value={editingCreditor?.phone || ''}
                    onChange={(e) => setEditingCreditor(prev => 
                      prev ? { ...prev, phone: e.target.value } : null
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-company">Company</Label>
                  <Input
                    id="edit-company"
                    type="text"
                    value={editingCreditor?.company || ''}
                    onChange={(e) => setEditingCreditor(prev => 
                      prev ? { ...prev, company: e.target.value } : null
                    )}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  type="text"
                  value={editingCreditor?.address || ''}
                  onChange={(e) => setEditingCreditor(prev => 
                    prev ? { ...prev, address: e.target.value } : null
                  )}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={editingCreditor?.notes || ''}
                  onChange={(e) => setEditingCreditor(prev => 
                    prev ? { ...prev, notes: e.target.value } : null
                  )}
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditingCreditor(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Edit className="mr-2 h-4 w-4" />
                  )}
                  Update Creditor
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
