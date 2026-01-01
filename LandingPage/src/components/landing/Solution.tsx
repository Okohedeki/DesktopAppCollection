import { Upload, Sparkles, FileOutput, Wifi } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Drop your file",
    description: "Drag any PDF, spreadsheet, or document into the app. That's it.",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "App understands the structure",
    description: "Intelligent parsing detects tables, columns, and data patterns automatically.",
  },
  {
    number: "03",
    icon: FileOutput,
    title: "Get clean, usable output",
    description: "Export as CSV, Excel, JSON, or plain text. Ready to use immediately.",
  },
];

const Solution = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-28">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
            How it works
          </h2>
          <p className="text-lg text-muted-foreground">
            Three steps. No learning curve. No accounts.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          {steps.map((step, index) => (
            <div key={step.title} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[calc(50%+3rem)] w-[calc(100%-3rem)] h-px bg-border" />
              )}
              
              <div className="text-center">
                <div className="relative inline-flex mb-6">
                  <div className="w-24 h-24 rounded-2xl bg-secondary flex items-center justify-center shadow-soft">
                    <step.icon className="w-10 h-10 text-foreground" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Offline badge */}
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center gap-3 px-5 py-4 rounded-xl bg-secondary/50 border border-border/50">
            <Wifi className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              <span className="text-foreground font-medium">Runs completely offline.</span> Your data never touches the internet.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Solution;
