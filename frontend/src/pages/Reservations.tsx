import React, { useState, useEffect } from 'react'
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from '@mui/material'
import apiClient from '../config/api'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import Layout from '../components/Layout'

interface Reservation {
  id: number
  userId: number
  vehicleId: number
  reservationDate: string
  startTime: string
  endTime: string
  purpose?: string
  status: string
  adminNotes?: string
  createdAt: string
  approvedAt?: string
  registrationNumber: string
  brand: string
  model: string
  type: string
  firstName: string
  lastName: string
  email: string
  // Nested structure for compatibility
  vehicle?: {
    brand: string
    model: string
    registrationNumber: string
  }
}

const statusColors: {
  [key: string]: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
} = {
  'PENDING': 'warning',
  'APPROVED': 'success',
  'REJECTED': 'error',
  'CANCELLED': 'default',
  'COMPLETED': 'info',
  'active': 'success',
  'cancelled': 'error'
}

const statusLabels: { [key: string]: string } = {
  'PENDING': 'En attente',
  'APPROVED': 'Approuvée',
  'REJECTED': 'Refusée',
  'CANCELLED': 'Annulée',
  'COMPLETED': 'Complétée',
  'active': 'Active',
  'cancelled': 'Annulée'
}

const Reservations: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [openDetails, setOpenDetails] = useState(false)

  useEffect(() => {
    fetchReservations()
  }, [statusFilter])

  const fetchReservations = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) {
        params.append('status', statusFilter)
      }
      
      const response = await apiClient.get(`/reservations/my-reservations?${params.toString()}`)
      setReservations(response.data.data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des réservations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setOpenDetails(true)
  }

  const handleCancel = async (reservationId: number) => {
    try {
      await apiClient.post(`/reservations/${reservationId}/cancel`)
      fetchReservations()
      setOpenDetails(false)
    } catch (error: any) {
      console.error('Erreur lors de l\'annulation:', error)
      alert(error.response?.data?.message || 'Erreur lors de l\'annulation')
    }
  }

  const getStatusColor = (status: string) => statusColors[status] || 'default'
  const getStatusLabel = (status: string) => statusLabels[status] || status

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
          Mes Réservations
        </Typography>

        <Paper sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: 3 }}>
          <TextField
            select
            label="Statut"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">Tous</MenuItem>
            <MenuItem value="PENDING">En attente</MenuItem>
            <MenuItem value="APPROVED">Approuvée</MenuItem>
            <MenuItem value="REJECTED">Refusée</MenuItem>
            <MenuItem value="CANCELLED">Annulée</MenuItem>
            <MenuItem value="COMPLETED">Complétée</MenuItem>
            <MenuItem value="active">Active (Ancien)</MenuItem>
            <MenuItem value="cancelled">Annulée (Ancien)</MenuItem>
          </TextField>
        </Paper>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : reservations.length === 0 ? (
          <Typography color="text.secondary" align="center">
            Aucune réservation
          </Typography>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'primary.main' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white' }}>Véhicule</TableCell>
                  <TableCell sx={{ color: 'white' }}>Date</TableCell>
                  <TableCell sx={{ color: 'white' }}>Horaires</TableCell>
                  <TableCell sx={{ color: 'white' }}>Statut</TableCell>
                  <TableCell sx={{ color: 'white' }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reservations.map((reservation) => (
                  <TableRow key={reservation.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DirectionsCarIcon fontSize="small" />
                        {reservation.brand} {reservation.model}
                      </Box>
                    </TableCell>
                    <TableCell>{reservation.reservationDate}</TableCell>
                    <TableCell>{reservation.startTime} - {reservation.endTime}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(reservation.status)}
                        color={getStatusColor(reservation.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        onClick={() => handleViewDetails(reservation)}
                      >
                        Détails
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="xs" fullWidth>
          {selectedReservation && (
            <>
              <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', py: 1.5 }}>
                Détails
              </DialogTitle>
              <DialogContent sx={{ pt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Véhicule</Typography>
                    <Typography>{selectedReservation.brand} {selectedReservation.model}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedReservation.registrationNumber} - {selectedReservation.type}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Réservation</Typography>
                    <Typography>Date: {selectedReservation.reservationDate}</Typography>
                    <Typography>Début: {selectedReservation.startTime}</Typography>
                    <Typography>Fin: {selectedReservation.endTime}</Typography>
                    {selectedReservation.purpose && <Typography>Motif: {selectedReservation.purpose}</Typography>}
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Statut</Typography>
                    <Chip label={getStatusLabel(selectedReservation.status)} color={getStatusColor(selectedReservation.status)} />
                    {selectedReservation.status === 'REJECTED' && selectedReservation.adminNotes && (
                      <Typography color="error">Raison: {selectedReservation.adminNotes}</Typography>
                    )}
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Créée le: {new Date(selectedReservation.createdAt).toLocaleDateString('fr-FR')}
                    </Typography>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions sx={{ py: 1 }}>
                {(selectedReservation.status === 'PENDING' || selectedReservation.status === 'APPROVED' || selectedReservation.status === 'active') && (
                  <Button color="error" size="small" onClick={() => handleCancel(selectedReservation.id)}>
                    Annuler
                  </Button>
                )}
                <Button size="small" onClick={() => setOpenDetails(false)}>
                  Fermer
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </Layout>
  )
}

export default Reservations