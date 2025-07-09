import RowSkeleton from "./RowSkeleton";

const loading = () => {
  return (
    <main className="pb-16 overflow-hidden pt-28 min-h-screen space-y-6 bg-black px-15">
      <RowSkeleton />
      <RowSkeleton />
      <RowSkeleton />
      <RowSkeleton />
      <RowSkeleton />
    </main>
  );
};

export default loading;
