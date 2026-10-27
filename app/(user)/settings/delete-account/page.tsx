import DeleteAccountForm from "./DeleteAccountForm";

export default function DeleteAccountPage() {
  return (
    <main className="page-gutter min-h-screen bg-black px-6 pb-20 pt-32 font-[family-name:var(--font-geist-sans)] text-white sm:px-8">
      <div className="absolute inset-0 page-ambient pointer-events-none" />
      <div className="relative">
        <DeleteAccountForm />
      </div>
    </main>
  );
}
