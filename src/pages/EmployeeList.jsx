import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye,
  FaSearch,
  FaTimes
} from 'react-icons/fa';
import Navbar from '../components/Navbar';
import axiosInstance from '../api/axiosInstance';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    position: '',
    phone: ''
  });

  useEffect(() => {
    fetchEmployees();
  }, [search]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/employees?search=${search}&limit=50`);
      setEmployees(response.data.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load employees');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (selectedEmployee) {
        await axiosInstance.put(`/employees/${selectedEmployee._id}`, formData);
        toast.success('Employee updated successfully');
      } else {
        await axiosInstance.post('/employees', formData);
        toast.success('Employee created successfully');
      }
      
      setShowForm(false);
      setSelectedEmployee(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        department: '',
        position: '',
        phone: ''
      });
      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save employee');
    }
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name || '',
      email: employee.email || '',
      password: '',
      department: employee.department || '',
      position: employee.position || '',
      phone: employee.phone || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (employeeId) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;

    try {
      await axiosInstance.delete(`/employees/${employeeId}`);
      toast.success('Employee deleted successfully');
      fetchEmployees();
    } catch (error) {
      toast.error('Failed to delete employee');
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setSelectedEmployee(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      department: '',
      position: '',
      phone: ''
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Employee Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your team members and their details.
          </p>
        </div>

        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative flex-1 w-full sm:w-auto">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <FaPlus />
              Add Employee
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No employees found. Add your first employee!
              </p>
            </div>
          ) : (
            employees.map((employee) => (
              <div key={employee._id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {employee.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {employee.employeeId}
                    </p>
                  </div>
                  <span className={`badge ${employee.isActive ? 'badge-completed' : 'badge-pending'}`}>
                    {employee.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Email:</strong> {employee.email}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Department:</strong> {employee.department}
                  </p>
                  {employee.position && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Position:</strong> {employee.position}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Tasks:</strong> {employee.taskCount || 0} (Completed: {employee.completedTasks || 0})
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Joined: {new Date(employee.joinDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleEdit(employee)}
                    className="flex-1 btn-secondary flex items-center justify-center gap-2 text-sm"
                  >
                    <FaEdit />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(employee._id)}
                    className="flex-1 btn-danger flex items-center justify-center gap-2 text-sm"
                  >
                    <FaTrash />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Employee Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedEmployee ? 'Edit Employee' : 'Add New Employee'}
              </h2>
              <button
                onClick={closeForm}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={!!selectedEmployee}
                    className="input-field disabled:opacity-50"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {!selectedEmployee && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={!selectedEmployee}
                    className="input-field"
                    placeholder="Minimum 6 characters"
                    minLength="6"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Department *
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="e.g., IT, HR, Sales"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Position
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g., Software Engineer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeForm}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {selectedEmployee ? 'Update Employee' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
