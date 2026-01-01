import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const FinalCTA = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
            Download and get your time back
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            Stop fighting with files. Start getting results.
          </p>

          <Button variant="hero" size="xl" className="gap-2">
            <Download className="w-5 h-5" />
            Download LocalFile
          </Button>

          <p className="mt-6 text-sm text-muted-foreground">
            Free to try. No account needed.
          </p>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
