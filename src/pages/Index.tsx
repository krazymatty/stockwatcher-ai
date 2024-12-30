import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="text-xl font-bold">Stock Market App</div>
            <Button onClick={() => navigate("/auth")}>Sign In</Button>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h1 className="text-4xl font-bold tracking-tight">
            Track Your Investments with Ease
          </h1>
          <p className="text-xl text-muted-foreground">
            Create watchlists, monitor stock performance, and make informed investment decisions.
          </p>
          <Button size="lg" onClick={() => navigate("/auth")}>
            Get Started
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Index;