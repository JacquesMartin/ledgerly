'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Filter, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  Banknote,
  FileText,
  Smartphone
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth-supabase';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import type { Payment } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';
import { useUserPreferences } from '@/hooks/use-user-preferences';
import { formatCurrency } from '@/lib/utils';

const getPaymentMethodIcon = (method: Payment['paymentMethod']) => {
  switch (method) {
    case 'bank_transfer':
      return <Banknote className="h-4 w-4" />;
    case 'cash':
      return <DollarSign className="h-4 w-4" />;
    case 'check':
      return <FileText className="h-4 w-4" />;
    case 'digital_wallet':
      return <Smartphone className="h-4 w-4" />;
    default:
      return <CreditCard className="h-4 w-4" />;
  }
};

const getStatusIcon = (status: Payment['status']) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'cancelled':
      return <AlertCircle className="h-4 w-4 text-gray-500" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const getStatusVariant = (status: Payment['status']) => {
  switch (status) {
    case 'completed':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'failed':
      return 'destructive';
    case 'cancelled':
      return 'outline';
    default:
      return 'secondary';
  }
};

export default function PaymentsPage() {
  const { user } = useAuth();
  const { preferences } = useUserPreferences();
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const fetchPayments = async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .or(`payer_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching payments:', error);
      } else {
        setPayments(data || []);
      }
      setLoading(false);
    };

    fetchPayments();
  }, [user]);

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || payment.paymentMethod === methodFilter;
    
    return matchesSearch && matchesStatus && matchesMethod;
  });

  // Calculate statistics
  const stats = {
    totalPayments: payments.length,
    completedPayments: payments.filter(p => p.status === 'completed').length,
    pendingPayments: payments.filter(p => p.status === 'pending').length,
    totalAmount: payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0),
    totalReceived: payments
      .filter(p => p.receiver_id === user?.id && p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0),
    totalSent: payments
      .filter(p => p.payer_id === user?.id && p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0)
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Payment History</h1>
        <p className="text-muted-foreground">Track all your loan payments and transactions.</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPayments}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedPayments} completed, {stats.pendingPayments} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalAmount, preferences.currency)}
            </div>
            <p className="text-xs text-muted-foreground">
              All completed payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amount Received</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalReceived, preferences.currency)}
            </div>
            <p className="text-xs text-muted-foreground">
              From loan repayments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amount Sent</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.totalSent, preferences.currency)}
            </div>
            <p className="text-xs text-muted-foreground">
              Loan payments made
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
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search payments..."
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
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="all">All Methods</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="check">Check</option>
                <option value="digital_wallet">Digital Wallet</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payments ({filteredPayments.length})</CardTitle>
          <CardDescription>
            Showing {filteredPayments.length} of {payments.length} payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  </TableRow>
                ))
              ) : filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => {
                  const isReceived = payment.receiver_id === user?.id;
                  return (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {format(parseISO(payment.date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className={`font-mono ${isReceived ? 'text-green-600' : 'text-red-600'}`}>
                          {isReceived ? '+' : '-'}{formatCurrency(payment.amount, preferences.currency)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={isReceived ? 'default' : 'secondary'}>
                          {isReceived ? 'Received' : 'Sent'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getPaymentMethodIcon(payment.paymentMethod)}
                          <span className="capitalize text-sm">
                            {payment.paymentMethod.replace('_', ' ')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(payment.status)} className="flex items-center gap-1 w-fit">
                          {getStatusIcon(payment.status)}
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {payment.reference || 'N/A'}
                        </div>
                        {payment.notes && (
                          <div className="text-xs text-muted-foreground">
                            {payment.notes}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                    {payments.length === 0 
                      ? "No payment history yet." 
                      : "No payments match your current filters."
                    }
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
