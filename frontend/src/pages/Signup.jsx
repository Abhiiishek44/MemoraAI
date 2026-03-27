import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../context/AuthContext';

function Signup() {
    const { register } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
            setError('Please fill out all fields.');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsLoading(true);
        const res = await register({ name: name.trim(), email: email.trim(), password });
        setIsLoading(false);

        if (!res?.success) {
            setError(res?.message || 'Registration failed. Please try again.');
            return;
        }

        navigate('/login');
    };

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4 py-12 overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.08),_transparent_35%)]" aria-hidden="true" />

            <div className="relative grid w-full max-w-5xl gap-6 md:grid-cols-[1.1fr_0.9fr] items-center">
                <Card className="shadow-lg border-slate-100">
                    <CardHeader className="space-y-2">
                        <CardTitle className="text-3xl font-semibold text-slate-900">Create your account</CardTitle>
                        <CardDescription className="text-slate-600">
                            Sign up to generate flashcards, practice MCQs, and track your study progress.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {error && (
                            <div className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <form id="signup-form" onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-slate-900">Full name</Label>
                                <div className="relative">
                                    <User className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="name"
                                        type="text"
                                        autoComplete="name"
                                        placeholder="enter your name"
                                        className="pl-9"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-900">Email</Label>
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        placeholder="enter your email"
                                        className="pl-9"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-slate-900">Password</Label>
                                    <div className="relative">
                                        <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="password"
                                            type="password"
                                            autoComplete="new-password"
                                            placeholder="At least 8 characters"
                                            className="pl-9"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-slate-900">Confirm password</Label>
                                    <div className="relative">
                                        <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            autoComplete="new-password"
                                            placeholder="Re-enter password"
                                            className="pl-9"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Creating your account...' : 'Create account'}
                            </Button>
                        </form>

                        <p className="text-xs text-slate-500">
                            By continuing you agree to our Terms of Service and Privacy Policy.
                        </p>
                    </CardContent>
                </Card>

                <div className="relative h-full rounded-2xl border border-slate-100 bg-white/70 p-8 shadow-sm backdrop-blur">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/70 via-white to-purple-50/80 rounded-2xl pointer-events-none" aria-hidden="true" />
                    <div className="relative space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                            <ShieldCheck className="h-4 w-4" /> Secure by design
                        </div>
                        <h2 className="text-2xl font-semibold text-slate-900">Learn faster with Memora</h2>
                        <ul className="space-y-3 text-slate-700 text-sm">
                            <li className="flex items-start gap-3">
                                <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                                Generate flashcards and MCQ tests instantly from your notes.
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-1 h-2 w-2 rounded-full bg-purple-500" />
                                Track weak areas with progress analytics.
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                                Study anywhere with a clean, responsive workspace.
                            </li>
                        </ul>

                        <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
                            <Button asChild variant="link" className="h-auto p-0 text-blue-700 hover:text-blue-800">
                                <Link to="/login" className="inline-flex items-center gap-2 font-medium">
                                    <ArrowLeft className="h-4 w-4" /> Already have an account? Sign in
                                </Link>
                            </Button>
                            <Button asChild size="sm" className="gap-2">
                                <a href="#signup-form">
                                    Get started now <ArrowRight className="h-4 w-4" />
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Signup;
