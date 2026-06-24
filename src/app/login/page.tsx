import { checkIsSetup } from "@/app/actions/auth";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const isSetup = await checkIsSetup();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[100px] pointer-events-none" />

      <LoginForm isSetup={isSetup} />
    </div>
  );
}
