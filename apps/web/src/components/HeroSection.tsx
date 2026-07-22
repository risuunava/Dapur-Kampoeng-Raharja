import Image from 'next/image';

const signatures = [
  {
    name: 'Nasi Goreng',
    desc: 'Indonesian fried rice with sweet soy sauce, shallot, garlic, tamarind and chilli.',
    image: '/images/dish_rice_1784699494737.png',
  },
  {
    name: 'Sate Ayam',
    desc: 'Grilled chicken skewers served with a rich and savory peanut sauce.',
    image: '/images/dish_satay_1784699504463.png',
  },
  {
    name: 'Mie Goreng',
    desc: 'Flavorful and spicy fried noodle dish common in Indonesia.',
    image: '/images/dish_noodle_1784699485646.png',
  },
  {
    name: 'Soto Ayam',
    desc: 'Traditional yellow spicy chicken soup with lontong or nasi.',
    image: '/images/dish_soup_1784699516279.png',
  }
];

export default function HeroSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-ink leading-tight mb-8 md:mb-12 max-w-4xl mx-auto text-center">
        Menikmati Kelezatan Asli Dapur Kampoeng Raharja
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
        <div className="lg:col-span-8">
          <div className="relative w-full h-[500px] rounded-3xl overflow-hidden shadow-card">
            <Image 
              src="/images/hero_collage_1784699474875.png" 
              alt="Indonesian Cuisine Feast"
              fill
              className="object-cover"
            />
          </div>
        </div>
        
        <div className="lg:col-span-4 flex flex-col gap-6">
          {signatures.map((item, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-line/50 shadow-sm">
                <Image 
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-ink text-base">{item.name}:</h3>
                <p className="text-muted text-xs leading-relaxed mt-1">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 bg-forest rounded-2xl p-6 md:p-12 text-white flex flex-col md:flex-row gap-6 md:gap-8 items-center justify-between">
        <h2 className="text-xl md:text-3xl font-display font-semibold md:w-1/3 leading-snug text-balance text-center md:text-left">
          Keistimewaan Dapur Kampoeng Raharja
        </h2>
        <div className="w-full h-px md:w-px md:h-24 bg-white/20 block md:hidden" />
        <div className="w-px h-24 bg-white/20 hidden md:block" />
        <p className="md:w-3/5 text-sm md:text-base text-white/80 leading-relaxed text-center md:text-left">
          Rahasia masakan kami terletak pada bumbu rempah pilihan yang kaya dan autentik. Setiap hidangan disiapkan dengan resep tradisional turun-temurun untuk memberikan pengalaman kuliner terbaik bagi acara dan keseharian Anda.
        </p>
      </div>
    </section>
  );
}
