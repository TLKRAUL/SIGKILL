import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center px-8">
      <Link to="/" className="text-2xl font-black text-red-600">SIGKILL</Link>
      <Link to="/dashboard" className="text-gray-600 hover:text-red-600 font-medium">Cămară</Link>
    </nav>
  );
}