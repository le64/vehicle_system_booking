import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert
} from '@mui/material'
import {
  CheckCircle,
  Close,
  DirectionsCar,
  Event,
  Info,
  Schedule,
  TrendingUp,
  Warning,
  Delete
} from '@mui/icons-material'
import { useSnackbar } from 'notistack'
import apiClient from '../config/api'
import Layout from '../components/Layout'
import { format, parse } from 'date-fns'
import fr from 'date-fns/locale/fr'

interface Reservation {
  id: number
  vehicle: {
    id: number
    brand: string
    model: string
    registrationNumber: string
    type: string
  }
  reservationDate: string
  startTime: string
  endTime: string
  purpose: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  createdAt: string
  rejectionReason?: string
}

interface Stats {
  totalReservations: number
  pendingCount: number
  approvedCount: number
  completedCount: number
}

const EmployeeDashboard: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [stats, setStats] = useState<Stats>({
    totalReservations: 0,
    pendingCount: 0,
    approvedCount: 0,
    completedCount: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    fetchReservations()
  }, [])

  const fetchReservations = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Essayer les endpoints possibles
      let data = []
      try {
        const response = await apiClient.get('/reservations/my-reservations')
        data = response.data.data || response.data
      } catch (error: any) {
        if (error.response?.status === 404) {
          try {
            const response = await apiClient.get('/my-reservations')
            data = response.data.data || response.data
          } catch {
            // Si aucun endpoint ne fonctionne, tenter /reservations
            const response = await apiClient.get('/reservations')
            data = response.data.data || response.data
          }
        } else {
          throw error
        }
      }

      setReservations(data)

      // Calculate stats
      const stats: Stats = {
        totalReservations: data.length,
        pendingCount: data.filter((r: Reservation) => r.status === 'pending').length,
        approvedCount: data.filter((r: Reservation) => r.status === 'approved').length,
        completedCount: data.filter((r: Reservation) => r.status === 'completed').length
      }
      setStats(stats)
    } catch (error: any) {
      console.error('Erreur:', error)
      const errorMessage = error.response?.data?.message || 'Erreur lors du chargement des réservations'
      setError(errorMessage)
      enqueueSnackbar(errorMessage, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = parse(dateString, 'yyyy-MM-dd', new Date())
      return format(date, 'dd MMMM yyyy', { locale: fr })
    } catch {
      return dateString
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning'
      case 'approved': return 'success'
      case 'rejected': return 'error'
      case 'completed': return 'info'
      default: return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente'
      case 'approved': return 'Approuvée'
      case 'rejected': return 'Rejetée'
      case 'completed': return 'Complétée'
      default: return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Warning sx={{ color: 'warning.main' }} />
      case 'approved': return <CheckCircle sx={{ color: 'success.main' }} />
      case 'rejected': return <Close sx={{ color: 'error.main' }} />
      case 'completed': return <CheckCircle sx={{ color: 'info.main' }} />
      default: return null
    }
  }

  const handleDeleteReservation = async (reservation: Reservation) => {
    setDeleteLoading(true)
    try {
      await apiClient.delete(`/reservations/${reservation.id}`)
      enqueueSnackbar('Réservation annulée avec succès', { variant: 'success' })
      setDeleteConfirmOpen(false)
      setOpenDialog(false)
      setSelectedReservation(null)
      fetchReservations()
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || 'Erreur lors de l\'annulation',
        { variant: 'error' }
      )
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center' }}>
          <Schedule sx={{ mr: 1, color: 'primary.main' }} />
          Mon Tableau de Bord
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Suivez vos réservations de véhicules
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: 1, borderRadius: 3, borderLeft: '4px solid primary.main' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Total
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {stats.totalReservations}
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 32, color: 'primary.main', opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: 1, borderRadius: 3, borderLeft: '4px solid warning.main' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    En attente
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {stats.pendingCount}
                  </Typography>
                </Box>
                <Warning sx={{ fontSize: 32, color: 'warning.main', opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: 1, borderRadius: 3, borderLeft: '4px solid success.main' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Approuvées
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {stats.approvedCount}
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 32, color: 'success.main', opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: 1, borderRadius: 3, borderLeft: '4px solid info.main' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Complétées
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {stats.completedCount}
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 32, color: 'info.main', opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Reservations Table */}
      <Paper sx={{ borderRadius: 3, boxShadow: 1, overflow: 'hidden' }}>
        <Typography variant="h6" sx={{ p: 2, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
          <DirectionsCar sx={{ mr: 1, color: 'primary.main' }} />
          Mes Réservations
        </Typography>
        <Divider />

        {reservations.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Véhicule</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Horaires</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Motif</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reservations.map((reservation) => (
                  <TableRow key={reservation.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {reservation.vehicle.brand} {reservation.vehicle.model}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {reservation.vehicle.registrationNumber}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1">
                        {formatDate(reservation.reservationDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1">
                        {reservation.startTime} - {reservation.endTime}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1">{reservation.purpose || '-'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(reservation.status) as any}
                        label={getStatusText(reservation.status)}
                        color={getStatusColor(reservation.status) as any}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        startIcon={<Info />}
                        onClick={() => {
                          setSelectedReservation(reservation)
                          setOpenDialog(true)
                        }}
                      >
                        Détails
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <DirectionsCar sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Aucune réservation pour le moment
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Details Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          Détails de la réservation
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedReservation && (
            <>
              <List disablePadding>
                <ListItem disableGutters sx={{ mb: 1 }}>
                  <ListItemIcon>
                    <DirectionsCar sx={{ color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Véhicule"
                    secondary={`${selectedReservation.vehicle.brand} ${selectedReservation.vehicle.model} (${selectedReservation.vehicle.registrationNumber})`}
                  />
                </ListItem>

                <Divider sx={{ my: 1 }} />

                <ListItem disableGutters sx={{ mb: 1 }}>
                  <ListItemIcon>
                    <Event sx={{ color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Date et Horaires"
                    secondary={`${formatDate(selectedReservation.reservationDate)} de ${selectedReservation.startTime} à ${selectedReservation.endTime}`}
                  />
                </ListItem>

                <Divider sx={{ my: 1 }} />

                <ListItem disableGutters sx={{ mb: 1 }}>
                  <ListItemText
                    primary="Motif"
                    secondary={selectedReservation.purpose || '-'}
                  />
                </ListItem>

                <Divider sx={{ my: 1 }} />

                <ListItem disableGutters sx={{ mb: 1 }}>
                  <ListItemText
                    primary="Statut"
                    secondary={
                      <Chip
                        icon={getStatusIcon(selectedReservation.status) as any}
                        label={getStatusText(selectedReservation.status)}
                        color={getStatusColor(selectedReservation.status) as any}
                        size="small"
                        variant="outlined"
                      />
                    }
                  />
                </ListItem>

                {selectedReservation.status === 'rejected' && selectedReservation.rejectionReason && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <Alert severity="error" sx={{ mt: 1 }}>
                      Raison du rejet : {selectedReservation.rejectionReason}
                    </Alert>
                  </>
                )}
              </List>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ py: 1, px: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Fermer</Button>

          {selectedReservation?.status === 'pending' && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={() => setDeleteConfirmOpen(true)}
            >
              Annuler
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: 'error.main', fontWeight: 600 }}>
          Confirmer l'annulation
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography>
            Êtes-vous sûr de vouloir annuler cette réservation ? Cette action ne peut pas être annulée.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ py: 1, px: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Non, garder</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleDeleteReservation(selectedReservation!)}
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
            Oui, annuler
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  )
}

export default EmployeeDashboard