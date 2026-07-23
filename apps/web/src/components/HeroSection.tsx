import Image from 'next/image';

const signatures = [
  {
    name: 'Nasi Goreng',
    desc: 'Nasi goreng khas Indonesia dengan kecap manis, bawang merah, bawang putih, asam jawa, dan cabai.',
    image: '/images/dish_rice_1784699494737.png',
  },
  {
    name: 'Sate Ayam',
    desc: 'Tusuk ayam panggang yang disajikan dengan saus kacang yang kaya dan gurih.',
    image: '/images/dish_satay_1784699504463.png',
  },
  {
    name: 'Mie Goreng',
    desc: 'Hidangan mie goreng pedas yang lezat dan umum di Indonesia.',
    image: '/images/dish_noodle_1784699485646.png',
  },
  {
    name: 'Soto Ayam',
    desc: 'Sup ayam kuning pedas tradisional dengan lontong atau nasi.',
    image: '/images/dish_soup_1784699516279.png',
  }
];

export default function HeroSection() {
  return (
    <section id="hero" className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-12">
      <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-ink leading-tight mb-6 md:mb-12 max-w-4xl mx-auto text-center">
        Menikmati Kelezatan Asli Dapur Kampoeng Raharja
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12 items-start">
        <div className="lg:col-span-8">
          <div className="relative w-full h-[250px] sm:h-[350px] md:h-[500px] rounded-2xl md:rounded-3xl overflow-hidden shadow-card">
            <Image 
              src="/images/hero_collage_1784699474875.png" 
              alt="Indonesian Cuisine Feast"
              fill
              className="object-cover"
            />
          </div>
        </div>
        
        <div className="lg:col-span-4 flex flex-col gap-4 md:gap-6">
          {signatures.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 md:gap-4">
              <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden shrink-0 border-2 border-line/50 shadow-sm">
                <Image 
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-ink text-sm md:text-base">{item.name}:</h3>
                <p className="text-muted text-xs leading-relaxed mt-0.5 md:mt-1">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 md:mt-12 bg-forest rounded-2xl p-5 md:p-12 text-white flex flex-col md:flex-row gap-4 md:gap-8 items-center justify-between">
        <h2 className="text-lg md:text-3xl font-display font-semibold md:w-1/3 leading-snug text-balance text-center md:text-left">
          Keistimewaan Dapur Kampoeng Raharja
        </h2>
        <div className="w-full h-px md:w-px md:h-24 bg-white/20 block md:hidden" />
        <div className="w-px h-24 bg-white/20 hidden md:block" />
        <p className="md:w-3/5 text-xs md:text-base text-white/80 leading-relaxed text-center md:text-left">
          Rahasia masakan kami terletak pada bumbu rempah pilihan yang kaya dan autentik. Setiap hidangan disiapkan dengan resep tradisional turun-temurun untuk memberikan pengalaman kuliner terbaik bagi acara dan keseharian Anda.
        </p>
      </div>
    </section>
  );
}
