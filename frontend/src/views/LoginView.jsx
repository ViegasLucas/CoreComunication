import React, { useState } from "react";
import { HelpCircle, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function LoginView({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const normalizedEmail = email.trim().toLowerCase();
    let role = null;
    
    if (normalizedEmail === "visaolider@gmail.com") {
      role = "leader";
    } else if (normalizedEmail === "visaooperacional@gmail.com") {
      role = "employee";
    } else if (normalizedEmail === "visaorh@gmail.com") {
      role = "hr";
    } else {
      alert("E-mail não autorizado! Para testar as telas, utilize: \n- visaolider@gmail.com\n- visaooperacional@gmail.com\n- visaorh@gmail.com");
      return;
    }

    // TODO: wire auth logic with Firebase
    onLoginSuccess(role);
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

      <div className="relative w-full max-w-lg animate-scale-in">
        {/* glass card */}
        <div className="rounded-3xl border border-border/60 bg-card/80 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-12">
          {/* brand mark */}
          <div className="mb-10 text-center">
            <div className="mx-auto mb-6 flex h-20 items-center justify-center">
              <img
                src="/logo-brancoClearIt.png"
                alt="ClearIT Logo"
                className="h-full object-contain"
              />
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Smart Leading
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              Frase teste
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label htmlFor="email" className="block text-base font-medium text-foreground">
                E-mail
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@empresa.com"
                  className="w-full rounded-xl border border-input bg-background/60 py-3.5 pl-12 pr-4 text-base text-foreground placeholder:text-muted-foreground/70 outline-none ring-0 transition focus:border-primary focus:bg-background focus:ring-2 focus:ring-ring/40"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label htmlFor="password" className="block text-base font-medium text-foreground">
                Senha
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
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="group mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90 hover:shadow-primary/35 active:scale-[0.98]"
            >
              Entrar
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </form>

          {/* subtle links */}
          <div className="mt-8 flex items-center justify-between text-sm text-muted-foreground">
            <button
              type="button"
              className="transition hover:text-primary hover:underline"
            >
              Esqueci a senha
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 transition hover:text-primary hover:underline"
            >
              Ajuda
              <HelpCircle className="h-4 w-4" />
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground/70">
          Ao continuar, você concorda com os Termos de Serviço e Política de Privacidade.
        </p>
      </div>
    </main>
  );
}
