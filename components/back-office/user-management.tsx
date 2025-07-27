"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { usePOS } from "@/lib/pos-context"
import { useNotification } from "@/lib/notification-context"
import type { User, UserRole } from "@/lib/auth-context"
import { Plus, Edit, Trash2, Search, Key, RotateCcw, Eye, EyeOff } from "lucide-react"

export function UserManagement() {
  const { users, addUser, updateUser, deleteUser, updateUserPassword, resetUserPassword } = usePOS()
  const { showNotification, showConfirmation, showToast } = useNotification()
  const [searchQuery, setSearchQuery] = useState("")
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSaveUser = (userData: Partial<User>) => {
    if (editingUser) {
      updateUser(editingUser.id, userData)
      showToast({
        type: "success",
        title: "User Updated",
        message: `${userData.name || editingUser.name} has been updated successfully.`,
      })
    } else {
      addUser({
        name: userData.name || "",
        email: userData.email || "",
        role: userData.role || "cashier",
      })
      showToast({
        type: "success",
        title: "User Added",
        message: `${userData.name} has been added to the system.`,
      })
    }
    setIsDialogOpen(false)
    setEditingUser(null)
  }

  const handleDeleteUser = (id: string, userName: string) => {
    if (id === "1") {
      showNotification({
        type: "warning",
        title: "Cannot Delete Admin",
        message: "The main admin account cannot be deleted for security reasons.",
      })
      return
    }

    showConfirmation(
      "Delete User",
      `Are you sure you want to delete ${userName}? This will permanently remove their access to the system.`,
      () => {
        deleteUser(id)
        showToast({
          type: "success",
          title: "User Deleted",
          message: `${userName} has been removed from the system.`,
        })
      },
      "error",
    )
  }

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      showNotification({
        type: "error",
        title: "Password Mismatch",
        message: "The passwords do not match. Please try again.",
      })
      return
    }

    if (newPassword.length < 6) {
      showNotification({
        type: "error",
        title: "Password Too Short",
        message: "Password must be at least 6 characters long.",
      })
      return
    }

    const user = users.find((u) => u.id === selectedUserId)
    updateUserPassword(selectedUserId, newPassword)

    showToast({
      type: "success",
      title: "Password Updated",
      message: `Password for ${user?.name} has been updated successfully.`,
    })

    setIsPasswordDialogOpen(false)
    setNewPassword("")
    setConfirmPassword("")
    setSelectedUserId("")
    setShowPassword(false)
  }

  const handlePasswordReset = (userId: string, userName: string) => {
    showConfirmation("Reset Password", `Reset password for ${userName} to the default password?`, () => {
      const defaultPassword = resetUserPassword(userId)
      showNotification({
        type: "success",
        title: "Password Reset",
        message: `Password for ${userName} has been reset to: ${defaultPassword}\n\nPlease share this with the user securely.`,
      })
    })
  }

  const openPasswordDialog = (userId: string) => {
    setSelectedUserId(userId)
    setIsPasswordDialogOpen(true)
  }

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
      case "cashier":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "kitchen":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">User Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage staff accounts, roles, and passwords</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-500 hover:bg-green-600" onClick={() => setEditingUser(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md dark:bg-gray-800 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-gray-800 dark:text-gray-200">
                {editingUser ? "Edit User" : "Add New User"}
              </DialogTitle>
            </DialogHeader>
            <UserForm user={editingUser} onSave={handleSaveUser} onCancel={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
          />
        </div>
      </div>

      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-800 dark:text-gray-200">System Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="dark:border-gray-700">
                <TableHead className="dark:text-gray-300">Name</TableHead>
                <TableHead className="dark:text-gray-300">Email</TableHead>
                <TableHead className="dark:text-gray-300">Role</TableHead>
                <TableHead className="dark:text-gray-300">Password</TableHead>
                <TableHead className="dark:text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="dark:border-gray-700">
                  <TableCell className="font-medium text-gray-800 dark:text-gray-200">{user.name}</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">{user.email}</TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openPasswordDialog(user.id)}
                        className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                        title="Change Password"
                      >
                        <Key className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePasswordReset(user.id, user.name)}
                        className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                        title="Reset to Default"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingUser(user)
                          setIsDialogOpen(true)
                        }}
                        className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 dark:border-gray-600 dark:hover:bg-gray-700"
                        disabled={user.id === "1"} // Prevent deleting main admin
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Password Change Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="max-w-md dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-800 dark:text-gray-200">Change Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-gray-700 dark:text-gray-300">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-gray-700 dark:text-gray-300">
                Confirm Password
              </Label>
              <Input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsPasswordDialogOpen(false)
                  setNewPassword("")
                  setConfirmPassword("")
                  setShowPassword(false)
                }}
                className="dark:border-gray-600 dark:text-gray-300 bg-transparent"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handlePasswordChange}
                className="bg-green-500 hover:bg-green-600"
                disabled={!newPassword || !confirmPassword}
              >
                Update Password
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function UserForm({
  user,
  onSave,
  onCancel,
}: {
  user: User | null
  onSave: (data: Partial<User>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || ("cashier" as UserRole),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
          Full Name
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role" className="text-gray-700 dark:text-gray-300">
          Role
        </Label>
        <Select value={formData.role} onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}>
          <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
            <SelectItem value="cashier">Cashier</SelectItem>
            <SelectItem value="kitchen">Kitchen Staff</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="dark:border-gray-600 dark:text-gray-300 bg-transparent"
        >
          Cancel
        </Button>
        <Button type="submit" className="bg-green-500 hover:bg-green-600">
          {user ? "Update" : "Add"} User
        </Button>
      </div>
    </form>
  )
}
