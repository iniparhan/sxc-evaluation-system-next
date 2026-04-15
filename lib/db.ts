type User = {
  id: number;
  email: string;
  password: string;
  name: string;
};

const users: User[] = [
  {
    id: 1,
    email: "admin@gmail.com",
    password: "123456",
    name: "Admin",
  },
];

export function findUserByEmail(email: string) {
  return users.find((u) => u.email === email);
}