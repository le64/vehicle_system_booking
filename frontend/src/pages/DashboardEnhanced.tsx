import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import apiClient from '../config/api'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Paper,
  Divider,
  LinearProgress,
  Chip,
  Avatar,
  Tab,
  Tabs,
  CircularProgress
} from '@mui/material'
import {
  DirectionsCar,
  CalendarToday,
  TrendingUp,
  AccessTime,
  CheckCircle,
  Schedule,
  EmojiEvents,
  LocalFireDepartment
} from '@mui/icons-material'
import Layout from '../components/Layout'

interface DashboardStats {
  totalVehicles: number
  availableVehicles: number
  activeReservations: number
}

interface Reservation {
  id: number
  vehicle: {
    brand: string
    model: string
    registrationNumber: string
  }
  startDate: string
  endDate: string
  purpose: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED'
}

interface Vehicle {
  id: number
  registrationNumber: string
  brand: string
  model: string
  type: string
  status: 'available' | 'maintenance' | 'unavailable'
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props

  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [tabValue, setTabValue] = useState(0)

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      navigate('/admin/dashboard')
      return
    }
    fetchDashboardData()
  }, [user, navigate])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      const statsResponse = await apiClient.get('/admin/stats/employee')
      setStats(statsResponse.data.data)

      const reservationsResponse = await apiClient.get('/reservations/my-reservations', {
        params: { limit: 10 }
      })
      setReservations(reservationsResponse.data.data)

      const vehiclesResponse = await apiClient.get('/vehicles')
      setVehicles(vehiclesResponse.data.data)
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getReservationStats = () => {
    const completed = reservations.filter(r => r.status === 'COMPLETED').length
    const active = reservations.filter(r => r.status === 'APPROVED').length
    const cancelled = reservations.filter(r => r.status === 'CANCELLED' || r.status === 'REJECTED').length
    return { completed, active, cancelled }
  }

  const getUpcomingReservations = () => {
    return reservations
      .filter(r => r.status === 'APPROVED')
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 3)
  }

  const getMostReservedVehicles = () => {
    const vehicleCounts: { [key: string]: number } = {}
    reservations.forEach(r => {
      const vehicleKey = `${r.vehicle.brand} ${r.vehicle.model}`
      vehicleCounts[vehicleKey] = (vehicleCounts[vehicleKey] || 0) + 1
    })
    return Object.entries(vehicleCounts)
      .sort(([,a],[,b]) => b - a)
      .slice(0, 3)
  }

  const reservationStats = getReservationStats()
  const upcomingReservations = getUpcomingReservations()
  const mostReservedVehicles = getMostReservedVehicles()

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
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Tableau de bord
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Bienvenue {user?.firstName}
          </Typography>
        </Box>
        <Avatar sx={{ bgcolor: 'primary.main' }}>{user?.firstName?.[0]}</Avatar>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.main', color: 'common.white', borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <DirectionsCar sx={{ mr: 1 }} />
                <Typography variant="body2">Véhicules</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {stats?.totalVehicles || 0}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {stats?.availableVehicles || 0} disponibles
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.main', color: 'common.white', borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Schedule sx={{ mr: 1 }} />
                <Typography variant="body2">Actives</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {reservationStats.active}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                en cours
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'info.main', color: 'common.white', borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircle sx={{ mr: 1 }} />
                <Typography variant="body2">Terminées</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {reservationStats.completed}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                au total
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.main', color: 'common.white', borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp sx={{ mr: 1 }} />
                <Typography variant="body2">Taux</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {reservations.length ? Math.round((reservationStats.active / reservations.length) * 100) : 0}%
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                d'activité
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ borderRadius: 2, boxShadow: 3, mb: 4 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} variant="fullWidth">
          <Tab icon={<CalendarToday />} label="À venir" />
          <Tab icon={<LocalFireDepartment />} label="Populaires" />
          <Tab icon={<TrendingUp />} label="Stats" />
        </Tabs>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {upcomingReservations.length ? upcomingReservations.map(r => (
            <Grid item xs={12} sm={6} key={r.id}>
              <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {r.vehicle.brand} {r.vehicle.model}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {r.vehicle.registrationNumber}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {formatDate(r.startDate)} - {formatDate(r.endDate)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">{r.purpose}</Typography>
                  </Box>
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button variant="outlined" size="small" onClick={() => navigate('/reservations')}>
                      Détails
                    </Button>
                    <Button variant="text" color="error" size="small">
                      Annuler
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )) : (
            <Box sx={{ textAlign: 'center', width: '100%', py: 4 }}>
              <CalendarToday sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Aucune réservation à venir
              </Typography>
              <Button variant="contained" onClick={() => navigate('/vehicles')}>
                Réserver
              </Button>
            </Box>
          )}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          {mostReservedVehicles.length ? mostReservedVehicles.map(([vehicle, count], i) => (
            <Grid item xs={12} sm={6} key={i}>
              <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {vehicle}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Véhicule populaire
                    </Typography>
                  </Box>
                  <Chip
                    icon={<LocalFireDepartment />}
                    label={`${count} réservations`}
                    color="warning"
                  />
                </CardContent>
              </Card>
            </Grid>
          )) : (
            <Box sx={{ textAlign: 'center', width: '100%', py: 4 }}>
              <EmojiEvents sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
              <Typography color="text.secondary">
                Pas de données sur les populaires
              </Typography>
            </Box>
          )}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                Réservations
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Actives</Typography>
                  <Chip label={reservationStats.active} color="primary" size="small" />
                </Box>
                <LinearProgress variant="determinate" value={reservations.length ? (reservationStats.active / reservations.length) * 100 : 0} />
              </Box>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Terminées</Typography>
                  <Chip label={reservationStats.completed} color="success" size="small" />
                </Box>
                <LinearProgress variant="determinate" value={reservations.length ? (reservationStats.completed / reservations.length) * 100 : 0} color="success" />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Annulées</Typography>
                  <Chip label={reservationStats.cancelled} color="error" size="small" />
                </Box>
                <LinearProgress variant="determinate" value={reservations.length ? (reservationStats.cancelled / reservations.length) * 100 : 0} color="error" />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                Véhicules
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 3 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {vehicles.filter(v => v.status === 'available').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Disponibles</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                    {vehicles.filter(v => v.status === 'maintenance').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Maintenance</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    {vehicles.filter(v => v.status === 'unavailable').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Indisponibles</Typography>
                </Box>
              </Box>
              <LinearProgress variant="determinate" value={vehicles.length ? (vehicles.filter(v => v.status === 'available').length / vehicles.length) * 100 : 0} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {vehicles.length ? Math.round((vehicles.filter(v => v.status === 'available').length / vehicles.length) * 100) : 0}% disponibles
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>
    </Layout>
  )
}

export default Dashboard