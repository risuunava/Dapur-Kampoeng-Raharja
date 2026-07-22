import { FaLinkedinIn, FaInstagram, FaFacebookF } from 'react-icons/fa';

const chefs = [
  {
    name: "BUDI SANTOSO",
    experience: "12 YEAR EXPERIENCE",
    initials: "BS",
    color: "bg-blue-100 text-blue-700"
  },
  {
    name: "SITI AMINAH",
    experience: "09 YEAR EXPERIENCE",
    initials: "SA",
    color: "bg-orange-100 text-orange-700"
  },
  {
    name: "AGUS PRATAMA",
    experience: "06 YEAR EXPERIENCE",
    initials: "AP",
    color: "bg-green-100 text-green-700"
  }
];

export default function ChefSection() {
  return (
    <section className="max-w-7xl mx-auto px-8 py-16 bg-white/50 rounded-3xl mb-20">
      <div className="flex items-center justify-between mb-12">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-ink">
          Meet with our Chief
        </h2>
        <button className="px-6 py-2.5 rounded-full bg-forest text-white font-semibold text-sm hover:bg-forest-dark transition-colors">
          View all chief
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {chefs.map((chef, idx) => (
          <div key={idx} className="bg-surface rounded-2xl p-8 flex flex-col items-center shadow-sm border border-line/50 text-center hover:shadow-card transition-shadow">
            <div className={`w-40 h-40 rounded-full flex items-center justify-center text-5xl font-display font-bold mb-6 shadow-inner ${chef.color}`}>
              {chef.initials}
            </div>
            <h3 className="text-sm font-bold text-ink tracking-widest uppercase mb-1">{chef.name}</h3>
            <p className="text-[10px] text-muted font-bold tracking-widest uppercase mb-4">{chef.experience}</p>
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-forest text-white flex items-center justify-center text-xs cursor-pointer">
                <FaLinkedinIn className="w-4 h-4" />
              </span>
              <span className="w-8 h-8 rounded-full bg-surface border border-line flex items-center justify-center text-xs text-ink cursor-pointer hover:bg-forest hover:text-white transition-colors">
                <FaInstagram className="w-4 h-4" />
              </span>
              <span className="w-8 h-8 rounded-full bg-surface border border-line flex items-center justify-center text-xs text-ink cursor-pointer hover:bg-forest hover:text-white transition-colors">
                <FaFacebookF className="w-4 h-4" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
