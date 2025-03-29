import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Checkout Cancelled</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your checkout was cancelled. No charges were made.
          </p>
          <div className="flex justify-center">
            <Button asChild>
              <Link href="/causes">Continue Shopping</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 