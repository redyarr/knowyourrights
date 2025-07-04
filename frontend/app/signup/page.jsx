'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'visitor',
    // Lawyer specific fields
    lawFirm: '',
    badgeNumber: '',
    badgeIssueDate: '',
    badgeIssuingAuthority: '',
    summary: '',
    contactNumber: '',
    universitySelect: '',
    university: '',
    degree: ''
  });
  const [badgeFile, setBadgeFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setBadgeFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add file if selected
      if (badgeFile) {
        formDataToSend.append('badgeUpload', badgeFile);
      }

      console.log('Sending request to:', 'http://localhost:3001/register');
      
      const response = await fetch('http://localhost:3001/register', {
        method: 'POST',
        credentials: 'include',
        body: formDataToSend
      });


      const data = await response.json();
      

      if (response.ok && data.success) {
        // router.push(data.redirectUrl);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error.message.includes('JSON')) {
        setError('Server error. Please check if the backend is running correctly.');
      } else {
        setError(error.message || 'Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join the Legal Network
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {/* Role Selection */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Account Type
            </label>
            <select
              id="role"
              name="role"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="user">Regular User</option>
              <option value="lawyer">Lawyer</option>
            </select>
          </div>

          {/* Lawyer-specific fields */}
          {formData.role === 'lawyer' && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900">Lawyer Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="lawFirm" className="block text-sm font-medium text-gray-700">
                    Law Firm (Optional)
                  </label>
                  <input
                    id="lawFirm"
                    name="lawFirm"
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.lawFirm}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">
                    Contact Number
                  </label>
                  <input
                    id="contactNumber"
                    name="contactNumber"
                    type="tel"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.contactNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="badgeNumber" className="block text-sm font-medium text-gray-700">
                    Badge Number
                  </label>
                  <input
                    id="badgeNumber"
                    name="badgeNumber"
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.badgeNumber}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="badgeIssueDate" className="block text-sm font-medium text-gray-700">
                    Badge Issue Date
                  </label>
                  <input
                    id="badgeIssueDate"
                    name="badgeIssueDate"
                    type="date"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.badgeIssueDate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="badgeIssuingAuthority" className="block text-sm font-medium text-gray-700">
                  Badge Issuing Authority
                </label>
                <input
                  id="badgeIssuingAuthority"
                  name="badgeIssuingAuthority"
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.badgeIssuingAuthority}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="badgeUpload" className="block text-sm font-medium text-gray-700">
                  Badge Document (Optional)
                </label>
                <input
                  id="badgeUpload"
                  name="badgeUpload"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  onChange={handleFileChange}
                />
              </div>

              {/* Education Information */}
              <div className="border-t pt-4">
                <h4 className="text-md font-medium text-gray-900 mb-4">Education</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="universitySelect" className="block text-sm font-medium text-gray-700">
                      University
                    </label>
                    <select
                      id="universitySelect"
                      name="universitySelect"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      value={formData.universitySelect}
                      onChange={handleChange}
                    >
                      <option value="">Select University</option>
                      <option value="Harvard Law School">Harvard Law School</option>
                      <option value="Yale Law School">Yale Law School</option>
                      <option value="Stanford Law School">Stanford Law School</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  {formData.universitySelect === 'other' && (
                    <div>
                      <label htmlFor="university" className="block text-sm font-medium text-gray-700">
                        University Name
                      </label>
                      <input
                        id="university"
                        name="university"
                        type="text"
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        value={formData.university}
                        onChange={handleChange}
                      />
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <label htmlFor="degree" className="block text-sm font-medium text-gray-700">
                    Degree
                  </label>
                  <input
                    id="degree"
                    name="degree"
                    type="text"
                    required
                    placeholder="e.g., Juris Doctor (JD)"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.degree}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="summary" className="block text-sm font-medium text-gray-700">
                  Professional Summary (Optional)
                </label>
                <textarea
                  id="summary"
                  name="summary"
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.summary}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/signin" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign in here
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;