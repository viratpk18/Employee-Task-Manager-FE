import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaTasks, 
  FaCheckCircle, 
  FaClock,
  FaExclamationTriangle,
  FaEye
} from 'react-icons/fa';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    overdueTasks: 0,
    completionRate: 0
  });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, tasksRes] = await Promise.all([
        axiosInstance.get('/tasks/stats/overview'),
        axiosInstance.get('/tasks')
      ]);

      setStats(statsRes.data.data);
      setTasks(tasksRes.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      await axiosInstance.put(`/tasks/${taskId}`, { status: newStatus });
      toast.success('Task status updated successfully');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

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

  const isOverdue = (deadline, status) => {
    return status !== 'completed' && new Date(deadline) < new Date();
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
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Here's an overview of your tasks and progress.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Tasks"
            value={stats.totalTasks}
            icon={FaTasks}
            color="primary"
          />
          <StatCard
            title="Completed"
            value={stats.completedTasks}
            icon={FaCheckCircle}
            color="green"
            subtitle={`${stats.completionRate}% completion rate`}
          />
          <StatCard
            title="In Progress"
            value={stats.inProgressTasks}
            icon={FaClock}
            color="blue"
          />
          <StatCard
            title="Overdue"
            value={stats.overdueTasks}
            icon={FaExclamationTriangle}
            color="red"
          />
        </div>

        {/* Task Progress Chart */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Task Overview
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

        {/* Tasks List */}
        <div className="card">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              My Tasks
            </h2>
            
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'pending'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter('in-progress')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'in-progress'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'completed'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredTasks.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No tasks found.
              </p>
            ) : (
              filteredTasks.map((task) => (
                <div 
                  key={task._id} 
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {task.title}
                        </h3>
                        <div className="flex gap-2">
                          <span className={getPriorityBadge(task.priority)}>
                            {task.priority}
                          </span>
                          <span className={getStatusBadge(task.status)}>
                            {task.status}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {task.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>
                          <strong>Assigned by:</strong> {task.assignedBy?.name}
                        </span>
                        <span className={isOverdue(task.deadline, task.status) ? 'text-red-600 dark:text-red-400' : ''}>
                          <strong>Deadline:</strong> {formatDate(task.deadline)}
                          {isOverdue(task.deadline, task.status) && ' (Overdue)'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex sm:flex-col gap-2">
                      {task.status !== 'completed' && (
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusUpdate(task._id, e.target.value)}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 dark:bg-gray-700"
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      )}
                      <Link
                        to={`/tasks/${task._id}`}
                        className="btn-secondary flex items-center justify-center gap-2 text-sm whitespace-nowrap"
                      >
                        <FaEye />
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
