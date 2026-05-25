import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BriefcaseBusiness, ChevronLeft, ChevronRight, Clock3, GraduationCap, ShieldCheck, Sparkles, UserRound } from 'lucide-react';

const TOTAL_STEPS = 4;
const EXPERTISE_OPTIONS = ['DSA', 'Web Dev', 'GATE', 'Core Engineering', 'Finance'];
const LANGUAGE_OPTIONS = ['English', 'Hindi', 'Hinglish'];

const initialForm = {
    name: '',
    college: '',
    branch: '',
    graduationYear: '',
    currentRole: '',
    company: '',
    expertiseTags: [],
    sessionDuration: '',
    preferredLanguage: '',
    bio: '',
    upiId: '',
    confirmUpiId: '',
};

const hardcodedSlots = [
    { day: 'Monday', time: '7:00 PM - 8:00 PM' },
    { day: 'Wednesday', time: '8:30 PM - 9:30 PM' },
    { day: 'Saturday', time: '11:00 AM - 1:00 PM' },
];

const stepConfig = [
    { id: 1, label: 'Personal', short: 'Details' },
    { id: 2, label: 'Expertise', short: 'Tags' },
    { id: 3, label: 'Session', short: 'Preference' },
    { id: 4, label: 'Payout', short: 'Setup' },
];

const durationOptions = [
    {
        value: '30 min',
        title: 'Quick',
        subtitle: 'Focused guidance',
        icon: Clock3,
    },
    {
        value: '60 min',
        title: 'Deep',
        subtitle: 'More detailed help',
        icon: Sparkles,
    },
];

const fieldMeta = {
    name: { label: 'Full Name', icon: UserRound },
    college: { label: 'College', icon: GraduationCap },
    branch: { label: 'Branch', icon: GraduationCap },
    graduationYear: { label: 'Graduation Year', icon: GraduationCap },
    currentRole: { label: 'Current Role', icon: BriefcaseBusiness },
    company: { label: 'Company', icon: BriefcaseBusiness },
};

const safeMentorIdFromName = (name) => {
    const base = (name || 'mentor')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return `${base || 'mentor'}-${Date.now().toString().slice(-6)}`;
};

const MentorOnboardingPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [submittedMentorId, setSubmittedMentorId] = useState('');
    const [direction, setDirection] = useState(1);

    const progressPercent = useMemo(() => (step / TOTAL_STEPS) * 100, [step]);

    const livePreview = useMemo(() => ({
        name: form.name || 'Shivam Maurya',
        college: form.college || 'IIT BHU',
        branch: form.branch || 'Computer Science',
        currentRole: form.currentRole || 'SDE @ Google',
        company: form.company || 'Google',
        expertiseTags: form.expertiseTags.length > 0 ? form.expertiseTags : ['DSA', 'Web Dev'],
        sessionDuration: form.sessionDuration || '30 min',
        preferredLanguage: form.preferredLanguage || 'English',
        bio: form.bio || 'Helping students make practical career decisions with clear steps and honest feedback.',
    }), [form]);

    const setField = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: '' }));
    };

    const toggleExpertise = (tag) => {
        setForm((prev) => {
            const hasTag = prev.expertiseTags.includes(tag);
            if (hasTag) {
                return { ...prev, expertiseTags: prev.expertiseTags.filter((item) => item !== tag) };
            }
            if (prev.expertiseTags.length >= 5) {
                setErrors((old) => ({ ...old, expertiseTags: 'You can select up to 5 expertise tags only.' }));
                return prev;
            }
            return { ...prev, expertiseTags: [...prev.expertiseTags, tag] };
        });
        setErrors((prev) => ({ ...prev, expertiseTags: '' }));
    };

    const validateStep = (currentStep) => {
        const nextErrors = {};

        if (currentStep === 1) {
            if (!form.name.trim()) nextErrors.name = 'Name is required.';
            if (!form.college.trim()) nextErrors.college = 'College is required.';
            if (!form.branch.trim()) nextErrors.branch = 'Branch is required.';
            if (!form.graduationYear.trim()) {
                nextErrors.graduationYear = 'Graduation year is required.';
            } else if (!/^\d{4}$/.test(form.graduationYear.trim())) {
                nextErrors.graduationYear = 'Use a valid 4-digit year.';
            }
            if (!form.currentRole.trim()) nextErrors.currentRole = 'Current role is required.';
            if (!form.company.trim()) nextErrors.company = 'Company is required.';
        }

        if (currentStep === 2) {
            if (form.expertiseTags.length === 0) {
                nextErrors.expertiseTags = 'Select at least one expertise tag.';
            }
            if (form.expertiseTags.length > 5) {
                nextErrors.expertiseTags = 'You can select up to 5 expertise tags only.';
            }
        }

        if (currentStep === 3) {
            if (!form.sessionDuration) nextErrors.sessionDuration = 'Please select session duration.';
            if (!form.preferredLanguage) nextErrors.preferredLanguage = 'Please choose a preferred language.';
            if (!form.bio.trim()) {
                nextErrors.bio = 'Short bio is required.';
            } else if (form.bio.trim().length > 150) {
                nextErrors.bio = 'Bio must be 150 characters or less.';
            }
        }

        if (currentStep === 4) {
            if (!form.upiId.trim()) nextErrors.upiId = 'UPI ID is required.';
            if (!form.confirmUpiId.trim()) {
                nextErrors.confirmUpiId = 'Please confirm your UPI ID.';
            } else if (form.confirmUpiId.trim() !== form.upiId.trim()) {
                nextErrors.confirmUpiId = 'UPI IDs do not match.';
            }
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleNext = () => {
        if (!validateStep(step)) return;
        setDirection(1);
        setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
    };

    const handleBack = () => {
        setDirection(-1);
        setStep((prev) => Math.max(prev - 1, 1));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!validateStep(4)) return;

        const mentorId = safeMentorIdFromName(form.name);
        const profilePayload = {
            mentorId,
            name: form.name.trim(),
            college: form.college.trim(),
            branch: form.branch.trim(),
            graduationYear: form.graduationYear.trim(),
            currentRole: form.currentRole.trim(),
            company: form.company.trim(),
            expertiseTags: form.expertiseTags,
            sessionDuration: form.sessionDuration,
            preferredLanguage: form.preferredLanguage,
            bio: form.bio.trim(),
            upiId: form.upiId.trim(),
            totalSessionsCompleted: 0,
            averageRating: '--',
            availableSlots: hardcodedSlots,
            photoUrl: '',
        };

        const stored = localStorage.getItem('atyant_mentor_profiles');
        const parsedProfiles = stored ? JSON.parse(stored) : {};
        parsedProfiles[mentorId] = profilePayload;

        localStorage.setItem('atyant_mentor_profiles', JSON.stringify(parsedProfiles));
        localStorage.setItem('atyant_last_mentor_profile_id', mentorId);
        setSubmittedMentorId(mentorId);
    };

    if (submittedMentorId) {
        return (
            <section className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.10),_transparent_35%),linear-gradient(to_bottom,_#f8fafc,_#ffffff)] px-4 py-14">
                <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.10)] sm:p-10">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-lg shadow-indigo-200">
                        <ShieldCheck size={28} />
                    </div>
                    <div className="mx-auto max-w-xl text-center">
                        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Profile Published</p>
                        <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">Your mentor profile is now visible to students.</h1>
                        <p className="mt-4 text-slate-600">
                            The onboarding steps are complete and your profile is ready to be shared.
                        </p>
                    </div>

                    <div className="mx-auto mt-8 grid max-w-2xl gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:grid-cols-3">
                        {['Personal Details', 'Expertise Added', 'Payout Setup Complete'].map((item) => (
                            <div key={item} className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                                    <ShieldCheck size={14} />
                                </div>
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 flex justify-center">
                        <button
                            type="button"
                            onClick={() => navigate(`/mentor/${submittedMentorId}`)}
                            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl"
                        >
                            View My Profile
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.10),_transparent_35%),linear-gradient(to_bottom,_#f8fafc,_#ffffff)] px-4 py-6 sm:py-10">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 rounded-[2rem] border border-slate-200 bg-white/90 px-5 py-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:px-8 sm:py-7">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Become a verified mentor on Atyant</p>
                            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Mentor onboarding</h1>
                            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                                Complete a short setup to publish your mentor profile and start helping students.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                            <ShieldCheck className="text-indigo-600" size={18} />
                            Verified profile setup
                        </div>
                    </div>

                    <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-1">
                        {stepConfig.map((item, index) => {
                            const completed = step > item.id;
                            const active = step === item.id;
                            return (
                                <React.Fragment key={item.id}>
                                    <div className="flex items-center gap-2">
                                        <div className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm font-semibold transition-all duration-300 ${completed || active
                                            ? 'border-indigo-500 bg-indigo-600 text-white shadow-[0_0_0_6px_rgba(99,102,241,0.12)]'
                                            : 'border-slate-300 bg-white text-slate-400'
                                            }`}>
                                            {completed ? <ShieldCheck size={16} /> : item.id}
                                        </div>
                                        <div className="min-w-[78px]">
                                            <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${completed || active ? 'text-indigo-600' : 'text-slate-400'}`}>{item.label}</p>
                                            <p className="text-sm text-slate-500">{item.short}</p>
                                        </div>
                                    </div>
                                    {index < stepConfig.length - 1 && (
                                        <div className={`h-[2px] flex-1 rounded-full transition-all duration-300 ${step > item.id ? 'bg-indigo-500' : 'bg-slate-200'}`} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                    <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-8">
                        <AnimatePresence mode="wait" initial={false} custom={direction}>
                            <motion.form
                                key={step}
                                custom={direction}
                                onSubmit={handleSubmit}
                                className="space-y-6"
                                initial={{ opacity: 0, x: direction > 0 ? 24 : -24 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: direction > 0 ? -18 : 18 }}
                                transition={{ duration: 0.22, ease: 'easeOut' }}
                            >
                                {step === 1 && (
                                    <div className="space-y-4">
                                        <div>
                                            <h2 className="text-xl font-semibold text-slate-900">Personal details</h2>
                                            <p className="mt-1 text-sm text-slate-500">Add the basics students should see on your public profile.</p>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            {[
                                                ['name', 'Full Name'],
                                                ['college', 'College'],
                                                ['branch', 'Branch'],
                                                ['graduationYear', 'Graduation Year'],
                                                ['currentRole', 'Current Role'],
                                                ['company', 'Company'],
                                            ].map(([key, label]) => {
                                                const meta = fieldMeta[key];
                                                const Icon = meta?.icon;
                                                return (
                                                    <div key={key} className={key === 'company' ? 'sm:col-span-2' : ''}>
                                                        <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700">
                                                            {Icon && <Icon size={16} className="text-indigo-600" />}
                                                            {label}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={form[key]}
                                                            onChange={(e) => setField(key, e.target.value)}
                                                            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                                        />
                                                        {errors[key] && <p className="mt-1.5 text-xs text-rose-600">{errors[key]}</p>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-4">
                                        <div>
                                            <h2 className="text-xl font-semibold text-slate-900">Expertise tags</h2>
                                            <p className="mt-1 text-sm text-slate-500">Choose up to five areas you can mentor in.</p>
                                        </div>

                                        <div className="flex flex-wrap gap-3">
                                            {EXPERTISE_OPTIONS.map((tag) => {
                                                const selected = form.expertiseTags.includes(tag);
                                                return (
                                                    <button
                                                        key={tag}
                                                        type="button"
                                                        onClick={() => toggleExpertise(tag)}
                                                        className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${selected
                                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-[0_0_0_4px_rgba(99,102,241,0.10)]'
                                                            : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-300 hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        {tag}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-slate-500">Selected: {form.expertiseTags.length}/5</p>
                                            {errors.expertiseTags && <p className="text-xs text-rose-600">{errors.expertiseTags}</p>}
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="space-y-5">
                                        <div>
                                            <h2 className="text-xl font-semibold text-slate-900">Session preference</h2>
                                            <p className="mt-1 text-sm text-slate-500">Choose how you want to run sessions and communicate.</p>
                                        </div>

                                        <div>
                                            <label className="mb-3 block text-sm font-medium text-slate-700">Session duration</label>
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                {durationOptions.map(({ value, title, subtitle, icon: Icon }) => {
                                                    const active = form.sessionDuration === value;
                                                    return (
                                                        <button
                                                            key={value}
                                                            type="button"
                                                            onClick={() => setField('sessionDuration', value)}
                                                            className={`group rounded-3xl border p-4 text-left transition-all duration-200 ${active
                                                                ? 'border-indigo-500 bg-indigo-50 shadow-[0_0_0_4px_rgba(99,102,241,0.10)] scale-[1.01]'
                                                                : 'border-slate-300 bg-white hover:border-indigo-300 hover:bg-slate-50'
                                                                }`}
                                                        >
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div>
                                                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</p>
                                                                    <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
                                                                    <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
                                                                </div>
                                                                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl transition ${active ? 'bg-white text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                                                                    <Icon size={18} />
                                                                </div>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {errors.sessionDuration && <p className="mt-2 text-xs text-rose-600">{errors.sessionDuration}</p>}
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-slate-700">Preferred language</label>
                                            <select
                                                value={form.preferredLanguage}
                                                onChange={(e) => setField('preferredLanguage', e.target.value)}
                                                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                            >
                                                <option value="">Select language</option>
                                                {LANGUAGE_OPTIONS.map((language) => (
                                                    <option key={language} value={language}>{language}</option>
                                                ))}
                                            </select>
                                            {errors.preferredLanguage && <p className="mt-1.5 text-xs text-rose-600">{errors.preferredLanguage}</p>}
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-slate-700">Short bio</label>
                                            <textarea
                                                value={form.bio}
                                                onChange={(e) => setField('bio', e.target.value.slice(0, 150))}
                                                rows={4}
                                                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                                placeholder="Write a crisp summary of your mentoring journey"
                                            />
                                            <div className="mt-1.5 flex items-center justify-between">
                                                <p className="text-xs text-slate-500">Keep this short and specific.</p>
                                                <p className="text-xs text-slate-500">{form.bio.length}/150</p>
                                            </div>
                                            {errors.bio && <p className="mt-1.5 text-xs text-rose-600">{errors.bio}</p>}
                                        </div>
                                    </div>
                                )}

                                {step === 4 && (
                                    <div className="space-y-5">
                                        <div>
                                            <h2 className="text-xl font-semibold text-slate-900">Payout setup</h2>
                                            <p className="mt-1 text-sm text-slate-500">Payments from mentorship sessions will be sent to this UPI account.</p>
                                        </div>

                                        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm">
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                                    <ShieldCheck size={18} />
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-semibold text-slate-900">Secure payout information</h3>
                                                    <p className="mt-1 text-sm leading-6 text-slate-600">Editable later. Instant transfers are routed to your verified UPI details.</p>
                                                </div>
                                            </div>
                                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                                <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">✓ Secure payout information</div>
                                                <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">✓ Editable later</div>
                                                <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-600 shadow-sm sm:col-span-2">✓ Instant transfers</div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-slate-700">UPI ID</label>
                                            <input
                                                type="text"
                                                value={form.upiId}
                                                onChange={(e) => setField('upiId', e.target.value)}
                                                placeholder="example@upi"
                                                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                            />
                                            {errors.upiId && <p className="mt-1.5 text-xs text-rose-600">{errors.upiId}</p>}
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-slate-700">Confirm UPI ID</label>
                                            <input
                                                type="text"
                                                value={form.confirmUpiId}
                                                onChange={(e) => setField('confirmUpiId', e.target.value)}
                                                placeholder="example@upi"
                                                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                            />
                                            {errors.confirmUpiId && <p className="mt-1.5 text-xs text-rose-600">{errors.confirmUpiId}</p>}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        disabled={step === 1}
                                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <ChevronLeft size={16} />
                                        Back
                                    </button>

                                    {step < TOTAL_STEPS ? (
                                        <button
                                            type="button"
                                            onClick={handleNext}
                                            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl"
                                        >
                                            Continue
                                            <ChevronRight size={16} />
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl"
                                        >
                                            Publish Profile
                                            <ChevronRight size={16} />
                                        </button>
                                    )}
                                </div>
                            </motion.form>
                        </AnimatePresence>
                    </div>

                    <aside className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-8 lg:sticky lg:top-6 lg:self-start">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-indigo-600">Live Preview</p>
                                <h2 className="mt-1 text-lg font-semibold text-slate-900">Public mentor card</h2>
                            </div>
                            <div className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">Updates instantly</div>
                        </div>

                        <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-[linear-gradient(180deg,_rgba(79,70,229,0.08),_rgba(255,255,255,1))] p-5 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="flex h-20 w-20 items-center justify-center rounded-[1.6rem] bg-white text-2xl font-bold text-indigo-700 shadow-sm ring-1 ring-slate-200">
                                    {livePreview.name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Mentor Profile</p>
                                    <h3 className="mt-1 truncate text-xl font-bold text-slate-900">{livePreview.name}</h3>
                                    <p className="mt-1 text-sm text-slate-600">{livePreview.currentRole}</p>
                                </div>
                            </div>

                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">College</p>
                                    <p className="mt-1 text-sm font-semibold text-slate-900">{livePreview.college}</p>
                                </div>
                                <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Branch</p>
                                    <p className="mt-1 text-sm font-semibold text-slate-900">{livePreview.branch}</p>
                                </div>
                                <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200 sm:col-span-2">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Company</p>
                                    <p className="mt-1 text-sm font-semibold text-slate-900">{livePreview.company}</p>
                                </div>
                            </div>

                            <div className="mt-5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Expertise</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {livePreview.expertiseTags.map((tag, index) => (
                                        <span
                                            key={`${tag}-${index}`}
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${[
                                                'bg-indigo-100 text-indigo-700',
                                                'bg-blue-100 text-blue-700',
                                                'bg-violet-100 text-violet-700',
                                                'bg-sky-100 text-sky-700',
                                                'bg-fuchsia-100 text-fuchsia-700',
                                            ][index % 5]}`}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-5 grid grid-cols-3 gap-3">
                                <div className="rounded-2xl bg-white px-3 py-3 text-center shadow-sm ring-1 ring-slate-200">
                                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Sessions</p>
                                    <p className="mt-1 text-lg font-semibold text-slate-900">0</p>
                                </div>
                                <div className="rounded-2xl bg-white px-3 py-3 text-center shadow-sm ring-1 ring-slate-200">
                                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Rating</p>
                                    <p className="mt-1 text-lg font-semibold text-slate-900">--</p>
                                </div>
                                <div className="rounded-2xl bg-white px-3 py-3 text-center shadow-sm ring-1 ring-slate-200">
                                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Duration</p>
                                    <p className="mt-1 text-lg font-semibold text-slate-900">{livePreview.sessionDuration}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm font-semibold text-slate-900">What students will see</p>
                            <p className="mt-1 text-sm leading-6 text-slate-600">
                                Your name, college, current role, expertise, and session setup update as you type.
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    );
};

export default MentorOnboardingPage;