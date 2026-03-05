export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
      <h1 className="text-5xl font-extrabold text-green-800 mb-4">
        The Future of Farming is Smart.
      </h1>
      <p className="text-lg text-gray-600 max-w-2xl mb-8">
        Buy verified inputs, sell your harvest directly, and diagnose crop diseases instantly with our AI-powered platform.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <a href="/marketplace" className="bg-green-700 text-white px-8 py-3 rounded-full font-bold shadow-lg">
          Explore Market
        </a>
        <a href="/scanner" className="bg-white border-2 border-green-700 text-green-700 px-8 py-3 rounded-full font-bold">
          Try AI Scanner
        </a>
      </div>
    </div>
  );
}
