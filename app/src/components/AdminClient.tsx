"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  username: string;
  role: string;
  createdAt: Date | string;
}

interface Props {
  users: User[];
  currentUserId: string;
}

export default function AdminClient({ users: initialUsers, currentUserId }: Props) {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>(initialUsers);

  const [creds, setCreds] = useState({ currentPassword: "", newUsername: "", newPassword: "" });
  const [credsError, setCredsError] = useState("");
  const [credsOk, setCredsOk] = useState(false);
  const [credsLoading, setCredsLoading] = useState(false);

  const [newUser, setNewUser] = useState({ username: "", password: "", role: "USER" });
  const [newUserError, setNewUserError] = useState("");
  const [newUserLoading, setNewUserLoading] = useState(false);

  async function handleCredsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCredsError("");
    setCredsOk(false);
    setCredsLoading(true);

    const res = await fetch("/api/admin/credentials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(creds),
    });

    const data = await res.json();
    setCredsLoading(false);

    if (!res.ok) {
      setCredsError(data.error ?? "Erreur");
      return;
    }

    setCredsOk(true);
    setCreds({ currentPassword: "", newUsername: "", newPassword: "" });
    router.refresh();
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setNewUserError("");
    setNewUserLoading(true);

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });

    const data = await res.json();
    setNewUserLoading(false);

    if (!res.ok) {
      setNewUserError(data.error ?? "Erreur");
      return;
    }

    setUsers((prev) => [...prev, data]);
    setNewUser({ username: "", password: "", role: "USER" });
  }

  async function handleDeleteUser(id: string, username: string) {
    if (!confirm(`Supprimer le compte "${username}" ?`)) return;

    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  }

  const inputClass = "bg-transparent border px-4 py-3 text-sm outline-none transition-colors duration-150 w-full";
  const inputStyle = { borderColor: "#2d2926", color: "#dfd8cc", fontFamily: "var(--font-inter)" };

  return (
    <div className="pt-20 max-w-2xl mx-auto px-6 py-10 flex flex-col gap-14">

      {/* Identifiants */}
      <section className="flex flex-col gap-6">
        <h2
          className="text-xs tracking-widest uppercase pb-3 border-b"
          style={{ color: "#8a837a", letterSpacing: "0.2em", borderColor: "#2d2926" }}
        >
          Mes identifiants
        </h2>

        <form onSubmit={handleCredsSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="Mot de passe actuel *"
            value={creds.currentPassword}
            onChange={(e) => setCreds((p) => ({ ...p, currentPassword: e.target.value }))}
            required
            autoComplete="current-password"
            className={inputClass}
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#c8a06a")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#2d2926")}
          />
          <input
            type="text"
            placeholder="Nouvel identifiant (optionnel)"
            value={creds.newUsername}
            onChange={(e) => setCreds((p) => ({ ...p, newUsername: e.target.value }))}
            autoComplete="username"
            className={inputClass}
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#c8a06a")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#2d2926")}
          />
          <input
            type="password"
            placeholder="Nouveau mot de passe (optionnel)"
            value={creds.newPassword}
            onChange={(e) => setCreds((p) => ({ ...p, newPassword: e.target.value }))}
            autoComplete="new-password"
            className={inputClass}
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#c8a06a")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#2d2926")}
          />

          {credsError && <p className="text-xs" style={{ color: "#a05050" }}>{credsError}</p>}
          {credsOk && <p className="text-xs" style={{ color: "#6a9a6a" }}>Modifie avec succes</p>}

          <button
            type="submit"
            disabled={credsLoading}
            className="mt-1 px-6 py-2.5 border text-xs tracking-widest uppercase transition-colors duration-200 disabled:opacity-40 self-start"
            style={{ borderColor: "#c8a06a", color: "#c8a06a", letterSpacing: "0.2em" }}
          >
            {credsLoading ? "..." : "Enregistrer"}
          </button>
        </form>
      </section>

      {/* Comptes */}
      <section className="flex flex-col gap-6">
        <h2
          className="text-xs tracking-widest uppercase pb-3 border-b"
          style={{ color: "#8a837a", letterSpacing: "0.2em", borderColor: "#2d2926" }}
        >
          Comptes
        </h2>

        <ul className="flex flex-col gap-1">
          {users.map((u) => (
            <li
              key={u.id}
              className="flex items-center justify-between py-3 border-b"
              style={{ borderColor: "#1e1c1a" }}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm" style={{ color: "#dfd8cc" }}>{u.username}</span>
                <span
                  className="text-xs tracking-widest uppercase px-2 py-0.5 border"
                  style={{
                    color: u.role === "ADMIN" ? "#c8a06a" : "#8a837a",
                    borderColor: u.role === "ADMIN" ? "#c8a06a40" : "#2d2926",
                    letterSpacing: "0.1em",
                  }}
                >
                  {u.role === "ADMIN" ? "Admin" : "User"}
                </span>
              </div>
              {u.id !== currentUserId && (
                <button
                  onClick={() => handleDeleteUser(u.id, u.username)}
                  className="text-xs tracking-widest uppercase transition-colors duration-200"
                  style={{ color: "#8a837a", letterSpacing: "0.1em" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#a05050")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#8a837a")}
                >
                  Supprimer
                </button>
              )}
            </li>
          ))}
        </ul>

        <form onSubmit={handleCreateUser} className="flex flex-col gap-4 mt-2">
          <p className="text-xs tracking-widest uppercase" style={{ color: "#8a837a", letterSpacing: "0.15em" }}>
            Creer un compte
          </p>
          <input
            type="text"
            placeholder="Identifiant *"
            value={newUser.username}
            onChange={(e) => setNewUser((p) => ({ ...p, username: e.target.value }))}
            required
            className={inputClass}
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#c8a06a")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#2d2926")}
          />
          <input
            type="password"
            placeholder="Mot de passe *"
            value={newUser.password}
            onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))}
            required
            className={inputClass}
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#c8a06a")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#2d2926")}
          />
          <div className="flex items-center gap-4">
            {["USER", "ADMIN"].map((r) => (
              <label key={r} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value={r}
                  checked={newUser.role === r}
                  onChange={() => setNewUser((p) => ({ ...p, role: r }))}
                  className="accent-[#c8a06a]"
                />
                <span className="text-xs tracking-widest uppercase" style={{ color: "#8a837a", letterSpacing: "0.1em" }}>
                  {r === "USER" ? "User" : "Admin"}
                </span>
              </label>
            ))}
          </div>

          {newUserError && <p className="text-xs" style={{ color: "#a05050" }}>{newUserError}</p>}

          <button
            type="submit"
            disabled={newUserLoading}
            className="px-6 py-2.5 border text-xs tracking-widest uppercase transition-colors duration-200 disabled:opacity-40 self-start"
            style={{ borderColor: "#c8a06a", color: "#c8a06a", letterSpacing: "0.2em" }}
          >
            {newUserLoading ? "..." : "Creer"}
          </button>
        </form>
      </section>
    </div>
  );
}
