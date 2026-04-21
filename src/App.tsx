import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navigation } from "./components/Navigation";
import { Footer } from "./components/Footer";
import { Home } from "./pages/Home";
import { Dashboard } from "./pages/Dashboard";
import { Profile } from "./pages/Profile";
import { UsernameSetup } from "./pages/UsernameSetup";
import { SignIn } from "./pages/SignIn";
import { Loader2 } from "lucide-react";

const FullPageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center italic opacity-30">
    <Loader2 className="w-8 h-8 animate-spin" />
  </div>
);

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <FullPageLoader />;
  if (!user) return <Navigate to="/signin" />;

  return <>{children}</>;
};

const RequireProfile: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, loading } = useAuth();

  if (loading) return <FullPageLoader />;
  if (!profile) return <Navigate to="/setup" />;

  return <>{children}</>;
};

const HomeRoute: React.FC = () => {
  const { user, profile, loading } = useAuth();

  if (loading) return <FullPageLoader />;

  if (user && !profile) {
    return <Navigate to="/setup" />;
  }

  return <Home />;
};

const SetupRoute: React.FC = () => {
  const { profile, loading } = useAuth();

  if (loading) return <FullPageLoader />;
  if (profile) return <Navigate to="/dashboard" />;

  return <UsernameSetup />;
};

const SignInRoute: React.FC = () => {
  const { user, profile, loading } = useAuth();

  if (loading) return <FullPageLoader />;

  if (user && profile) return <Navigate to="/dashboard" />;
  if (user && !profile) return <Navigate to="/setup" />;

  return <SignIn />;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#FCFCFC] text-[#111] font-sans selection:bg-[#111] selection:text-white">
          <Navigation />
          <main className="max-w-[1400px] mx-auto px-6 md:px-12 pb-24">
            <Routes>
              <Route path="/" element={<HomeRoute />} />
              <Route path="/signin" element={<SignInRoute />} />
              <Route path="/setup" element={<RequireAuth><SetupRoute /></RequireAuth>} />
              <Route path="/dashboard" element={<RequireAuth><RequireProfile><Dashboard /></RequireProfile></RequireAuth>} />
              <Route path="/:username" element={<Profile />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
