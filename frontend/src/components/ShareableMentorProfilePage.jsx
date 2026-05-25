import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { API_URL } from '../services/api.js';
import { BadgeCheck, Clock3, GraduationCap, MapPin, MessageSquareMore, Star } from 'lucide-react';

const defaultSlots = [
    { day: 'Monday', time: '7:00 PM - 8:00 PM' },
    { day: 'Wednesday', time: '8:30 PM - 9:30 PM' },
    { day: 'Saturday', time: '11:00 AM - 1:00 PM' },
];

const fallbackMentor = (mentorId) => ({
    mentorId,
    name: 'Shivam Maurya',
    college: 'IIT BHU',
    branch: 'Computer Science',
    currentRole: 'SDE @ Google',
    company: 'Google',
    expertiseTags: ['DSA', 'Web Dev', 'System Design', 'Interview Prep', 'CP'],
    bio: 'Helping students move from confusion to clear outcomes with practical guidance and honest feedback.',
    sessionDuration: '30 min',
    totalSessionsCompleted: 0,
    averageRating: '--',
    availableSlots: defaultSlots,
    photoUrl: '',
});

const colorClasses = [
    'bg-indigo-100 text-indigo-700 border-indigo-200',
    'bg-blue-100 text-blue-700 border-blue-200',
    'bg-violet-100 text-violet-700 border-violet-200',
    'bg-sky-100 text-sky-700 border-sky-200',
    'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
];

const normalizeMentorData = (raw, mentorId) => {
    if (!raw || typeof raw !== 'object') return fallbackMentor(mentorId);

    const name = raw.name || raw.username || 'Atyant Mentor';
    const expertise = Array.isArray(raw.expertiseTags)
        ? raw.expertiseTags
        : Array.isArray(raw.expertise)
            ? raw.expertise
            : Array.isArray(raw.skills)
                ? raw.skills.slice(0, 5)
                : [];

    const rating = raw.averageRating || raw.rating;
    const formattedRating = rating && Number(rating) > 0 ? Number(rating).toFixed(1) : '--';

    return {
        mentorId,
        name,
        college: raw.college || raw.education?.[0]?.institutionName || raw.education?.[0]?.institution || 'Not added yet',
        branch: raw.branch || raw.education?.[0]?.field || 'Not added yet',
        currentRole: raw.currentRole || raw.role || 'Mentor',
        company: raw.company || raw.organization || 'Not added yet',
        expertiseTags: expertise,
        bio: raw.bio || 'No bio added yet.',
        sessionDuration: raw.sessionDuration || '30 min',
        totalSessionsCompleted: raw.totalSessionsCompleted || raw.totalChats || 0,
        averageRating: formattedRating,
        availableSlots: Array.isArray(raw.availableSlots) && raw.availableSlots.length > 0 ? raw.availableSlots : defaultSlots,
        photoUrl: raw.photoUrl || raw.profilePicture || raw.profileImage || '',
    };
};

const readMentorFromStorage = (mentorId) => {
    try {
        const storedProfiles = localStorage.getItem('atyant_mentor_profiles');
        if (!storedProfiles) return null;
        const parsed = JSON.parse(storedProfiles);
        return parsed?.[mentorId] || null;
    } catch {
        return null;
    }
};

const ShareableMentorProfilePage = () => {
    const { mentorId } = useParams();
    const location = useLocation();
    const [mentor, setMentor] = useState(() => {
        const routeSnapshot = location.state?.mentorSnapshot;
        if (routeSnapshot) return normalizeMentorData(routeSnapshot, mentorId);

        const storedSnapshot = readMentorFromStorage(mentorId);
        if (storedSnapshot) return normalizeMentorData(storedSnapshot, mentorId);

        return fallbackMentor(mentorId);
    });
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const loadMentor = async () => {
            try {
                const storedSnapshot = readMentorFromStorage(mentorId);
                if (storedSnapshot) {
                    if (!cancelled) setMentor(normalizeMentorData(storedSnapshot, mentorId));
                    return;
                }

                const response = await fetch(`${API_URL}/api/mentor/mentors/${mentorId}`);
                if (response.ok) {
                    const data = await response.json();
                    if (!cancelled) setMentor(normalizeMentorData(data, mentorId));
                    return;
                }

                if (!cancelled) setMentor(fallbackMentor(mentorId));
            } catch (error) {
                console.error('Failed to load mentor profile:', error);
                if (!cancelled) setMentor(fallbackMentor(mentorId));
            } finally {
                if (!cancelled) setHydrated(true);
            }
        };

        loadMentor();

        return () => {
            cancelled = true;
        };
    }, [mentorId]);

    const initials = useMemo(() => {
        if (!mentor?.name) return 'M';
        return mentor.name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0].toUpperCase())
            .join('');
    }, [mentor?.name]);

    return (
        <section className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.10),_transparent_35%),linear-gradient(to_bottom,_#f8fafc,_#ffffff)] px-4 py-8 sm:py-12">
            <div className="mx-auto max-w-6xl space-y-6">
                {!hydrated && (
                    <div className="rounded-3xl border border-slate-200 bg-white/70 px-5 py-3 text-sm text-slate-500 shadow-sm backdrop-blur">
                        Loading the latest profile details...
                    </div>
                )}
                <div className="rounded-[2rem] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
                    <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
                        <div className="relative overflow-hidden rounded-t-[2rem] bg-[linear-gradient(180deg,_rgba(79,70,229,0.96),_rgba(37,99,235,0.95))] p-6 text-white sm:p-8 lg:rounded-l-[2rem] lg:rounded-tr-none">
                            <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                            <div className="relative z-10 flex flex-col gap-5">
                                <div className="flex items-start gap-4">
                                    {mentor.photoUrl ? (
                                        <img src={mentor.photoUrl} alt={mentor.name} className="h-24 w-24 rounded-[1.5rem] border border-white/30 object-cover shadow-lg" />
                                    ) : (
                                        <div className="flex h-24 w-24 items-center justify-center rounded-[1.5rem] border border-white/30 bg-white text-3xl font-bold text-indigo-700 shadow-lg">
                                            {initials}
                                        </div>
                                    )}

                                    <div className="min-w-0 flex-1">
                                        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/90">
                                            <BadgeCheck size={14} />
                                            New Mentor
                                        </div>
                                        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{mentor.name}</h1>
                                        <p className="mt-2 text-lg text-white/90">{mentor.currentRole}</p>
                                        <p className="mt-2 flex items-center gap-2 text-sm text-white/80">
                                            <GraduationCap size={16} />
                                            {mentor.college}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-3">
                                    <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">Company</p>
                                        <p className="mt-1 text-sm font-semibold text-white">{mentor.company}</p>
                                    </div>
                                    <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">Sessions</p>
                                        <p className="mt-1 text-sm font-semibold text-white">{mentor.totalSessionsCompleted}</p>
                                    </div>
                                    <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">Duration</p>
                                        <p className="mt-1 text-sm font-semibold text-white">{mentor.sessionDuration}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col justify-between gap-6 p-6 sm:p-8">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Average rating</p>
                                    <div className="mt-2 flex items-center gap-2 text-2xl font-bold text-slate-900">
                                        <Star className="text-amber-500" size={20} fill="currentColor" />
                                        {mentor.averageRating}
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Session style</p>
                                    <p className="mt-2 text-lg font-semibold text-slate-900">{mentor.sessionDuration}</p>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Branch</p>
                                    <p className="mt-2 text-lg font-semibold text-slate-900">{mentor.branch}</p>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                        <MessageSquareMore size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">Ready to help students</p>
                                        <p className="mt-1 text-sm leading-6 text-slate-600">Book a session to get direct guidance from this mentor.</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl"
                                >
                                    Book Session
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
                    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-8">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                <GraduationCap size={18} />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Expertise</h2>
                                <p className="text-sm text-slate-500">Skills students can book you for.</p>
                            </div>
                        </div>
                        <div className="mt-5 flex flex-wrap gap-3">
                            {mentor.expertiseTags.length > 0 ? mentor.expertiseTags.map((tag, index) => (
                                <span
                                    key={`${tag}-${index}`}
                                    className={`rounded-full border px-4 py-2 text-sm font-semibold ${colorClasses[index % colorClasses.length]}`}
                                >
                                    {tag}
                                </span>
                            )) : (
                                <span className="text-sm text-slate-500">No expertise tags added yet.</span>
                            )}
                        </div>

                        <div className="mt-8">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                                    <MapPin size={18} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">Bio</h2>
                                    <p className="text-sm text-slate-500">Short introduction shown on the public profile.</p>
                                </div>
                            </div>
                            <p className="mt-4 text-sm leading-7 text-slate-600">{mentor.bio}</p>
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-8">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                <Clock3 size={18} />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Available this week</h2>
                                <p className="text-sm text-slate-500">Live schedule preview for students.</p>
                            </div>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            {mentor.availableSlots.map((slot, index) => (
                                <div key={`${slot.day}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-indigo-300 hover:bg-white">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">{slot.day}</p>
                                            <p className="mt-1 text-sm text-slate-600">{slot.time}</p>
                                        </div>
                                        <div className="h-10 w-10 rounded-2xl bg-indigo-50" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm font-semibold text-slate-900">Session summary</p>
                            <p className="mt-1 text-sm leading-6 text-slate-600">{mentor.name} offers {mentor.sessionDuration} sessions with a simple booking experience.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ShareableMentorProfilePage;