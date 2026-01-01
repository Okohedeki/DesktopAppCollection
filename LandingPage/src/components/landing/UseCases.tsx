import { FileSpreadsheet, Receipt, Building2, FileText, ArrowRight } from "lucide-react";

const useCases = [
  {
    icon: FileSpreadsheet,
    from: "PDF",
    to: "Excel",
    description: "Extract tables from PDF reports into editable spreadsheets.",
  },
  {
    icon: Receipt,
    from: "Invoice",
    to: "Structured data",
    description: "Pull line items, totals, and dates from invoices automatically.",
  },
  {
    icon: Building2,
    from: "Bank statements",
    to: "Normalized CSV",
    description: "Standardize transaction data from any bank format.",
  },
  {
    icon: FileText,
    from: "Reports",
    to: "Clean text",
    description: "Strip formatting and extract just the content you need.",
  },
];

const UseCases = () => {
  return (
    <section id="use-cases" className="py-20 md:py-28 bg-surface-sunken">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
            Common use cases
          </h2>
          <p className="text-lg text-muted-foreground">
            Real workflows, real time savings.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {useCases.map((useCase) => (
            <div
              key={useCase.from}
              className="group bg-card rounded-xl p-6 shadow-card hover:shadow-elevated transition-all duration-300 border border-border/50"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <useCase.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-foreground">{useCase.from}</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{useCase.to}</span>
              </div>
              
              <p className="text-sm text-muted-foreground leading-relaxed">
                {useCase.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;
