import { FileX, Clock, Lock, CloudOff } from "lucide-react";

const problems = [
  {
    icon: FileX,
    title: "PDFs that don't copy cleanly",
    description: "Tables become jumbled text. Formatting disappears. Hours lost to manual cleanup.",
  },
  {
    icon: Clock,
    title: "Bank statements in random formats",
    description: "Every bank exports differently. Reconciling accounts becomes a nightmare.",
  },
  {
    icon: FileX,
    title: "CSVs that need hours of cleanup",
    description: "Merged cells, inconsistent dates, special characters. The data is there — just not usable.",
  },
  {
    icon: Lock,
    title: "Upload limits and privacy concerns",
    description: "Online tools want your files on their servers. That's not always an option.",
  },
];

const Problem = () => {
  return (
    <section id="problem" className="py-20 md:py-28 bg-surface-sunken">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
            Sound familiar?
          </h2>
          <p className="text-lg text-muted-foreground">
            You've got the file. The data is right there. But getting it into a usable format? That's the hard part.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {problems.map((problem, index) => (
            <div
              key={problem.title}
              className="group bg-card rounded-xl p-6 shadow-card hover:shadow-elevated transition-all duration-300 border border-border/50"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <problem.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">
                    {problem.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {problem.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Problem;
