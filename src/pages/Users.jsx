/**
 * pages/Users.jsx — Ostello Admin User Management
 */
import { useEffect, useState, useCallback } from 'react';
import { getUsers, updateUser, deleteUser } from '../utils/api';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';
import {
    Box, Typography, Grid, Card, CardContent, CardActions, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
    Avatar, Stack, Alert, CircularProgress, Chip, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Paper, Tooltip,
    ToggleButton, ToggleButtonGroup, Divider, MenuItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import TableRowsIcon from '@mui/icons-material/TableRows';

const BRAND = { teal: '#0E7C6B', tealDark: '#065C50', orange: '#F2994A', orangeLight: '#FDE8D0' };

const AVATAR_COLORS = [BRAND.teal, '#7B3F00', '#1A4A7B', '#1A5C2E', '#4A1A7B'];
const avatarBg = (name = '') => AVATAR_COLORS[(name.codePointAt(0) ?? 0) % AVATAR_COLORS.length];

const ROLE_COLORS = {
    ADMIN: { bg: '#FDE8D0', text: '#D07A2D' },
    CUSTODIAN: { bg: '#E3F2FD', text: '#0288D1' },
    STUDENT: { bg: '#E8F5E9', text: '#2E7D32' },
};

export default function Users({ token }) {
    const { toast, showToast, hideToast } = useToast();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [view, setView] = useState('grid');

    const [formOpen, setFormOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState({ full_name: '', email: '', role: 'STUDENT' });
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            setUsers(await getUsers(token));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const openForm = (u) => {
        setEditTarget(u);
        setForm({ full_name: u.full_name, email: u.email, role: u.role });
        setFormError('');
        setFormOpen(true);
    };

    const handleFormSubmit = async () => {
        if (!form.full_name.trim() || !form.email.trim()) {
            setFormError('Name and email are required.');
            return;
        }
        setSaving(true);
        setFormError('');
        try {
            await updateUser(editTarget.id, form, token);
            showToast(`${form.full_name} was updated.`, 'success', 'User Updated');
            setFormOpen(false);
            fetchUsers();
        } catch (err) {
            setFormError(err.message);
            showToast(err.message, 'error', 'Update Failed');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        const name = deleteTarget.full_name;
        try {
            await deleteUser(deleteTarget.id, token);
            setDeleteTarget(null);
            showToast(`${name} was removed.`, 'warning', 'User Removed');
            fetchUsers();
        } catch (err) {
            setError(err.message);
            showToast(err.message, 'error', 'Delete Failed');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{ width: 4, height: 26, bgcolor: BRAND.orange, borderRadius: 1 }} />
                    <Typography variant="h5" fontWeight={800} color={BRAND.teal}>Users</Typography>
                    {!loading && (
                        <Chip label={users.length} size="small" sx={{ bgcolor: BRAND.orangeLight, color: BRAND.teal, fontWeight: 700, fontSize: 12 }} />
                    )}
                </Stack>
                <ToggleButtonGroup value={view} exclusive onChange={(_, v) => v && setView(v)} size="small"
                    sx={{ '& .MuiToggleButton-root': { borderColor: 'rgba(14,124,107,0.25)' }, '& .MuiToggleButton-root.Mui-selected': { bgcolor: BRAND.orangeLight, color: BRAND.teal } }}>
                    <ToggleButton value="grid"><ViewModuleIcon /></ToggleButton>
                    <ToggleButton value="table"><TableRowsIcon /></ToggleButton>
                </ToggleButtonGroup>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress sx={{ color: BRAND.teal }} /></Box>}

            {!loading && !error && users.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 10, color: 'text.secondary' }}>
                    <PeopleIcon sx={{ fontSize: 72, color: BRAND.orangeLight }} />
                    <Typography mt={2} fontWeight={600}>No users registered yet.</Typography>
                </Box>
            )}

            {/* Grid View */}
            {!loading && view === 'grid' && (
                <Grid container spacing={3}>
                    {users.map(u => {
                        const rc = ROLE_COLORS[u.role] ?? ROLE_COLORS.STUDENT;
                        return (
                            <Grid item xs={12} sm={6} md={4} key={u.id}>
                                <Card sx={{ borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', border: '1px solid rgba(14,124,107,0.08)', transition: '0.2s', '&:hover': { boxShadow: '0 6px 22px rgba(14,124,107,0.14)', transform: 'translateY(-3px)' } }}>
                                    <Box sx={{ height: 4, bgcolor: BRAND.teal, borderRadius: '10px 10px 0 0' }} />
                                    <CardContent sx={{ pt: 2.5 }}>
                                        <Stack direction="row" alignItems="center" spacing={2}>
                                            <Avatar sx={{ bgcolor: avatarBg(u.full_name), width: 46, height: 46, fontWeight: 700, fontSize: 18, border: `2px solid ${BRAND.orangeLight}` }}>
                                                {u.full_name[0]?.toUpperCase()}
                                            </Avatar>
                                            <Box sx={{ overflow: 'hidden' }}>
                                                <Typography variant="subtitle1" fontWeight={700} color={BRAND.teal} noWrap>{u.full_name}</Typography>
                                                <Typography variant="body2" color="text.secondary" noWrap>{u.email}</Typography>
                                                <Stack direction="row" spacing={0.5} mt={0.5}>
                                                    <Chip label={u.role} size="small" sx={{ bgcolor: rc.bg, color: rc.text, fontWeight: 600, fontSize: 10 }} />
                                                    {u.is_verified ? (
                                                        <Chip label="Verified" size="small" sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 600, fontSize: 10 }} />
                                                    ) : (
                                                        <Chip label="Unverified" size="small" sx={{ bgcolor: '#FFF3E0', color: '#ED6C02', fontWeight: 600, fontSize: 10 }} />
                                                    )}
                                                </Stack>
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                    <Divider sx={{ borderColor: 'rgba(14,124,107,0.08)' }} />
                                    <CardActions sx={{ justifyContent: 'flex-end', px: 2, py: 1 }}>
                                        <Tooltip title="Edit"><IconButton size="small" onClick={() => openForm(u)} sx={{ color: BRAND.teal, '&:hover': { bgcolor: BRAND.orangeLight } }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteTarget(u)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                    </CardActions>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}

            {/* Table View */}
            {!loading && view === 'table' && (
                <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', border: '1px solid rgba(14,124,107,0.08)' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: BRAND.teal }}>
                                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>User</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Email</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Role</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Status</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map(u => {
                                const rc = ROLE_COLORS[u.role] ?? ROLE_COLORS.STUDENT;
                                return (
                                    <TableRow key={u.id} hover>
                                        <TableCell>
                                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                                <Avatar sx={{ width: 30, height: 30, fontSize: 13, bgcolor: avatarBg(u.full_name), border: `2px solid ${BRAND.orangeLight}`, fontWeight: 700 }}>
                                                    {u.full_name[0]?.toUpperCase()}
                                                </Avatar>
                                                <Typography variant="body2" fontWeight={600}>{u.full_name}</Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>{u.email}</TableCell>
                                        <TableCell><Chip label={u.role} size="small" sx={{ bgcolor: rc.bg, color: rc.text, fontWeight: 600, fontSize: 11 }} /></TableCell>
                                        <TableCell>
                                            {u.is_verified
                                                ? <Chip label="Verified" size="small" sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 600, fontSize: 11 }} />
                                                : <Chip label="Unverified" size="small" sx={{ bgcolor: '#FFF3E0', color: '#ED6C02', fontWeight: 600, fontSize: 11 }} />
                                            }
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Edit"><IconButton size="small" onClick={() => openForm(u)} sx={{ color: BRAND.teal }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                            <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteTarget(u)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Edit Dialog */}
            <Dialog open={formOpen} onClose={() => setFormOpen(false)} slotProps={{ paper: { sx: { borderRadius: 3, minWidth: 380 } } }}>
                <DialogTitle sx={{ fontWeight: 800, color: BRAND.teal, borderBottom: `3px solid ${BRAND.teal}`, pb: 1.5 }}>Edit User</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
                    <TextField label="Full Name" fullWidth margin="normal" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} required autoFocus />
                    <TextField label="Email" type="email" fullWidth margin="normal" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                    <TextField label="Role" select fullWidth margin="normal" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                        <MenuItem value="STUDENT">Student</MenuItem>
                        <MenuItem value="CUSTODIAN">Custodian</MenuItem>
                        <MenuItem value="ADMIN">Admin</MenuItem>
                    </TextField>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setFormOpen(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
                    <Button variant="contained" onClick={handleFormSubmit} disabled={saving}
                        sx={{ bgcolor: BRAND.teal, '&:hover': { bgcolor: BRAND.tealDark }, fontWeight: 700 }}>
                        {saving ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} slotProps={{ paper: { sx: { borderRadius: 3, minWidth: 360 } } }}>
                <DialogTitle sx={{ fontWeight: 800, color: 'error.main' }}>Delete User</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete <b>{deleteTarget?.full_name}</b>? This cannot be undone.</Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDeleteTarget(null)} sx={{ color: 'text.secondary' }}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleDeleteConfirm} disabled={deleting}>
                        {deleting ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Toast toast={toast} onClose={hideToast} />
        </Box>
    );
}
