import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { creditors } from '@/lib/mock-data';

export default function ApplyPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Apply for a Loan</h1>
        <p className="text-muted-foreground">Fill out the form below to submit your loan application.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Loan Application Form</CardTitle>
          <CardDescription>
            Your application will be sent to the selected creditor for review.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="creditor">Select Creditor</Label>
              <Select>
                <SelectTrigger id="creditor">
                  <SelectValue placeholder="Choose a creditor" />
                </SelectTrigger>
                <SelectContent>
                  {creditors
                    .filter((c) => c.status === 'approved')
                    .map((creditor) => (
                      <SelectItem key={creditor.id} value={creditor.id}>
                        {creditor.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="amount">Loan Amount ($)</Label>
                <Input id="amount" type="number" placeholder="e.g., 5000" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="term">Payment Term (months)</Label>
                <Input id="term" type="number" placeholder="e.g., 24" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="purpose">Purpose of Loan</Label>
              <Textarea id="purpose" placeholder="e.g., To cover expenses for a home renovation project." />
            </div>

            <Button type="submit" className="w-full md:w-auto bg-accent text-accent-foreground hover:bg-accent/90">
              Submit Application
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
