
import { Navigate } from "react-router-dom";

type Props = {
  isAuth: boolean;
  children: React.ReactNode;
};

export function ProtectedRoute({ isAuth, children }: Props) {
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
