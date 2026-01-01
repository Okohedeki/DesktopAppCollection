import { CloudOff, CreditCard, Zap, Shield, Check } from "lucide-react";

const benefits = [
  {
    icon: CloudOff,
    title: "No uploads",
    description: "Your files stay on your machine. Period.",
  },
  {
    icon: CreditCard,
    title: "No subscription required",
    description: "Download once, use forever. No recurring fees to start.",
  },
  {
    icon: Zap,
    title: "Faster than web tools",
    description: "No upload time, no waiting for servers. Instant results.",
  },
  {
    icon: Shield,
    title: "Works on sensitive data",
    description: "Client files, financials, personal data — process it all safely.",
  },
];

const Benefits = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
            Why it's better
          </h2>
          <p className="text-lg text-muted-foreground">
            Built for people who care about privacy and productivity.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="flex items-start gap-4 p-6 rounded-xl bg-card border border-border/50 shadow-soft"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <benefit.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1 flex items-center gap-2">
                  {benefit.title}
                  <Check className="w-4 h-4 text-green-500" />
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
