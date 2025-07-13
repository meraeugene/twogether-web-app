import RowSkeleton from "./RowSkeleton";

const loading = () => {
  return (
    <main className="pb-16 overflow-hidden pt-28  lg:px-24 xl:px-32 2xl:px-26 xl:pt-32 min-h-screen space-y-6 bg-black px-7 ">
      <RowSkeleton />
      <RowSkeleton />
      <RowSkeleton />
      <RowSkeleton />
      <RowSkeleton />
    </main>
  );
};

export default loading;
