import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { session_id: string };
}) {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Thank you for your purchase!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your order has been received and is being processed. You will receive a
            confirmation email shortly.
          </p>
          <div className="flex justify-center">
            <Button asChild>
              <Link href="/causes">Browse More Causes</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 