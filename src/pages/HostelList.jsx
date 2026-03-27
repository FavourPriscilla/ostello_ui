/**
 * pages/HostelList.jsx — Browse & Search Hostels
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Grid, Card, CardContent, CardActionArea, Button,
    TextField, Stack, Chip, CircularProgress, Alert, Rating,
    MenuItem, InputAdornment, Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ApartmentIcon from '@mui/icons-material/Apartment';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import { searchHostels } from '../utils/api';

const BRAND = { teal: '#0E7C6B', tealDark: '#065C50', orange: '#F2994A', orangeLight: '#FDE8D0' };

const CARD_GRADIENTS = [
    'linear-gradient(135deg, #0E7C6B22 0%, #F2994A22 100%)',
    'linear-gradient(135deg, #1A4A7B22 0%, #0E7C6B22 100%)',
    'linear-gradient(135deg, #7B3F0022 0%, #F2994A22 100%)',
    'linear-gradient(135deg, #4A1A7B22 0%, #0E7C6B22 100%)',
];

export default function HostelList() {
    const navigate = useNavigate();

    const [hostels, setHostels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [search, setSearch] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [roomType, setRoomType] = useState('');

    const hasFilters = search.trim() || minPrice || maxPrice || roomType;

    const fetchHostels = async (params = {}) => {
        setLoading(true);
        setError('');
        try {
            setHostels(await searchHostels(params));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchHostels(); }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        const params = {};
        if (search.trim()) params.search = search.trim();
        if (minPrice) params.min_price = minPrice;
        if (maxPrice) params.max_price = maxPrice;
        if (roomType) params.room_type = roomType;
        fetchHostels(params);
    };

    const handleClear = () => {
        setSearch(''); setMinPrice(''); setMaxPrice(''); setRoomType('');
        fetchHostels();
    };
function getlocation() {
    navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const ing = position.coords.longitude;

        console.log(lat, lng);

        fetch("/api/hostels",{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ lat, lng })
        });
    });
}
    return (
        <Box>
            {/* Header */}
            <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
                <Box sx={{ width: 4, height: 26, bgcolor: BRAND.orange, borderRadius: 1 }} />
                <Typography variant="h5" fontWeight={800} color={BRAND.teal}>Browse Hostels</Typography>
                {!loading && (
                    <Chip label={`${hostels.length} found`} size="small" sx={{ bgcolor: BRAND.orangeLight, color: BRAND.teal, fontWeight: 700 }} />
                )}
            </Stack>

            {/* Filter bar */}
            <Box
                component="form" onSubmit={handleSearch}
                sx={{ mb: 3, p: 2.5, borderRadius: 3, bgcolor: '#fff', border: '1px solid rgba(14,124,107,0.12)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
            >
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-end" flexWrap="wrap">
                    <TextField
                        label="Search by name or location" size="small" value={search}
                        onChange={e => setSearch(e.target.value)} sx={{ flex: 2, minWidth: 200 }}
                        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: BRAND.teal, fontSize: 18 }} /></InputAdornment> } }}
                    />
                    <TextField label="Min Price (UGX)" size="small" type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} sx={{ flex: 1, minWidth: 130 }} />
                    <TextField label="Max Price (UGX)" size="small" type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} sx={{ flex: 1, minWidth: 130 }} />
                    <TextField label="Room Type" size="small" select value={roomType} onChange={e => setRoomType(e.target.value)} sx={{ flex: 1, minWidth: 130 }}>
                        <MenuItem value="">All Types</MenuItem>
                        <MenuItem value="SINGLE">Single</MenuItem>
                        <MenuItem value="DOUBLE">Double</MenuItem>
                        <MenuItem value="DORMITORY">Dormitory</MenuItem>
                    </TextField>
                    <Stack direction="row" spacing={1}>
                        <Button type="submit" variant="contained" sx={{ bgcolor: BRAND.teal, '&:hover': { bgcolor: BRAND.tealDark }, fontWeight: 700, height: 40, px: 3 }}>
                            Search
                        </Button>
                        {hasFilters && (
                            <>
                                <Button variant="outlined" onClick={handleClear} startIcon={<FilterListOffIcon />}
                                    sx={{ borderColor: BRAND.teal, color: BRAND.teal, fontWeight: 700, height: 40 }}>
                                    Clear
                                </Button>
                                <Button onClick={getlocation}>
                                    Find Nearby Hostels
                                </Button>
                            </>
                        )}
                    </Stack>
                </Stack>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress sx={{ color: BRAND.teal }} /></Box>}

            {!loading && hostels.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 12, color: 'text.secondary' }}>
                    <ApartmentIcon sx={{ fontSize: 80, color: BRAND.orangeLight, mb: 2 }} />
                    <Typography variant="h6" fontWeight={700} gutterBottom>No hostels found</Typography>
                    <Typography variant="body2">Try adjusting your search filters.</Typography>
                    {hasFilters && <Button onClick={handleClear} sx={{ mt: 2, color: BRAND.teal, fontWeight: 700 }}>Clear Filters</Button>}
                </Box>
            )}

            {/* Hostel Cards */}
            {!loading && hostels.length > 0 && (
                <Grid container spacing={3}>
                    {hostels.map((h, idx) => {
                        const amenities = Array.isArray(h.amenities)
                            ? h.amenities
                            : (h.amenities ? h.amenities.split(',') : []);
                        const minP = h.min_price ? Number(h.min_price) : null;

                        return (
                            <Grid item xs={12} sm={6} md={4} key={h.id}>
                                <Card sx={{
                                    borderRadius: 3, overflow: 'hidden',
                                    border: '1px solid rgba(0,0,0,0.07)',
                                    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                                    transition: 'transform 0.22s, box-shadow 0.22s',
                                    height: '100%', display: 'flex', flexDirection: 'column',
                                    '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 10px 32px rgba(14,124,107,0.18)' },
                                }}>
                                    <CardActionArea onClick={() => navigate(`/hostels/${h.id}`)} sx={{ flexGrow: 1 }}>
                                        {/* Visual */}
                                        {h.photos && h.photos[0] ? (
                                            <Box sx={{ height: 160, overflow: 'hidden', position: 'relative' }}>
                                                <img src={h.photos[0]} alt={h.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                {minP && (
                                                    <Box sx={{
                                                        position: 'absolute', bottom: 10, right: 12,
                                                        bgcolor: BRAND.teal, color: '#fff',
                                                        px: 1.5, py: 0.4, borderRadius: 5,
                                                        fontSize: 11, fontWeight: 800,
                                                    }}>
                                                        From UGX {minP.toLocaleString()}
                                                    </Box>
                                                )}
                                            </Box>
                                        ) : (
                                            <Box sx={{
                                                height: 160, position: 'relative',
                                                background: CARD_GRADIENTS[idx % CARD_GRADIENTS.length],
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                <ApartmentIcon sx={{ fontSize: 68, color: BRAND.teal, opacity: 0.45 }} />
                                                {minP && (
                                                    <Box sx={{
                                                        position: 'absolute', bottom: 10, right: 12,
                                                        bgcolor: BRAND.teal, color: '#fff',
                                                        px: 1.5, py: 0.4, borderRadius: 5,
                                                        fontSize: 11, fontWeight: 800,
                                                    }}>
                                                        From UGX {minP.toLocaleString()}
                                                    </Box>
                                                )}
                                            </Box>
                                        )}

                                        <CardContent sx={{ pt: 2, pb: 1 }}>
                                            <Typography variant="h6" fontWeight={700} noWrap color={BRAND.teal}>{h.name}</Typography>
                                            <Stack direction="row" alignItems="center" spacing={0.5} mt={0.5}>
                                                <LocationOnIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
                                                <Typography variant="body2" color="text.secondary" noWrap sx={{ fontSize: 12 }}>{h.address}</Typography>
                                            </Stack>

                                            <Stack direction="row" alignItems="center" justifyContent="space-between" mt={1.2}>
                                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                                    <Rating value={Number(h.avg_rating) || 0} precision={0.5} readOnly size="small" />
                                                    <Typography variant="caption" color="text.disabled">({Number(h.avg_rating || 0).toFixed(1)})</Typography>
                                                </Stack>
                                                {h.room_count > 0 && (
                                                    <Stack direction="row" alignItems="center" spacing={0.4}>
                                                        <MeetingRoomIcon sx={{ fontSize: 14, color: BRAND.teal }} />
                                                        <Typography variant="caption" color={BRAND.teal} fontWeight={600}>
                                                            {h.room_count} room{h.room_count !== 1 ? 's' : ''}
                                                        </Typography>
                                                    </Stack>
                                                )}
                                            </Stack>

                                            {amenities.length > 0 && (
                                                <Stack direction="row" spacing={0.5} mt={1.2} flexWrap="wrap" useFlexGap>
                                                    {amenities.slice(0, 3).map(a => (
                                                        <Chip key={a} label={typeof a === 'string' ? a.trim() : a} size="small"
                                                            sx={{ fontSize: 10, bgcolor: BRAND.orangeLight, color: BRAND.teal, fontWeight: 600 }} />
                                                    ))}
                                                    {amenities.length > 3 && (
                                                        <Chip label={`+${amenities.length - 3}`} size="small"
                                                            sx={{ fontSize: 10, bgcolor: 'rgba(0,0,0,0.05)', color: 'text.secondary', fontWeight: 600 }} />
                                                    )}
                                                </Stack>
                                            )}
                                        </CardContent>
                                    </CardActionArea>

                                    <Divider sx={{ borderColor: 'rgba(0,0,0,0.05)' }} />
                                    <Box sx={{ px: 2, py: 1.2, display: 'flex', justifyContent: 'flex-end' }}>
                                        <Button size="small" variant="contained" onClick={() => navigate(`/hostels/${h.id}`)}
                                            sx={{ bgcolor: BRAND.teal, '&:hover': { bgcolor: BRAND.tealDark }, fontWeight: 700, fontSize: 12, borderRadius: 2 }}>
                                            View Details
                                        </Button>
                                        <Button size="small" onClick={() => navigate(`/hostels/${h.id}`)} sx={{ ml: 1, color: BRAND.teal, fontWeight: 700, fontSize: 12 }}>
                                            Save
                                        </Button>
                                        <button onclick={getlocation}>
                                            Find nearby hostels   
                                        </button>
                                    </Box>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}
        </Box>
    );
}
