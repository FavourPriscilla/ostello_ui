/**
 * pages/ManageHostels.jsx — Custodian: CRUD hostels + rooms
 */
import { useEffect, useState, useCallback } from 'react';
import {
    Box, Typography, Stack, Chip, CircularProgress, Alert,
    Card, CardContent, Button, Grid, IconButton, Tooltip,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Divider,
} from '@mui/material';
import ApartmentIcon from '@mui/icons-material/Apartment';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import {
    getMyHostels, createHostel, updateHostel, deleteHostel,
    getRoomsByHostel, createRoom, updateRoom, deleteRoom,
} from '../utils/api';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';

const BRAND = { teal: '#0E7C6B', tealDark: '#065C50', orange: '#F2994A', orangeLight: '#FDE8D0' };

const emptyHostel = { name: '', address: '', description: '', amenities: '', latitude: '', longitude: '' };
const emptyRoom = { room_number: '', room_type: 'SINGLE', price_per_semester: '', description: '' };

export default function ManageHostels({ token }) {
    const { toast, showToast, hideToast } = useToast();

    const [hostels, setHostels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Hostel form
    const [hostelOpen, setHostelOpen] = useState(false);
    const [editHostel, setEditHostel] = useState(null);
    const [hostelForm, setHostelForm] = useState(emptyHostel);
    const [hostelSaving, setHostelSaving] = useState(false);

    // Rooms per hostel
    const [roomsMap, setRoomsMap] = useState({});
    const [expandedHostel, setExpandedHostel] = useState(null);
    const [roomOpen, setRoomOpen] = useState(false);
    const [editRoom, setEditRoom] = useState(null);
    const [roomHostelId, setRoomHostelId] = useState(null);
    const [roomForm, setRoomForm] = useState(emptyRoom);
    const [roomSaving, setRoomSaving] = useState(false);

    const fetchHostels = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            setHostels(await getMyHostels(token));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { fetchHostels(); }, [fetchHostels]);

    const loadRooms = async (hostelId) => {
        try {
            const rooms = await getRoomsByHostel(hostelId);
            setRoomsMap(prev => ({ ...prev, [hostelId]: rooms }));
        } catch {
            /* ignore */
        }
    };

    const toggleRooms = (hostelId) => {
        if (expandedHostel === hostelId) {
            setExpandedHostel(null);
        } else {
            setExpandedHostel(hostelId);
            if (!roomsMap[hostelId]) loadRooms(hostelId);
        }
    };

    // Hostel CRUD
    const openHostelForm = (h = null) => {
        setEditHostel(h);
        setHostelForm(h ? { name: h.name, address: h.address, description: h.description || '', amenities: h.amenities || '', latitude: h.latitude || '', longitude: h.longitude || '' } : emptyHostel);
        setHostelOpen(true);
    };

    const handleHostelSave = async () => {
        if (!hostelForm.name.trim() || !hostelForm.address.trim()) return;
        setHostelSaving(true);
        try {
            if (editHostel) {
                await updateHostel(editHostel.id, hostelForm, token);
                showToast('Hostel updated.', 'success', 'Updated');
            } else {
                await createHostel(hostelForm, token);
                showToast('Hostel created!', 'success', 'Created');
            }
            setHostelOpen(false);
            fetchHostels();
        } catch (err) {
            showToast(err.message, 'error', 'Error');
        } finally {
            setHostelSaving(false);
        }
    };

    const handleHostelDelete = async (id) => {
        try {
            await deleteHostel(id, token);
            showToast('Hostel deleted.', 'warning', 'Deleted');
            fetchHostels();
        } catch (err) {
            showToast(err.message, 'error', 'Error');
        }
    };

    // Room CRUD
    const openRoomForm = (hostelId, r = null) => {
        setRoomHostelId(hostelId);
        setEditRoom(r);
        setRoomForm(r ? { room_number: r.room_number, room_type: r.room_type, price_per_semester: r.price_per_semester, description: r.description || '' } : emptyRoom);
        setRoomOpen(true);
    };

    const handleRoomSave = async () => {
        if (!roomForm.room_number.trim() || !roomForm.price_per_semester) return;
        setRoomSaving(true);
        try {
            if (editRoom) {
                await updateRoom(editRoom.id, roomForm, token);
                showToast('Room updated.', 'success', 'Updated');
            } else {
                await createRoom(roomHostelId, roomForm, token);
                showToast('Room added!', 'success', 'Created');
            }
            setRoomOpen(false);
            loadRooms(roomHostelId);
        } catch (err) {
            showToast(err.message, 'error', 'Error');
        } finally {
            setRoomSaving(false);
        }
    };

    const handleRoomDelete = async (roomId, hostelId) => {
        try {
            await deleteRoom(roomId, token);
            showToast('Room removed.', 'warning', 'Deleted');
            loadRooms(hostelId);
        } catch (err) {
            showToast(err.message, 'error', 'Error');
        }
    };

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{ width: 4, height: 26, bgcolor: BRAND.orange, borderRadius: 1 }} />
                    <Typography variant="h5" fontWeight={800} color={BRAND.teal}>My Hostels</Typography>
                    {!loading && <Chip label={hostels.length} size="small" sx={{ bgcolor: BRAND.orangeLight, color: BRAND.teal, fontWeight: 700 }} />}
                </Stack>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => openHostelForm()}
                    sx={{ bgcolor: BRAND.teal, '&:hover': { bgcolor: BRAND.tealDark }, fontWeight: 700 }}>
                    Add Hostel
                </Button>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: BRAND.teal }} /></Box>}

            {!loading && hostels.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 10, color: 'text.secondary' }}>
                    <ApartmentIcon sx={{ fontSize: 72, color: BRAND.orangeLight }} />
                    <Typography mt={2} fontWeight={600}>You haven&apos;t listed any hostels yet.</Typography>
                </Box>
            )}

            {!loading && (
                <Stack spacing={2}>
                    {hostels.map(h => (
                        <Card key={h.id} sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)' }}>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                    <Box>
                                        <Typography variant="h6" fontWeight={700} color={BRAND.teal}>{h.name}</Typography>
                                        <Typography variant="body2" color="text.secondary">{h.address}</Typography>
                                        {h.amenities && (
                                            <Stack direction="row" spacing={0.5} mt={0.5} flexWrap="wrap" useFlexGap>
                                                {(Array.isArray(h.amenities) ? h.amenities : h.amenities.split(',')).map(a => (
                                                    <Chip key={a} label={typeof a === 'string' ? a.trim() : a} size="small" sx={{ fontSize: 10, bgcolor: BRAND.orangeLight, color: BRAND.teal, fontWeight: 600 }} />
                                                ))}
                                            </Stack>
                                        )}
                                    </Box>
                                    <Stack direction="row" spacing={0.5}>
                                        <Tooltip title="Edit"><IconButton size="small" onClick={() => openHostelForm(h)} sx={{ color: BRAND.teal }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleHostelDelete(h.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                    </Stack>
                                </Stack>

                                <Divider sx={{ my: 1.5 }} />

                                <Button size="small" startIcon={<MeetingRoomIcon />} onClick={() => toggleRooms(h.id)} sx={{ color: BRAND.teal, fontWeight: 700 }}>
                                    {expandedHostel === h.id ? 'Hide Rooms' : 'Manage Rooms'}
                                </Button>

                                {expandedHostel === h.id && (
                                    <Box sx={{ mt: 2 }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                            <Typography variant="subtitle2" fontWeight={700}>Rooms</Typography>
                                            <Button size="small" startIcon={<AddIcon />} onClick={() => openRoomForm(h.id)} sx={{ color: BRAND.teal, fontWeight: 700 }}>Add Room</Button>
                                        </Stack>
                                        {(roomsMap[h.id] ?? []).length === 0 ? (
                                            <Typography variant="body2" color="text.secondary">No rooms yet.</Typography>
                                        ) : (
                                            <Grid container spacing={1}>
                                                {(roomsMap[h.id] ?? []).map(r => (
                                                    <Grid item xs={12} sm={6} key={r.id}>
                                                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                                            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                                                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                                    <Box>
                                                                        <Typography variant="body2" fontWeight={700}>Room {r.room_number}</Typography>
                                                                        <Stack direction="row" spacing={0.5} mt={0.3}>
                                                                            <Chip label={r.room_type} size="small" sx={{ fontSize: 10, bgcolor: '#E3F2FD', color: '#0288D1', fontWeight: 600 }} />
                                                                            <Chip label={`UGX ${Number(r.price_per_semester).toLocaleString()}`} size="small" sx={{ fontSize: 10, bgcolor: BRAND.orangeLight, color: BRAND.orange, fontWeight: 600 }} />
                                                                            <Chip label={r.is_available ? 'Available' : 'Occupied'} size="small"
                                                                                sx={{ fontSize: 10, bgcolor: r.is_available ? '#E8F5E9' : '#FFEBEE', color: r.is_available ? '#2E7D32' : '#D32F2F', fontWeight: 600 }} />
                                                                        </Stack>
                                                                    </Box>
                                                                    <Stack direction="row">
                                                                        <IconButton size="small" onClick={() => openRoomForm(h.id, r)} sx={{ color: BRAND.teal }}><EditIcon sx={{ fontSize: 16 }} /></IconButton>
                                                                        <IconButton size="small" color="error" onClick={() => handleRoomDelete(r.id, h.id)}><DeleteIcon sx={{ fontSize: 16 }} /></IconButton>
                                                                    </Stack>
                                                                </Stack>
                                                            </CardContent>
                                                        </Card>
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        )}
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            )}

            {/* Hostel Dialog */}
            <Dialog open={hostelOpen} onClose={() => setHostelOpen(false)} slotProps={{ paper: { sx: { borderRadius: 3, minWidth: 420 } } }}>
                <DialogTitle sx={{ fontWeight: 800, color: BRAND.teal }}>{editHostel ? 'Edit Hostel' : 'Add Hostel'}</DialogTitle>
                <DialogContent>
                    <TextField label="Hostel Name" fullWidth margin="normal" value={hostelForm.name} onChange={e => setHostelForm(f => ({ ...f, name: e.target.value }))} required />
                    <TextField label="Address" fullWidth margin="normal" value={hostelForm.address} onChange={e => setHostelForm(f => ({ ...f, address: e.target.value }))} required />
                    <TextField label="Description" fullWidth margin="normal" multiline rows={2} value={hostelForm.description} onChange={e => setHostelForm(f => ({ ...f, description: e.target.value }))} />
                    <TextField label="Amenities (comma-separated)" fullWidth margin="normal" value={hostelForm.amenities} onChange={e => setHostelForm(f => ({ ...f, amenities: e.target.value }))} placeholder="WiFi, Water, Security" />
                    <Stack direction="row" spacing={2}>
                        <TextField label="Latitude" fullWidth margin="normal" type="number" value={hostelForm.latitude} onChange={e => setHostelForm(f => ({ ...f, latitude: e.target.value }))} />
                        <TextField label="Longitude" fullWidth margin="normal" type="number" value={hostelForm.longitude} onChange={e => setHostelForm(f => ({ ...f, longitude: e.target.value }))} />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setHostelOpen(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
                    <Button variant="contained" onClick={handleHostelSave} disabled={hostelSaving}
                        sx={{ bgcolor: BRAND.teal, '&:hover': { bgcolor: BRAND.tealDark }, fontWeight: 700 }}>
                        {hostelSaving ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Room Dialog */}
            <Dialog open={roomOpen} onClose={() => setRoomOpen(false)} slotProps={{ paper: { sx: { borderRadius: 3, minWidth: 380 } } }}>
                <DialogTitle sx={{ fontWeight: 800, color: BRAND.teal }}>{editRoom ? 'Edit Room' : 'Add Room'}</DialogTitle>
                <DialogContent>
                    <TextField label="Room Number" fullWidth margin="normal" value={roomForm.room_number} onChange={e => setRoomForm(f => ({ ...f, room_number: e.target.value }))} required />
                    <TextField label="Type" select fullWidth margin="normal" value={roomForm.room_type} onChange={e => setRoomForm(f => ({ ...f, room_type: e.target.value }))}>
                        <MenuItem value="SINGLE">Single</MenuItem>
                        <MenuItem value="DOUBLE">Double</MenuItem>
                        <MenuItem value="DORMITORY">Dormitory</MenuItem>
                    </TextField>
                    <TextField label="Price per Semester (UGX)" fullWidth margin="normal" type="number" value={roomForm.price_per_semester} onChange={e => setRoomForm(f => ({ ...f, price_per_semester: e.target.value }))} required />
                    <TextField label="Description" fullWidth margin="normal" multiline rows={2} value={roomForm.description} onChange={e => setRoomForm(f => ({ ...f, description: e.target.value }))} />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setRoomOpen(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
                    <Button variant="contained" onClick={handleRoomSave} disabled={roomSaving}
                        sx={{ bgcolor: BRAND.teal, '&:hover': { bgcolor: BRAND.tealDark }, fontWeight: 700 }}>
                        {roomSaving ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Toast toast={toast} onClose={hideToast} />
        </Box>
    );
}
