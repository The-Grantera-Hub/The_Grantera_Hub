export default function AboutSection() {
  return (
    <section id="about" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-balance"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              About Grantera
            </h2>
            <div className="w-24 h-1 bg-accent mx-auto mb-8" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
              <p className="text-pretty">
                At Grantera, we believe every Nigerian entrepreneur deserves a
                fair shot at success. We're not just another funding
                platform—we're a movement dedicated to empowering the dreamers,
                the builders, and the innovators who are shaping Nigeria's
                future.
              </p>
              <p className="text-pretty">
                Our mission is simple: to provide business empowerment grants
                that help small businesses and entrepreneurs overcome financial
                barriers and achieve their full potential. No loans to repay. No
                equity to give up. Just pure, transformative opportunity.
              </p>
              <p className="text-pretty">
                We understand the challenges you face—the sleepless nights, the
                uncertainty, the struggle to find capital. That's why we created
                Grantera: to be the partner you need on your journey to success.
              </p>
            </div>

            <div className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/nigerian-entrepreneurs-collaborating-in-modern-off.jpg"
                alt="Nigerian entrepreneurs collaborating"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-secondary/80 mb-2">
                500+
              </div>
              <div className="text-muted-foreground">
                Businesses Ready to Grow
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-secondary/80 mb-2">
                ₦2B+
              </div>
              <div className="text-muted-foreground">
                Grant Opportunities Ahead
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-secondary/80 mb-2">
                36
              </div>
              <div className="text-muted-foreground">States in Our Vision</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
