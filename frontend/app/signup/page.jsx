'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  User,
  GraduationCap,
  Mail,
  Lock,
  ArrowRight,
  Upload,
  AlertCircle,
  Briefcase,
  Calendar,
  Phone,
  Bookmark,
  Sparkles
} from 'lucide-react';

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'user', // Defaults to Regular User
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

      console.log('Sending registration request to backend...');
      
      const response = await fetch('http://localhost:3001/register', {
        method: 'POST',
        credentials: 'include',
        body: formDataToSend
      });

      const data = await response.json();

      if (response.ok && data.success) {
        router.push(data.redirectUrl);
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Blur Elements */}
      <div className="absolute top-10 left-10 w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none"></div>

      <div className="max-w-2xl w-full relative z-10 my-8">
        <Card className="border border-slate-200/80 dark:border-slate-800/80 shadow-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl overflow-hidden">
          <CardHeader className="pt-8 pb-4 text-center border-b border-slate-100 dark:border-slate-800/50">
            <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-3">
              <ShieldCheck className="h-6 w-6 text-white animate-pulse" />
            </div>
            <CardTitle className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Create Your Account
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400 mt-1.5">
              Join the legal ecosystem. Connect with experts, or showcase your practice.
            </CardDescription>

            {/* Premium Role Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl max-w-sm mx-auto mt-6 border border-slate-200/30 dark:border-slate-800/30">
              <button
                type="button"
                className={`py-2 px-3 text-xs font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  formData.role === 'user'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                onClick={() => setFormData({ ...formData, role: 'user' })}
              >
                <User className="h-3.5 w-3.5" /> Client / Visitor
              </button>
              <button
                type="button"
                className={`py-2 px-3 text-xs font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  formData.role === 'lawyer'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                onClick={() => setFormData({ ...formData, role: 'lawyer' })}
              >
                <Briefcase className="h-3.5 w-3.5" /> Professional Lawyer
              </button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Basic Details Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    placeholder="e.g. Jane"
                    className="bg-white dark:bg-slate-950/50"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    placeholder="e.g. Doe"
                    className="bg-white dark:bg-slate-950/50"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Email & Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="e.g. jane.doe@example.com"
                      className="pl-9 bg-white dark:bg-slate-950/50"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      placeholder="Create security credentials"
                      className="pl-9 bg-white dark:bg-slate-950/50"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Lawyer Specific Subform */}
              {formData.role === 'lawyer' && (
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Lawyer Qualifications</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="lawFirm">Law Firm (Optional)</Label>
                      <Input
                        id="lawFirm"
                        name="lawFirm"
                        type="text"
                        placeholder="e.g. Apex Legal LLP"
                        className="bg-white dark:bg-slate-950/50"
                        value={formData.lawFirm}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="contactNumber">Contact Telephone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="contactNumber"
                          name="contactNumber"
                          type="tel"
                          required
                          placeholder="e.g. +1 (555) 019-2834"
                          className="pl-9 bg-white dark:bg-slate-950/50"
                          value={formData.contactNumber}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="badgeNumber">Badge / Bar Card Number</Label>
                      <Input
                        id="badgeNumber"
                        name="badgeNumber"
                        type="text"
                        required
                        placeholder="e.g. BAR-82931-NY"
                        className="bg-white dark:bg-slate-950/50"
                        value={formData.badgeNumber}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="badgeIssueDate">Badge Issue Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="badgeIssueDate"
                          name="badgeIssueDate"
                          type="date"
                          required
                          className="pl-9 bg-white dark:bg-slate-950/50"
                          value={formData.badgeIssueDate}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="badgeIssuingAuthority">Badge Issuing Authority</Label>
                    <Input
                      id="badgeIssuingAuthority"
                      name="badgeIssuingAuthority"
                      type="text"
                      required
                      placeholder="e.g. New York State Bar Association"
                      className="bg-white dark:bg-slate-950/50"
                      value={formData.badgeIssuingAuthority}
                      onChange={handleChange}
                    />
                  </div>

                  {/* University & Degree */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="universitySelect">University</Label>
                      <select
                        id="universitySelect"
                        name="universitySelect"
                        className="h-10 rounded-md border border-input bg-white dark:bg-slate-950/50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
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

                    {formData.universitySelect === 'other' ? (
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="university">Custom University Name</Label>
                        <Input
                          id="university"
                          name="university"
                          type="text"
                          required
                          placeholder="Enter university name"
                          className="bg-white dark:bg-slate-950/50"
                          value={formData.university}
                          onChange={handleChange}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="degree">Degree Obtained</Label>
                        <div className="relative">
                          <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            id="degree"
                            name="degree"
                            type="text"
                            required
                            placeholder="e.g. Juris Doctor (JD)"
                            className="pl-9 bg-white dark:bg-slate-950/50"
                            value={formData.degree}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* If custom university, show degree underneath */}
                  {formData.universitySelect === 'other' && (
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="degree">Degree Obtained</Label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="degree"
                          name="degree"
                          type="text"
                          required
                          placeholder="e.g. Juris Doctor (JD)"
                          className="pl-9 bg-white dark:bg-slate-950/50"
                          value={formData.degree}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="badgeUpload">Badge Verification Document (Optional)</Label>
                    <div className="border border-dashed border-slate-300 dark:border-slate-800 rounded-lg p-4 text-center hover:bg-slate-50 dark:hover:bg-slate-900/30 transition relative cursor-pointer">
                      <Upload className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                      <span className="text-xs font-semibold text-slate-500 block">
                        {badgeFile ? badgeFile.name : 'Upload Bar Card image or certification letter (PDF/JPG/PNG)'}
                      </span>
                      <input
                        id="badgeUpload"
                        name="badgeUpload"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="summary">Professional Practice Summary</Label>
                    <Textarea
                      id="summary"
                      name="summary"
                      rows={3}
                      placeholder="Briefly describe your areas of practice, key legal expertise, and bio..."
                      className="bg-white dark:bg-slate-950/50"
                      value={formData.summary}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2.5 rounded-lg shadow-lg shadow-blue-500/20 hover:shadow-indigo-500/30 transition duration-200 mt-6"
              >
                {loading ? 'Creating Credentials...' : (
                  <span className="flex items-center justify-center gap-1.5">
                    Register Account <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800/80 px-6 py-4 text-center flex justify-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link href="/signin" className="font-bold text-blue-600 hover:text-blue-500 hover:underline">
                Sign In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;