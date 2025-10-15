export function SuccessStoriesSection() {
  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 font-[family-name:var(--font-playfair)] text-balance">
              Empowering Nigerian Dreams
            </h2>
            <div className="w-24 h-1 bg-accent mx-auto mb-8" />
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Every grant we award represents a dream realized, a business empowered, and a future transformed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl group">
              <img
                src="/successful-nigerian-female-entrepreneur-in-her-thr.jpg"
                alt="Successful Nigerian entrepreneur"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="inline-block px-3 py-1 bg-accent text-primary text-sm font-semibold rounded-full mb-3">
                  Retail Success
                </div>
                <h3 className="text-2xl font-bold mb-2">From Dream to Reality</h3>
                <p className="text-white/90 text-sm leading-relaxed">
                  Grantera grants would help hundreds of entrepreneurs turn their business ideas into thriving
                  enterprises across Nigeria.
                </p>
              </div>
            </div>

            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl group">
              <img
                src="/nigerian-male-entrepreneur-working-on-laptop-in-mo.jpg"
                alt="Nigerian tech entrepreneur"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="inline-block px-3 py-1 bg-accent text-primary text-sm font-semibold rounded-full mb-3">
                  Tech Innovation
                </div>
                <h3 className="text-2xl font-bold mb-2">Building the Future</h3>
                <p className="text-white/90 text-sm leading-relaxed">
                  Our grants would empower tech innovators and digital entrepreneurs to scale their solutions and create
                  lasting impact.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
