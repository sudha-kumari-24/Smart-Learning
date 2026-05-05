import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import './ProfileEdit.css';

function EditProfile() {
    const { user, token, updateUser } = useAuth();
    const navigate = useNavigate();
    const notify = useNotification();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        address: '',
        classCourse: '',
        schoolCollege: '',
        preferences: {
            studyGoalMinutesPerDay: 60,
            preferredStudyTime: 'evening',
            focusAreas: []
        }
    });

    const [focusAreaInput, setFocusAreaInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.name || user.fullName || '',
                email: user.email || '',
                phone: user.phone || '',
                dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
                address: user.address || '',
                classCourse: user.classCourse || '',
                schoolCollege: user.schoolCollege || '',
                preferences: {
                    studyGoalMinutesPerDay: user.preferences?.studyGoalMinutesPerDay || 60,
                    preferredStudyTime: user.preferences?.preferredStudyTime || 'evening',
                    focusAreas: user.preferences?.focusAreas || []
                }
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handlePreferenceChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            preferences: { ...prev.preferences, [name]: value }
        }));
    };

    const addFocusArea = () => {
        if (focusAreaInput.trim() && !formData.preferences.focusAreas.includes(focusAreaInput.trim())) {
            setFormData(prev => ({
                ...prev,
                preferences: {
                    ...prev.preferences,
                    focusAreas: [...prev.preferences.focusAreas, focusAreaInput.trim()]
                }
            }));
            setFocusAreaInput('');
        }
    };

    const removeFocusArea = (area) => {
        setFormData(prev => ({
            ...prev,
            preferences: {
                ...prev.preferences,
                focusAreas: prev.preferences.focusAreas.filter(a => a !== area)
            }
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Name is required';
        } else if (formData.fullName.length < 3) {
            newErrors.fullName = 'Name must be at least 3 characters';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
            newErrors.phone = 'Phone must be a valid 10-digit number';
        }

        if (formData.dateOfBirth) {
            const birthDate = new Date(formData.dateOfBirth);
            const today = new Date();
            const minDate = new Date();
            minDate.setFullYear(today.getFullYear() - 5);
            if (birthDate > minDate) {
                newErrors.dateOfBirth = 'You must be at least 5 years old';
            }
        }

        const goalMinutes = parseInt(formData.preferences.studyGoalMinutesPerDay);
        if (isNaN(goalMinutes) || goalMinutes < 10 || goalMinutes > 480) {
            newErrors.studyGoal = 'Study goal must be between 10 and 480 minutes';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            notify.show('Please fix the errors before submitting', 'error');
            return;
        }

        setLoading(true);

        try {

            const response = await fetch('http://localhost:5000/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    dateOfBirth: formData.dateOfBirth || null,
                    address: formData.address,
                    classCourse: formData.classCourse,
                    schoolCollege: formData.schoolCollege,
                    preferences: formData.preferences
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Update failed');
            }

            // Update user context
            if (updateUser) {
                updateUser(data.user);
            }

            notify.show('Profile updated successfully!', 'success');
            navigate('/profile');
        } catch (error) {
            console.error('Update error:', error);
            notify.show(error.message || 'Failed to update profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const studyTimeOptions = [
        { value: 30, label: '30 minutes' },
        { value: 60, label: '1 hour' },
        { value: 90, label: '1.5 hours' },
        { value: 120, label: '2 hours' },
        { value: 180, label: '3 hours' },
        { value: 240, label: '4 hours' }
    ];

    const studyTimeOptions2 = [
        { value: 'morning', label: '🌅 Morning (6 AM - 12 PM)', icon: '🌅' },
        { value: 'afternoon', label: '☀️ Afternoon (12 PM - 5 PM)', icon: '☀️' },
        { value: 'evening', label: '🌙 Evening (5 PM - 9 PM)', icon: '🌙' },
        { value: 'night', label: '⭐ Night (9 PM - 12 AM)', icon: '⭐' }
    ];

    const suggestedFocusAreas = [
        'Programming', 'Data Science', 'Web Development', 'Machine Learning',
        'Communication Skills', 'Leadership', 'Time Management', 'DSA',
        'Soft Skills', 'Interview Prep', 'Cloud Computing', 'DevOps'
    ];

    return (
        <section className="edit-profile-page">
            <div className="edit-profile-container">
                {/* Header */}
                <div className="edit-profile-header">
                    <button className="back-btn" onClick={() => navigate('/profile')}>
                        ← Back to Profile
                    </button>
                    <h1>Edit Profile</h1>
                    <p>Update your personal information and learning preferences</p>
                </div>

                <form onSubmit={handleSubmit} className="edit-profile-form">
                    {/* Personal Information Section */}
                    <div className="form-section">
                        <div className="section-title">
                            <span className="section-icon">👤</span>
                            <h2>Personal Information</h2>
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label>Full Name *</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    className={errors.fullName ? 'error' : ''}
                                />
                                {errors.fullName && <span className="error-text">{errors.fullName}</span>}
                            </div>

                            <div className="form-group">
                                <label>Email Address *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="your@email.com"
                                    className={errors.email ? 'error' : ''}
                                />
                                {errors.email && <span className="error-text">{errors.email}</span>}
                            </div>

                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="10-digit mobile number"
                                    className={errors.phone ? 'error' : ''}
                                />
                                {errors.phone && <span className="error-text">{errors.phone}</span>}
                            </div>

                            <div className="form-group">
                                <label>Date of Birth</label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                />
                                {errors.dateOfBirth && <span className="error-text">{errors.dateOfBirth}</span>}
                            </div>

                            <div className="form-group full-width">
                                <label>Address</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Your address"
                                    rows="2"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Academic Information Section */}
                    <div className="form-section">
                        <div className="section-title">
                            <span className="section-icon">🎓</span>
                            <h2>Academic Information</h2>
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label>Class/Course</label>
                                <input
                                    type="text"
                                    name="classCourse"
                                    value={formData.classCourse}
                                    onChange={handleChange}
                                    placeholder="e.g., B.Tech CSE, 12th Grade"
                                />
                            </div>

                            <div className="form-group">
                                <label>School/College</label>
                                <input
                                    type="text"
                                    name="schoolCollege"
                                    value={formData.schoolCollege}
                                    onChange={handleChange}
                                    placeholder="Name of your institution"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Study Preferences Section */}
                    <div className="form-section">
                        <div className="section-title">
                            <span className="section-icon">⚙️</span>
                            <h2>Study Preferences</h2>
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label>Daily Study Goal</label>
                                <div className="goal-buttons">
                                    {studyTimeOptions.map(option => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            className={`goal-btn ${formData.preferences.studyGoalMinutesPerDay === option.value ? 'active' : ''}`}
                                            onClick={() => setFormData(prev => ({
                                                ...prev,
                                                preferences: { ...prev.preferences, studyGoalMinutesPerDay: option.value }
                                            }))}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                                {errors.studyGoal && <span className="error-text">{errors.studyGoal}</span>}
                            </div>

                            <div className="form-group">
                                <label>Preferred Study Time</label>
                                <div className="time-buttons">
                                    {studyTimeOptions2.map(option => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            className={`time-btn ${formData.preferences.preferredStudyTime === option.value ? 'active' : ''}`}
                                            onClick={() => setFormData(prev => ({
                                                ...prev,
                                                preferences: { ...prev.preferences, preferredStudyTime: option.value }
                                            }))}
                                        >

                                            <span className="time-label">{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Focus Areas Section */}
                    <div className="form-section">
                        <div className="section-title">
                            <span className="section-icon">🎯</span>
                            <h2>Focus Areas</h2>
                            <p>Topics you're interested in learning</p>
                        </div>

                        <div className="focus-areas-container">
                            <div className="add-focus-area">
                                <input
                                    type="text"
                                    value={focusAreaInput}
                                    onChange={(e) => setFocusAreaInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addFocusArea()}
                                    placeholder="Add a focus area..."
                                    className="focus-input"
                                />
                                <button type="button" onClick={addFocusArea} className="add-btn">
                                    + Add
                                </button>
                            </div>

                            <div className="focus-tags">
                                {formData.preferences.focusAreas.map((area, index) => (
                                    <div key={index} className="focus-tag">
                                        <span>{area}</span>
                                        <button type="button" onClick={() => removeFocusArea(area)}>✕</button>
                                    </div>
                                ))}
                            </div>

                            <div className="suggested-focus">
                                <p className="suggested-title">Suggested focus areas:</p>
                                <div className="suggested-tags">
                                    {suggestedFocusAreas.filter(area => !formData.preferences.focusAreas.includes(area)).slice(0, 8).map(area => (
                                        <button
                                            key={area}
                                            type="button"
                                            className="suggested-tag"
                                            onClick={() => {
                                                if (!formData.preferences.focusAreas.includes(area)) {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        preferences: {
                                                            ...prev.preferences,
                                                            focusAreas: [...prev.preferences.focusAreas, area]
                                                        }
                                                    }));
                                                }
                                            }}
                                        >
                                            + {area}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={() => navigate('/profile')}>
                            Cancel
                        </button>
                        <button type="submit" className="save-btn" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner-small"></span>
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}

export default EditProfile;