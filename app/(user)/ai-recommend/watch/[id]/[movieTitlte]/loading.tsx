const loading = () => {
  return (
    <main className="min-h-screen font-[family-name:var(--font-geist-sans)] bg-black flex flex-col px-15 pt-28 pb-16 text-white">
      <div className="w-full aspect-video bg-white/10 rounded-lg" />

      <div className="flex justify-between items-center gap-8 mt-12">
        <div className="h-10 w-[60%] bg-white/10 rounded-lg" />
        <div className="h-10 w-[13%] bg-white/10 rounded-lg" />
      </div>

      <div className="h-4 w-[10%] bg-white/10 rounded-sm mt-6" />
      <div className="h-5 w-[55%] bg-white/10 rounded-sm mt-3" />
      <div className="h-6 w-[40%] bg-white/10 rounded-sm mt-4" />
      <div className="h-5 w-[15%] bg-white/10 rounded-sm mt-4" />
    </main>
  );
};

export default loading;
