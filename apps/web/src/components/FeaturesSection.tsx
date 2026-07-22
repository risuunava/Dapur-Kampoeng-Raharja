import Image from 'next/image';
import { Check } from 'lucide-react';

const features = [
  "Fresh Ingredients",
  "Rich and Flavorful",
  "Rice and Noodles",
  "Aromatic Herbs and Spices",
  "Street Food Culture"
];

export default function FeaturesSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
        <div>
          <h2 className="text-2xl md:text-5xl font-display font-bold text-ink leading-tight mb-4 md:mb-6 text-balance">
            Cita Rasa Khas <br className="hidden md:block" /> Masakan Kami
          </h2>
          <p className="text-muted text-sm md:text-base leading-relaxed mb-6 md:mb-8 max-w-md">
            Dapur Kampoeng Raharja menyajikan hidangan dengan kehangatan dan kelezatan masakan rumahan. Cocok untuk hidangan sehari-hari maupun pesanan catering acara Anda.
          </p>
          
          <ul className="space-y-3 mb-8 md:mb-10">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-3 text-sm font-semibold text-ink">
                <span className="w-5 h-5 rounded-full bg-forest/10 flex items-center justify-center text-forest text-xs">
                  <Check className="w-3 h-3" strokeWidth={3} />
                </span>
                {feature}
              </li>
            ))}
          </ul>
          
          <button className="px-8 py-3 rounded-full bg-forest text-white font-semibold text-sm hover:bg-forest-dark transition-colors w-full md:w-auto">
            Selengkapnya
          </button>
        </div>
        
        <div className="flex gap-3 md:gap-4 h-[250px] sm:h-[350px] md:h-[500px]">
          <div className="relative flex-1 rounded-2xl md:rounded-full overflow-hidden shadow-card mt-0 md:mt-12">
             <Image 
                src="/images/feature_img_1_1784699536052.png"
                alt="Fresh ingredients"
                fill
                className="object-cover"
              />
          </div>
          <div className="relative flex-1 rounded-2xl md:rounded-full overflow-hidden shadow-card mb-0 md:mb-12">
             <Image 
                src="/images/dish_noodle_1784699485646.png"
                alt="Delicious food"
                fill
                className="object-cover"
              />
          </div>
        </div>
      </div>
    </section>
  );
}
