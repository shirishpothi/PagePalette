import { Hero } from "@/components/sections/Hero";
import { InfiniteMarquee } from "@/components/ui/infinite-marquee";
import { CardCarousel } from "@/components/ui/card-carousel";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { FlashlightCard } from "@/components/ui/flashlight-card";

const testimonials = [
  "Isabella", "Lucy Milligan", "Victoria He", "Anna Zhou", "Cayden Martin",
  "Sid Basu", "Prada Pek", "Julian Dizon", "Roxana", "Caelyn Wong",
  "Nicole Xu", "Emily Wang", "Leo", "Sakurako Fukui", "Mohan Parameshwar",
  "Shirish Pothi", "Soyoon", "Benjamin Faber", "Lakshy Lavany"
];

const features = [
  {
    title: "Modular Design",
    description: "Snap modules in and out to customize your workflow instantly.",
    color: "from-indigo-500 to-purple-500"
  },
  {
    title: "Sustainable",
    description: "Made from recycled materials and designed to last longer than standard notebooks.",
    color: "from-cyan-500 to-blue-500"
  },
  {
    title: "3D Printed",
    description: "Precision engineered parts manufactured with high-quality filaments.",
    color: "from-emerald-500 to-green-500"
  }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] overflow-x-hidden">
      <Hero />

      <section className="py-20 relative z-10">
        <ScrollReveal animation="fade">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-neutral-200 to-neutral-500">
            Loved by Students & Teachers
          </h2>
          <InfiniteMarquee
            items={testimonials.map((name, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  {name.charAt(0)}
                </div>
                <div>
                  <p className="text-white font-medium">{name}</p>
                  <p className="text-neutral-400 text-xs">Early Adopter</p>
                </div>
              </div>
            ))}
            speed="slow"
          />
        </ScrollReveal>
      </section>

      <section className="py-20 relative z-10">
        <ScrollReveal animation="slide">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-neutral-200 to-neutral-500">
            Why PagePalette?
          </h2>
          <CardCarousel
            items={features.map((feature, i) => (
              <FlashlightCard key={i} className="h-full w-full bg-neutral-900 border-neutral-800">
                <div className="h-full flex flex-col p-8">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} mb-6`} />
                  <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-neutral-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </FlashlightCard>
            ))}
          />
        </ScrollReveal>
      </section>
    </main>
  );
}
