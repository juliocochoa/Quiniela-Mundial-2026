import React, { useState } from "react";
import { supabase } from "../supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleRequestMagicLink = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Por favor ingresa un correo electrónico.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor ingresa un correo electrónico válido.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: true,
          // Supabase redirige automáticamente al root (/) o al que configures en el Dashboard
          emailRedirectTo: window.location.origin,
        },
      });

      if (signInError) throw signInError;

      // Mostrar estado de éxito
      setIsEmailSent(true);
    } catch (err) {
      setError(err.message || "Error al enviar el enlace mágico.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = () => {
    // Aquí podrías agregar supabase.auth.signInWithOAuth({ provider: 'google' })
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col items-center justify-center p-gutter selection:bg-primary-fixed selection:text-on-primary-fixed relative overflow-x-hidden">
      {/* Main Content Canvas */}
      <main className="w-full max-w-[440px] animate-in fade-in duration-700 slide-in-from-bottom-4 relative z-10">
        {/* Brand Header Section */}
        <header className="text-center mb-stack-lg">
          <div className="inline-flex items-center justify-center mb-4 text-primary">
            <span
              className="material-symbols-outlined !text-[48px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              sports_soccer
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight uppercase">
            QUINIELA MUNDIAL 2026
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">
            El Circulo Edition
          </p>
        </header>

        {/* Login Card */}
        <div className="bg-surface-container-lowest border border-outline-variant p-stack-lg rounded-xl shadow-[0_20px_50px_rgba(0,12,46,0.08)] relative overflow-hidden">
          {/* Decorative flare reflecting vibrancy */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-secondary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>

          <div className="relative z-10 flex flex-col gap-stack-md">
            {!isEmailSent ? (
              <>
                <div className="text-center mb-2">
                  <h2 className="font-headline-lg text-[24px] text-on-surface">
                    Welcome Back
                  </h2>
                  <p className="font-label-sm text-label-sm text-on-surface-variant mt-1 uppercase tracking-wider">
                    Enter your credentials to continue
                  </p>
                </div>

                {/* Social Authentication Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleSocialLogin}
                    className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-surface-container-low border border-outline-variant hover:bg-surface-container-high active:scale-[0.98] transition-all duration-200 rounded-lg group"
                  >
                    <img
                      alt="Google"
                      className="w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4OwMUh2IoTOQQSx993JSWbtfndgilCk7Zi5NGq9FRmsaoIKbncf2I30i8w0Gb1XPZ8oYvznpdqACXGBhZ_2f-QRHRU-kSrtUIR3E0-VFnoBp-fzY6yJiQWkmN1Zg_zWEYGZanSI2tCq9y4Tl-3H8Z1RFPhXXzn9SOLGoAY2i1n9WWbK9GzfUB8MWpoKaof8uNVnx539FofZdXnEqgQr19idp_VcPyYZCvcwFMJiqdMg4knA1BWF9-w2dDbEukGngYrZFa9V5Z55jT"
                    />
                    <span className="font-body-md text-body-md text-on-surface font-semibold">
                      Sign in with Google
                    </span>
                  </button>
                  <button
                    onClick={handleSocialLogin}
                    className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-primary text-on-primary hover:bg-primary-container active:scale-[0.98] transition-all duration-200 rounded-lg"
                  >
                    <span
                      className="material-symbols-outlined !text-[20px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      ios
                    </span>
                    <span className="font-body-md text-body-md font-semibold">
                      Sign in with Apple
                    </span>
                  </button>
                </div>

                {/* Separator */}
                <div className="flex items-center gap-4 py-2">
                  <div className="h-px flex-1 bg-outline-variant"></div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    OR
                  </span>
                  <div className="h-px flex-1 bg-outline-variant"></div>
                </div>

                {/* Form Section */}
                <form
                  onSubmit={handleRequestMagicLink}
                  className="space-y-4"
                >
                  <div className="group">
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5 ml-1 group-focus-within:text-primary transition-colors">
                      EMAIL ADDRESS
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError("");
                      }}
                      className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-3 px-4 text-on-surface outline-none transition-all placeholder:text-outline/50"
                      placeholder="name@stadium.com"
                      disabled={isLoading}
                    />
                    {error && (
                      <p className="text-red-600 text-xs mt-1 ml-1">
                        {error}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-secondary text-on-secondary py-4 font-headline-lg text-[20px] hover:bg-on-secondary-fixed-variant active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 rounded-lg shadow-md flex justify-center items-center gap-2"
                  >
                    {isLoading ? (
                      <span
                        className="material-symbols-outlined animate-spin"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        sync
                      </span>
                    ) : (
                      "Continue with Email"
                    )}
                  </button>
                </form>
              </>
            ) : (
              // Email Sent Success State
              <div className="text-center py-6 animate-in zoom-in-95 duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
                  <span className="material-symbols-outlined text-[32px]">
                    mark_email_read
                  </span>
                </div>
                <h3 className="font-headline-md text-[24px] text-on-surface font-semibold mb-2">
                  Revisa tu correo
                </h3>
                <p className="font-body-md text-on-surface-variant mb-8">
                  Hemos enviado un enlace de acceso mágico a<br />
                  <span className="font-medium text-on-surface block mt-2">
                    {email}
                  </span>
                </p>
                <p className="text-sm text-on-surface-variant mb-6">
                  Haz clic en el enlace del correo para iniciar sesión
                  automáticamente. Puedes cerrar esta ventana.
                </p>
                <button
                  onClick={() => setIsEmailSent(false)}
                  className="text-secondary text-sm font-medium hover:underline"
                >
                  ¿No recibiste el correo? Intenta de nuevo
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <footer className="mt-stack-lg text-center flex flex-col gap-4">
          <p className="font-body-md text-body-md text-on-surface-variant">
            Versión 1.0 (Beta)
          </p>
        </footer>
      </main>

      {/* Background Atmospheric Elements: Vibrant Stadium Imagery */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-secondary/5"></div>
        <img
          alt="FIFA Stadium Background"
          className="w-full h-full object-cover opacity-20 contrast-125 saturate-150"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4OwMUh2IoTOQQSx993JSWbtfndgilCk7Zi5NGq9FRmsaoIKbncf2I30i8w0Gb1XPZ8oYvznpdqACXGBhZ_2f-QRHRU-kSrtUIR3E0-VFnoBp-fzY6yJiQWkmN1Zg_zWEYGZanSI2tCq9y4Tl-3H8Z1RFPhXXzn9SOLGoAY2i1n9WWbK9GzfUB8MWpoKaof8uNVnx539FofZdXnEqgQr19idp_VcPyYZCvcwFMJiqdMg4knA1BWF9-w2dDbEukGngYrZFa9V5Z55jT"
        />
      </div>
    </div>
  );
}
