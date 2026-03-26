/**
 * pages/MyBookings.jsx — Student: view all my bookings + pay for approved ones
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Stack, Chip, CircularProgress, Alert,
    Card, CardContent, Button, Grid, Tabs, Tab, Divider,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
} from '@mui/material';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import PaymentIcon from '@mui/icons-material/Payment';
import CancelIcon from '@mui/icons-material/Cancel';
import ApartmentIcon from '@mui/icons-material/Apartment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { getMyBookings, cancelBooking, makePayment } from '../utils/api';
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

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-UG', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function MyBookings({ token }) {
    const navigate = useNavigate();
    const { toast, showToast, hideToast } = useToast();

    const [allBookings, setAllBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tab, setTab] = useState('ALL');

    // Pay dialog
    const [payOpen, setPayOpen] = useState(false);
    const [payTarget, setPayTarget] = useState(null);
    const [payMethod, setPayMethod] = useState('MOBILE_MONEY');
    const [payRef, setPayRef] = useState('');
    const [paying, setPaying] = useState(false);

    const fetchBookings = async () => {
        setLoading(true);
        setError('');
        try {
            setAllBookings(await getMyBookings(token));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchBookings(); }, [token]);

    const bookings = tab === 'ALL' ? allBookings : allBookings.filter(b => b.status === tab);
    const countFor = (s) => s === 'ALL' ? allBookings.length : allBookings.filter(b => b.status === s).length;

    const handleCancel = async (id) => {
        try {
            await cancelBooking(id, token);
            showToast('Booking cancelled.', 'info', 'Cancelled');
            fetchBookings();
        } catch (err) {
            showToast(err.message, 'error', 'Error');
        }
    };

    const handlePay = async () => {
        setPaying(true);
        try {
            await makePayment({ booking_id: payTarget.id, amount: payTarget.price_per_semester, payment_method: payMethod, transaction_ref: payRef || undefined }, token);
            showToast('Payment successful!', 'success', 'Paid');
            setPayOpen(false);
            fetchBookings();
        } catch (err) {
            showToast(err.message, 'error', 'Payment Failed');
        } finally {
            setPaying(false);
        }
    };

    return (
        <Box>
            {/* Page header */}
            <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
                <Box sx={{ width: 4, height: 26, bgcolor: BRAND.orange, borderRadius: 1 }} />
                <Typography variant="h5" fontWeight={800} color={BRAND.teal}>My Bookings</Typography>
                {!loading && (
                    <Chip label={allBookings.length} size="small"
                        sx={{ bgcolor: BRAND.orangeLight, color: BRAND.teal, fontWeight: 700 }} />
                )}
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: BRAND.teal }} /></Box>}

            {/* Filter tabs */}
            {!loading && (
                <Box sx={{ mb: 3, bgcolor: '#fff', borderRadius: 3, border: '1px solid rgba(0,0,0,0.07)', overflow: 'hidden' }}>
                    <Tabs
                        value={tab}
                        onChange={(_, v) => setTab(v)}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            '& .MuiTab-root': { minHeight: 48, fontWeight: 700, fontSize: 13, textTransform: 'none' },
                            '& .Mui-selected': { color: BRAND.teal },
                            '& .MuiTabs-indicator': { bgcolor: BRAND.teal, height: 3 },
                        }}
                    >
                        {STATUS_TABS.map(s => (
                            <Tab key={s} value={s} label={
                                <Stack direction="row" alignItems="center" spacing={0.75}>
                                    <span>{s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}</span>
                                    {countFor(s) > 0 && (
                                        <Chip label={countFor(s)} size="small"
                                            sx={{
                                                height: 18, fontSize: 10, fontWeight: 700,
                                                bgcolor: s === tab ? BRAND.teal : 'rgba(0,0,0,0.08)',
                                                color: s === tab ? '#fff' : 'text.secondary',
                                                pointerEvents: 'none'
                                            }} />
                                    )}
                                </Stack>
                            } />
                        ))}
                    </Tabs>
                </Box>
            )}

            {/* Empty state */}
            {!loading && allBookings.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 10, color: 'text.secondary' }}>
                    <BookOnlineIcon sx={{ fontSize: 72, color: BRAND.orangeLight }} />
                    <Typography mt={2} fontWeight={600}>No bookings yet. Browse hostels to get started!</Typography>
                    <Button variant="contained" sx={{ mt: 2, bgcolor: BRAND.teal, fontWeight: 700 }} onClick={() => navigate('/hostels')}>
                        Browse Hostels
                    </Button>
                </Box>
            )}

            {!loading && allBookings.length > 0 && bookings.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                    <BookOnlineIcon sx={{ fontSize: 56, color: BRAND.orangeLight }} />
                    <Typography mt={2} fontWeight={600}>No {tab.toLowerCase()} bookings.</Typography>
                </Box>
            )}

            {/* Booking cards */}
            {!loading && (
                <Grid container spacing={2}>
                    {bookings.map(b => {
                        const sc = STATUS_COLORS[b.status] ?? STATUS_COLORS.PENDING;
                        return (
                            <Grid item xs={12} sm={6} md={4} key={b.id}>
                                <Card sx={{
                                    borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column',
                                    border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
                                    transition: 'all 0.2s',
                                    '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' },
                                }}>
                                    {/* Colour stripe + hostel name */}
                                    <Box sx={{ bgcolor: sc.text, px: 2, py: 1.5 }}>
                                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                                            <Stack direction="row" alignItems="center" spacing={1} sx={{ overflow: 'hidden' }}>
                                                <ApartmentIcon sx={{ color: '#fff', fontSize: 18, flexShrink: 0 }} />
                                                <Typography variant="subtitle2" fontWeight={800} color="#fff" noWrap>
                                                    {b.hostel_name}
                                                </Typography>
                                            </Stack>
                                            <Chip label={b.status} size="small"
                                                sx={{ bgcolor: 'rgba(255,255,255,0.22)', color: '#fff', fontWeight: 700, fontSize: 10, border: '1px solid rgba(255,255,255,0.4)' }} />
                                        </Stack>
                                    </Box>

                                    <CardContent sx={{ flex: 1, pt: 2 }}>
                                        {/* Room info */}
                                        <Stack direction="row" spacing={0.75} alignItems="center" mb={1.5}>
                                            <MeetingRoomIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                            <Typography variant="body2" color="text.secondary">
                                                Room {b.room_number}
                                            </Typography>
                                            <Chip label={b.room_type} size="small"
                                                sx={{ fontSize: 10, bgcolor: '#E3F2FD', color: '#0288D1', fontWeight: 600 }} />
                                        </Stack>

                                        {/* Dates */}
                                        <Stack direction="row" spacing={0.75} alignItems="flex-start" mb={1}>
                                            <CalendarTodayIcon sx={{ fontSize: 15, color: 'text.secondary', mt: 0.25 }} />
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    {fmt(b.check_in_date)} → {fmt(b.check_out_date)}
                                                </Typography>
                                            </Box>
                                        </Stack>

                                        <Divider sx={{ my: 1.5 }} />

                                        {/* Price */}
                                        <Typography variant="h6" fontWeight={800} color={BRAND.orange}>
                                            UGX {Number(b.price_per_semester).toLocaleString()}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">per semester</Typography>
                                    </CardContent>

                                    {/* Actions */}
                                    <Box sx={{ px: 2, pb: 2, pt: 0.5 }}>
                                        <Stack spacing={1}>
                                            <Button size="small" variant="text" endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                                                onClick={() => navigate(`/hostels/${b.hostel_id}`)}
                                                sx={{ color: BRAND.teal, fontWeight: 700, justifyContent: 'flex-start', px: 0 }}>
                                                View Hostel
                                            </Button>
                                            {b.status === 'APPROVED' && (
                                                <Button fullWidth size="small" variant="contained" startIcon={<PaymentIcon />}
                                                    sx={{ bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' }, fontWeight: 700, borderRadius: 2 }}
                                                    onClick={() => { setPayTarget(b); setPayOpen(true); }}>
                                                    Pay Now
                                                </Button>
                                            )}
                                            {(b.status === 'PENDING' || b.status === 'APPROVED') && (
                                                <Button fullWidth size="small" variant="outlined" color="error"
                                                    startIcon={<CancelIcon />}
                                                    onClick={() => handleCancel(b.id)}
                                                    sx={{ fontWeight: 700, borderRadius: 2 }}>
                                                    Cancel Booking
                                                </Button>
                                            )}
                                        </Stack>
                                    </Box>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}

            {/* Payment Dialog */}
            <Dialog open={payOpen} onClose={() => setPayOpen(false)} slotProps={{ paper: { sx: { borderRadius: 3, minWidth: 380 } } }}>
                <DialogTitle sx={{ fontWeight: 800, color: BRAND.teal }}>Make Payment</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                        {payTarget?.hostel_name} · Room {payTarget?.room_number} · UGX {Number(payTarget?.price_per_semester ?? 0).toLocaleString()}
                    </Typography>
                    <TextField label="Payment Method" select fullWidth margin="normal" value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                        <MenuItem value="MOBILE_MONEY">Mobile Money</MenuItem>
                        <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
                        <MenuItem value="CASH">Cash</MenuItem>
                    </TextField>
                    <TextField label="Transaction Reference (optional)" fullWidth margin="normal" value={payRef} onChange={e => setPayRef(e.target.value)} />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setPayOpen(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
                    <Button variant="contained" onClick={handlePay} disabled={paying}
                        sx={{ bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' }, fontWeight: 700 }}>
                        {paying ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Confirm Payment'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Toast toast={toast} onClose={hideToast} />
        </Box>
    );
}
