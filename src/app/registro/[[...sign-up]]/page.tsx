import { SignUp } from "@clerk/nextjs";
import AuthLoadingBoundary from "@/components/AuthLoadingBoundary";
import { AuthLayout } from "@/components/AuthLayout";

function Registro() {
  return (
    <AuthLayout><AuthLoadingBoundary><SignUp /></AuthLoadingBoundary></AuthLayout>
  );
}

export default Registro;
