import { LoadingPage } from "@/components/PageSkeletons";
import RowSkeleton from "@/app/(user)/recos/RowSkeleton";

export default function RecosSkeletonLoading() {
  return (
    <LoadingPage label="Loading recommendations">
      <RowSkeleton title="Latest Reco" />
      <RowSkeleton />
      <RowSkeleton />
    </LoadingPage>
  );
}
