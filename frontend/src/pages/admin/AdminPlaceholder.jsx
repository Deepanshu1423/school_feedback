import { useLocation } from "react-router-dom";

const AdminPlaceholder = () => {
  const location = useLocation();

  return (
    <div className="bg-white border border-[#d8c3a0] rounded-[28px] p-10 shadow-lg">
      <h2 className="text-3xl font-bold text-black mb-4">Coming Soon</h2>
      <p className="text-gray-700 text-lg">
        This page is under development.
      </p>
      <p className="text-[#a57f42] font-medium mt-3">
        Current route: {location.pathname}
      </p>
    </div>
  );
};

export default AdminPlaceholder;