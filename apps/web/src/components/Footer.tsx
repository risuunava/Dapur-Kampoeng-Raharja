import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="max-w-7xl mx-auto px-8 pb-12 pt-8">
      <div className="flex flex-col md:flex-row items-center justify-between border-b border-line pb-8 mb-8 gap-4">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-ink mb-2 md:mb-0 text-center md:text-left">
          Ingin pesan Catering untuk acara Anda?
        </h2>
        <a href="https://wa.me/6288812342278" target="_blank" rel="noreferrer" className="px-8 py-3 rounded-full bg-forest text-white font-semibold text-sm hover:bg-forest-dark transition-colors text-center whitespace-nowrap">
          Hubungi via WhatsApp
        </a>
      </div>
      <p className="text-xs text-muted max-w-2xl leading-relaxed mb-16 text-center md:text-left mx-auto md:mx-0">
        Kami melayani pesanan catering partai besar maupun kecil untuk berbagai acara seperti syukuran, pernikahan, rapat kantor, dan lainnya. Diskusikan menu dan budget Anda bersama kami.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xl font-bold tracking-tight text-primary font-display uppercase">Dapur Kampoeng</span>
          </div>
          <div className="flex items-center gap-3">
            <FaFacebookF className="w-4 h-4 text-muted hover:text-primary cursor-pointer transition-colors" />
            <FaTwitter className="w-4 h-4 text-muted hover:text-primary cursor-pointer transition-colors" />
            <FaLinkedinIn className="w-4 h-4 text-muted hover:text-primary cursor-pointer transition-colors" />
            <FaInstagram className="w-4 h-4 text-muted hover:text-primary cursor-pointer transition-colors" />
          </div>
        </div>
        
        <div>
          <h4 className="font-bold text-ink mb-4">Our services</h4>
          <ul className="space-y-3 text-xs text-muted font-medium">
            <li className="hover:text-primary cursor-pointer transition-colors">Pricing</li>
            <li className="hover:text-primary cursor-pointer transition-colors">Tracking</li>
            <li className="hover:text-primary cursor-pointer transition-colors">Report a Bug</li>
            <li className="hover:text-primary cursor-pointer transition-colors">Terms of service</li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-bold text-ink mb-4">Our Company</h4>
          <ul className="space-y-3 text-xs text-muted font-medium">
            <li className="hover:text-primary cursor-pointer transition-colors">Reporting</li>
            <li className="hover:text-primary cursor-pointer transition-colors">Get in Touch</li>
            <li className="hover:text-primary cursor-pointer transition-colors">Management</li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-bold text-ink mb-4">Address</h4>
          <ul className="space-y-3 text-xs text-muted font-medium">
            <li>121 King St.</li>
            <li>888-123-42278</li>
            <li className="hover:text-primary cursor-pointer transition-colors">hello.dapurkampoeng@gmail.com</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
