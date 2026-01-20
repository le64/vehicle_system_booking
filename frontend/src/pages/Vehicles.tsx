import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Button,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Pagination,
  Paper,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  LinearProgress
} from '@mui/material'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { addDays } from 'date-fns'
import fr from 'date-fns/locale/fr'
import { useSnackbar } from 'notistack'
import apiClient from '../config/api'
import Layout from '../components/Layout'
import {
  DirectionsCar,
  CheckCircle,
  Warning,
  Search,
  Speed,
  People,
  CalendarToday,
  Build,
  LocalGasStation
} from '@mui/icons-material'

interface Vehicle {
  id: number
  registrationNumber: string
  brand: string
  model: string
  type: string
  status: 'available' | 'maintenance' | 'unavailable'
  image_url_1?: string
  image_url_2?: string
  image_url_3?: string
  year?: number
  fuelType?: string
  seatsCount?: number
  mileage?: number
}

const Vehicles: React.FC = () => {
  const navigate = useNavigate()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string>('')
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [reservationDate, setReservationDate] = useState<Date | null>(addDays(new Date(), 1))
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('18:00')
  const [purpose, setPurpose] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [page, setPage] = useState(1)
  const [reservationLoading, setReservationLoading] = useState(false)
  const itemsPerPage = 6
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    const role = localStorage.getItem('userRole') || sessionStorage.getItem('userRole')
    setUserRole(role || '')
    
    if (role === 'admin') {
      navigate('/reservations')
      return
    }
    
    fetchVehicles()
  }, [navigate])

  useEffect(() => {
    filterVehicles()
  }, [vehicles, filterStatus, filterType, searchTerm])

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/vehicles')
      setVehicles(response.data.data)
    } catch (error) {
      console.error('Erreur lors du chargement des véhicules:', error)
      enqueueSnackbar('Erreur lors du chargement des véhicules', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const filterVehicles = () => {
    let filtered = vehicles

    if (filterStatus !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.status === filterStatus)
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.type === filterType)
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(vehicle => 
        vehicle.brand.toLowerCase().includes(term) ||
        vehicle.model.toLowerCase().includes(term) ||
        vehicle.registrationNumber.toLowerCase().includes(term)
      )
    }

    setFilteredVehicles(filtered)
    setPage(1)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'success'
      case 'maintenance': return 'warning'
      case 'unavailable': return 'error'
      default: return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Disponible'
      case 'maintenance': return 'En maintenance'
      case 'unavailable': return 'Indisponible'
      default: return status
    }
  }

  const getVehicleAge = (year?: number) => {
    if (!year) return 'N/A'
    return new Date().getFullYear() - year
  }

  const paginatedVehicles = filteredVehicles.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  )

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
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center' }}>
          <DirectionsCar sx={{ mr: 1, color: 'primary.main' }} />
          Réserver un véhicule
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sélectionnez un véhicule disponible dans notre parc
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 2.5, mb: 3, borderRadius: 2, boxShadow: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12} md={5}>
            <TextField
              fullWidth
              size="small"
              placeholder="Rechercher par marque, modèle ou immatriculation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              sx={{ backgroundColor: '#f5f5f5' }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Statut</InputLabel>
              <Select
                value={filterStatus}
                label="Statut"
                onChange={(e) => setFilterStatus(e.target.value as string)}
              >
                <MenuItem value="all">Tous les statuts</MenuItem>
                <MenuItem value="available">Disponible</MenuItem>
                <MenuItem value="maintenance">En maintenance</MenuItem>
                <MenuItem value="unavailable">Indisponible</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={filterType}
                label="Type"
                onChange={(e) => setFilterType(e.target.value as string)}
              >
                <MenuItem value="all">Tous les types</MenuItem>
                <MenuItem value="Berline">Berline</MenuItem>
                <MenuItem value="Compacte">Compacte</MenuItem>
                <MenuItem value="SUV">SUV</MenuItem>
                <MenuItem value="Utilitaire">Utilitaire</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Summary */}
      {filteredVehicles.length > 0 && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            <strong>{filteredVehicles.length}</strong> véhicule(s) trouvé(s)
          </Typography>
        </Box>
      )}

      {/* Vehicle Grid */}
      {filteredVehicles.length > 0 ? (
        <>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {paginatedVehicles.map((vehicle) => (
              <Grid item xs={12} sm={6} md={4} key={vehicle.id}>
                <Card sx={{ 
                  height: '100%', 
                  borderRadius: 2, 
                  boxShadow: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}>
                  {/* Vehicle Icon Header */}
                  <Box sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    p: 2.5,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DirectionsCar sx={{ fontSize: 32, mr: 1 }} />
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                          {vehicle.brand}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          {vehicle.model}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip 
                      label={getStatusText(vehicle.status)} 
                      color={getStatusColor(vehicle.status) as any}
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>

                  {/* Vehicle Details */}
                  <CardContent sx={{ flexGrow: 1, pt: 2.5 }}>
                    {/* Registration and Type */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Immatriculation
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {vehicle.registrationNumber}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    {/* Specifications List */}
                    <List disablePadding sx={{ mb: 1 }}>
                      {vehicle.year && (
                        <ListItem disableGutters sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <Build sx={{ fontSize: 18, color: 'primary.main' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={<Typography variant="caption" sx={{ color: 'text.secondary' }}>Année</Typography>}
                            secondary={<Typography variant="body2" sx={{ fontWeight: 'bold' }}>{vehicle.year} ({getVehicleAge(vehicle.year)} ans)</Typography>}
                          />
                        </ListItem>
                      )}
                      
                      {vehicle.fuelType && (
                        <ListItem disableGutters sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <LocalGasStation sx={{ fontSize: 18, color: 'primary.main' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={<Typography variant="caption" sx={{ color: 'text.secondary' }}>Carburant</Typography>}
                            secondary={<Typography variant="body2" sx={{ fontWeight: 'bold' }}>{vehicle.fuelType}</Typography>}
                          />
                        </ListItem>
                      )}

                      {vehicle.seatsCount && (
                        <ListItem disableGutters sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <People sx={{ fontSize: 18, color: 'primary.main' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={<Typography variant="caption" sx={{ color: 'text.secondary' }}>Places</Typography>}
                            secondary={<Typography variant="body2" sx={{ fontWeight: 'bold' }}>{vehicle.seatsCount} places</Typography>}
                          />
                        </ListItem>
                      )}

                      {vehicle.mileage !== undefined && (
                        <ListItem disableGutters sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <Speed sx={{ fontSize: 18, color: 'primary.main' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={<Typography variant="caption" sx={{ color: 'text.secondary' }}>Kilométrage</Typography>}
                            secondary={<Typography variant="body2" sx={{ fontWeight: 'bold' }}>{vehicle.mileage.toLocaleString('fr-FR')} km</Typography>}
                          />
                        </ListItem>
                      )}

                      <ListItem disableGutters sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <DirectionsCar sx={{ fontSize: 18, color: 'primary.main' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={<Typography variant="caption" sx={{ color: 'text.secondary' }}>Type</Typography>}
                          secondary={<Typography variant="body2" sx={{ fontWeight: 'bold' }}>{vehicle.type}</Typography>}
                        />
                      </ListItem>
                    </List>
                  </CardContent>

                  {/* Actions */}
                  <CardActions sx={{ pt: 1 }}>
                    {vehicle.status === 'available' ? (
                      <Button
                        fullWidth
                        size="small"
                        variant="contained"
                        onClick={() => {
                          setSelectedVehicle(vehicle)
                          setOpenDialog(true)
                        }}
                        startIcon={<CalendarToday />}
                        sx={{ py: 1 }}
                      >
                        Réserver
                      </Button>
                    ) : (
                      <Button fullWidth size="small" disabled>
                        {getStatusText(vehicle.status)}
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {filteredVehicles.length > itemsPerPage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 2 }}>
              <Pagination
                count={Math.ceil(filteredVehicles.length / itemsPerPage)}
                page={page}
                onChange={(_, value) => setPage(value)}
              />
            </Box>
          )}
        </>
      ) : (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Search sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.3 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            Aucun véhicule trouvé
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Essayez de modifier vos filtres de recherche
          </Typography>
          <Button 
            variant="outlined" 
            onClick={() => {
              setFilterStatus('all')
              setFilterType('all')
              setSearchTerm('')
            }}
          >
            Réinitialiser les filtres
          </Button>
        </Box>
      )}

      {/* Reservation Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', py: 2, display: 'flex', alignItems: 'center' }}>
          <CalendarToday sx={{ mr: 1 }} />
          Réserver {selectedVehicle?.brand} {selectedVehicle?.model}
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <DatePicker
                  label="Date de réservation"
                  value={reservationDate}
                  onChange={setReservationDate}
                  minDate={addDays(new Date(), 1)}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Heure de début"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  size="small"
                  fullWidth
                  inputProps={{ step: 1800 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Heure de fin"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  size="small"
                  fullWidth
                  inputProps={{ step: 1800 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Motif de la réservation"
                  multiline
                  rows={3}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  size="small"
                  fullWidth
                  placeholder="Décrivez l'usage du véhicule..."
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions sx={{ py: 1.5, px: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={async () => {
              if (!selectedVehicle || !reservationDate || !startTime || !endTime) {
                enqueueSnackbar('Veuillez remplir tous les champs', { variant: 'error' })
                return
              }

              if (startTime >= endTime) {
                enqueueSnackbar('L\'heure de début doit être avant l\'heure de fin', { variant: 'error' })
                return
              }

              setReservationLoading(true)
              try {
                await apiClient.post('/reservations', {
                  vehicleId: selectedVehicle.id,
                  reservationDate: reservationDate.toISOString().split('T')[0],
                  startTime,
                  endTime,
                  purpose: purpose || null
                })

                enqueueSnackbar('Réservation créée avec succès! Elle est en attente de validation par l\'admin', { variant: 'success' })
                setOpenDialog(false)
                setSelectedVehicle(null)
                setStartTime('09:00')
                setEndTime('18:00')
                setPurpose('')
                fetchVehicles()
              } catch (error: any) {
                enqueueSnackbar(
                  error.response?.data?.message || 'Erreur lors de la création de la réservation',
                  { variant: 'error' }
                )
              } finally {
                setReservationLoading(false)
              }
            }}
            disabled={!reservationDate || !startTime || !endTime || reservationLoading}
          >
            {reservationLoading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  )
}

export default Vehicles