import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("Erro 404: Tentativa de acesso a rota inexistente:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Página não encontrada
        </p>
        <Button asChild>
          <Link to="/dashboard">
            <Home className="w-4 h-4 mr-2" />
            Voltar ao Painel
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
