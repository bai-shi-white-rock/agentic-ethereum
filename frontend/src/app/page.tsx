"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const router = useRouter();

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="text-center flex flex-col items-center">
        <Image
          src="/logo-purple.png"
          alt="Bai Shi Logo"
          width={200}
          height={200}
        />
        <h1 className="text-2xl font-bold my-4">Hello 白石</h1>
        <button
          onClick={() => router.push("/login")}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
        >
          Login
        </button>
      </div>
    </div>
  );
}
