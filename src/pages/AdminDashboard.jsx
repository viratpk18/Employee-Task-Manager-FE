import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaTasks, 
  FaUsers, 
  FaCheckCircle, 
  FaClock,
  FaExclamationTriangle,
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash
} from 'react-icons/fa';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import TaskForm from '../components/TaskForm';
import axiosInstance from '../api/axiosInstance';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    overdueTasks: 0
  });
  const [tasks, setTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [priorityData, setPriorityData] = useState([]);

  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [taskStatsRes, employeeStatsRes, tasksRes] = await Promise.all([
        axiosInstance.get('/tasks/stats/overview'),
        axiosInstance.get('/employees/stats/overview'),
        axiosInstance.get('/tasks?limit=10')
      ]);

      setStats({
        totalEmployees: employeeStatsRes.data.data.totalEmployees,
        totalTasks: taskStatsRes.data.data.totalTasks,
        completedTasks: taskStatsRes.data.data.completedTasks,
        pendingTasks: taskStatsRes.data.data.pendingTasks,
        inProgressTasks: taskStatsRes.data.data.inProgressTasks,
        overdueTasks: taskStatsRes.data.data.overdueTasks
      });

      setTasks(tasksRes.data.data);

      // Process priority data for pie chart
      const priorityStats = taskStatsRes.data.data.priorityStats || [];
      setPriorityData(priorityStats.map(item => ({
        name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
        value: item.count
      })));

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await axiosInstance.delete(`/tasks/${taskId}`);
      toast.success('Task deleted successfully');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleTaskCreated = () => {
    setShowTaskForm(false);
    setSelectedTask(null);
    fetchDashboardData();
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: 'badge badge-low',
      medium: 'badge badge-medium',
      high: 'badge badge-high',
      urgent: 'badge badge-urgent'
    };
    return badges[priority] || badges.medium;
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge badge-pending',
      'in-progress': 'badge badge-in-progress',
      completed: 'badge badge-completed'
    };
    return badges[status] || badges.pending;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back! Here's an overview of your team's performance.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Employees"
            value={stats.totalEmployees}
            icon={FaUsers}
            color="blue"
          />
          <StatCard
            title="Total Tasks"
            value={stats.totalTasks}
            icon={FaTasks}
            color="primary"
          />
          <StatCard
            title="Completed Tasks"
            value={stats.completedTasks}
            icon={FaCheckCircle}
            color="green"
          />
          <StatCard
            title="Overdue Tasks"
            value={stats.overdueTasks}
            icon={FaExclamationTriangle}
            color="red"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Task Status Bar Chart */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Task Status Overview
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: 'Pending', count: stats.pendingTasks },
                { name: 'In Progress', count: stats.inProgressTasks },
                { name: 'Completed', count: stats.completedTasks },
                { name: 'Overdue', count: stats.overdueTasks }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Priority Distribution Pie Chart */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Priority Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Recent Tasks
            </h2>
            <button
              onClick={() => setShowTaskForm(true)}
              className="btn-primary flex items-center gap-2"
            >
              <FaPlus />
              Create Task
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Deadline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No tasks found. Create your first task!
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr key={task._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {task.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                          {task.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {task.assignedTo?.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {task.assignedTo?.department}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getPriorityBadge(task.priority)}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(task.status)}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatDate(task.deadline)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/tasks/${task._id}`}
                            className="text-primary-600 hover:text-primary-900 dark:text-primary-400"
                          >
                            <FaEye />
                          </Link>
                          <button
                            onClick={() => handleDeleteTask(task._id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-center">
            <Link to="/admin/tasks" className="btn-secondary">
              View All Tasks
            </Link>
          </div>
        </div>
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          task={selectedTask}
          onClose={() => {
            setShowTaskForm(false);
            setSelectedTask(null);
          }}
          onSuccess={handleTaskCreated}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
