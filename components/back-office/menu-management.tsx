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
import { Textarea } from "@/components/ui/textarea"
import { usePOS } from "@/lib/pos-context"
import { useNotification } from "@/lib/notification-context"
import { ImageUploadService, isValidImageType } from "@/lib/image-upload"
import { formatCurrency } from "@/lib/currency"
import type { MenuItem } from "@/lib/types"
import { Plus, Edit, Trash2, Search, Upload, X, ImageIcon } from "lucide-react"

export function MenuManagement() {
  const { menuItems, categories, addMenuItem, updateMenuItem, deleteMenuItem } = usePOS()
  const { showNotification, showToast } = useNotification()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleSaveItem = (itemData: Partial<MenuItem>) => {
    if (editingItem) {
      updateMenuItem(editingItem.id, itemData)
      showToast({
        type: "success",
        title: "Item Updated",
        message: `${itemData.name || editingItem.name} has been updated successfully.`,
      })
    } else {
      addMenuItem({
        name: itemData.name || "",
        price: itemData.price || 0,
        image: itemData.image || "/placeholder.svg?height=120&width=120&text=🍽️",
        category: itemData.category || "food",
        description: itemData.description || "",
      })
      showToast({
        type: "success",
        title: "Item Added",
        message: `${itemData.name} has been added to the menu.`,
      })
    }
    setIsDialogOpen(false)
    setEditingItem(null)
  }

  const handleDeleteItem = (id: string, itemName: string) => {
    showNotification({
      type: "warning",
      title: "Delete Menu Item",
      message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      showCancel: true,
      onConfirm: () => {
        deleteMenuItem(id)
        showToast({
          type: "success",
          title: "Item Deleted",
          message: `${itemName} has been removed from the menu.`,
        })
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Menu Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage menu items, prices, and images</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-500 hover:bg-green-600" onClick={() => setEditingItem(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-gray-800 dark:text-gray-200">
                {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
              </DialogTitle>
            </DialogHeader>
            <MenuItemForm item={editingItem} onSave={handleSaveItem} onCancel={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
          <Input
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-800 dark:text-gray-200">Menu Items ({filteredItems.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="dark:border-gray-700">
                <TableHead className="dark:text-gray-300">Image</TableHead>
                <TableHead className="dark:text-gray-300">Name</TableHead>
                <TableHead className="dark:text-gray-300">Category</TableHead>
                <TableHead className="dark:text-gray-300">Price</TableHead>
                <TableHead className="dark:text-gray-300">Description</TableHead>
                <TableHead className="dark:text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id} className="dark:border-gray-700">
                  <TableCell>
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <img
                        src={item.image || "/placeholder.svg?height=64&width=64&text=🍽️"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=64&width=64&text=🍽️"
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-gray-800 dark:text-gray-200">{item.name}</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">
                    {categories.find((cat) => cat.id === item.category)?.name || item.category}
                  </TableCell>
                  <TableCell className="font-semibold text-gray-800 dark:text-gray-200">
                    {formatCurrency(item.price)}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-gray-700 dark:text-gray-300">
                    {item.description}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingItem(item)
                          setIsDialogOpen(true)
                        }}
                        className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteItem(item.id, item.name)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 dark:border-gray-600 dark:hover:bg-gray-700"
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
    </div>
  )
}

function MenuItemForm({
  item,
  onSave,
  onCancel,
}: {
  item: MenuItem | null
  onSave: (data: Partial<MenuItem>) => void
  onCancel: () => void
}) {
  const { categories } = usePOS()
  const { showNotification, showToast } = useNotification()
  const [formData, setFormData] = useState({
    name: item?.name || "",
    price: item?.price || 0,
    category: item?.category || "food",
    description: item?.description || "",
    image: item?.image || "",
  })
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState(ImageUploadService.getInstance().getAllImages())

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!isValidImageType(file.type)) {
      showNotification({
        type: "error",
        title: "Invalid File Type",
        message: "Please select a valid image file (JPEG, PNG, GIF, or WebP).",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      showNotification({
        type: "error",
        title: "File Too Large",
        message: "Image size must be less than 5MB. Please choose a smaller image.",
      })
      return
    }

    setIsUploading(true)

    try {
      const imageService = ImageUploadService.getInstance()
      const uploadedImage = await imageService.uploadImage(file)

      setFormData({ ...formData, image: uploadedImage.url })
      setUploadedImages(imageService.getAllImages())

      showToast({
        type: "success",
        title: "Image Uploaded",
        message: `${file.name} has been uploaded successfully.`,
      })
    } catch (error) {
      showNotification({
        type: "error",
        title: "Upload Failed",
        message: error instanceof Error ? error.message : "Failed to upload image. Please try again.",
      })
    } finally {
      setIsUploading(false)
      // Reset file input
      event.target.value = ""
    }
  }

  const handleSelectExistingImage = (imageUrl: string) => {
    setFormData({ ...formData, image: imageUrl })
  }

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: "" })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      showNotification({
        type: "error",
        title: "Missing Information",
        message: "Please enter a name for the menu item.",
      })
      return
    }
    if (formData.price <= 0) {
      showNotification({
        type: "error",
        title: "Invalid Price",
        message: "Please enter a valid price greater than 0.",
      })
      return
    }
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
              Item Name *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter item name"
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price" className="text-gray-700 dark:text-gray-300">
              Price *
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">Preview: {formatCurrency(formData.price)}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-gray-700 dark:text-gray-300">
              Category *
            </Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center space-x-2">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter item description"
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              rows={3}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">Item Image</Label>

            {/* Current Image Preview */}
            <div className="w-full h-48 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
              {formData.image ? (
                <div className="relative w-full h-full">
                  <img
                    src={formData.image || "/placeholder.svg"}
                    alt="Menu item preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <ImageIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No image selected</p>
                </div>
              )}
            </div>

            {/* Upload New Image */}
            <div className="space-y-2">
              <Label htmlFor="image-upload" className="text-sm text-gray-600 dark:text-gray-400">
                Upload New Image
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={isUploading}
                  className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 bg-transparent"
                  onClick={() => document.getElementById("image-upload")?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? "Uploading..." : "Browse"}
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Supported: JPEG, PNG, GIF, WebP (Max 5MB)</p>
            </div>

            {/* Previously Uploaded Images */}
            {uploadedImages.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-gray-600 dark:text-gray-400">Or Select from Uploaded Images</Label>
                <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                  {uploadedImages.slice(0, 9).map((image) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => handleSelectExistingImage(image.url)}
                      className={`relative w-full h-16 rounded border-2 overflow-hidden hover:border-green-500 transition-colors ${
                        formData.image === image.url
                          ? "border-green-500 ring-2 ring-green-200 dark:ring-green-800"
                          : "border-gray-200 dark:border-gray-600"
                      }`}
                    >
                      <img
                        src={image.url || "/placeholder.svg"}
                        alt={image.name}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t dark:border-gray-600">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="dark:border-gray-600 dark:text-gray-300 bg-transparent"
        >
          Cancel
        </Button>
        <Button type="submit" className="bg-green-500 hover:bg-green-600">
          {item ? "Update" : "Add"} Item
        </Button>
      </div>
    </form>
  )
}
