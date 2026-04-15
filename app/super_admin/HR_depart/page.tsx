import React from "react";

type User = {
  id: number;
  name: string;
  role: string;
  division: string;
  image: string;
};

const users: User[] = [
  {
    id: 1,
    name: "Irfan",
    role: "Chief Human Resources Officer",
    division: "Human Resources",
    image: "/user.png",
  },
  {
    id: 2,
    name: "Irfan",
    role: "Chief Human Resources Officer",
    division: "Human Resources",
    image: "/user.png",
  },
];

const Sidebar = () => {
  return (
    <aside className="w-full md:w-64 bg-white shadow-md p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-[#0b2f63]">
          StudentxCEOs <br /> East Java
        </h1>
        <p className="text-sm text-[#0b2f63] mt-1">Batch 7</p>
      </div>

      <button className="bg-[#051f46] text-white py-2 rounded-lg font-semibold">
        Add User
      </button>

      <nav className="flex flex-col gap-4 text-[#0b2f63]">
        <p>Dashboard</p>
        <p>C-Level</p>
        <p>Marketing & Communications</p>
        <p>Finance</p>
        <p>Operations</p>
        <p className="font-bold">Human Resources</p>
      </nav>
    </aside>
  );
};

const Header = () => {
  return (
    <header className="w-full bg-gradient-to-b from-[#031b3e] to-[#0c326a] text-white flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-4">
        <img src="/logo.png" alt="logo" className="w-24" />
        <h1 className="font-bold text-lg md:text-xl">
          Performance Appraisal Super Admin
        </h1>
      </div>
    </header>
  );
};

const UserCard = ({ user }: { user: User }) => {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white rounded-xl shadow-md p-4 gap-4">
      <div className="flex items-center gap-4">
        <img
          src={user.image}
          alt={user.name}
          className="w-16 h-16 rounded-lg object-cover"
        />
        <div>
          <p className="font-bold text-[#0b2f63]">{user.name}</p>
          <p className="text-sm text-[#0b2f63]">{user.role}</p>
          <p className="text-xs font-semibold text-[#0b2f63]">
            {user.division}
          </p>
        </div>
      </div>

      <div className="flex gap-2 w-full md:w-auto">
        <button className="flex-1 md:flex-none bg-red-500/70 text-white px-4 py-2 rounded-lg">
          Delete
        </button>
        <button className="flex-1 md:flex-none bg-[#051f46] text-white px-4 py-2 rounded-lg">
          Edit
        </button>
      </div>
    </div>
  );
};

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="flex flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#0b2f63]">
              Lets we see parhan
            </h2>
            <p className="text-[#0b2f63]">Any problem?</p>
          </div>

          <div className="flex flex-col gap-4">
            {users.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}