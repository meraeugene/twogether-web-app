import DeleteAccountForm from "./DeleteAccountForm";

export default function DeleteAccountPage() {
  return (
    <main className="min-h-screen bg-black px-6 pb-20 pt-32 font-[family-name:var(--font-geist-sans)] text-white sm:px-8">
      <div className="absolute inset-0 bg-gradient-to-br from-red-700/20 via-black/5 to-red-800/10 pointer-events-none" />
      <div className="relative">
        <DeleteAccountForm />
      </div>
    </main>
  );
}
