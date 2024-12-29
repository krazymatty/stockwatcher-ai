import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-foreground">StockWatcher AI</h1>
        <p className="text-muted-foreground">Track and analyze your favorite stocks</p>
      </header>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Watchlists</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Connect Supabase to create and manage your watchlists</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Market Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Your personalized market insights will appear here</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>AI Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Support and resistance predictions will be shown here</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;