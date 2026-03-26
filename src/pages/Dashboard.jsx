/**
 * pages/Dashboard.jsx — Ostello Role-Based Dashboard
 *
 * STUDENT   → My recent bookings, quick search link
 * CUSTODIAN → Hostel stats, recent booking requests
 * ADMIN     → Platform overview stats
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Typography, Box, Card, CardContent, Grid, Paper,
    Avatar, Stack, CircularProgress, Button, Chip, Divider,
} from '@mui/material';
import ApartmentIcon from '@mui/icons-material/Apartment';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import PeopleIcon from '@mui/icons-material/People';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import StarIcon from '@mui/icons-material/Star';
import {
    getMyBookings, getHostelStats, getMyHostels, getCustodianBookings,
    searchHostels, getUsers,
} from '../utils/api';

const BRAND = {
    teal: '#0E7C6B',
    tealDark: '#065C50',
    orange: '#F2994A',
    orangeLight: '#FDE8D0',
};

const STATUS_COLORS = {
    PENDING: '#ED6C02',
    APPROVED: '#0288D1',
    COMPLETED: '#2E7D32',
    DECLINED: '#D32F2F',
    CANCELLED: '#9E9E9E',
};

export default function Dashboard({ token, user }) {
    const navigate = useNavigate();
    const role = user?.role ?? 'STUDENT';
    const firstName = user?.full_name?.split(' ')[0] ?? 'there';

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({});

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                if (role === 'STUDENT') {
                    const bookings = await getMyBookings(token);
                    setData({ bookings });
                } else if (role === 'CUSTODIAN') {
                    const [stats, hostels, requests] = await Promise.all([
                        getHostelStats(token),
                        getMyHostels(token),
                        getCustodianBookings(token, 'PENDING'),
                    ]);
                    setData({ stats, hostels, requests });
                } else {
                    // ADMIN
                    const [hostels, users] = await Promise.all([
                        searchHostels(),
                        getUsers(token),
                    ]);
                    setData({ hostelCount: hostels.length, userCount: users.length });
                }
            } catch {
                // silently handle — show zeros
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [token, role]);

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    // ── KPI cards per role ───────────────────────────────────────────────────────
    const getCards = () => {
        if (role === 'STUDENT') {
            const bookings = data.bookings ?? [];
            return [
                { label: 'Total Bookings', value: bookings.length, icon: <BookOnlineIcon sx={{ fontSize: 32 }} />, accent: BRAND.teal, lightBg: '#E6F4F1', link: '/my-bookings' },
                { label: 'Pending', value: bookings.filter(b => b.status === 'PENDING').length, icon: <TrendingUpIcon sx={{ fontSize: 32 }} />, accent: '#ED6C02', lightBg: '#FFF3E0', link: '/my-bookings' },
                { label: 'Approved', value: bookings.filter(b => b.status === 'APPROVED').length, icon: <StarIcon sx={{ fontSize: 32 }} />, accent: '#0288D1', lightBg: '#E3F2FD', link: '/my-bookings' },
                { label: 'Completed', value: bookings.filter(b => b.status === 'COMPLETED').length, icon: <MeetingRoomIcon sx={{ fontSize: 32 }} />, accent: '#2E7D32', lightBg: '#E8F5E9', link: '/my-bookings' },
            ];
        }
        if (role === 'CUSTODIAN') {
            const stats = data.stats ?? {};
            return [
                { label: 'My Hostels', value: data.hostels?.length ?? 0, icon: <ApartmentIcon sx={{ fontSize: 32 }} />, accent: BRAND.teal, lightBg: '#E6F4F1', link: '/manage-hostels' },
                { label: 'Total Rooms', value: stats.total_rooms ?? 0, icon: <MeetingRoomIcon sx={{ fontSize: 32 }} />, accent: '#1A4A7B', lightBg: '#EEF4FB', link: '/manage-hostels' },
                { label: 'Active Bookings', value: stats.active_bookings ?? 0, icon: <BookOnlineIcon sx={{ fontSize: 32 }} />, accent: '#7B5200', lightBg: '#FDF7EC', link: '/booking-requests' },
                { label: 'Pending Requests', value: data.requests?.length ?? 0, icon: <TrendingUpIcon sx={{ fontSize: 32 }} />, accent: '#ED6C02', lightBg: '#FFF3E0', link: '/booking-requests' },
            ];
        }
        // ADMIN
        return [
            { label: 'Total Hostels', value: data.hostelCount ?? 0, icon: <ApartmentIcon sx={{ fontSize: 32 }} />, accent: BRAND.teal, lightBg: '#E6F4F1', link: '/hostels' },
            { label: 'Registered Users', value: data.userCount ?? 0, icon: <PeopleIcon sx={{ fontSize: 32 }} />, accent: '#1A4A7B', lightBg: '#EEF4FB', link: '/users' },
        ];
    };

    const statCards = getCards();

    return (
        <Box sx={{ width: '100%' }}>

            {/* Hero Banner */}
            <Box
                sx={{
                    mb: 3.5, borderRadius: 4, overflow: 'hidden', position: 'relative',
                    background: `linear-gradient(135deg, ${BRAND.teal} 0%, #0A9B84 50%, ${BRAND.tealDark} 100%)`,
                    p: { xs: 3, md: 4 },
                    boxShadow: '0 8px 32px rgba(14,124,107,0.35)',
                }}
            >
                <Box sx={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'radial-gradient(circle at 20px 20px, white 2px, transparent 0)', backgroundSize: '40px 40px' }} />
                <Box sx={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', bgcolor: 'rgba(242,153,74,0.2)', filter: 'blur(40px)' }} />

                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
                    <Box>
                        <Typography variant="caption" sx={{ color: BRAND.orange, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', fontSize: 11 }}>
                            Ostello — {role === 'CUSTODIAN' ? 'Custodian Portal' : role === 'ADMIN' ? 'Admin Portal' : 'Student Portal'}
                        </Typography>
                        <Typography variant="h4" fontWeight={900} color="#fff" sx={{ mt: 0.5, lineHeight: 1.2 }}>
                            {greeting}, {firstName}! 👋
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.72)', mt: 1 }}>
                            {role === 'STUDENT' && "Here's an overview of your hostel bookings."}
                            {role === 'CUSTODIAN' && "Here's how your hostels are performing."}
                            {role === 'ADMIN' && "Platform overview at a glance."}
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={1.5} flexShrink={0}>
                        {role === 'STUDENT' && (
                            <Button variant="contained" startIcon={<SearchIcon />} onClick={() => navigate('/hostels')}
                                sx={{ bgcolor: BRAND.orange, color: '#3D2100', fontWeight: 800, borderRadius: 2.5, px: 2.5, '&:hover': { bgcolor: '#E8A84A' }, boxShadow: '0 4px 14px rgba(242,153,74,0.4)' }}>
                                Browse Hostel
                            </Button>
                        )}
                        {role === 'CUSTODIAN' && (
                            <Button variant="contained" startIcon={<ApartmentIcon />} onClick={() => navigate('/manage-hostels')}
                                sx={{ bgcolor: BRAND.orange, color: '#3D2100', fontWeight: 800, borderRadius: 2.5, px: 2.5, '&:hover': { bgcolor: '#E8A84A' }, boxShadow: '0 4px 14px rgba(242,153,74,0.4)' }}>
                                Manage Hostels
                            </Button>
                        )}
                    </Stack>
                </Stack>
            </Box>

            {/* Loading */}
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress sx={{ color: BRAND.teal }} />
                </Box>
            )}

            {/* KPI Cards */}
            {!loading && (
                <Grid container spacing={2.5} mb={3.5}>
                    {statCards.map((card, i) => (
                        <Grid item xs={12} sm={6} md={3} key={i}>
                            <Card
                                onClick={() => card.link && navigate(card.link)}
                                sx={{
                                    borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)',
                                    boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
                                    cursor: card.link ? 'pointer' : 'default',
                                    transition: 'all 0.25s', overflow: 'hidden',
                                    '&:hover': card.link ? { transform: 'translateY(-4px)', boxShadow: `0 12px 28px ${card.accent}22`, borderColor: `${card.accent}44` } : {},
                                }}
                            >
                                <Box sx={{ height: 5, bgcolor: card.accent }} />
                                <CardContent sx={{ pt: 3, pb: '24px !important', px: 3 }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ letterSpacing: 0.8, textTransform: 'uppercase', fontSize: 11 }}>
                                                {card.label}
                                            </Typography>
                                            <Typography variant="h2" fontWeight={900} color={card.accent} sx={{ lineHeight: 1.1, mt: 0.75 }}>
                                                {card.value}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ bgcolor: card.lightBg, borderRadius: 2.5, p: 1.8, color: card.accent }}>
                                            <Box sx={{ fontSize: 32, display: 'flex' }}>{card.icon}</Box>
                                        </Box>
                                    </Stack>
                                    {card.link && (
                                        <Stack direction="row" alignItems="center" spacing={0.5} mt={3}>
                                            <Typography variant="caption" color="text.disabled" sx={{ fontSize: 12 }}>View details</Typography>
                                            <ArrowForwardIcon sx={{ fontSize: 13, color: card.accent, ml: 'auto' }} />
                                        </Stack>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Recent Bookings (Student) */}
            {!loading && role === 'STUDENT' && (data.bookings ?? []).length > 0 && (
                <Paper sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 3, py: 2, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                        <Box>
                            <Typography variant="subtitle2" fontWeight={800}>Recent Bookings</Typography>
                            <Typography variant="caption" color="text.disabled">Your latest hostel reservations</Typography>
                        </Box>
                        <Button size="small" endIcon={<ArrowForwardIcon sx={{ fontSize: 13 }} />} onClick={() => navigate('/my-bookings')} sx={{ color: BRAND.teal, fontWeight: 700, fontSize: 12 }}>
                            View all
                        </Button>
                    </Stack>
                    <Box>
                        {data.bookings.slice(0, 5).map((b, idx) => (
                            <Stack key={b.id} direction="row" alignItems="center" spacing={2}
                                sx={{ px: 3, py: 1.8, borderBottom: idx < Math.min(data.bookings.length, 5) - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none', transition: '0.15s', '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' } }}>
                                <Avatar sx={{ bgcolor: '#E6F4F1', color: BRAND.teal, width: 38, height: 38 }}>
                                    <ApartmentIcon sx={{ fontSize: 18 }} />
                                </Avatar>
                                <Box flex={1} minWidth={0}>
                                    <Typography variant="body2" fontWeight={700} noWrap>{b.hostel_name}</Typography>
                                    <Typography variant="caption" color="text.disabled">Room {b.room_number} · {b.room_type}</Typography>
                                </Box>
                                <Chip label={b.status} size="small" sx={{ bgcolor: `${STATUS_COLORS[b.status] ?? '#999'}18`, color: STATUS_COLORS[b.status] ?? '#999', fontWeight: 700, fontSize: 11 }} />
                            </Stack>
                        ))}
                    </Box>
                </Paper>
            )}

            {/* Pending Requests (Custodian) */}
            {!loading && role === 'CUSTODIAN' && (data.requests ?? []).length > 0 && (
                <Paper sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', overflow: 'hidden', mt: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 3, py: 2, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                        <Box>
                            <Typography variant="subtitle2" fontWeight={800}>Pending Booking Requests</Typography>
                            <Typography variant="caption" color="text.disabled">Requests awaiting your approval</Typography>
                        </Box>
                        <Button size="small" endIcon={<ArrowForwardIcon sx={{ fontSize: 13 }} />} onClick={() => navigate('/booking-requests')} sx={{ color: BRAND.teal, fontWeight: 700, fontSize: 12 }}>
                            View all
                        </Button>
                    </Stack>
                    <Box>
                        {data.requests.slice(0, 5).map((b, idx) => (
                            <Stack key={b.id} direction="row" alignItems="center" spacing={2}
                                sx={{ px: 3, py: 1.8, borderBottom: idx < Math.min(data.requests.length, 5) - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
                                <Avatar sx={{ bgcolor: '#FFF3E0', color: '#ED6C02', width: 38, height: 38 }}>
                                    <BookOnlineIcon sx={{ fontSize: 18 }} />
                                </Avatar>
                                <Box flex={1} minWidth={0}>
                                    <Typography variant="body2" fontWeight={700} noWrap>{b.student_name}</Typography>
                                    <Typography variant="caption" color="text.disabled">{b.hostel_name} · Room {b.room_number}</Typography>
                                </Box>
                                <Chip label="PENDING" size="small" sx={{ bgcolor: '#FFF3E0', color: '#ED6C02', fontWeight: 700, fontSize: 11 }} />
                            </Stack>
                        ))}
                    </Box>
                </Paper>
            )}
        </Box>
    );
}
