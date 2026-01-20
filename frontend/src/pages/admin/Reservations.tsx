import React, { useState, useEffect } from 'react'
import {
  Grid,
  Typography,
  Box,
  Button,
  Chip,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Alert,
  TextareaAutosize,
  CircularProgress
} from '@mui/material'
import {
  CheckCircle,
  Block,
  Info
} from '@mui/icons-material'
import { useSnackbar } from 'notistack'
import apiClient from '../../config/api'
import Layout from '../../components/Layout'

interface Reservation {
  id: number
  userId: number
  vehicleId: number
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  purpose: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED'
  adminNotes?: string
  approvedAt?: string
  createdAt: string
  vehicle: {
    brand: string
    model: string
    registrationNumber: string
    type: string
  }
  user: {
    firstName: string
    lastName: string
    email: string
  }
}

const AdminReservations: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('PENDING')
  const [page, setPage] = useState(1)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [openDetailDialog, setOpenDetailDialog] = useState(false)
  const [openActionDialog, setOpenActionDialog] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve')
  const [adminNotes, setAdminNotes] = useState('')
  const itemsPerPage = 10
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    fetchReservations()
  }, [])

  useEffect(() => {
    filterReservations()
  }, [reservations, statusFilter])

  const fetchReservations = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/admin/reservations')
      setReservations(response.data.data)
    } catch (error) {
      console.error('Erreur lors du chargement des réservations:', error)
      enqueueSnackbar('Erreur lors du chargement des réservations', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const filterReservations = () => {
    let filtered = reservations
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter)
    }

    setFilteredReservations(filtered)
  }

  const handleApprove = async () => {
    if (!selectedReservation) return

    try {
      await apiClient.put(`/admin/reservations/${selectedReservation.id}/approve`, {
        adminNotes
      })

      enqueueSnackbar('Réservation approuvée avec succès', { variant: 'success' })
      setOpenActionDialog(false)
      setAdminNotes('')
      setOpenDetailDialog(false)
      fetchReservations()
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || 'Erreur lors de l\'approbation',
        { variant: 'error' }
      )
    }
  }

  const handleReject = async () => {
    if (!selectedReservation) return

    try {
      await apiClient.put(`/admin/reservations/${selectedReservation.id}/reject`, {
        adminNotes
      })

      enqueueSnackbar('Réservation rejetée', { variant: 'success' })
      setOpenActionDialog(false)
      setAdminNotes('')
      setOpenDetailDialog(false)
      fetchReservations()
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || 'Erreur lors du rejet',
        { variant: 'error' }
      )
    }
  }

  const getStatusChip = (status: string) => {
    const statusConfig: { [key: string]: { color: any; label: string } } = {
      'PENDING': { color: 'warning', label: 'En attente' },
      'APPROVED': { color: 'success', label: 'Approuvée' },
      'REJECTED': { color: 'error', label: 'Rejetée' },
      'CANCELLED': { color: 'default', label: 'Annulée' },
      'COMPLETED': { color: 'info', label: 'Complétée' }
    }

    const config = statusConfig[status] || { color: 'default', label: status }
    return <Chip label={config.label} color={config.color} size="small" />
  }

  const formatDateTime = (dateString: string, timeString?: string) => {
    const date = new Date(dateString)
    const dateStr = date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
    return timeString ? `${dateStr} ${timeString}` : dateStr
  }

  const paginatedReservations = filteredReservations.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  )
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage)

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress color="primary" />
        </Box>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* En-tête */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Gestion des Réservations
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Validez ou rejetez les réservations des employés
        </Typography>
      </Box>

      {/* Filtres */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <Select
              fullWidth
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              variant="outlined"
              size="small"
            >
              <MenuItem value="all">Tous les statuts</MenuItem>
              <MenuItem value="PENDING">⏳ En attente</MenuItem>
              <MenuItem value="APPROVED">✓ Approuvées</MenuItem>
              <MenuItem value="REJECTED">✗ Rejetées</MenuItem>
              <MenuItem value="CANCELLED">⊘ Annulées</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={12} sm={8}>
            <Typography variant="body2" color="text.secondary">
              {filteredReservations.length} réservation(s) avec le filtre sélectionné
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Tableau des réservations */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Employé</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Véhicule</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Dates</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Motif</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Statut</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedReservations.length > 0 ? (
              paginatedReservations.map((reservation) => (
                <TableRow key={reservation.id} hover sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {reservation.user.firstName} {reservation.user.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {reservation.user.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {reservation.vehicle.brand} {reservation.vehicle.model}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {reservation.vehicle.registrationNumber}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDateTime(reservation.startDate, reservation.startTime)} à{' '}
                      {formatDateTime(reservation.endDate, reservation.endTime)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{reservation.purpose}</Typography>
                  </TableCell>
                  <TableCell>{getStatusChip(reservation.status)}</TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Info />}
                      onClick={() => {
                        setSelectedReservation(reservation)
                        setOpenDetailDialog(true)
                      }}
                    >
                      Détails
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">
                    Aucune réservation trouvée
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
            size="large"
          />
        </Box>
      )}

      {/* Dialog des détails */}
      <Dialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          Détails de la Réservation #{selectedReservation?.id}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedReservation && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Alert severity={selectedReservation.status === 'PENDING' ? 'warning' : 'info'}>
                Statut: {getStatusChip(selectedReservation.status)}
              </Alert>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Employé
                </Typography>
                <Typography variant="body2">
                  {selectedReservation.user.firstName} {selectedReservation.user.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedReservation.user.email}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Véhicule
                </Typography>
                <Typography variant="body2">
                  {selectedReservation.vehicle.brand} {selectedReservation.vehicle.model}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedReservation.vehicle.registrationNumber}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Période
                </Typography>
                <Typography variant="body2">
                  De: {formatDateTime(selectedReservation.startDate, selectedReservation.startTime)}
                </Typography>
                <Typography variant="body2">
                  À: {formatDateTime(selectedReservation.endDate, selectedReservation.endTime)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Motif
                </Typography>
                <Typography variant="body2">
                  {selectedReservation.purpose}
                </Typography>
              </Box>

              {selectedReservation.adminNotes && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Notes Admin
                  </Typography>
                  <Typography variant="body2">
                    {selectedReservation.adminNotes}
                  </Typography>
                </Box>
              )}

              <Typography variant="caption" color="text.secondary">
                Créée le: {formatDateTime(selectedReservation.createdAt)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Button onClick={() => setOpenDetailDialog(false)} variant="outlined">
            Fermer
          </Button>
          {selectedReservation?.status === 'PENDING' && (
            <>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Block />}
                onClick={() => {
                  setActionType('reject')
                  setOpenActionDialog(true)
                }}
              >
                Rejeter
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircle />}
                onClick={() => {
                  setActionType('approve')
                  setOpenActionDialog(true)
                }}
              >
                Approuver
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Dialog d'action (approuver/rejeter) */}
      <Dialog open={openActionDialog} onClose={() => setOpenActionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: actionType === 'approve' ? 'success.main' : 'error.main', color: 'white' }}>
          {actionType === 'approve' ? 'Approuver la Réservation' : 'Rejeter la Réservation'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Alert severity={actionType === 'approve' ? 'success' : 'error'}>
              {actionType === 'approve'
                ? 'La réservation sera approuvée et l\'employé en sera notifié'
                : 'La réservation sera rejetée et l\'employé en sera notifié'}
            </Alert>

            <TextareaAutosize
              placeholder="Ajouter des notes (optionnel)..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              minRows={3}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontFamily: 'inherit',
                fontSize: '14px'
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Button onClick={() => setOpenActionDialog(false)} variant="outlined">
            Annuler
          </Button>
          <Button
            variant="contained"
            color={actionType === 'approve' ? 'success' : 'error'}
            onClick={actionType === 'approve' ? handleApprove : handleReject}
          >
            {actionType === 'approve' ? 'Approuver' : 'Rejeter'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  )
}

export default AdminReservations