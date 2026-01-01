import { Calculator, BarChart3, Settings2, Building, FileStack } from "lucide-react";

const audiences = [
  { icon: Calculator, label: "Accountants" },
  { icon: BarChart3, label: "Analysts" },
  { icon: Settings2, label: "Operators" },
  { icon: Building, label: "Small businesses" },
  { icon: FileStack, label: "Anyone with messy files" },
];

const Audience = () => {
  return (
    <section id="who-its-for" className="py-20 md:py-28 bg-surface-sunken">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
            Who it's for
          </h2>
          <p className="text-lg text-muted-foreground">
            If you work with data locked in files, this is for you.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 max-w-3xl mx-auto">
          {audiences.map((audience) => (
            <div
              key={audience.label}
              className="flex items-center gap-3 px-5 py-3 rounded-full bg-card border border-border/50 shadow-soft hover:shadow-card transition-all duration-200"
            >
              <audience.icon className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{audience.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Audience;
