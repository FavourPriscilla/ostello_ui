/**
 * pages/HostelDetail.jsx — Single Hostel View + Rooms + Reviews + Booking
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Grid, Card, CardContent, Stack, Chip,
    CircularProgress, Alert, Rating, Button, Divider,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Paper, Avatar,
    MenuItem, Select, FormControl, InputLabel,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ApartmentIcon from '@mui/icons-material/Apartment';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import StarIcon from '@mui/icons-material/Star';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getHostelById, getRoomsByHostel, getHostelReviews, createBooking, createReview, getMyBookings } from '../utils/api';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';

const BRAND = { teal: '#0E7C6B', tealDark: '#065C50', orange: '#F2994A', orangeLight: '#FDE8D0' };

export default function HostelDetail({ token, user }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast, showToast, hideToast } = useToast();

    const [hostel, setHostel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Booking dialog
    const [bookOpen, setBookOpen] = useState(false);
    const [bookRoom, setBookRoom] = useState(null);
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [booking, setBooking] = useState(false);

    // Review dialog
    const [reviewOpen, setReviewOpen] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [eligibleBookings, setEligibleBookings] = useState([]);
    const [selectedBookingId, setSelectedBookingId] = useState('');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [h, r, rev] = await Promise.all([
                    getHostelById(id),
                    getRoomsByHostel(id),
                    getHostelReviews(id),
                ]);
                setHostel(h);
                setRooms(r);
                setReviews(rev);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const handleBook = async () => {
        if (!checkIn || !checkOut) return;
        setBooking(true);
        try {
            await createBooking({ room_id: bookRoom.id, check_in_date: checkIn, check_out_date: checkOut }, token);
            showToast('Booking request submitted!', 'success', 'Booked');
            setBookOpen(false);
            setCheckIn('');
            setCheckOut('');
        } catch (err) {
            showToast(err.message, 'error', 'Booking Failed');
        } finally {
            setBooking(false);
        }
    };

    const openReviewDialog = async () => {
        try {
            const myBookings = await getMyBookings(token);
            // Only bookings for this hostel that are COMPLETED and not yet reviewed
            const eligible = (myBookings || []).filter(
                b => String(b.hostel_id) === String(id) && b.status === 'COMPLETED'
            );
            setEligibleBookings(eligible);
            setSelectedBookingId(eligible.length === 1 ? String(eligible[0].id) : '');
        } catch {
            setEligibleBookings([]);
            setSelectedBookingId('');
        }
        setReviewOpen(true);
    };

    const handleReview = async () => {
        if (!selectedBookingId) return;
        setSubmittingReview(true);
        try {
            await createReview({ booking_id: Number(selectedBookingId), rating: reviewRating, comment: reviewComment }, token);
            showToast('Review posted!', 'success', 'Thank you');
            setReviewOpen(false);
            setReviewComment('');
            setSelectedBookingId('');
            const rev = await getHostelReviews(id);
            setReviews(rev);
        } catch (err) {
            showToast(err.message, 'error', 'Review Failed');
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress sx={{ color: BRAND.teal }} /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!hostel) return <Alert severity="warning">Hostel not found.</Alert>;

    return (
        <Box>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2, color: BRAND.teal, fontWeight: 600 }}>
                Back
            </Button>

            {/* Hostel Header */}
            <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 3, border: '1px solid rgba(0,0,0,0.06)' }}>
                <Box sx={{ height: 180, bgcolor: '#E6F4F1', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${BRAND.teal}22 0%, ${BRAND.orange}22 100%)` }}>
                    <ApartmentIcon sx={{ fontSize: 80, color: BRAND.teal, opacity: 0.4 }} />
                </Box>
                <Box sx={{ p: 3 }}>
                    <Typography variant="h4" fontWeight={800} color={BRAND.teal}>{hostel.name}</Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5} mt={1}>
                        <LocationOnIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                        <Typography variant="body1" color="text.secondary">{hostel.address}</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1} mt={1}>
                        <Rating value={Number(hostel.avg_rating) || 0} precision={0.5} readOnly />
                        <Typography variant="body2" color="text.disabled">({Number(hostel.avg_rating || 0).toFixed(1)} / 5)</Typography>
                    </Stack>
                    {hostel.description && <Typography variant="body2" color="text.secondary" mt={2}>{hostel.description}</Typography>}
                    {hostel.amenities && (
                        <Stack direction="row" spacing={0.5} mt={2} flexWrap="wrap" useFlexGap>
                            {(Array.isArray(hostel.amenities)
                                ? hostel.amenities
                                : hostel.amenities.split(',')
                            ).map(a => (
                                <Chip key={a} label={typeof a === 'string' ? a.trim() : a} size="small" sx={{ bgcolor: BRAND.orangeLight, color: BRAND.teal, fontWeight: 600 }} />
                            ))}
                        </Stack>
                    )}
                </Box>
            </Paper>

            {/* Rooms */}
            <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                <MeetingRoomIcon sx={{ color: BRAND.teal }} />
                <Typography variant="h6" fontWeight={700} color={BRAND.teal}>Available Rooms</Typography>
            </Stack>

            {rooms.length === 0 ? (
                <Typography color="text.secondary" mb={3}>No rooms listed yet.</Typography>
            ) : (
                <Grid container spacing={2} mb={4}>
                    {rooms.map(r => (
                        <Grid item xs={12} sm={6} md={4} key={r.id}>
                            <Card sx={{ borderRadius: 2, border: '1px solid rgba(0,0,0,0.06)' }}>
                                <CardContent>
                                    <Typography variant="subtitle1" fontWeight={700}>Room {r.room_number}</Typography>
                                    <Stack direction="row" spacing={1} mt={0.5}>
                                        <Chip label={r.room_type} size="small" sx={{ bgcolor: '#E3F2FD', color: '#0288D1', fontWeight: 600, fontSize: 11 }} />
                                        <Chip label={r.is_available ? 'Available' : 'Occupied'} size="small"
                                            sx={{ bgcolor: r.is_available ? '#E8F5E9' : '#FFEBEE', color: r.is_available ? '#2E7D32' : '#D32F2F', fontWeight: 600, fontSize: 11 }} />
                                    </Stack>
                                    <Typography variant="h6" fontWeight={800} color={BRAND.orange} mt={1}>
                                        UGX {Number(r.price_per_semester).toLocaleString()}<Typography component="span" variant="caption" color="text.disabled"> /semester</Typography>
                                    </Typography>
                                    {r.description && <Typography variant="body2" color="text.secondary" mt={0.5}>{r.description}</Typography>}
                                    {user?.role === 'STUDENT' && r.is_available && (
                                        <Button
                                            variant="contained" startIcon={<BookOnlineIcon />} fullWidth
                                            sx={{ mt: 2, bgcolor: BRAND.teal, '&:hover': { bgcolor: BRAND.tealDark }, fontWeight: 700 }}
                                            onClick={() => { setBookRoom(r); setBookOpen(true); }}
                                        >
                                            Book This Room
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Reviews */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <StarIcon sx={{ color: BRAND.orange }} />
                    <Typography variant="h6" fontWeight={700} color={BRAND.teal}>Reviews ({reviews.length})</Typography>
                </Stack>
                {user?.role === 'STUDENT' && (
                    <Button variant="outlined" onClick={openReviewDialog} sx={{ color: BRAND.teal, borderColor: BRAND.teal, fontWeight: 700 }}>
                        Write Review
                    </Button>
                )}
            </Stack>

            {reviews.length === 0 ? (
                <Typography color="text.secondary">No reviews yet. Be the first!</Typography>
            ) : (
                <Stack spacing={2}>
                    {reviews.map(r => (
                        <Paper key={r.id} sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(0,0,0,0.06)' }}>
                            <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: BRAND.teal, fontSize: 14, fontWeight: 700 }}>
                                    {r.reviewer_name?.[0]?.toUpperCase() ?? 'U'}
                                </Avatar>
                                <Box>
                                    <Typography variant="body2" fontWeight={700}>{r.reviewer_name ?? 'User'}</Typography>
                                    <Rating value={r.rating} readOnly size="small" />
                                </Box>
                            </Stack>
                            {r.comment && <Typography variant="body2" color="text.secondary">{r.comment}</Typography>}
                        </Paper>
                    ))}
                </Stack>
            )}

            {/* Booking Dialog */}
            <Dialog open={bookOpen} onClose={() => setBookOpen(false)} slotProps={{ paper: { sx: { borderRadius: 3, minWidth: 380 } } }}>
                <DialogTitle sx={{ fontWeight: 800, color: BRAND.teal }}>Book Room {bookRoom?.room_number}</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                        {hostel.name} · {bookRoom?.room_type} · UGX {Number(bookRoom?.price_per_semester ?? 0).toLocaleString()}/semester
                    </Typography>
                    <TextField label="Check-in Date" type="date" fullWidth margin="normal" value={checkIn} onChange={e => setCheckIn(e.target.value)} InputLabelProps={{ shrink: true }} />
                    <TextField label="Check-out Date" type="date" fullWidth margin="normal" value={checkOut} onChange={e => setCheckOut(e.target.value)} InputLabelProps={{ shrink: true }} />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setBookOpen(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
                    <Button variant="contained" onClick={handleBook} disabled={booking || !checkIn || !checkOut}
                        sx={{ bgcolor: BRAND.teal, '&:hover': { bgcolor: BRAND.tealDark }, fontWeight: 700 }}>
                        {booking ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Submit Booking'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Review Dialog */}
            <Dialog open={reviewOpen} onClose={() => setReviewOpen(false)} slotProps={{ paper: { sx: { borderRadius: 3, minWidth: 380 } } }}>
                <DialogTitle sx={{ fontWeight: 800, color: BRAND.teal }}>Write a Review</DialogTitle>
                <DialogContent>
                    {eligibleBookings.length === 0 ? (
                        <Alert severity="info" sx={{ mt: 1 }}>
                            You can only review hostels where you have a <strong>completed</strong> booking.
                        </Alert>
                    ) : (
                        <>
                            {eligibleBookings.length > 1 && (
                                <FormControl fullWidth sx={{ mt: 1, mb: 1 }}>
                                    <InputLabel>Select Booking</InputLabel>
                                    <Select
                                        value={selectedBookingId}
                                        label="Select Booking"
                                        onChange={e => setSelectedBookingId(e.target.value)}
                                    >
                                        {eligibleBookings.map(b => (
                                            <MenuItem key={b.id} value={String(b.id)}>
                                                Booking #{b.id} · Room {b.room_number ?? b.room_id} · {b.check_in_date?.slice(0, 10)}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}
                            <Stack alignItems="center" my={2}>
                                <Rating value={reviewRating} onChange={(_, v) => setReviewRating(v)} size="large" />
                            </Stack>
                            <TextField label="Comment (optional)" fullWidth multiline rows={3} value={reviewComment} onChange={e => setReviewComment(e.target.value)} />
                        </>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setReviewOpen(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
                    {eligibleBookings.length > 0 && (
                        <Button variant="contained" onClick={handleReview} disabled={submittingReview || !selectedBookingId}
                            sx={{ bgcolor: BRAND.teal, '&:hover': { bgcolor: BRAND.tealDark }, fontWeight: 700 }}>
                            {submittingReview ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Post Review'}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            <Toast toast={toast} onClose={hideToast} />
        </Box>
    );
}
