import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="w-full bg-primary h-24 flex items-center justify-between px-6 fixed top-0 z-50">
      <Link href="/" className="flex items-center">
        <Image
          src="/logo-white.png"
          alt="Logo"
          width={50}
          height={50}
          className="object-contain"
        />
        <p className="text-white text-2xl font-bold">Bai Shi</p>
      </Link>
      
      <Link href="/login">
        <Button className="bg-secondary hover:bg-tertiary font-bold text-primary text-xl" size="lg">
          Get Started
        </Button>
      </Link>
    </nav>
  );
};

export default Navbar;
