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
  Typography
} from '@mui/material'
import {
  Edit,
  Block,
  CheckCircle,
  PersonAdd
} from '@mui/icons-material'
import { useSnackbar } from 'notistack'
import apiClient from '../../config/api'
import Layout from '../../components/Layout'

interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role: 'ADMIN' | 'EMPLOYEE'
  isActive: boolean
  createdAt: string
  totalReservations: number
  activeReservations: number
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'EMPLOYEE',
    password: ''
  })
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/admin/users')
      setUsers(response.data.data)
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error)
      enqueueSnackbar('Erreur lors du chargement des utilisateurs', { variant: 'error' })
    }
  }

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setFormData({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      password: ''
    })
    setOpenDialog(true)
  }

  const handleCreateUser = () => {
    setEditingUser(null)
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      role: 'EMPLOYEE',
      password: ''
    })
    setOpenDialog(true)
  }

  const handleSaveUser = async () => {
    try {
      if (editingUser) {
        await apiClient.put(`/admin/users/${editingUser.id}`, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role
        })
        enqueueSnackbar('Utilisateur mis à jour avec succès', { variant: 'success' })
      } else {
        await apiClient.post('/admin/users', formData)
        enqueueSnackbar('Utilisateur créé avec succès', { variant: 'success' })
      }
      
      setOpenDialog(false)
      fetchUsers()
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || 'Erreur lors de la sauvegarde',
        { variant: 'error' }
      )
    }
  }

  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    try {
      await apiClient.put(`/admin/users/${userId}/status`, {
        isActive: !currentStatus
      })
      
      enqueueSnackbar(
        `Utilisateur ${!currentStatus ? 'activé' : 'désactivé'} avec succès`,
        { variant: 'success' }
      )
      
      fetchUsers()
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || 'Erreur lors du changement de statut',
        { variant: 'error' }
      )
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  return (
    <Layout>
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
          Gestion des utilisateurs
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={handleCreateUser}
          size="small"
        >
          Nouvel utilisateur
        </Button>
      </Box>

      <Paper sx={{ borderRadius: 2, boxShadow: 3 }}>
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', py: 1 }}>Nom</TableCell>
                <TableCell sx={{ color: 'white', py: 1 }}>Email</TableCell>
                <TableCell sx={{ color: 'white', py: 1 }}>Rôle</TableCell>
                <TableCell sx={{ color: 'white', py: 1 }}>Statut</TableCell>
                <TableCell sx={{ color: 'white', py: 1 }}>Réservations</TableCell>
                <TableCell sx={{ color: 'white', py: 1 }}>Créé le</TableCell>
                <TableCell align="right" sx={{ color: 'white', py: 1 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ py: 1 }}>
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell sx={{ py: 1 }}>{user.email}</TableCell>
                    <TableCell sx={{ py: 1 }}>
                      <Chip
                        label={user.role}
                        color={user.role === 'ADMIN' ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ py: 1 }}>
                      <Chip
                        label={user.isActive ? 'Actif' : 'Inactif'}
                        color={user.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ py: 1 }}>
                      {user.totalReservations} ({user.activeReservations} actives)
                    </TableCell>
                    <TableCell sx={{ py: 1 }}>{formatDate(user.createdAt)}</TableCell>
                    <TableCell align="right" sx={{ py: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleEditUser(user)}
                        color="primary"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleStatus(user.id, user.isActive)}
                        color={user.isActive ? 'warning' : 'success'}
                      >
                        {user.isActive ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={users.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes:"
          sx={{ minHeight: 40 }}
        />
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ py: 1.5 }}>
          {editingUser ? 'Modifier' : 'Créer'} utilisateur
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Box display="flex" flexDirection="column" gap={1.5}>
            {!editingUser && (
              <>
                <TextField
                  size="small"
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <TextField
                  size="small"
                  label="Mot de passe"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </>
            )}
            
            <TextField
              size="small"
              label="Prénom"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
            
            <TextField
              size="small"
              label="Nom"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
            
            <FormControl size="small">
              <InputLabel>Rôle</InputLabel>
              <Select
                value={formData.role}
                label="Rôle"
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'ADMIN' | 'EMPLOYEE' })}
              >
                <MenuItem value="EMPLOYEE">Employé</MenuItem>
                <MenuItem value="ADMIN">Administrateur</MenuItem>
              </Select>
            </FormControl>
            
            {editingUser && (
              <Alert severity="info" sx={{ py: 0.5 }}>
                Mot de passe inchangé si vide
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ py: 1 }}>
          <Button onClick={() => setOpenDialog(false)} size="small">Annuler</Button>
          <Button variant="contained" onClick={handleSaveUser} size="small">
            {editingUser ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  )
}

export default AdminUsers