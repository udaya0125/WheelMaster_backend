import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEye, FiEyeOff, FiX } from 'react-icons/fi';

const EditUserForm = ({ editingUser, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});
  const [apiErrors, setApiErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Set form data when editingUser changes
  useEffect(() => {
    if (editingUser) {
      setFormData({
        name: editingUser.name || "",
        email: editingUser.email || "",
        password: "",
        confirmPassword: ""
      });
    }
  }, [editingUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
    if (apiErrors[name]) {
      setApiErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    // Password validation only when password is entered
    if (formData.password && formData.password.length > 0) {
      if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setSubmitting(true);
      setApiErrors({});

      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('_method', 'PUT'); // Laravel method spoofing
      
      // Only append password if it's provided
      if (formData.password) {
        submitData.append('password', formData.password);
      }
      
      // Update existing user
      await axios.post(route("ouruser.update", { id: editingUser.id }), submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
      });
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
      
      // Close modal
      onClose();
      
    } catch (error) {
      console.error('Error updating user:', error);
      
      if (error.response && error.response.data && error.response.data.errors) {
        const serverErrors = error.response.data.errors;
        setApiErrors(serverErrors);
        
        const firstError = Object.values(serverErrors)[0]?.[0];
        if (firstError) {
          alert(firstError);
        }
      } else {
        alert('Error updating user. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getErrorMessage = (field) => {
    return apiErrors[field]?.[0] || errors[field];
  };

  return (
    <div className="relative">
      {/* Optional: Add a close button at the top right if needed */}
      {/* <button
        type="button"
        onClick={onClose}
        className="absolute right-0 top-0 text-gray-400 hover:text-gray-600 focus:outline-none"
        disabled={submitting}
      >
        <FiX size={24} />
      </button> */}
      
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter full name"
            disabled={submitting}
          />
          {getErrorMessage("name") && (
            <p className="text-red-500 text-sm mt-1">{getErrorMessage("name")}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700  mb-1">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            disabled
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300  bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter email"        
          />

          {getErrorMessage("email") && (
            <p className="text-red-500 text-sm mt-1">{getErrorMessage("email")}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">
            Email cannot be changed.
          </p>
        </div>

        {/* <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            New Password (leave blank to keep current)
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              placeholder="Enter new password (optional)"
              disabled={submitting}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800 focus:outline-none"
              disabled={submitting}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <FiEyeOff size={20} className="text-gray-500" />
              ) : (
                <FiEye size={20} className="text-gray-500" />
              )}
            </button>
          </div>
          {getErrorMessage("password") && (
            <p className="text-red-500 text-sm mt-1">{getErrorMessage("password")}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">
            If you don't want to change the password, leave this field blank.
          </p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            {!formData.password ? 'Confirm Password (optional)' : 'Confirm Password *'}
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              placeholder="Confirm new password"
              disabled={submitting}
            />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800 focus:outline-none"
              disabled={submitting}
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            >
              {showConfirmPassword ? (
                <FiEyeOff size={20} className="text-gray-500" />
              ) : (
                <FiEye size={20} className="text-gray-500" />
              )}
            </button>
          </div>
          {getErrorMessage("confirmPassword") && (
            <p className="text-red-500 text-sm mt-1">{getErrorMessage("confirmPassword")}</p>
          )}
        </div> */}

        <div className="flex space-x-3 pt-4">
          
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {submitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </>
            ) : "Update User"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUserForm;