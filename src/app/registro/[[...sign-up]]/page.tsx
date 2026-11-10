import { SignUp } from "@clerk/nextjs";
import { AuthLayout } from "@/components/AuthLayout";

function Registro() {
  return (
    <AuthLayout><SignUp /></AuthLayout>
  );
}

export default Registro;
