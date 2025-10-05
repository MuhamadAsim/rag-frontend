export default function CheckEmail() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center space-y-4">
      <h1 className="text-2xl font-bold">Verify your email 📧</h1>
      <p className="text-muted-foreground max-w-md">
        We’ve sent a verification link to your email. Please click it to activate your account.
      </p>
    </div>
  );
}
