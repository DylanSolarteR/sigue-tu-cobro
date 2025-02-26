import { UserProfile } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui";

function Config() {
  return (
    <>
      <UserProfile
        fallback={
          <Skeleton className="flex h-full w-[55rem] flex-col items-center justify-center gap-2"></Skeleton>
        }
      />
    </>
  );
}

export default Config;
