import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { creditors } from '@/lib/mock-data';
import { PlusCircle } from 'lucide-react';

export default function CreditorsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Manage Creditors</h1>
        <p className="text-muted-foreground">Add new creditors to your personal network.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add a New Creditor</CardTitle>
          <CardDescription>
            Enter the email of the creditor you want to add.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col sm:flex-row items-end gap-4">
            <div className="grid gap-2 flex-1 w-full">
              <Label htmlFor="email">Creditor&apos;s Email</Label>
              <Input id="email" type="email" placeholder="creditor@example.com" />
            </div>
            <Button type="submit" className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Creditor
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Creditors</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {creditors.map((creditor) => (
                <TableRow key={creditor.id}>
                  <TableCell className="font-medium">{creditor.name}</TableCell>
                  <TableCell>{creditor.email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
