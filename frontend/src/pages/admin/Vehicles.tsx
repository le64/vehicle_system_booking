import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Typography,
  CircularProgress
} from '@mui/material'
import {
  Edit,
  Delete,
  Add
} from '@mui/icons-material'
import { useSnackbar } from 'notistack'
import apiClient from '../../config/api'
import Layout from '../../components/Layout'

interface Vehicle {
  id: number
  registrationNumber: string
  brand: string
  model: string
  type: string
  status: 'available' | 'maintenance' | 'unavailable'
  totalReservations?: number
  activeReservations?: number
}

const AdminVehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    registrationNumber: '',
    brand: '',
    model: '',
    type: '',
    status: 'available'
  })
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [uploading, setUploading] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    fetchVehicles()
  }, [filterStatus])

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const url = filterStatus === 'all' 
        ? '/admin/vehicles'
        : `/admin/vehicles?status=${filterStatus}`
      const response = await apiClient.get(url)
      setVehicles(response.data.data)
    } catch (error) {
      console.error('Erreur lors du chargement des véhicules:', error)
      enqueueSnackbar('Erreur lors du chargement des véhicules', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingId(vehicle.id)
      setFormData({
        registrationNumber: vehicle.registrationNumber,
        brand: vehicle.brand,
        model: vehicle.model,
        type: vehicle.type,
        status: vehicle.status
      })
    } else {
      setEditingId(null)
      setFormData({
        registrationNumber: '',
        brand: '',
        model: '',
        type: '',
        status: 'available'
      })
    }
    setOpenDialog(true)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveVehicle = async () => {
    if (!formData.registrationNumber || !formData.brand || !formData.model || !formData.type) {
      enqueueSnackbar('Veuillez remplir tous les champs obligatoires', { variant: 'error' })
      return
    }

    try {
      if (editingId) {
        await apiClient.put(`/admin/vehicles/${editingId}`, {
          registrationNumber: formData.registrationNumber,
          brand: formData.brand,
          model: formData.model,
          type: formData.type,
          status: formData.status
        })
        enqueueSnackbar('Véhicule mis à jour avec succès', { variant: 'success' })
      } else {
        await apiClient.post('/admin/vehicles', {
          registrationNumber: formData.registrationNumber,
          brand: formData.brand,
          model: formData.model,
          type: formData.type
        })
        enqueueSnackbar('Véhicule créé avec succès', { variant: 'success' })
      }
      setOpenDialog(false)
      fetchVehicles()
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || 'Erreur lors de la sauvegarde',
        { variant: 'error' }
      )
    }
  }

  const handleDeleteVehicle = async (vehicleId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce véhicule?')) {
      try {
        await apiClient.delete(`/admin/vehicles/${vehicleId}`)
        enqueueSnackbar('Véhicule supprimé avec succès', { variant: 'success' })
        fetchVehicles()
      } catch (error: any) {
        enqueueSnackbar(
          error.response?.data?.message || 'Erreur lors de la suppression',
          { variant: 'error' }
        )
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'success'
      case 'maintenance':
        return 'warning'
      case 'unavailable':
        return 'error'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponible'
      case 'maintenance':
        return 'Maintenance'
      case 'unavailable':
        return 'Indisponible'
      default:
        return status
    }
  }

  const filteredVehicles = filterStatus === 'all'
    ? vehicles
    : vehicles.filter(v => v.status === filterStatus)

  const paginatedVehicles = filteredVehicles.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Layout>
    )
  }

  return (
    <Layout>
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
          Gestion des Véhicules
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          size="small"
        >
          Ajouter
        </Button>
      </Box>

      <Paper sx={{ p: 1, mb: 2, borderRadius: 2, boxShadow: 3 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Statut</InputLabel>
          <Select
            value={filterStatus}
            label="Statut"
            onChange={(e) => {
              setFilterStatus(e.target.value)
              setPage(0)
            }}
          >
            <MenuItem value="all">Tous</MenuItem>
            <MenuItem value="available">Disponibles</MenuItem>
            <MenuItem value="maintenance">Maintenance</MenuItem>
            <MenuItem value="unavailable">Indisponibles</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', py: 1 }}>Immatriculation</TableCell>
              <TableCell sx={{ color: 'white', py: 1 }}>Marque</TableCell>
              <TableCell sx={{ color: 'white', py: 1 }}>Modèle</TableCell>
              <TableCell sx={{ color: 'white', py: 1 }}>Type</TableCell>
              <TableCell sx={{ color: 'white', py: 1 }}>Statut</TableCell>
              <TableCell align="right" sx={{ color: 'white', py: 1 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedVehicles.map((vehicle) => (
              <TableRow key={vehicle.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell sx={{ py: 1 }}>{vehicle.registrationNumber}</TableCell>
                <TableCell sx={{ py: 1 }}>{vehicle.brand}</TableCell>
                <TableCell sx={{ py: 1 }}>{vehicle.model}</TableCell>
                <TableCell sx={{ py: 1 }}>{vehicle.type}</TableCell>
                <TableCell sx={{ py: 1 }}>
                  <Chip
                    label={getStatusLabel(vehicle.status)}
                    color={getStatusColor(vehicle.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right" sx={{ py: 1 }}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleOpenDialog(vehicle)}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteVehicle(vehicle.id)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredVehicles.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10))
          setPage(0)
        }}
        labelRowsPerPage="Lignes:"
        rowsPerPageOptions={[5, 10, 25]}
        sx={{ minHeight: 40 }}
      />

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ py: 1.5 }}>
          {editingId ? 'Modifier' : 'Ajouter'} véhicule
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <TextField
              size="small"
              label="Immatriculation"
              value={formData.registrationNumber}
              onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
              disabled={!!editingId}
            />

            <TextField
              size="small"
              label="Marque"
              value={formData.brand}
              onChange={(e) => handleInputChange('brand', e.target.value)}
            />

            <TextField
              size="small"
              label="Modèle"
              value={formData.model}
              onChange={(e) => handleInputChange('model', e.target.value)}
            />

            <TextField
              size="small"
              label="Type"
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
            />

            <TextField
              size="small"
              label="URL image"
              onChange={(e) => handleInputChange('imageUrl', e.target.value)}
              multiline
              rows={1}
            />

            <Button
              variant="outlined"
              component="label"
              size="small"
              disabled={uploading}
            >
              Upload
              <input
                type="file"
                accept="image/*"
                hidden
              />
            </Button>

            {uploading && <CircularProgress size={20} sx={{ alignSelf: 'center' }} />}


            {editingId && (
              <FormControl size="small">
                <InputLabel>Statut</InputLabel>
                <Select
                  value={formData.status}
                  label="Statut"
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <MenuItem value="available">Disponible</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                  <MenuItem value="unavailable">Indisponible</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ py: 1 }}>
          <Button onClick={() => setOpenDialog(false)} size="small">Annuler</Button>
          <Button variant="contained" onClick={handleSaveVehicle} size="small">
            {editingId ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  )
}

export default AdminVehicles