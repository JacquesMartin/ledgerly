
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import type { LoanApplication } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, parseISO, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { useUserPreferences } from '@/hooks/use-user-preferences';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Search, 
  Filter, 
  Download, 
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export default function LedgerPage() {
  const { user } = useAuth();
  const { preferences, loading: prefLoading } = useUserPreferences();
  const [transactions, setTransactions] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{from?: Date, to?: Date}>({});

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const applicantQuery = query(collection(db, 'loan_applications'), where('applicant.uid', '==', user.uid));
    const creditorQuery = query(collection(db, 'loan_applications'), where('creditorId', '==', user.uid));

    const unsubscribeApplicant = onSnapshot(applicantQuery, (snapshot) => {
      const applicantLoans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LoanApplication));
      setTransactions(prev => {
        const otherLoans = prev.filter(t => t.creditorId === user.uid);
        const combined = [...otherLoans, ...applicantLoans].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
        return combined;
      });
       setLoading(false);
    });

    const unsubscribeCreditor = onSnapshot(creditorQuery, (snapshot) => {
      const creditorLoans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LoanApplication));
       setTransactions(prev => {
        const otherLoans = prev.filter(t => t.applicant.uid === user.uid);
        const combined = [...otherLoans, ...creditorLoans].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
        return combined;
      });
       setLoading(false);
    });

    return () => {
      unsubscribeApplicant();
      unsubscribeCreditor();
    };

  }, [user]);

  // Filter and search logic
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(tx => 
        tx.applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.purpose.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tx => tx.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(tx => {
        const isBorrower = tx.applicant.uid === user?.uid;
        if (typeFilter === 'borrowed') return isBorrower;
        if (typeFilter === 'lent') return !isBorrower;
        return true;
      });
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(tx => {
        const txDate = parseISO(tx.date);
        switch (dateFilter) {
          case 'today':
            return txDate.toDateString() === now.toDateString();
          case 'week':
            return txDate >= subDays(now, 7);
          case 'month':
            return txDate >= startOfMonth(now);
          case 'year':
            return txDate >= subMonths(now, 12);
          default:
            return true;
        }
      });
    }

    // Date range filter
    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter(tx => {
        const txDate = parseISO(tx.date);
        if (dateRange.from && txDate < dateRange.from) return false;
        if (dateRange.to && txDate > dateRange.to) return false;
        return true;
      });
    }

    return filtered;
  }, [transactions, searchTerm, statusFilter, typeFilter, dateFilter, dateRange, user?.uid]);

  // Calculate statistics
  const stats = useMemo(() => {
    const borrowed = filteredTransactions.filter(tx => tx.applicant.uid === user?.uid);
    const lent = filteredTransactions.filter(tx => tx.creditorId === user?.uid);
    
    const totalBorrowed = borrowed.reduce((sum, tx) => sum + tx.amount, 0);
    const totalLent = lent.reduce((sum, tx) => sum + tx.amount, 0);
    
    const approvedBorrowed = borrowed.filter(tx => tx.status === 'approved' || tx.status === 'modified');
    const approvedLent = lent.filter(tx => tx.status === 'approved' || tx.status === 'modified');
    
    return {
      totalBorrowed,
      totalLent,
      netPosition: totalLent - totalBorrowed,
      activeBorrowed: approvedBorrowed.length,
      activeLent: approvedLent.length,
      totalTransactions: filteredTransactions.length,
    };
  }, [filteredTransactions, user?.uid]);

  const getStatusVariant = (status: LoanApplication['status']) => {
    switch (status) {
        case 'approved':
        case 'modified':
            return 'secondary';
        case 'pending':
            return 'outline';
        case 'rejected':
            return 'destructive';
        default:
            return 'default';
    }
  };

  const getStatusIcon = (status: LoanApplication['status']) => {
    switch (status) {
        case 'approved':
        case 'modified':
            return <CheckCircle className="h-4 w-4" />;
        case 'pending':
            return <Clock className="h-4 w-4" />;
        case 'rejected':
            return <XCircle className="h-4 w-4" />;
        default:
            return <AlertCircle className="h-4 w-4" />;
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Date', 'Type', 'Counterparty', 'Amount', 'Purpose', 'Status', 'Interest Rate', 'Term'],
      ...filteredTransactions.map(tx => {
        const isBorrower = tx.applicant.uid === user?.uid;
        return [
          format(parseISO(tx.date), 'yyyy-MM-dd'),
          isBorrower ? 'Borrowed' : 'Lent',
          isBorrower ? 'Creditor' : tx.applicant.name,
          tx.amount,
          tx.purpose,
          tx.status,
          `${tx.interestRate}%`,
          `${tx.termMonths} months`
        ];
      })
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledger-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };


  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Transaction Ledger</h1>
          <p className="text-muted-foreground">A complete history of your loan activities with advanced filtering.</p>
        </div>
        <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Borrowed</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(stats.totalBorrowed, preferences.currency)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.activeBorrowed} active loans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalLent, preferences.currency)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.activeLent} active loans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Position</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.netPosition >= 0 ? 'text-green-600' : 'text-destructive'}`}>
              {formatCurrency(Math.abs(stats.netPosition), preferences.currency)}
              {stats.netPosition >= 0 ? ' (Net Lender)' : ' (Net Borrower)'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalTransactions} total transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.activeBorrowed + stats.activeLent}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.activeBorrowed} borrowed, {stats.activeLent} lent
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="modified">Modified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="borrowed">Borrowed</SelectItem>
                  <SelectItem value="lent">Lent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Custom Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      "Pick a date range"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions ({filteredTransactions.length})</CardTitle>
          <CardDescription>
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading || prefLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-28 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => {
                  const isBorrower = tx.applicant.uid === user?.uid;
                  return (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium text-muted-foreground">
                        {format(parseISO(tx.date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {isBorrower ? `Loan from Creditor` : `Loan to ${tx.applicant.name}`}
                        </div>
                        <div className="text-sm text-muted-foreground">{tx.purpose}</div>
                        <div className="text-xs text-muted-foreground">
                          {tx.interestRate}% for {tx.termMonths} months
                        </div>
                      </TableCell>
                      <TableCell>
                        {isBorrower ? (
                          <Badge variant="outline" className="text-destructive-foreground bg-destructive/10 border-destructive/20">
                            <ArrowDownLeft className="mr-1 h-3 w-3" />
                            Borrowed
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200">
                            <ArrowUpRight className="mr-1 h-3 w-3" />
                            Lent
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(tx.status)} className="capitalize flex items-center gap-1 w-fit">
                          {getStatusIcon(tx.status)}
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(tx.amount, preferences.currency)}
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                    {transactions.length === 0 
                      ? "You have no transactions yet." 
                      : "No transactions match your current filters."
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
