import React from "react";
import Image from "next/image";

type InputProps = {
  label: string;
  type?: string;
};

const InputField: React.FC<InputProps> = ({ label, type = "text" }) => {
  return (
    <div className="w-full flex flex-col gap-2">
      <label className="text-lg font-semibold text-[#0b2f63]">{label}</label>
      <input
        type={type}
        className="w-full h-12 px-4 rounded-md border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0b2f63]"
      />
    </div>
  );
};

const SelectField: React.FC<{ label: string }> = ({ label }) => {
  return (
    <div className="w-full flex flex-col gap-2">
      <label className="text-lg font-semibold text-[#0b2f63]">{label}</label>
      <select className="w-full h-12 px-4 rounded-md border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0b2f63]">
        <option>Select {label}</option>
      </select>
    </div>
  );
};

const Sidebar = () => {
  const menus = [
    "Dashboard",
    "C-Level",
    "Marketing & Communications",
    "Finance",
    "Operations",
    "Human Resources",
  ];

  return (
    <aside className="w-full lg:w-64 bg-white shadow-md p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-[#0b2f63]">
          StudentxCEOs <br /> East Java
        </h1>
        <p className="text-sm text-[#0b2f63] mt-1">Batch 7</p>
      </div>

      <button className="bg-[#051f46] text-white py-2 rounded-md font-semibold">
        Add User
      </button>

      <nav className="flex flex-col gap-4 mt-6">
        {menus.map((item) => (
          <p key={item} className="text-[#0b2f63] cursor-pointer">
            {item}
          </p>
        ))}
      </nav>
    </aside>
  );
};

const Header = () => {
  return (
    <header className="w-full bg-gradient-to-b from-[#031b3e] to-[#0c326a] text-white px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <Image
          src="/sxc_logo.png"
          alt="StudentxCEOs logo"
          width={96}
          height={32}
          className="w-24 h-auto"
        />
        <h1 className="font-bold text-lg md:text-xl">
          Performance Appraisal Super Admin
        </h1>
      </div>
    </header>
  );
};

const EditUserPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-200 flex flex-col">
      <Header />

      <div className="flex flex-1 flex-col lg:flex-row">
        <Sidebar />

        <main className="flex-1 p-6 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold text-[#0b2f63] mb-6">
            Edit User
          </h2>

          <div className="bg-white rounded-xl shadow-md p-6 md:p-10 flex flex-col lg:flex-row gap-10">
            
            {/* IMAGE */}
            <div className="flex justify-center items-center w-full lg:w-1/2">
              <Image
                src="/sxc_logo.png"
                alt="Edit user illustration"
                width={320}
                height={320}
                className="w-64 md:w-80 rounded-2xl h-auto"
              />
            </div>

            {/* FORM */}
            <div className="w-full lg:w-1/2 flex flex-col gap-6">
              <InputField label="Name" />
              <InputField label="Email" type="email" />
              <InputField label="Password" type="password" />

              <SelectField label="Role" />
              <SelectField label="Division" />
              <SelectField label="Sub-Division" />

              <div className="flex flex-col md:flex-row gap-4 mt-4">
                <button className="bg-[#051f46] text-white py-3 px-6 rounded-xl font-semibold w-full md:w-auto">
                  Edit
                </button>
                <button className="text-red-500 font-medium">
                  Cancel
                </button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default EditUserPage;
