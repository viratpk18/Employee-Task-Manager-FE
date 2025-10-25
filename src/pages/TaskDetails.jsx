import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaArrowLeft, 
  FaClock, 
  FaUser, 
  FaCalendar,
  FaFlag,
  FaComment
} from 'react-icons/fa';
import Navbar from '../components/Navbar';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      const response = await axiosInstance.get(`/tasks/${id}`);
      setTask(response.data.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load task details');
      navigate(-1);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await axiosInstance.put(`/tasks/${id}`, { status: newStatus });
      toast.success('Task status updated');
      fetchTask();
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      await axiosInstance.post(`/tasks/${id}/comments`, { text: comment });
      toast.success('Comment added');
      setComment('');
      fetchTask();
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200',
      medium: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200',
      high: 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-200',
      urgent: 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200'
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-200',
      'in-progress': 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200',
      completed: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200'
    };
    return colors[status] || colors.pending;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!task) return null;

  const isOverdue = task.status !== 'completed' && new Date(task.deadline) < new Date();
  const canEdit = user?.role === 'employee' && task.assignedTo?._id === user?.id;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <FaArrowLeft />
          Back
        </button>

        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {task.title}
              </h1>
              <div className="flex flex-wrap gap-2">
                <span className={`badge ${getPriorityColor(task.priority)}`}>
                  <FaFlag className="inline mr-1" />
                  {task.priority} Priority
                </span>
                <span className={`badge ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
                {task.tags?.map((tag, index) => (
                  <span key={index} className="badge bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {canEdit && task.status !== 'completed' && (
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            )}
          </div>

          <div className="prose dark:prose-invert max-w-none mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Description</h3>
            <p className="text-gray-600 dark:text-gray-400">{task.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center gap-3">
              <FaUser className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Assigned To</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {task.assignedTo?.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {task.assignedTo?.department}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FaUser className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Assigned By</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {task.assignedBy?.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FaCalendar className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Start Date</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDate(task.startDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FaClock className={isOverdue ? 'text-red-500' : 'text-gray-400'} />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Deadline</p>
                <p className={`font-medium ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                  {formatDate(task.deadline)}
                  {isOverdue && ' (Overdue)'}
                </p>
              </div>
            </div>

            {task.completedDate && (
              <div className="flex items-center gap-3">
                <FaCalendar className="text-green-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Completed Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(task.completedDate)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            <FaComment className="inline mr-2" />
            Comments ({task.comments?.length || 0})
          </h2>

          <div className="space-y-4 mb-6">
            {task.comments?.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              task.comments?.map((comment, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {comment.user?.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(comment.createdAt)}
                    </p>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    {comment.text}
                  </p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleCommentSubmit}>
            <div className="flex gap-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 input-field"
              />
              <button
                type="submit"
                disabled={submitting || !comment.trim()}
                className="btn-primary disabled:opacity-50"
              >
                {submitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
