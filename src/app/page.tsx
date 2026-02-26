import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-white px-4 pt-2">
      
      {/* Logo */}
      <div className="mb-15">
        <Image
          src="/logo.png"
          alt="e-Gurukulam for IAS"
          width={220}
          height={80}
          priority
        />
      </div>

      {/* Heading */}
      <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700 mb-10 tracking-wide">
        DASHBOARD
      </h1>

      {/* Button */}
      <Link href="/upload">
        <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-full transition duration-300 shadow-md">
          UPLOAD EXCEL SHEET
        </button>
      </Link>
    </div>
  );
}
