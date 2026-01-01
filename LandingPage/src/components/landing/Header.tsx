import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">LF</span>
          </div>
          <span className="font-semibold text-foreground">LocalFile</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="#problem" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Why LocalFile
          </a>
          <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            How it works
          </a>
          <a href="#use-cases" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Use cases
          </a>
          <a href="#who-its-for" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Who it's for
          </a>
        </nav>

        <Button variant="default" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          Download
        </Button>
      </div>
    </header>
  );
};

export default Header;
