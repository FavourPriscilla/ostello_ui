/**
 * pages/BookingRequests.jsx — Custodian: approve / decline booking requests
 */
import { useEffect, useState, useCallback } from 'react';
import {
    Box, Typography, Stack, Chip, CircularProgress, Alert,
    Card, CardContent, Button, Grid, Tabs, Tab, Avatar, Divider,
} from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ApartmentIcon from '@mui/icons-material/Apartment';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import { getCustodianBookings, approveBooking, declineBooking } from '../utils/api';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';

const BRAND = { teal: '#0E7C6B', tealDark: '#065C50', orange: '#F2994A', orangeLight: '#FDE8D0' };

const STATUS_COLORS = {
    PENDING: { bg: '#FFF3E0', text: '#ED6C02' },
    APPROVED: { bg: '#E3F2FD', text: '#0288D1' },
    COMPLETED: { bg: '#E8F5E9', text: '#2E7D32' },
    DECLINED: { bg: '#FFEBEE', text: '#D32F2F' },
    CANCELLED: { bg: '#F5F5F5', text: '#9E9E9E' },
};

const STATUS_TABS = ['ALL', 'PENDING', 'APPROVED', 'COMPLETED', 'DECLINED', 'CANCELLED'];

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export default function BookingRequests({ token }) {
    const { toast, showToast, hideToast } = useToast();

    const [allBookings, setAllBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tab, setTab] = useState('ALL');

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            setAllBookings(await getCustodianBookings(token));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { fetchBookings(); }, [fetchBookings]);

    const handleApprove = async (id) => {
        try {
            await approveBooking(id, token);
            showToast('Booking approved!', 'success', 'Approved');
            fetchBookings();
        } catch (err) {
            showToast(err.message, 'error', 'Error');
        }
    };

    const handleDecline = async (id) => {
        try {
            await declineBooking(id, token);
            showToast('Booking declined.', 'warning', 'Declined');
            fetchBookings();
        } catch (err) {
            showToast(err.message, 'error', 'Error');
        }
    };

    const bookings = tab === 'ALL' ? allBookings : allBookings.filter(b => b.status === tab);

    const countFor = (s) => s === 'ALL' ? allBookings.length : allBookings.filter(b => b.status === s).length;

    return (
        <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                <Box sx={{ width: 4, height: 26, bgcolor: BRAND.orange, borderRadius: 1 }} />
                <Typography variant="h5" fontWeight={800} color={BRAND.teal}>Booking Requests</Typography>
                {!loading && <Chip label={allBookings.length} size="small" sx={{ bgcolor: BRAND.orangeLight, color: BRAND.teal, fontWeight: 700 }} />}
            </Stack>

            {/* Status filter tabs */}
            <Box sx={{ mb: 3, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{ '& .MuiTab-root': { fontWeight: 600, fontSize: 12, minWidth: 90 }, '& .Mui-selected': { color: `${BRAND.teal} !important` }, '& .MuiTabs-indicator': { bgcolor: BRAND.teal } }}
                >
                    {STATUS_TABS.map(s => (
                        <Tab
                            key={s}
                            value={s}
                            label={
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <span>{s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}</span>
                                    <Chip
                                        label={countFor(s)}
                                        size="small"
                                        sx={{
                                            height: 18, fontSize: 10, fontWeight: 700,
                                            bgcolor: s === tab ? BRAND.teal : 'rgba(0,0,0,0.06)',
                                            color: s === tab ? '#fff' : 'text.secondary',
                                        }}
                                    />
                                </Stack>
                            }
                        />
                    ))}
                </Tabs>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: BRAND.teal }} /></Box>}

            {!loading && bookings.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 10, color: 'text.secondary' }}>
                    <InboxIcon sx={{ fontSize: 72, color: BRAND.orangeLight }} />
                    <Typography mt={2} fontWeight={600}>
                        {tab === 'ALL' ? 'No booking requests yet.' : `No ${tab.toLowerCase()} bookings.`}
                    </Typography>
                </Box>
            )}

            {!loading && (
                <Grid container spacing={2}>
                    {bookings.map(b => {
                        const sc = STATUS_COLORS[b.status] ?? STATUS_COLORS.PENDING;
                        return (
                            <Grid item xs={12} sm={6} md={4} key={b.id}>
                                <Card sx={{
                                    borderRadius: 3, border: '1px solid rgba(0,0,0,0.07)',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
                                    height: '100%', display: 'flex', flexDirection: 'column',
                                }}>
                                    <Box sx={{ height: 4, bgcolor: sc.text, borderRadius: '12px 12px 0 0' }} />
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        {/* Hostel + Status row */}
                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Avatar sx={{ width: 34, height: 34, bgcolor: '#E6F4F1', color: BRAND.teal }}>
                                                    <ApartmentIcon sx={{ fontSize: 18 }} />
                                                </Avatar>
                                                <Box sx={{ minWidth: 0 }}>
                                                    <Typography variant="subtitle2" fontWeight={700} noWrap color={BRAND.teal}>{b.hostel_name}</Typography>
                                                    <Stack direction="row" alignItems="center" spacing={0.4}>
                                                        <MeetingRoomIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                                                        <Typography variant="caption" color="text.secondary">
                                                            Room {b.room_number} · {b.room_type}
                                                        </Typography>
                                                    </Stack>
                                                </Box>
                                            </Stack>
                                            <Chip label={b.status} size="small" sx={{ bgcolor: sc.bg, color: sc.text, fontWeight: 700, fontSize: 10, flexShrink: 0 }} />
                                        </Stack>

                                        <Divider sx={{ mb: 1.5, borderColor: 'rgba(0,0,0,0.05)' }} />

                                        {/* Student */}
                                        <Stack direction="row" alignItems="center" spacing={0.8} mb={0.8}>
                                            <PersonIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
                                            <Typography variant="body2" fontWeight={600}>{b.student_name}</Typography>
                                        </Stack>

                                        {/* Dates */}
                                        <Stack direction="row" alignItems="center" spacing={0.8} mb={0.8}>
                                            <CalendarTodayIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
                                                {fmt(b.check_in_date)} → {fmt(b.check_out_date)}
                                            </Typography>
                                        </Stack>

                                        {/* Price */}
                                        <Typography variant="h6" fontWeight={800} color={BRAND.orange} mt={0.5}>
                                            UGX {Number(b.price_per_semester ?? 0).toLocaleString()}
                                        </Typography>
                                    </CardContent>

                                    {b.status === 'PENDING' && (
                                        <>
                                            <Divider sx={{ borderColor: 'rgba(0,0,0,0.05)' }} />
                                            <Stack direction="row" spacing={1} sx={{ px: 2, py: 1.5 }}>
                                                <Button
                                                    size="small" variant="contained" fullWidth startIcon={<CheckCircleIcon />}
                                                    sx={{ bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' }, fontWeight: 700 }}
                                                    onClick={() => handleApprove(b.id)}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="small" variant="outlined" fullWidth color="error" startIcon={<CancelIcon />}
                                                    onClick={() => handleDecline(b.id)} sx={{ fontWeight: 700 }}
                                                >
                                                    Decline
                                                </Button>
                                            </Stack>
                                        </>
                                    )}
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}

            <Toast toast={toast} onClose={hideToast} />
        </Box>
    );
}
