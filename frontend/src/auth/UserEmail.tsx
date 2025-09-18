import { useEffect, useState } from "react";
import { subscribeAuth } from ".";

const UserEmail = () => {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeAuth((user) => {
      setEmail(user?.email ?? null);
    });
    return () => unsub();
  }, []);

  if (!email) return null;
  return <span className="title" style={{ marginRight: 16 }}>{email}</span>;
};

export default UserEmail;


