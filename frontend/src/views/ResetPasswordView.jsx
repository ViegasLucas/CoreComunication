import { useState } from "react";
import { Lock, ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "../lib/firebase";
import ReCAPTCHA from "react-google-recaptcha";

export default function ResetPasswordView({ oobCode, onPasswordResetSuccess }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  // Essa é uma chave pública OFICIAL DE TESTES DO GOOGLE. Ela sempre funciona em localhost (não é sensível).
  const recaptchaSiteKey = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";

  const handleRecaptcha = (token) => {
    setRecaptchaToken(token);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (password.length < 6) {
      setError("A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (!recaptchaToken) {
      setError("Por favor, confirme que você não é um robô antes de continuar.");
      return;
    }

    try {
      setIsLoading(true);
      await confirmPasswordReset(auth, oobCode, password);
      // Dispara callback de sucesso para o App avisando que o reset foi completado
      onPasswordResetSuccess();
    } catch (err) {
      console.error("[Auth] Erro ao redefinir senha:", err.message);
      if (err.code === "auth/invalid-action-code") {
        setError("O link de redefinição expirou ou já foi utilizado. Por favor, solicite um novo.");
      } else {
        setError("Ocorreu um erro ao redefinir sua senha. Tente novamente mais tarde.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12 w-full">
      {/* subtle gradient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, oklch(0.35 0.15 262.881 / 0.35), transparent 55%), radial-gradient(circle at 80% 90%, oklch(0.25 0.08 262.881 / 0.22), transparent 45%)",
        }}
      />

      <div className="relative w-full max-w-lg animate-in fade-in zoom-in-95 duration-500">
        {/* glass card */}
        <div className="rounded-3xl border border-border/60 bg-card/80 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-12">
          
          <div className="mb-10 text-center">
            <div className="mx-auto mb-6 flex h-20 items-center justify-center">
              <ShieldCheck className="h-16 w-16 text-primary drop-shadow-md" />
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Nova Senha
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              Digite e confirme sua nova senha de acesso.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-3">
              <label htmlFor="password" className="block text-base font-medium text-foreground">
                Nova Senha
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-input bg-background/60 py-3.5 pl-12 pr-12 text-base text-foreground placeholder:text-muted-foreground/70 outline-none ring-0 transition focus:border-primary focus:bg-background focus:ring-2 focus:ring-ring/40"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label htmlFor="confirmPassword" className="block text-base font-medium text-foreground">
                Confirmar Senha
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-input bg-background/60 py-3.5 pl-12 pr-12 text-base text-foreground placeholder:text-muted-foreground/70 outline-none ring-0 transition focus:border-primary focus:bg-background focus:ring-2 focus:ring-ring/40"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="pt-2 pb-2 flex justify-center">
              <ReCAPTCHA
                sitekey={recaptchaSiteKey}
                onChange={handleRecaptcha}
                theme="dark"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-destructive/15 p-3 text-sm text-destructive border border-destructive/30 text-center animate-in fade-in duration-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="group mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90 hover:shadow-primary/35 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Salvando..." : "Salvar Nova Senha"}
              {!isLoading && <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />}
            </button>
          </form>
          
          <div className="mt-8 text-center text-sm text-muted-foreground">
             Lembrou da senha? <button type="button" onClick={() => window.location.href="/"} className="text-primary hover:underline">Voltar ao Login</button>
          </div>
        </div>
      </div>
    </main>
  );
}
