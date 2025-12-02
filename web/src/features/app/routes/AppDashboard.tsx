import { useSession } from "@/features/auth/api/useSession";

export const AppDashboard: React.FC = () => {
  const session = useSession();

  return (
    <div>
      <pre>{JSON.stringify(session.data)}</pre>
    </div>
  );
};
